const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputImage = path.join(__dirname, '../public/anubhav-creative-ai.jpeg');
const outputDir = path.join(__dirname, '../public');

// Favicon sizes to generate
const faviconSizes = [
  { size: 16, name: 'favicon-16x16.png' },
  { size: 32, name: 'favicon-32x32.png' },
  { size: 48, name: 'favicon-48x48.png' },
  { size: 64, name: 'favicon-64x64.png' },
  { size: 96, name: 'favicon-96x96.png' },
  { size: 128, name: 'favicon-128x128.png' },
  { size: 180, name: 'apple-touch-icon.png' },
  { size: 192, name: 'android-chrome-192x192.png' },
  { size: 512, name: 'android-chrome-512x512.png' },
];

async function generateFavicons() {
  try {
    console.log('Starting favicon generation...');
    
    for (const favicon of faviconSizes) {
      const outputPath = path.join(outputDir, favicon.name);
      
      await sharp(inputImage)
        .resize(favicon.size, favicon.size, {
          fit: 'cover',
          position: 'center',
        })
        .png({ quality: 90, compressionLevel: 9 })
        .toFile(outputPath);
        
      console.log(`✓ Generated ${favicon.name} (${favicon.size}x${favicon.size})`);
    }
    
    // Generate ICO file for Windows browsers
    await sharp(inputImage)
      .resize(32, 32, {
        fit: 'cover',
        position: 'center',
      })
      .png()
      .toFile(path.join(outputDir, 'favicon.png'));
    
    console.log('✓ Generated favicon.png (32x32)');
    
    // Generate optimized social media image
    await sharp(inputImage)
      .resize(1200, 630, {
        fit: 'cover',
        position: 'center',
      })
      .jpeg({ quality: 90, progressive: true })
      .toFile(path.join(outputDir, 'og-image.jpg'));
    
    console.log('✓ Generated og-image.jpg (1200x630)');
    
    // Generate optimized Twitter card image
    await sharp(inputImage)
      .resize(1200, 675, {
        fit: 'cover',
        position: 'center',
      })
      .jpeg({ quality: 90, progressive: true })
      .toFile(path.join(outputDir, 'twitter-card.jpg'));
    
    console.log('✓ Generated twitter-card.jpg (1200x675)');
    
    console.log('\n🎉 All favicon files generated successfully!');
    
  } catch (error) {
    console.error('Error generating favicons:', error);
  }
}

generateFavicons();