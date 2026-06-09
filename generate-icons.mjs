import { createCanvas } from 'canvas';
import fs from 'fs';

// Try canvas-based generation, fallback to SVG if not available
async function generateIcons() {
  try {
    // Generate SVG icons as fallback
    const sizes = [192, 512];
    
    for (const size of sizes) {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
  <defs>
    <radialGradient id="bg" cx="50%" cy="50%" r="60%">
      <stop offset="0%" stop-color="#1A1A1A"/>
      <stop offset="100%" stop-color="#0F0F0F"/>
    </radialGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="${size * 0.02}" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  <rect width="${size}" height="${size}" rx="${size * 0.22}" fill="url(#bg)"/>
  
  <!-- Dumbbell icon centered -->
  <g transform="translate(${size/2}, ${size/2})" filter="url(#glow)">
    <!-- Bar -->
    <rect x="${-size*0.18}" y="${-size*0.04}" width="${size*0.36}" height="${size*0.08}" rx="${size*0.015}" fill="#F97316"/>
    <!-- Left weight plate outer -->
    <rect x="${-size*0.28}" y="${-size*0.14}" width="${size*0.10}" height="${size*0.28}" rx="${size*0.025}" fill="#F97316"/>
    <!-- Left weight plate inner -->
    <rect x="${-size*0.32}" y="${-size*0.10}" width="${size*0.06}" height="${size*0.20}" rx="${size*0.02}" fill="#F97316"/>
    <!-- Right weight plate outer -->
    <rect x="${size*0.18}" y="${-size*0.14}" width="${size*0.10}" height="${size*0.28}" rx="${size*0.025}" fill="#F97316"/>
    <!-- Right weight plate inner -->
    <rect x="${size*0.26}" y="${-size*0.10}" width="${size*0.06}" height="${size*0.20}" rx="${size*0.02}" fill="#F97316"/>
  </g>
</svg>`;
      
      fs.writeFileSync(`public/icon-${size}.svg`, svg);
      console.log(`Generated icon-${size}.svg`);
    }
    
    // Also create maskable version (same but with safe zone padding)
    const maskable = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" fill="#0F0F0F"/>
  <g transform="translate(256, 256)">
    <rect x="-72" y="-16" width="144" height="32" rx="6" fill="#F97316"/>
    <rect x="-112" y="-56" width="40" height="112" rx="10" fill="#F97316"/>
    <rect x="-130" y="-40" width="24" height="80" rx="8" fill="#F97316"/>
    <rect x="72" y="-56" width="40" height="112" rx="10" fill="#F97316"/>
    <rect x="106" y="-40" width="24" height="80" rx="8" fill="#F97316"/>
  </g>
</svg>`;
    
    fs.writeFileSync('public/icon-maskable.svg', maskable);
    console.log('Generated icon-maskable.svg');
    console.log('Done! Note: PNG icons need to be converted from SVG if needed.');
    
  } catch (err) {
    console.error(err);
  }
}

generateIcons();
