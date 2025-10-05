#!/usr/bin/env ts-node
/**
 * Simplified Autonomous Rescue - Direct Firecrawl Implementation
 * Gets production content running NOW without complex agent coordination
 */

import 'dotenv/config';
import FirecrawlApp from '@mendable/firecrawl-js';
import fs from 'fs';
import path from 'path';
import * as cheerio from 'cheerio';
import chalk from 'chalk';

const PRODUCTION_URL = 'https://epic.libralab.ai';
const API_KEY = process.env.FIRECRAWL_API_KEY || 'fc-bbe5576ee3944e15bd7dafb234eb129b';

async function main() {
  console.log(chalk.bold.cyan('\n🚀 Starting Simple Autonomous Rescue\n'));

  const firecrawl = new FirecrawlApp({ apiKey: API_KEY });

  // Step 1: Scrape homepage
  console.log(chalk.blue('📥 Step 1: Scraping production homepage...'));
  const scrapeResult = await firecrawl.scrapeUrl(PRODUCTION_URL, {
    formats: ['markdown', 'html']
  });

  if (!scrapeResult.success) {
    throw new Error('Failed to scrape production site');
  }

  console.log(chalk.green('✅ Homepage scraped successfully\n'));

  // Step 2: Extract room data using Cheerio
  console.log(chalk.blue('📊 Step 2: Extracting room data...'));
  const $ = cheerio.load(scrapeResult.html || '');

  const rooms: any[] = [];

  // Try multiple selectors to find room cards
  const roomSelectors = [
    '.room-card',
    '[data-room]',
    '.listing-card',
    'article',
    '.card'
  ];

  for (const selector of roomSelectors) {
    const elements = $(selector);
    if (elements.length > 0) {
      console.log(chalk.gray(`Found ${elements.length} elements with selector: ${selector}`));
      break;
    }
  }

  // Parse markdown for room data
  const markdown = scrapeResult.markdown || '';
  const lines = markdown.split('\n');

  let currentRoom: any = null;

  for (const line of lines) {
    // Look for room titles (headers)
    if (line.startsWith('##') || line.startsWith('###')) {
      if (currentRoom) {
        rooms.push(currentRoom);
      }
      currentRoom = {
        id: `room-${rooms.length + 1}`,
        title: line.replace(/^#+\s*/, '').trim(),
        description: '',
        images: [],
        features: []
      };
    }

    // Look for pricing
    const priceMatch = line.match(/€(\d+)/);
    if (priceMatch && currentRoom) {
      currentRoom.price = parseInt(priceMatch[1]);
    }

    // Look for size
    const sizeMatch = line.match(/(\d+)\s*m²/);
    if (sizeMatch && currentRoom) {
      currentRoom.size = parseInt(sizeMatch[1]);
    }

    // Collect description
    if (currentRoom && line.trim() && !line.startsWith('#') && !line.startsWith('!')) {
      currentRoom.description += line.trim() + ' ';
    }
  }

  if (currentRoom) {
    rooms.push(currentRoom);
  }

  console.log(chalk.green(`✅ Extracted ${rooms.length} rooms\n`));

  // Step 3: Save data
  console.log(chalk.blue('💾 Step 3: Saving data...'));

  const outputData = {
    lastUpdated: new Date().toISOString(),
    version: '2.0-rescued',
    source: 'production-rescue',
    rooms: rooms,
    location: {
      description: 'AI-Powered Co-Living Space near Innsbruck, Austria',
      address: 'Omes, near Innsbruck'
    }
  };

  const dataPath = path.join(process.cwd(), 'src/data/epicwg.json');
  const dataDir = path.dirname(dataPath);

  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Backup if exists
  if (fs.existsSync(dataPath)) {
    const backupPath = `${dataPath}.backup-${Date.now()}`;
    fs.copyFileSync(dataPath, backupPath);
    console.log(chalk.gray(`Backup created: ${backupPath}`));
  }

  fs.writeFileSync(dataPath, JSON.stringify(outputData, null, 2));
  console.log(chalk.green(`✅ Data saved to: ${dataPath}\n`));

  // Step 4: Download images
  console.log(chalk.blue('🖼️  Step 4: Downloading images...'));

  const imageLinks = scrapeResult.links?.filter((link: string) =>
    /\.(jpg|jpeg|png|webp|gif)$/i.test(link)
  ) || [];

  console.log(chalk.gray(`Found ${imageLinks.length} image links`));

  const imagesDir = path.join(process.cwd(), 'public/images/rooms');
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }

  let downloaded = 0;
  for (const link of imageLinks.slice(0, 20)) {  // Limit to 20 for quick test
    try {
      const url = link.startsWith('http') ? link : `${PRODUCTION_URL}${link}`;
      const response = await fetch(url);
      if (response.ok) {
        const buffer = await response.arrayBuffer();
        const filename = path.basename(new URL(url).pathname);
        const filepath = path.join(imagesDir, filename);
        fs.writeFileSync(filepath, Buffer.from(buffer));
        downloaded++;
      }
    } catch (error) {
      // Skip failed images
    }
  }

  console.log(chalk.green(`✅ Downloaded ${downloaded}/${imageLinks.length} images\n`));

  // Summary
  console.log(chalk.bold.cyan('═'.repeat(80)));
  console.log(chalk.bold.cyan('🎉 RESCUE COMPLETE'));
  console.log(chalk.bold.cyan('═'.repeat(80)));
  console.log(chalk.white(`Rooms Extracted: ${rooms.length}`));
  console.log(chalk.white(`Images Downloaded: ${downloaded}`));
  console.log(chalk.white(`Data Saved: ${dataPath}`));
  console.log(chalk.bold.cyan('═'.repeat(80) + '\n'));

  console.log(chalk.yellow('Next steps:'));
  console.log(chalk.white('1. Review: cat src/data/epicwg.json'));
  console.log(chalk.white('2. Compare: npm run compare:quick'));
  console.log(chalk.white('3. Copy to web/: cp src/data/epicwg.json ../web/src/data/\n'));
}

main().catch(error => {
  console.error(chalk.red('\n❌ Error:'), error.message);
  process.exit(1);
});
