#!/bin/bash
# Web vs Web2 Comparison Tool
# Quick comparison between web/ and web2/ directories

echo "🔍 Comparing web/ vs web2/"
echo "═══════════════════════════════════════════════════════════════════════════════"
echo ""

# 1. Directory Structure Comparison
echo "📁 DIRECTORY STRUCTURE"
echo "───────────────────────────────────────────────────────────────────────────────"
echo "web/ directories:"
find web -type d -maxdepth 3 | grep -v node_modules | grep -v ".next" | head -20
echo ""
echo "web2/ directories:"
find web2 -type d -maxdepth 3 | grep -v node_modules | head -20
echo ""

# 2. Data File Comparison
echo "📊 DATA FILES"
echo "───────────────────────────────────────────────────────────────────────────────"
if [ -f "web/src/data/epicwg.json" ]; then
    WEB_ROOMS=$(jq '.rooms | length' web/src/data/epicwg.json 2>/dev/null || echo "N/A")
    echo "web/src/data/epicwg.json: $WEB_ROOMS rooms"
else
    echo "web/src/data/epicwg.json: ❌ NOT FOUND"
fi

if [ -f "web2/src/data/epicwg.json" ]; then
    WEB2_ROOMS=$(jq '.rooms | length' web2/src/data/epicwg.json 2>/dev/null || echo "N/A")
    echo "web2/src/data/epicwg.json: $WEB2_ROOMS rooms"
else
    echo "web2/src/data/epicwg.json: ❌ NOT FOUND"
fi
echo ""

# 3. Image Comparison
echo "🖼️  IMAGES"
echo "───────────────────────────────────────────────────────────────────────────────"
if [ -d "web/public/images" ]; then
    WEB_IMAGES=$(find web/public/images -type f \( -name "*.jpg" -o -name "*.png" -o -name "*.webp" \) 2>/dev/null | wc -l)
    echo "web/public/images: $WEB_IMAGES images"
    echo "  - rooms: $(find web/public/images/rooms -type f 2>/dev/null | wc -l)"
    echo "  - epicwg: $(find web/public/images/epicwg -type f 2>/dev/null | wc -l)"
    echo "  - partners: $(find web/public/images/partners -type f 2>/dev/null | wc -l)"
else
    echo "web/public/images: ❌ NOT FOUND"
fi

if [ -d "web2/public/images" ]; then
    WEB2_IMAGES=$(find web2/public/images -type f \( -name "*.jpg" -o -name "*.png" -o -name "*.webp" \) 2>/dev/null | wc -l)
    echo "web2/public/images: $WEB2_IMAGES images"
    echo "  - rooms: $(find web2/public/images/rooms -type f 2>/dev/null | wc -l)"
    echo "  - epicwg: $(find web2/public/images/epicwg -type f 2>/dev/null | wc -l)"
    echo "  - partners: $(find web2/public/images/partners -type f 2>/dev/null | wc -l)"
else
    echo "web2/public/images: ❌ NOT FOUND"
fi
echo ""

# 4. Rescue System Status
echo "🤖 RESCUE SYSTEM STATUS"
echo "───────────────────────────────────────────────────────────────────────────────"
if [ -d "web2/scripts/rescue" ]; then
    AGENT_COUNT=$(find web2/scripts/rescue/agents -name "*.ts" 2>/dev/null | wc -l)
    echo "✅ Rescue system installed in web2/"
    echo "   Agents: $AGENT_COUNT"
    echo "   Status: Ready to run"
else
    echo "❌ Rescue system not found in web2/"
fi
echo ""

# 5. Git Status
echo "📝 GIT STATUS"
echo "───────────────────────────────────────────────────────────────────────────────"
git status --short | head -10
echo ""

# 6. Summary
echo "═══════════════════════════════════════════════════════════════════════════════"
echo "🎯 QUICK COMPARISON SUMMARY"
echo "═══════════════════════════════════════════════════════════════════════════════"

if [ -f "web/src/data/epicwg.json" ] && [ -f "web2/src/data/epicwg.json" ]; then
    if diff web/src/data/epicwg.json web2/src/data/epicwg.json > /dev/null 2>&1; then
        echo "✅ Data files are IDENTICAL"
    else
        echo "⚠️  Data files are DIFFERENT"
        echo "   Run: diff web/src/data/epicwg.json web2/src/data/epicwg.json | head -50"
    fi
else
    echo "⚠️  Cannot compare - one or both data files missing"
    echo ""
    if [ ! -f "web2/src/data/epicwg.json" ]; then
        echo "💡 Run rescue system first: cd web2 && npm run rescue:autonomous"
    fi
fi
echo ""

echo "📋 DETAILED COMPARISON AVAILABLE:"
echo "   - JSON data: diff web/src/data/epicwg.json web2/src/data/epicwg.json"
echo "   - Images: diff -qr web/public/images web2/public/images"
echo "   - All files: diff -r web web2 | grep -v node_modules | head -50"
echo ""
echo "═══════════════════════════════════════════════════════════════════════════════"
