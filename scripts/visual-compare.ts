#!/usr/bin/env ts-node
/**
 * Simple Before/After Frontend Comparison
 * Takes screenshots of production vs local and displays side-by-side
 */

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

interface CompareOptions {
  productionUrl?: string;
  localUrl?: string;
  outputDir?: string;
  pages?: string[];
  viewport?: { width: number; height: number };
}

class VisualCompare {
  private options: Required<CompareOptions>;

  constructor(options: CompareOptions = {}) {
    this.options = {
      productionUrl: options.productionUrl || 'https://epic.libralab.ai',
      localUrl: options.localUrl || 'http://localhost:3000',
      outputDir: options.outputDir || './visual-comparison',
      pages: options.pages || ['/', '/apply', '/impressum'],
      viewport: options.viewport || { width: 1920, height: 1080 }
    };
  }

  async compare(): Promise<void> {
    console.log('📸 Starting visual comparison...\n');

    // Create output directory
    if (!fs.existsSync(this.options.outputDir)) {
      fs.mkdirSync(this.options.outputDir, { recursive: true });
    }

    const browser = await puppeteer.launch({
      headless: true,
      defaultViewport: this.options.viewport
    });

    try {
      for (const pagePath of this.options.pages) {
        await this.comparePage(browser, pagePath);
      }

      // Generate HTML comparison viewer
      await this.generateViewer();

      console.log(`\n✅ Comparison complete!`);
      console.log(`📁 Screenshots saved to: ${this.options.outputDir}`);
      console.log(`🌐 Open viewer: open ${this.options.outputDir}/index.html\n`);
    } finally {
      await browser.close();
    }
  }

  private async comparePage(browser: any, pagePath: string): Promise<void> {
    const pageName = pagePath === '/' ? 'homepage' : pagePath.replace(/\//g, '-');

    console.log(`📸 Comparing: ${pagePath}`);

    const page = await browser.newPage();

    try {
      // Screenshot production
      console.log(`  → Production: ${this.options.productionUrl}${pagePath}`);
      await page.goto(`${this.options.productionUrl}${pagePath}`, {
        waitUntil: 'networkidle2',
        timeout: 30000
      });
      await page.screenshot({
        path: path.join(this.options.outputDir, `${pageName}-production.png`),
        fullPage: true
      });

      // Screenshot local
      console.log(`  → Local: ${this.options.localUrl}${pagePath}`);
      await page.goto(`${this.options.localUrl}${pagePath}`, {
        waitUntil: 'networkidle2',
        timeout: 30000
      });
      await page.screenshot({
        path: path.join(this.options.outputDir, `${pageName}-local.png`),
        fullPage: true
      });

      console.log(`  ✅ ${pageName} captured\n`);
    } catch (error: any) {
      console.log(`  ❌ Failed: ${error.message}\n`);
    } finally {
      await page.close();
    }
  }

  private async generateViewer(): Promise<void> {
    const pages = this.options.pages.map(p =>
      p === '/' ? 'homepage' : p.replace(/\//g, '-')
    );

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Before/After Comparison - LIBRAlab</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #1a1a1a;
      color: #fff;
      padding: 20px;
    }

    .header {
      text-align: center;
      margin-bottom: 40px;
      padding: 30px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 10px;
    }

    h1 {
      font-size: 2.5em;
      margin-bottom: 10px;
    }

    .subtitle {
      font-size: 1.1em;
      opacity: 0.9;
    }

    .timestamp {
      margin-top: 10px;
      font-size: 0.9em;
      opacity: 0.7;
    }

    .page-section {
      margin-bottom: 60px;
      background: #2a2a2a;
      border-radius: 10px;
      padding: 30px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.3);
    }

    .page-title {
      font-size: 1.8em;
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 2px solid #667eea;
    }

    .comparison-container {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-top: 20px;
    }

    .screenshot-box {
      background: #1a1a1a;
      border-radius: 8px;
      padding: 15px;
      border: 2px solid #333;
      transition: all 0.3s ease;
    }

    .screenshot-box:hover {
      border-color: #667eea;
      transform: translateY(-2px);
      box-shadow: 0 8px 16px rgba(102, 126, 234, 0.2);
    }

    .screenshot-label {
      font-size: 1.2em;
      font-weight: bold;
      margin-bottom: 10px;
      padding: 10px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 5px;
      text-align: center;
    }

    .production-label {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    }

    .local-label {
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    }

    img {
      width: 100%;
      height: auto;
      border-radius: 5px;
      display: block;
      border: 1px solid #444;
    }

    .controls {
      position: fixed;
      top: 20px;
      right: 20px;
      background: #2a2a2a;
      padding: 15px;
      border-radius: 8px;
      border: 2px solid #667eea;
      box-shadow: 0 4px 12px rgba(0,0,0,0.5);
      z-index: 1000;
    }

    .toggle-btn {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 5px;
      cursor: pointer;
      font-size: 1em;
      margin: 5px;
      transition: all 0.2s ease;
    }

    .toggle-btn:hover {
      transform: scale(1.05);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }

    .toggle-btn:active {
      transform: scale(0.98);
    }

    .side-by-side {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }

    .stacked {
      display: grid;
      grid-template-columns: 1fr;
      gap: 20px;
    }

    .slider-container {
      position: relative;
      overflow: hidden;
      border-radius: 8px;
      background: #1a1a1a;
    }

    .slider-wrapper {
      position: relative;
      width: 100%;
    }

    .slider-image {
      width: 100%;
      height: auto;
      display: block;
    }

    .slider-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 50%;
      height: 100%;
      overflow: hidden;
      border-right: 3px solid #667eea;
    }

    .slider-handle {
      position: absolute;
      top: 0;
      left: 50%;
      width: 4px;
      height: 100%;
      background: #667eea;
      cursor: ew-resize;
      z-index: 10;
    }

    .slider-handle::before {
      content: '↔';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #667eea;
      color: white;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    }

    .info {
      background: #2a2a2a;
      padding: 15px;
      border-radius: 8px;
      margin-top: 20px;
      border-left: 4px solid #667eea;
    }

    @media (max-width: 1200px) {
      .comparison-container {
        grid-template-columns: 1fr;
      }
      .controls {
        position: static;
        margin-bottom: 20px;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🔍 Before/After Frontend Comparison</h1>
    <div class="subtitle">LIBRAlab Production vs Rescued Content</div>
    <div class="timestamp">Generated: ${new Date().toLocaleString()}</div>
  </div>

  <div class="controls">
    <div style="margin-bottom: 10px; font-weight: bold;">View Mode:</div>
    <button class="toggle-btn" onclick="setViewMode('side-by-side')">Side-by-Side</button>
    <button class="toggle-btn" onclick="setViewMode('stacked')">Stacked</button>
    <button class="toggle-btn" onclick="setViewMode('slider')">Slider</button>
  </div>

  <div id="content">
${pages.map((pageName, idx) => `
    <div class="page-section">
      <div class="page-title">📄 ${pageName.toUpperCase()}</div>

      <div id="container-${idx}" class="comparison-container side-by-side">
        <div class="screenshot-box">
          <div class="screenshot-label production-label">🌐 PRODUCTION (Current Live)</div>
          <img src="${pageName}-production.png" alt="Production ${pageName}" id="prod-${idx}">
        </div>
        <div class="screenshot-box">
          <div class="screenshot-label local-label">💻 LOCAL (After Rescue)</div>
          <img src="${pageName}-local.png" alt="Local ${pageName}" id="local-${idx}">
        </div>
      </div>

      <div class="info">
        <strong>💡 What to look for:</strong>
        <ul style="margin-left: 20px; margin-top: 10px;">
          <li>Room names (expect AI-themed: "Claude", "GPT-4 Suite")</li>
          <li>Pricing changes (expect €890-€1650 range)</li>
          <li>Layout and styling (should match exactly)</li>
          <li>Images loading correctly</li>
        </ul>
      </div>
    </div>
`).join('\n')}
  </div>

  <script>
    let currentMode = 'side-by-side';

    function setViewMode(mode) {
      currentMode = mode;
      const containers = document.querySelectorAll('[id^="container-"]');

      containers.forEach((container, idx) => {
        if (mode === 'side-by-side') {
          container.className = 'comparison-container side-by-side';
          container.innerHTML = \`
            <div class="screenshot-box">
              <div class="screenshot-label production-label">🌐 PRODUCTION</div>
              <img src="${pages[idx]}-production.png" alt="Production">
            </div>
            <div class="screenshot-box">
              <div class="screenshot-label local-label">💻 LOCAL</div>
              <img src="${pages[idx]}-local.png" alt="Local">
            </div>
          \`;
        } else if (mode === 'stacked') {
          container.className = 'comparison-container stacked';
          container.innerHTML = \`
            <div class="screenshot-box">
              <div class="screenshot-label production-label">🌐 PRODUCTION</div>
              <img src="${pages[idx]}-production.png" alt="Production">
            </div>
            <div class="screenshot-box">
              <div class="screenshot-label local-label">💻 LOCAL</div>
              <img src="${pages[idx]}-local.png" alt="Local">
            </div>
          \`;
        } else if (mode === 'slider') {
          container.className = 'comparison-container';
          container.innerHTML = \`
            <div class="slider-container" id="slider-\${idx}">
              <img src="${pages[idx]}-local.png" class="slider-image" alt="Local">
              <div class="slider-overlay" id="overlay-\${idx}">
                <img src="${pages[idx]}-production.png" class="slider-image" alt="Production">
              </div>
              <div class="slider-handle" id="handle-\${idx}"></div>
            </div>
          \`;
          initSlider(idx);
        }
      });

      // Highlight active button
      document.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.style.opacity = btn.textContent.toLowerCase().includes(mode.replace('-', ' ')) ? '1' : '0.6';
      });
    }

    function initSlider(idx) {
      const container = document.getElementById(\`slider-\${idx}\`);
      const overlay = document.getElementById(\`overlay-\${idx}\`);
      const handle = document.getElementById(\`handle-\${idx}\`);

      if (!container || !overlay || !handle) return;

      let isDragging = false;

      handle.addEventListener('mousedown', () => { isDragging = true; });
      document.addEventListener('mouseup', () => { isDragging = false; });

      document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;

        const rect = container.getBoundingClientRect();
        let x = e.clientX - rect.left;
        x = Math.max(0, Math.min(x, rect.width));

        const percentage = (x / rect.width) * 100;
        overlay.style.width = percentage + '%';
        handle.style.left = percentage + '%';
      });

      // Touch support
      handle.addEventListener('touchstart', () => { isDragging = true; });
      document.addEventListener('touchend', () => { isDragging = false; });

      document.addEventListener('touchmove', (e) => {
        if (!isDragging) return;

        const rect = container.getBoundingClientRect();
        let x = e.touches[0].clientX - rect.left;
        x = Math.max(0, Math.min(x, rect.width));

        const percentage = (x / rect.width) * 100;
        overlay.style.width = percentage + '%';
        handle.style.left = percentage + '%';
      });
    }

    // Initialize with side-by-side view
    setViewMode('side-by-side');
  </script>
</body>
</html>`;

    fs.writeFileSync(
      path.join(this.options.outputDir, 'index.html'),
      html
    );
  }
}

// CLI execution
async function main() {
  const args = process.argv.slice(2);

  const options: CompareOptions = {
    productionUrl: args.find(a => a.startsWith('--prod='))?.split('=')[1],
    localUrl: args.find(a => a.startsWith('--local='))?.split('=')[1],
    outputDir: args.find(a => a.startsWith('--output='))?.split('=')[1]
  };

  console.log('🚀 Visual Comparison Tool');
  console.log('═'.repeat(80));
  console.log(`Production: ${options.productionUrl || 'https://epic.libralab.ai'}`);
  console.log(`Local:      ${options.localUrl || 'http://localhost:3000'}`);
  console.log(`Output:     ${options.outputDir || './visual-comparison'}`);
  console.log('═'.repeat(80));
  console.log('');

  const comparator = new VisualCompare(options);

  try {
    await comparator.compare();
  } catch (error: any) {
    console.error('❌ Comparison failed:', error.message);
    if (error.message.includes('localhost')) {
      console.error('\n💡 Make sure your local server is running:');
      console.error('   cd web && npm run dev\n');
    }
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export default VisualCompare;
