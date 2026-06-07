#!/bin/bash
# Run this script from INSIDE the myedibleschef folder on your local machine
# It downloads all missing chunk JS files and CDN images
set -e
SITE="https://myedibleschef.com"
CDN="https://horizons-cdn.hostinger.com/a38af39a-ec2d-4547-a076-5363b58ab7df"

echo "=== Downloading missing JS chunks ==="
mkdir -p assets
CHUNKS=(
  "AboutPage-Bla0x595.js"
  "AdminDashboard-Bs2WMine.js"
  "AdminLoginPage-C_FZ4JE9.js"
  "BlogPage-Ci6uRn2S.js"
  "BlogPostPage-CsLRclb2.js"
  "ContactPage-CYnfZF3M.js"
  "FAQPage-BXixHOhz.js"
  "ProductsList-EaEb9Omw.js"
  "SuccessPage-BiPlQlzW.js"
  "WhatsAppSandboxTest-B_afrT6K.js"
  "book-open-CVl8ByEb.js"
  "mail-BwIZoWyy.js"
  "map-pin-0wMmiEto.js"
  "search-DB68hCvN.js"
)
for chunk in "${CHUNKS[@]}"; do
  echo "  Downloading assets/$chunk ..."
  curl -sSL "$SITE/assets/$chunk" -o "assets/$chunk"
done

echo ""
echo "=== Downloading CDN images ==="
mkdir -p images
IMAGES=(
  "09d25c39292c8ab56d676b741d67f40d.png"
  "0a186667aa4d02751a1c0b7dfc2059fa.jpg"
  "39b054f651113b548cbfd3303263a893.webp"
  "3f4010776848140c53f1bdea9322891b.jpg"
  "5c5a480d15e73e7f83035d52fee555e2.png"
  "7c2852153625ac5c88ea3dc57a369b71.jpg"
  "82b1d419712778a28aad374ec5d13145.jpg"
  "8c49f05ee3abb37feca73b615e06f40b.png"
  "936d339ce231d193019a99a5f5125f01.png"
  "af5ab65646fc6b5f652173f594ddf3ed.png"
  "bf13e0d6b3e7d28e50530e0e47b1b1fb.jpg"
  "c0355061d87ba33b69a7528f06b44420.jpg"
  "ca1c2144ad2c881cf9034b905b872c25.jpg"
  "cab999ce8f6c8a5ca0dc5702110d7c4f.jpg"
  "fc4492ce23105f62e653ffd616492b75.jpg"
)
for img in "${IMAGES[@]}"; do
  echo "  Downloading images/$img ..."
  curl -sSL "$CDN/$img" -o "images/$img"
done

echo ""
echo "=== Patching JS bundle to use local images ==="
# Replace CDN image paths with local /images/ paths in the main JS bundle
sed -i 's|https://horizons-cdn\.hostinger\.com/a38af39a-ec2d-4547-a076-5363b58ab7df/|/images/|g' assets/index-C0iaDUkv.js
echo "  Patched assets/index-C0iaDUkv.js"

echo ""
echo "✅ Done! Run: node server.js"
echo "   Then open: http://localhost:3000"
