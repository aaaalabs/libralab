# 📸 Visual Before/After Comparison Tool

**Simple frontend comparison between production and local**

---

## 🎯 One-Liner Quick Start

```bash
# Make sure local server is running first!
cd web && npm run dev
```

Then in another terminal:
```bash
npm run compare:visual
```

**Output:** Opens interactive HTML viewer with side-by-side screenshots

---

## 🚀 How It Works

1. **Takes screenshots** of production (https://epic.libralab.ai) and local (localhost:3000)
2. **Generates HTML viewer** with three view modes:
   - **Side-by-Side** - Screenshots next to each other
   - **Stacked** - One above the other
   - **Slider** - Drag to reveal (like before/after)
3. **Saves to** `./visual-comparison/`
4. **Auto-opens** `./visual-comparison/index.html` in browser

---

## 📋 Prerequisites

1. **Local server must be running:**
   ```bash
   cd web && npm run dev
   # Wait for "Ready on http://localhost:3000"
   ```

2. **Dependencies installed:**
   ```bash
   npm install
   # Puppeteer will download Chrome automatically
   ```

---

## 🎨 View Modes

### **Mode 1: Side-by-Side** (Default)
```
┌─────────────────┬─────────────────┐
│   PRODUCTION    │      LOCAL      │
│  (Live Site)    │  (Your Changes) │
└─────────────────┴─────────────────┘
```
**Best for:** Quick comparison, spotting layout differences

### **Mode 2: Stacked**
```
┌─────────────────┐
│   PRODUCTION    │
└─────────────────┘
┌─────────────────┐
│      LOCAL      │
└─────────────────┘
```
**Best for:** Detailed vertical comparison

### **Mode 3: Slider** (Interactive)
```
┌──────────|──────┐
│ PROD     | LOCAL│
│ (drag the bar!) │
└─────────────────┘
```
**Best for:** Pixel-perfect comparison, subtle changes

---

## 📸 What Gets Compared

**Default Pages:**
- `/` - Homepage (main room listings)
- `/apply` - Application page
- `/impressum` - Impressum/legal

**Custom Pages:**
```bash
# Compare specific pages
npx ts-node scripts/visual-compare.ts --pages=/,/rooms,/about
```

---

## ⚙️ Configuration

### Custom URLs
```bash
# Different production URL
npm run compare:visual -- --prod=https://staging.libralab.ai

# Different local port
npm run compare:visual -- --local=http://localhost:3001

# Custom output directory
npm run compare:visual -- --output=./my-comparison
```

### Full Custom Run
```bash
npx ts-node scripts/visual-compare.ts \
  --prod=https://epic.libralab.ai \
  --local=http://localhost:3000 \
  --output=./visual-comparison
```

---

## 🔍 What to Look For

After opening the HTML viewer (`visual-comparison/index.html`):

### ✅ **Should Match:**
- Overall layout and structure
- Navigation bar
- Footer
- Button placements
- Image positions
- Color scheme

### ⚠️ **Expected Differences:**
- **Room names:** "VIP Spot" → "Claude", "GPT-4 Suite"
- **Pricing:** €1110-€1510 → €890-€1650
- **Descriptions:** Should be updated/enhanced
- **Images:** May have more/different images
- **Metrics:** Workshop count, founder network stats

### ❌ **Red Flags:**
- Completely different layout
- Missing entire sections
- Broken images (404)
- Styling totally different
- Navigation broken

---

## 📊 Output Files

After running, check `./visual-comparison/`:

```
visual-comparison/
├── index.html              # Interactive viewer (OPEN THIS!)
├── homepage-production.png # Production homepage screenshot
├── homepage-local.png      # Local homepage screenshot
├── apply-production.png
├── apply-local.png
├── impressum-production.png
└── impressum-local.png
```

---

## 🎯 Typical Workflow

### **Step 1: Before Making Changes**
```bash
# Take baseline screenshots of current local
npm run compare:visual
# Saves to visual-comparison/
mv visual-comparison visual-comparison-baseline
```

### **Step 2: After Rescue System Runs**
```bash
# Update web/ with rescued data from web2/
cp web2/src/data/epicwg.json web/src/data/
cp -r web2/public/images/* web/public/images/

# Restart local server to pick up changes
cd web && npm run dev

# Take new screenshots
npm run compare:visual
# Saves to visual-comparison/
```

### **Step 3: Compare**
```bash
# Open the viewer
open visual-comparison/index.html

# Use slider mode to see exact pixel differences
# Use side-by-side to see overall changes
```

### **Step 4: Validate**
- ✅ Layout unchanged? Good!
- ✅ Room names updated? Expected!
- ✅ Pricing updated? Verify correct values
- ✅ Images loading? Check all rooms
- ❌ Broken layout? Fix before deploy

---

## 💡 Pro Tips

### **Tip 1: Multiple Resolutions**
```bash
# Desktop view (default)
npm run compare:visual

# Tablet view
npx ts-node scripts/visual-compare.ts --width=768 --height=1024

# Mobile view
npx ts-node scripts/visual-compare.ts --width=375 --height=667
```

### **Tip 2: Specific Room Pages**
```bash
# If you have room detail pages
npx ts-node scripts/visual-compare.ts --pages=/,/rooms/claude,/rooms/gpt4
```

### **Tip 3: Quick Diff Check**
```bash
# After running comparison, check file sizes
ls -lh visual-comparison/*.png

# If production and local screenshots have very different file sizes,
# the pages are likely different
```

### **Tip 4: Use Image Diff**
```bash
# Install ImageMagick for pixel-perfect comparison
brew install imagemagick

# Generate diff image
compare visual-comparison/homepage-production.png \
        visual-comparison/homepage-local.png \
        visual-comparison/homepage-diff.png
```

---

## 🐛 Troubleshooting

### "Connection refused to localhost:3000"
```bash
# Start your local server first
cd web && npm run dev
# Wait for "Ready on http://localhost:3000"
# Then run comparison in another terminal
```

### "Cannot find module 'puppeteer'"
```bash
npm install
# Puppeteer will download Chrome automatically (~100MB)
```

### Screenshots look broken/partial
```bash
# Increase timeout
# Edit scripts/visual-compare.ts line with waitUntil option
# Change timeout from 30000 to 60000
```

### Local page is blank
```bash
# Check if data file exists
ls -la web/src/data/epicwg.json

# If missing, copy from web2 first
cp web2/src/data/epicwg.json web/src/data/
```

---

## ⚡ Quick Commands Summary

```bash
# Most common workflow:

# 1. Start local server
cd web && npm run dev

# 2. Run comparison (in another terminal)
npm run compare:visual

# 3. View results
open visual-comparison/index.html

# 4. Done! Use slider mode to see exact differences
```

---

## 🎯 Bottom Line

**Simplest possible workflow:**

1. Start local server: `cd web && npm run dev`
2. Run comparison: `npm run compare:visual`
3. Open viewer: `open visual-comparison/index.html`
4. Use **slider mode** to drag and see before/after

**Takes 2 minutes total. Visual, interactive, easy!** 🎉

---

*Tool uses Puppeteer for screenshots, generates beautiful HTML viewer with 3 view modes*
