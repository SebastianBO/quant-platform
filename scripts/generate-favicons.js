#!/usr/bin/env node
/**
 * Generate favicon files from logo.svg
 *
 * Requirements: sharp (npm install sharp)
 *
 * Run: node scripts/generate-favicons.js
 */

const fs = require('fs');
const path = require('path');

async function generateFavicons() {
  try {
    // Check if sharp is available
    let sharp;
    try {
      sharp = require('sharp');
    } catch (e) {
      console.log('Sharp not found. Installing...');
      const { execSync } = require('child_process');
      execSync('npm install sharp --save-dev', { stdio: 'inherit' });
      sharp = require('sharp');
    }

    const publicDir = path.join(__dirname, '..', 'public');
    const svgPath = path.join(publicDir, 'logo.svg');

    if (!fs.existsSync(svgPath)) {
      console.error('logo.svg not found in public directory');
      process.exit(1);
    }

    const svgBuffer = fs.readFileSync(svgPath);

    // Generate different sizes
    const sizes = [
      { name: 'favicon-16x16.png', size: 16 },
      { name: 'favicon-32x32.png', size: 32 },
      { name: 'apple-touch-icon.png', size: 180 },
      { name: 'android-chrome-192x192.png', size: 192 },
      { name: 'android-chrome-512x512.png', size: 512 },
    ];

    for (const { name, size } of sizes) {
      await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(path.join(publicDir, name));
      console.log(`Generated ${name}`);
    }

    // Generate favicon.ico (multi-size ICO)
    // For ICO, we'll use the 32x32 as a PNG fallback
    // Real ICO files need a specialized library
    await sharp(svgBuffer)
      .resize(32, 32)
      .png()
      .toFile(path.join(publicDir, 'favicon.ico'));
    console.log('Generated favicon.ico (as PNG - rename or use ICO converter for true ICO)');

    // Generate OG image from SVG
    const ogSvgPath = path.join(publicDir, 'og-image.svg');
    if (fs.existsSync(ogSvgPath)) {
      const ogSvgBuffer = fs.readFileSync(ogSvgPath);
      await sharp(ogSvgBuffer)
        .resize(1200, 630)
        .png()
        .toFile(path.join(publicDir, 'og-image.png'));
      console.log('Generated og-image.png');
    }

    console.log('\nAll favicons generated successfully!');
    console.log('\nNote: For a true .ico file, use https://realfavicongenerator.net/');

  } catch (error) {
    console.error('Error generating favicons:', error);
    process.exit(1);
  }
}

generateFavicons();
