# Web vs Web2 Comparison Guide

**Purpose:** Compare the current `web/` directory with `web2/` rescue system output

---

## 🎯 Quick Comparison Methods

### **Method 1: Quick Shell Script** (Recommended for quick check)

```bash
./compare.sh
```

**Output:**
- Directory structure comparison
- Data file comparison (room counts)
- Image counts by category
- Rescue system status
- Git status
- Quick summary

**Duration:** < 10 seconds

---

### **Method 2: Detailed TypeScript Tool**

```bash
npx ts-node scripts/compare-web-versions.ts
```

**Output:**
- Complete file-by-file comparison
- Room-by-room data differences
- Image-by-image comparison
- Structural analysis
- Markdown report saved to `COMPARISON-REPORT.md`

**Duration:** ~30 seconds

---

### **Method 3: Manual Diff Commands**

#### Compare Data Files
```bash
# Quick check if identical
diff web/src/data/epicwg.json web2/src/data/epicwg.json

# Detailed JSON diff with jq
diff <(jq -S . web/src/data/epicwg.json) <(jq -S . web2/src/data/epicwg.json)

# Room-by-room comparison
jq '.rooms[] | {id, title, price, size}' web/src/data/epicwg.json > /tmp/web-rooms.json
jq '.rooms[] | {id, title, price, size}' web2/src/data/epicwg.json > /tmp/web2-rooms.json
diff /tmp/web-rooms.json /tmp/web2-rooms.json
```

#### Compare Images
```bash
# List images in each directory
find web/public/images -type f | sort > /tmp/web-images.txt
find web2/public/images -type f | sort > /tmp/web2-images.txt
diff /tmp/web-images.txt /tmp/web2-images.txt

# Quick count comparison
echo "web/: $(find web/public/images -type f | wc -l) images"
echo "web2/: $(find web2/public/images -type f | wc -l) images"

# Images only in web2 (rescued from production)
comm -13 <(find web/public/images -type f | sort) <(find web2/public/images -type f | sort)
```

#### Compare Directory Structure
```bash
# Recursive diff (excluding node_modules)
diff -r web web2 --exclude=node_modules --exclude=.next --exclude=dist | head -100

# Directory tree comparison
tree -L 3 -I 'node_modules|.next' web > /tmp/web-tree.txt
tree -L 3 -I 'node_modules' web2 > /tmp/web2-tree.txt
diff /tmp/web-tree.txt /tmp/web2-tree.txt
```

---

## 📊 **What to Compare**

### **1. Data Content** (Most Important)

**File:** `web/src/data/epicwg.json` vs `web2/src/data/epicwg.json`

**Check:**
- Room count (should increase after rescue)
- Room names (expect AI-themed names in web2: "Claude", "GPT-4")
- Pricing (expect different values)
- Descriptions (should be more detailed in web2)
- Images arrays (should have more entries in web2)

**Command:**
```bash
# Side-by-side room comparison
jq -r '.rooms[] | "\(.id): \(.title.en // .title) - €\(.price)"' web/src/data/epicwg.json
jq -r '.rooms[] | "\(.id): \(.title.en // .title) - €\(.price)"' web2/src/data/epicwg.json
```

---

### **2. Images**

**Directories:**
- `web/public/images/` vs `web2/public/images/`

**Check:**
- New images downloaded from production (web2Only)
- Image count per category (rooms, epicwg, partners)
- Missing images that should be rescued

**Command:**
```bash
# New images in web2 (rescued from production)
comm -13 \
  <(find web/public/images -name "*.jpg" -o -name "*.webp" -o -name "*.png" | sort) \
  <(find web2/public/images -name "*.jpg" -o -name "*.webp" -o -name "*.png" | sort)
```

---

### **3. File Structure**

**Check:**
- web/ has full Next.js app (src/app, src/components, etc.)
- web2/ has rescue system (scripts/rescue with 20 agents)
- Common files (package.json, tsconfig.json, etc.)

**Command:**
```bash
# Show unique directories
diff <(find web -type d | grep -v node_modules | sort) \
     <(find web2 -type d | grep -v node_modules | sort)
```

---

### **4. Rescue System Outputs** (After Execution)

**Directory:** `web2/scripts/rescue/outputs/`

**Check:**
- `01-discovery/` - URL maps, sitemaps
- `02-extraction/` - Scraped content, images
- `03-comparison/` - **Diff reports** (KEY!)
- `04-implementation/` - Updated files manifest
- `05-validation/` - **Final report** (KEY!)

**Command:**
```bash
# Check if rescue has run
ls -la web2/scripts/rescue/outputs/*/

# Read key reports
cat web2/scripts/rescue/outputs/03-comparison/diff-report-*.md
cat web2/scripts/rescue/outputs/05-validation/FINAL-REPORT.md
```

---

## 🔄 **Comparison Workflow**

### **Before Rescue:**
```bash
./compare.sh
```
**Expected:**
- web2/ has minimal files
- No epicwg.json in web2/src/data/
- web/ has production app code
- **Status:** "web2 is empty, rescue not run yet"

---

### **After Rescue:**
```bash
./compare.sh
```
**Expected:**
- web2/src/data/epicwg.json created with production data
- web2/public/images/ populated with downloaded images
- **Status:** "web2 has rescued production data"

Then:
```bash
# Detailed comparison
npx ts-node scripts/compare-web-versions.ts

# Read the full report
open COMPARISON-REPORT.md
```

---

### **After Copying to Web:**
```bash
# Copy rescued data
cp web2/src/data/epicwg.json web/src/data/
cp -r web2/public/images/* web/public/images/

# Compare again
./compare.sh
```
**Expected:**
- Data files now identical
- Image counts similar
- **Status:** "web and web2 are synchronized"

---

## 📋 **Comparison Checklist**

Use this checklist before deploying:

- [ ] **Data Comparison**
  - [ ] Room counts match or web2 has more
  - [ ] AI-themed room names in web2 ("Claude", "GPT-4")
  - [ ] Pricing updated in web2
  - [ ] All translations present (EN/DE)

- [ ] **Image Comparison**
  - [ ] web2 has >= images as web
  - [ ] No broken image paths
  - [ ] All room images present

- [ ] **Rescue System Validation**
  - [ ] Final report shows "GO" or "REVIEW_REQUIRED"
  - [ ] Confidence score >= 85%
  - [ ] Build validation passed
  - [ ] Visual comparison passed

- [ ] **Git Status**
  - [ ] web2 has branch `rescue/production-sync-{timestamp}`
  - [ ] All changes committed
  - [ ] Main web/ directory not modified yet

---

## 🎯 **Specific Comparison Commands**

### Compare Room Names
```bash
# Show room names side-by-side
echo "=== WEB ===" && jq -r '.rooms[] | .title.en // .title' web/src/data/epicwg.json
echo "=== WEB2 ===" && jq -r '.rooms[] | .title.en // .title' web2/src/data/epicwg.json
```

### Compare Pricing
```bash
# Show price comparison
paste \
  <(jq -r '.rooms[] | "\(.title.en // .title): €\(.price)"' web/src/data/epicwg.json) \
  <(jq -r '.rooms[] | "\(.title.en // .title): €\(.price)"' web2/src/data/epicwg.json) \
  | column -t -s $'\t'
```

### Compare Images
```bash
# Images only in web2 (new from production)
comm -13 \
  <(find web/public/images -type f -name "*.jpg" | sort) \
  <(find web2/public/images -type f -name "*.jpg" | sort)
```

### Compare File Sizes
```bash
# Data file sizes
ls -lh web/src/data/epicwg.json web2/src/data/epicwg.json 2>/dev/null
```

---

## 📈 **Visual Comparison (After Rescue)**

After rescue completes, web2 generates visual comparison automatically:

```bash
# View screenshot comparisons
open web2/scripts/rescue/outputs/05-validation/visual-diff/

# Files in visual-diff/:
# - production-homepage.png
# - local-homepage.png
# - diff-homepage.png (red highlights show differences)
```

---

## 🔧 **Advanced Comparison**

### Build Comparison Tool in VS Code
```bash
# Install extension: "Diff Tool" or "Compare Folders"
# Or use VS Code built-in:
code --diff web/src/data/epicwg.json web2/src/data/epicwg.json
```

### JSON Diff with Better Output
```bash
npm install -g json-diff

# Pretty diff
json-diff web/src/data/epicwg.json web2/src/data/epicwg.json
```

### Use git diff (if both in git)
```bash
# Create a comparison commit
git diff --no-index web/src/data/epicwg.json web2/src/data/epicwg.json
```

---

## 📊 **Expected Differences**

### **Before Rescue:**
| Aspect | web/ | web2/ |
|--------|------|-------|
| Purpose | Production app | Rescue system |
| src/data/ | ✅ Current data | ❌ Empty |
| src/app/ | ✅ Full Next.js | ❌ No app code |
| public/images/ | ✅ Current images | ❌ Empty |
| scripts/rescue/ | ❌ None | ✅ 20 agents |

### **After Rescue:**
| Aspect | web/ | web2/ |
|--------|------|-------|
| Purpose | Production app (outdated) | Rescue system + rescued data |
| src/data/ | ❌ OLD data | ✅ NEW production data |
| public/images/ | ❌ OLD images | ✅ NEW production images |
| Room names | "VIP Spot" | "Claude", "GPT-4" |
| Pricing | €1110-€1510 | €890-€1650 |

---

## 🎯 **Key Comparison Questions**

After rescue execution, answer these:

1. **How many rooms in each?**
   - `jq '.rooms | length' web/src/data/epicwg.json`
   - `jq '.rooms | length' web2/src/data/epicwg.json`

2. **What are the room names?**
   - `jq -r '.rooms[].title' web/src/data/epicwg.json`
   - `jq -r '.rooms[].title' web2/src/data/epicwg.json`

3. **How do prices compare?**
   - `jq -r '.rooms[] | .price' web/src/data/epicwg.json | paste -sd+ | bc`
   - `jq -r '.rooms[] | .price' web2/src/data/epicwg.json | paste -sd+ | bc`

4. **How many images were rescued?**
   - `find web2/public/images -type f | wc -l` minus `find web/public/images -type f | wc -l`

5. **What's the confidence score?**
   - `cat web2/scripts/rescue/outputs/05-validation/FINAL-REPORT.md | grep -i confidence`

---

## 📋 **Decision Matrix**

Based on comparison results:

| Confidence | Differences | Action |
|------------|-------------|--------|
| ≥ 95% | < 5% data change | ✅ Safe to copy immediately |
| 85-94% | 5-20% data change | ⚠️  Review changes, then copy |
| 70-84% | 20-40% data change | 🔍 Detailed review required |
| < 70% | > 40% data change | ❌ Investigate issues first |

---

## 🚀 **Copy Web2 to Web** (When Ready)

After reviewing comparison and approving:

```bash
# Backup web/ first
cp web/src/data/epicwg.json web/src/data/epicwg.json.backup-$(date +%Y%m%d-%H%M%S)

# Copy rescued data
cp web2/src/data/epicwg.json web/src/data/

# Copy rescued images
cp -r web2/public/images/* web/public/images/

# Verify
./compare.sh

# Test build
cd web && npm run build

# If successful, deploy
# (when deployment warning is lifted)
```

---

## 🔍 **Real-Time Monitoring During Rescue**

While rescue is running (4-6 hours):

```bash
# Monitor progress
tail -f web2/scripts/rescue/outputs/rescue.log

# Check current phase
ls -lt web2/scripts/rescue/outputs/

# Check extracted rooms so far
jq '.rooms | length' web2/scripts/rescue/outputs/02-extraction/extracted-data.json 2>/dev/null || echo "Not yet extracted"
```

---

## 📊 **Comparison Report Contents**

After running `npx ts-node scripts/compare-web-versions.ts`:

**COMPARISON-REPORT.md includes:**
1. Executive Summary
   - Overall status (IDENTICAL/DIFFERENT/PARTIALLY_DIFFERENT)
   - Main differences highlighted
   - Recommendations

2. Directory Comparison
   - Total files in each
   - Common files
   - Unique files list

3. Data Comparison
   - Room count comparison
   - Room-by-room differences
   - Field changes (title, price, size)

4. Image Comparison
   - Count by category
   - New images in web2
   - Missing images

5. Structure Comparison
   - Unique directories
   - Key structural differences

6. Next Steps
   - Prioritized actions
   - Copy commands if approved

---

## 💡 **Pro Tips**

### 1. Use jq for JSON Comparison
```bash
# Install jq if not available
brew install jq

# Compare specific fields
diff <(jq '.rooms[].price' web/src/data/epicwg.json) \
     <(jq '.rooms[].price' web2/src/data/epicwg.json)
```

### 2. Visual Diff in VS Code
```bash
code --diff web/src/data/epicwg.json web2/src/data/epicwg.json
```

### 3. Create Comparison Branch
```bash
# Create branch with web2 data for review
git checkout -b review/rescued-content
cp web2/src/data/epicwg.json web/src/data/
git add web/src/data/epicwg.json
git diff --staged
# Review changes, then decide to commit or discard
```

### 4. Use the Rescue System's Own Comparison
The rescue system generates its own comparison in Phase 3:
```bash
# Read the built-in comparison
cat web2/scripts/rescue/outputs/03-comparison/diff-report-*.md
```

---

## 🎯 **Comparison Workflow**

```
1. Before Rescue
   ↓
   ./compare.sh
   ↓
   "web2 is empty, rescue not run"

2. Run Rescue
   ↓
   cd web2 && npm run rescue:autonomous
   ↓
   [Wait 4-6 hours]

3. After Rescue
   ↓
   ./compare.sh
   ↓
   "web2 has new data, X rooms, Y images"
   ↓
   npx ts-node scripts/compare-web-versions.ts
   ↓
   Review COMPARISON-REPORT.md

4. Review Rescue Outputs
   ↓
   cat web2/scripts/rescue/outputs/05-validation/FINAL-REPORT.md
   ↓
   open web2/scripts/rescue/outputs/review-package.html

5. Decision
   ↓
   If approved:
     cp web2/src/data/epicwg.json web/src/data/
     cp -r web2/public/images/* web/public/images/
   ↓
   ./compare.sh
   ↓
   "web and web2 are synchronized"

6. Deploy
   ↓
   cd web && npm run build
   ↓
   [When deployment warning lifted]
```

---

## 🚨 **What to Watch For**

### Red Flags in Comparison:
- ❌ Room count decreased (data loss)
- ❌ All prices set to 0 or default values
- ❌ Missing translations (all EN or all DE)
- ❌ No images downloaded
- ❌ Duplicate room IDs

### Good Signs:
- ✅ Room count same or increased
- ✅ AI-themed room names present
- ✅ Realistic pricing range
- ✅ Both EN/DE translations
- ✅ Images downloaded successfully
- ✅ Confidence score >= 85%

---

## 📝 **Quick Reference Commands**

```bash
# Quick comparison
./compare.sh

# Detailed comparison
npx ts-node scripts/compare-web-versions.ts

# Room names
diff <(jq -r '.rooms[].title' web/src/data/epicwg.json) \
     <(jq -r '.rooms[].title' web2/src/data/epicwg.json)

# Pricing
paste \
  <(jq -r '.rooms[] | .price' web/src/data/epicwg.json) \
  <(jq -r '.rooms[] | .price' web2/src/data/epicwg.json)

# Image count
echo "web: $(find web/public/images -type f | wc -l)"
echo "web2: $(find web2/public/images -type f | wc -l)"

# Rescue status
cat web2/scripts/rescue/outputs/05-validation/FINAL-REPORT.md 2>/dev/null || echo "Rescue not run yet"
```

---

## 🎯 **Bottom Line**

**Two simple ways:**

1. **Quick:** `./compare.sh` (10 seconds)
2. **Detailed:** `npx ts-node scripts/compare-web-versions.ts` (30 seconds)

Both generate clear output showing exactly what's different between web/ and web2/.

After rescue completes, use these tools to validate the rescued content before copying to production web/ directory.

---

*Last Updated: October 5, 2025*
