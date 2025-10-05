/**
 * Visual Comparator Agent - Phase 5 Validation
 * Compares production vs local screenshots using Puppeteer and Pixelmatch
 */

import puppeteer, { Browser, Page } from 'puppeteer';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';
import { promises as fs } from 'fs';
import path from 'path';
import { getLogger } from '../utils/logger';
import { ensureDir } from '../utils/file-system';
import type { AgentResult } from '../types';

const log = getLogger();

interface PageComparison {
  url: string;
  name: string;
  prodScreenshot: string;
  localScreenshot: string;
  diffScreenshot: string;
  pixelDifference: number;
  percentDifference: number;
  passed: boolean;
}

interface StructuralDifference {
  page: string;
  element: string;
  difference: string;
  severity: 'critical' | 'warning' | 'info';
}

interface VisualDiff {
  pages: PageComparison[];
  pixelDifferences: number;
  percentDifference: number;
  structuralDifferences: StructuralDifference[];
  screenshots: {
    production: string[];
    local: string[];
    diffs: string[];
  };
  summary: string;
  passed: boolean;
}

interface VisualCompareConfig {
  productionUrl: string;
  localUrl: string;
  outputDir?: string;
  threshold?: number; // % difference threshold for passing
  viewports?: { width: number; height: number }[];
}

/**
 * Visual Comparator Agent
 * Takes screenshots and compares production vs local environments
 */
export default class VisualComparatorAgent {
  private config: VisualCompareConfig;
  private outputDir: string;
  private browser: Browser | null = null;

  constructor(config: VisualCompareConfig) {
    this.config = {
      threshold: 5.0, // 5% pixel difference threshold
      viewports: [{ width: 1920, height: 1080 }],
      ...config
    };
    this.outputDir =
      config.outputDir || path.join(process.cwd(), 'scripts/rescue/outputs/05-validation/visual-diff');
  }

  /**
   * Execute the visual comparator agent
   */
  async execute(): Promise<AgentResult<VisualDiff>> {
    const startTime = Date.now();
    log.info('Starting Visual Comparator Agent', { config: this.config }, 'visual-comparator');

    try {
      // Ensure output directory exists
      await ensureDir(this.outputDir);

      // Launch browser
      this.browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });

      // Run comparisons
      const visualDiff = await this.comparePages();
      const duration = Date.now() - startTime;

      const confidence = this.calculateConfidence(visualDiff);

      log.success(
        'Visual Comparator completed',
        {
          duration: `${duration}ms`,
          pages: visualDiff.pages.length,
          percentDiff: visualDiff.percentDifference.toFixed(2) + '%',
          passed: visualDiff.passed,
          confidence: confidence.toFixed(2)
        },
        'visual-comparator'
      );

      return {
        success: true,
        data: visualDiff,
        confidence,
        timestamp: new Date()
      };
    } catch (error: any) {
      log.error('Visual Comparator Agent failed', error.message, 'visual-comparator');

      return {
        success: false,
        error: error.message,
        confidence: 0,
        timestamp: new Date()
      };
    } finally {
      // Clean up browser
      if (this.browser) {
        await this.browser.close();
      }
    }
  }

  /**
   * Compare key pages between production and local
   */
  private async comparePages(): Promise<VisualDiff> {
    const pagesToCompare = [
      { name: 'homepage', path: '/' },
      { name: 'rooms', path: '/rooms' },
      { name: 'about', path: '/about' },
      { name: 'apply', path: '/apply' }
    ];

    const pages: PageComparison[] = [];
    const screenshots = {
      production: [] as string[],
      local: [] as string[],
      diffs: [] as string[]
    };

    for (const pageConfig of pagesToCompare) {
      try {
        log.info(`Comparing ${pageConfig.name}...`, undefined, 'visual-comparator');

        const comparison = await this.comparePage(
          pageConfig.name,
          pageConfig.path,
          this.config.viewports![0]
        );

        pages.push(comparison);
        screenshots.production.push(comparison.prodScreenshot);
        screenshots.local.push(comparison.localScreenshot);
        screenshots.diffs.push(comparison.diffScreenshot);
      } catch (error: any) {
        log.warn(`Failed to compare ${pageConfig.name}`, error.message, 'visual-comparator');

        // Add placeholder for failed comparison
        pages.push({
          url: pageConfig.path,
          name: pageConfig.name,
          prodScreenshot: '',
          localScreenshot: '',
          diffScreenshot: '',
          pixelDifference: 0,
          percentDifference: 100,
          passed: false
        });
      }
    }

    // Analyze structural differences
    const structuralDifferences = await this.analyzeStructuralDifferences(pages);

    // Calculate overall metrics
    const totalPixelDiff = pages.reduce((sum, p) => sum + p.pixelDifference, 0);
    const avgPercentDiff = pages.reduce((sum, p) => sum + p.percentDifference, 0) / pages.length;
    const passed = avgPercentDiff <= this.config.threshold!;

    const summary = this.generateSummary({
      pages,
      pixelDifferences: totalPixelDiff,
      percentDifference: avgPercentDiff,
      structuralDifferences,
      screenshots,
      passed,
      summary: ''
    });

    return {
      pages,
      pixelDifferences: totalPixelDiff,
      percentDifference: avgPercentDiff,
      structuralDifferences,
      screenshots,
      summary,
      passed
    };
  }

  /**
   * Compare a single page
   */
  private async comparePage(
    name: string,
    pagePath: string,
    viewport: { width: number; height: number }
  ): Promise<PageComparison> {
    const prodUrl = `${this.config.productionUrl}${pagePath}`;
    const localUrl = `${this.config.localUrl}${pagePath}`;

    // Take screenshots
    const prodScreenshot = await this.takeScreenshot(prodUrl, viewport, `prod-${name}`);
    const localScreenshot = await this.takeScreenshot(localUrl, viewport, `local-${name}`);

    // Compare screenshots
    const { pixelDiff, percentDiff, diffImagePath } = await this.compareScreenshots(
      prodScreenshot,
      localScreenshot,
      `diff-${name}`
    );

    const passed = percentDiff <= this.config.threshold!;

    return {
      url: pagePath,
      name,
      prodScreenshot,
      localScreenshot,
      diffScreenshot: diffImagePath,
      pixelDifference: pixelDiff,
      percentDifference: percentDiff,
      passed
    };
  }

  /**
   * Take screenshot of a page
   */
  private async takeScreenshot(
    url: string,
    viewport: { width: number; height: number },
    filename: string
  ): Promise<string> {
    const page = await this.browser!.newPage();

    try {
      await page.setViewport(viewport);
      await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });

      // Wait for content to stabilize
      await page.waitForTimeout(1000);

      const screenshotPath = path.join(this.outputDir, `${filename}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: true });

      log.info(`Screenshot saved: ${filename}`, undefined, 'visual-comparator');
      return screenshotPath;
    } finally {
      await page.close();
    }
  }

  /**
   * Compare two screenshots using pixelmatch
   */
  private async compareScreenshots(
    img1Path: string,
    img2Path: string,
    diffFilename: string
  ): Promise<{ pixelDiff: number; percentDiff: number; diffImagePath: string }> {
    // Read images
    const img1Data = await fs.readFile(img1Path);
    const img2Data = await fs.readFile(img2Path);

    const img1 = PNG.sync.read(img1Data);
    const img2 = PNG.sync.read(img2Data);

    // Ensure images are same size (resize if needed)
    const width = Math.max(img1.width, img2.width);
    const height = Math.max(img1.height, img2.height);

    // Create diff image
    const diff = new PNG({ width, height });

    // Compare pixels
    const pixelDiff = pixelmatch(img1.data, img2.data, diff.data, width, height, {
      threshold: 0.1,
      includeAA: true
    });

    // Calculate percentage difference
    const totalPixels = width * height;
    const percentDiff = (pixelDiff / totalPixels) * 100;

    // Save diff image
    const diffImagePath = path.join(this.outputDir, `${diffFilename}.png`);
    await fs.writeFile(diffImagePath, PNG.sync.write(diff));

    log.info(`Pixel difference: ${pixelDiff} (${percentDiff.toFixed(2)}%)`, undefined, 'visual-comparator');

    return { pixelDiff, percentDiff, diffImagePath };
  }

  /**
   * Analyze structural differences between pages
   */
  private async analyzeStructuralDifferences(
    pages: PageComparison[]
  ): Promise<StructuralDifference[]> {
    const differences: StructuralDifference[] = [];

    // Open production and local pages to analyze DOM structure
    for (const page of pages) {
      if (!page.passed) {
        try {
          const prodUrl = `${this.config.productionUrl}${page.url}`;
          const localUrl = `${this.config.localUrl}${page.url}`;

          const prodDom = await this.analyzeDomStructure(prodUrl);
          const localDom = await this.analyzeDomStructure(localUrl);

          // Compare key elements
          const keySelectors = ['.room-card', '.navigation', 'header', 'footer', '.hero'];

          for (const selector of keySelectors) {
            const prodCount = prodDom.elementCounts[selector] || 0;
            const localCount = localDom.elementCounts[selector] || 0;

            if (prodCount !== localCount) {
              differences.push({
                page: page.name,
                element: selector,
                difference: `Production: ${prodCount} elements, Local: ${localCount} elements`,
                severity: Math.abs(prodCount - localCount) > 5 ? 'critical' : 'warning'
              });
            }
          }
        } catch (error) {
          log.warn(`Failed to analyze DOM for ${page.name}`, undefined, 'visual-comparator');
        }
      }
    }

    return differences;
  }

  /**
   * Analyze DOM structure of a page
   */
  private async analyzeDomStructure(
    url: string
  ): Promise<{ elementCounts: Record<string, number> }> {
    const page = await this.browser!.newPage();

    try {
      await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });

      // Count key elements
      const elementCounts = await page.evaluate(() => {
        const selectors = ['.room-card', '.navigation', 'header', 'footer', '.hero', 'img', 'a'];
        const counts: Record<string, number> = {};

        for (const selector of selectors) {
          counts[selector] = document.querySelectorAll(selector).length;
        }

        return counts;
      });

      return { elementCounts };
    } finally {
      await page.close();
    }
  }

  /**
   * Generate comparison summary
   */
  private generateSummary(visualDiff: VisualDiff): string {
    const lines: string[] = [];

    lines.push('VISUAL COMPARISON SUMMARY');
    lines.push('='.repeat(50));
    lines.push('');

    lines.push(`Production URL: ${this.config.productionUrl}`);
    lines.push(`Local URL: ${this.config.localUrl}`);
    lines.push(`Threshold: ${this.config.threshold}%`);
    lines.push('');

    lines.push('PAGE COMPARISONS:');
    for (const page of visualDiff.pages) {
      const status = page.passed ? '✅' : '❌';
      lines.push(`  ${status} ${page.name}: ${page.percentDifference.toFixed(2)}% difference`);
    }
    lines.push('');

    lines.push(`Overall Difference: ${visualDiff.percentDifference.toFixed(2)}%`);
    lines.push(`Total Pixel Differences: ${visualDiff.pixelDifferences.toLocaleString()}`);
    lines.push('');

    if (visualDiff.structuralDifferences.length > 0) {
      lines.push('STRUCTURAL DIFFERENCES:');
      for (const diff of visualDiff.structuralDifferences) {
        lines.push(`  - ${diff.page} / ${diff.element}: ${diff.difference}`);
      }
      lines.push('');
    }

    if (visualDiff.passed) {
      lines.push('✅ VISUAL VALIDATION PASSED - Pages match within threshold');
    } else {
      lines.push('❌ VISUAL VALIDATION FAILED - Differences exceed threshold');
      lines.push('Review diff images in output directory for details');
    }

    return lines.join('\n');
  }

  /**
   * Calculate confidence score
   */
  private calculateConfidence(visualDiff: VisualDiff): number {
    // Base confidence on similarity percentage
    const similarityPercent = 100 - visualDiff.percentDifference;
    let confidence = similarityPercent / 100;

    // Deduct for structural differences
    const criticalDiffs = visualDiff.structuralDifferences.filter(d => d.severity === 'critical').length;
    const warningDiffs = visualDiff.structuralDifferences.filter(d => d.severity === 'warning').length;

    confidence -= criticalDiffs * 0.1;
    confidence -= warningDiffs * 0.05;

    // Bonus if all pages passed
    if (visualDiff.passed) {
      confidence = Math.min(1.0, confidence + 0.1);
    }

    return Math.max(0, Math.min(1.0, confidence));
  }
}
