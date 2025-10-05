#!/usr/bin/env ts-node
/**
 * Web vs Web2 Comparison Tool
 * Compares the current web/ directory with web2/ rescue system output
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

interface ComparisonResult {
  timestamp: string;
  directories: DirectoryComparison;
  data: DataComparison;
  images: ImageComparison;
  structure: StructureComparison;
  summary: Summary;
}

interface DirectoryComparison {
  webOnly: string[];
  web2Only: string[];
  common: string[];
  totalWeb: number;
  totalWeb2: number;
}

interface DataComparison {
  epicwgExists: { web: boolean; web2: boolean };
  roomCount: { web: number; web2: number };
  differences: any[];
  summary: string;
}

interface ImageComparison {
  web: { total: number; rooms: number; epicwg: number; partners: number };
  web2: { total: number; rooms: number; epicwg: number; partners: number };
  webOnly: string[];
  web2Only: string[];
  common: string[];
}

interface StructureComparison {
  webHas: string[];
  web2Has: string[];
  differences: string[];
}

interface Summary {
  status: 'IDENTICAL' | 'DIFFERENT' | 'PARTIALLY_DIFFERENT';
  mainDifferences: string[];
  recommendations: string[];
}

class WebComparator {
  private webPath: string;
  private web2Path: string;
  private outputPath: string;

  constructor() {
    this.webPath = path.join(process.cwd(), 'web');
    this.web2Path = path.join(process.cwd(), 'web2');
    this.outputPath = path.join(process.cwd(), 'COMPARISON-REPORT.md');
  }

  async compare(): Promise<ComparisonResult> {
    console.log('🔍 Comparing web/ vs web2/...\n');

    const result: ComparisonResult = {
      timestamp: new Date().toISOString(),
      directories: await this.compareDirectories(),
      data: await this.compareData(),
      images: await this.compareImages(),
      structure: await this.compareStructure(),
      summary: {
        status: 'DIFFERENT',
        mainDifferences: [],
        recommendations: []
      }
    };

    // Generate summary
    result.summary = this.generateSummary(result);

    return result;
  }

  private async compareDirectories(): Promise<DirectoryComparison> {
    console.log('📁 Comparing directory structures...');

    const webFiles = this.getAllFiles(this.webPath);
    const web2Files = this.getAllFiles(this.web2Path);

    const webSet = new Set(webFiles);
    const web2Set = new Set(web2Files);

    const webOnly: string[] = [];
    const web2Only: string[] = [];
    const common: string[] = [];

    webFiles.forEach(file => {
      if (web2Set.has(file)) {
        common.push(file);
      } else {
        webOnly.push(file);
      }
    });

    web2Files.forEach(file => {
      if (!webSet.has(file)) {
        web2Only.push(file);
      }
    });

    console.log(`  ✅ web/ has ${webFiles.length} files`);
    console.log(`  ✅ web2/ has ${web2Files.length} files`);
    console.log(`  ✅ Common: ${common.length}, web-only: ${webOnly.length}, web2-only: ${web2Only.length}\n`);

    return {
      webOnly,
      web2Only,
      common,
      totalWeb: webFiles.length,
      totalWeb2: web2Files.length
    };
  }

  private getAllFiles(dir: string, baseDir?: string): string[] {
    const files: string[] = [];
    const base = baseDir || dir;

    if (!fs.existsSync(dir)) {
      return files;
    }

    const entries = fs.readdirSync(dir);

    for (const entry of entries) {
      // Skip node_modules, .next, etc.
      if (entry === 'node_modules' || entry === '.next' || entry.startsWith('.')) {
        continue;
      }

      const fullPath = path.join(dir, entry);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        files.push(...this.getAllFiles(fullPath, base));
      } else {
        const relativePath = path.relative(base, fullPath);
        files.push(relativePath);
      }
    }

    return files;
  }

  private async compareData(): Promise<DataComparison> {
    console.log('📊 Comparing data files...');

    const webDataPath = path.join(this.webPath, 'src/data/epicwg.json');
    const web2DataPath = path.join(this.web2Path, 'src/data/epicwg.json');

    const webExists = fs.existsSync(webDataPath);
    const web2Exists = fs.existsSync(web2DataPath);

    let roomCount = { web: 0, web2: 0 };
    let differences: any[] = [];
    let summary = '';

    if (webExists && web2Exists) {
      const webData = JSON.parse(fs.readFileSync(webDataPath, 'utf-8'));
      const web2Data = JSON.parse(fs.readFileSync(web2DataPath, 'utf-8'));

      roomCount.web = webData.rooms?.length || 0;
      roomCount.web2 = web2Data.rooms?.length || 0;

      // Compare rooms
      if (roomCount.web === roomCount.web2) {
        differences = this.compareRooms(webData.rooms, web2Data.rooms);
        summary = `Both have ${roomCount.web} rooms. ${differences.length} differences found.`;
      } else {
        summary = `Room count differs: web has ${roomCount.web}, web2 has ${roomCount.web2}`;
      }

      console.log(`  ✅ web/: ${roomCount.web} rooms`);
      console.log(`  ✅ web2/: ${roomCount.web2} rooms`);
      console.log(`  ✅ ${differences.length} differences detected\n`);
    } else {
      summary = `epicwg.json missing in ${!webExists ? 'web' : ''}${!webExists && !web2Exists ? ' and ' : ''}${!web2Exists ? 'web2' : ''}`;
      console.log(`  ⚠️  ${summary}\n`);
    }

    return {
      epicwgExists: { web: webExists, web2: web2Exists },
      roomCount,
      differences,
      summary
    };
  }

  private compareRooms(webRooms: any[], web2Rooms: any[]): any[] {
    const differences: any[] = [];

    for (let i = 0; i < Math.max(webRooms.length, web2Rooms.length); i++) {
      const webRoom = webRooms[i];
      const web2Room = web2Rooms[i];

      if (!webRoom || !web2Room) {
        differences.push({
          roomIndex: i,
          type: 'MISSING',
          missing: !webRoom ? 'web' : 'web2'
        });
        continue;
      }

      // Compare key fields
      const diff: any = { roomIndex: i, changes: [] };

      if (JSON.stringify(webRoom.title) !== JSON.stringify(web2Room.title)) {
        diff.changes.push({
          field: 'title',
          web: webRoom.title,
          web2: web2Room.title
        });
      }

      if (webRoom.price !== web2Room.price) {
        diff.changes.push({
          field: 'price',
          web: webRoom.price,
          web2: web2Room.price,
          difference: web2Room.price - webRoom.price
        });
      }

      if (webRoom.size !== web2Room.size) {
        diff.changes.push({
          field: 'size',
          web: webRoom.size,
          web2: web2Room.size
        });
      }

      if (diff.changes.length > 0) {
        differences.push(diff);
      }
    }

    return differences;
  }

  private async compareImages(): Promise<ImageComparison> {
    console.log('🖼️  Comparing images...');

    const webImages = this.getImages(path.join(this.webPath, 'public/images'));
    const web2Images = this.getImages(path.join(this.web2Path, 'public/images'));

    const webSet = new Set(webImages.all);
    const web2Set = new Set(web2Images.all);

    const webOnly = webImages.all.filter(img => !web2Set.has(img));
    const web2Only = web2Images.all.filter(img => !webSet.has(img));
    const common = webImages.all.filter(img => web2Set.has(img));

    console.log(`  ✅ web/: ${webImages.total} images (rooms: ${webImages.rooms}, epicwg: ${webImages.epicwg}, partners: ${webImages.partners})`);
    console.log(`  ✅ web2/: ${web2Images.total} images (rooms: ${web2Images.rooms}, epicwg: ${web2Images.epicwg}, partners: ${web2Images.partners})`);
    console.log(`  ✅ Common: ${common.length}, web-only: ${webOnly.length}, web2-only: ${web2Only.length}\n`);

    return {
      web: {
        total: webImages.total,
        rooms: webImages.rooms,
        epicwg: webImages.epicwg,
        partners: webImages.partners
      },
      web2: {
        total: web2Images.total,
        rooms: web2Images.rooms,
        epicwg: web2Images.epicwg,
        partners: web2Images.partners
      },
      webOnly,
      web2Only,
      common
    };
  }

  private getImages(imagesDir: string) {
    const result = {
      all: [] as string[],
      total: 0,
      rooms: 0,
      epicwg: 0,
      partners: 0
    };

    if (!fs.existsSync(imagesDir)) {
      return result;
    }

    const categories = ['rooms', 'epicwg', 'partners'];

    for (const category of categories) {
      const categoryPath = path.join(imagesDir, category);
      if (fs.existsSync(categoryPath)) {
        const files = fs.readdirSync(categoryPath).filter(f =>
          /\.(jpg|jpeg|png|webp|gif)$/i.test(f)
        );
        result[category as keyof typeof result] = files.length;
        result.total += files.length;
        result.all.push(...files.map(f => `${category}/${f}`));
      }
    }

    return result;
  }

  private async compareStructure(): Promise<StructureComparison> {
    console.log('🏗️  Comparing structure...');

    const webHas: string[] = [];
    const web2Has: string[] = [];
    const differences: string[] = [];

    // Check key directories
    const keyDirs = [
      'src',
      'src/app',
      'src/components',
      'src/data',
      'public',
      'public/images',
      'scripts',
      'scripts/rescue'
    ];

    for (const dir of keyDirs) {
      const webPath = path.join(this.webPath, dir);
      const web2Path = path.join(this.web2Path, dir);

      const webExists = fs.existsSync(webPath);
      const web2Exists = fs.existsSync(web2Path);

      if (webExists && !web2Exists) {
        webHas.push(dir);
        differences.push(`web/ has ${dir}, web2/ does not`);
      } else if (!webExists && web2Exists) {
        web2Has.push(dir);
        differences.push(`web2/ has ${dir}, web/ does not`);
      }
    }

    console.log(`  ✅ web-only directories: ${webHas.length}`);
    console.log(`  ✅ web2-only directories: ${web2Has.length}`);
    console.log(`  ✅ Structural differences: ${differences.length}\n`);

    return { webHas, web2Has, differences };
  }

  private generateSummary(result: ComparisonResult): Summary {
    const mainDifferences: string[] = [];
    const recommendations: string[] = [];

    // Analyze data differences
    if (result.data.differences.length > 0) {
      mainDifferences.push(
        `${result.data.differences.length} room data differences detected`
      );
    }

    if (result.data.roomCount.web !== result.data.roomCount.web2) {
      mainDifferences.push(
        `Room count differs: web=${result.data.roomCount.web}, web2=${result.data.roomCount.web2}`
      );
    }

    // Analyze image differences
    if (result.images.webOnly.length > 0) {
      mainDifferences.push(
        `${result.images.webOnly.length} images only in web/`
      );
    }

    if (result.images.web2Only.length > 0) {
      mainDifferences.push(
        `${result.images.web2Only.length} images only in web2/ (rescued from production)`
      );
      recommendations.push(
        `Copy new images from web2/ to web/: cp -r web2/public/images/* web/public/images/`
      );
    }

    // Analyze structure
    if (result.structure.web2Has.includes('scripts/rescue')) {
      mainDifferences.push('web2/ contains rescue system (expected)');
    }

    if (result.structure.webHas.includes('src/app')) {
      mainDifferences.push('web/ contains full Next.js application');
      recommendations.push(
        'web/ is the main application, web2/ is the rescue system'
      );
    }

    // Determine overall status
    let status: 'IDENTICAL' | 'DIFFERENT' | 'PARTIALLY_DIFFERENT';

    if (mainDifferences.length === 0) {
      status = 'IDENTICAL';
    } else if (mainDifferences.length <= 3) {
      status = 'PARTIALLY_DIFFERENT';
    } else {
      status = 'DIFFERENT';
    }

    // Add general recommendations
    if (!result.data.epicwgExists.web2 && result.structure.web2Has.includes('scripts/rescue')) {
      recommendations.push(
        'Run the rescue system first: cd web2 && npm run rescue:autonomous'
      );
      recommendations.push(
        'After rescue completes, compare again to see extracted production data'
      );
    }

    if (result.data.differences.length > 0) {
      recommendations.push(
        'Review data differences in detail before copying to production'
      );
    }

    return { status, mainDifferences, recommendations };
  }

  async generateReport(result: ComparisonResult): Promise<void> {
    const report = this.formatMarkdownReport(result);
    fs.writeFileSync(this.outputPath, report);
    console.log(`\n📄 Full report saved to: ${this.outputPath}\n`);
  }

  private formatMarkdownReport(result: ComparisonResult): string {
    return `# Web vs Web2 Comparison Report

**Generated:** ${new Date(result.timestamp).toLocaleString()}
**Status:** ${result.summary.status}

---

## 📊 Executive Summary

${result.summary.mainDifferences.map(d => `- ${d}`).join('\n')}

### Recommendations:
${result.summary.recommendations.map(r => `- ${r}`).join('\n')}

---

## 📁 Directory Comparison

| Metric | web/ | web2/ |
|--------|------|-------|
| Total Files | ${result.directories.totalWeb} | ${result.directories.totalWeb2} |
| Common Files | ${result.directories.common.length} | ${result.directories.common.length} |
| Unique Files | ${result.directories.webOnly.length} | ${result.directories.web2Only.length} |

### Files Only in web/
${result.directories.webOnly.length > 0 ? result.directories.webOnly.slice(0, 10).map(f => `- ${f}`).join('\n') : '*None*'}
${result.directories.webOnly.length > 10 ? `\n...and ${result.directories.webOnly.length - 10} more` : ''}

### Files Only in web2/
${result.directories.web2Only.length > 0 ? result.directories.web2Only.slice(0, 10).map(f => `- ${f}`).join('\n') : '*None*'}
${result.directories.web2Only.length > 10 ? `\n...and ${result.directories.web2Only.length - 10} more` : ''}

---

## 📊 Data Comparison

| Aspect | web/ | web2/ |
|--------|------|-------|
| epicwg.json exists | ${result.data.epicwgExists.web ? '✅' : '❌'} | ${result.data.epicwgExists.web2 ? '✅' : '❌'} |
| Room Count | ${result.data.roomCount.web} | ${result.data.roomCount.web2} |
| Differences | ${result.data.differences.length} changes |

### Data Differences:
${result.data.differences.length > 0
  ? result.data.differences.slice(0, 5).map(d =>
      `- Room ${d.roomIndex}: ${d.changes?.map((c: any) => `${c.field} changed`).join(', ') || 'Missing room'}`
    ).join('\n')
  : '*No differences or data not yet available*'}
${result.data.differences.length > 5 ? `\n...and ${result.data.differences.length - 5} more` : ''}

---

## 🖼️  Image Comparison

| Category | web/ | web2/ | Difference |
|----------|------|-------|------------|
| **Total** | ${result.images.web.total} | ${result.images.web2.total} | ${result.images.web2.total - result.images.web.total > 0 ? '+' : ''}${result.images.web2.total - result.images.web.total} |
| Rooms | ${result.images.web.rooms} | ${result.images.web2.rooms} | ${result.images.web2.rooms - result.images.web.rooms > 0 ? '+' : ''}${result.images.web2.rooms - result.images.web.rooms} |
| EpicWG | ${result.images.web.epicwg} | ${result.images.web2.epicwg} | ${result.images.web2.epicwg - result.images.web.epicwg > 0 ? '+' : ''}${result.images.web2.epicwg - result.images.web.epicwg} |
| Partners | ${result.images.web.partners} | ${result.images.web2.partners} | ${result.images.web2.partners - result.images.web.partners > 0 ? '+' : ''}${result.images.web2.partners - result.images.web.partners} |

### Images Only in web/:
${result.images.webOnly.slice(0, 10).map(img => `- ${img}`).join('\n') || '*None*'}
${result.images.webOnly.length > 10 ? `\n...and ${result.images.webOnly.length - 10} more` : ''}

### Images Only in web2/:
${result.images.web2Only.slice(0, 10).map(img => `- ${img}`).join('\n') || '*None*'}
${result.images.web2Only.length > 10 ? `\n...and ${result.images.web2Only.length - 10} more` : ''}

---

## 🏗️  Structure Comparison

### Directories Only in web/:
${result.structure.webHas.map(d => `- ${d}`).join('\n') || '*None*'}

### Directories Only in web2/:
${result.structure.web2Has.map(d => `- ${d}`).join('\n') || '*None*'}

### Key Structural Differences:
${result.structure.differences.map(d => `- ${d}`).join('\n') || '*None*'}

---

## 🎯 Next Steps

${result.summary.recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n')}

---

*Generated by Web Comparator Tool*
`;
  }

  printSummary(result: ComparisonResult): void {
    console.log('═'.repeat(80));
    console.log('📊 COMPARISON SUMMARY');
    console.log('═'.repeat(80));
    console.log(`Status: ${result.summary.status}`);
    console.log('\nMain Differences:');
    result.summary.mainDifferences.forEach(d => console.log(`  - ${d}`));
    console.log('\nRecommendations:');
    result.summary.recommendations.forEach(r => console.log(`  - ${r}`));
    console.log('═'.repeat(80));
  }
}

// Main execution
async function main() {
  const comparator = new WebComparator();

  try {
    const result = await comparator.compare();
    comparator.printSummary(result);
    await comparator.generateReport(result);
  } catch (error: any) {
    console.error('❌ Comparison failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export default WebComparator;
