const sharp = require('sharp');
const fs = require('fs');

async function generate() {
    const svgText = `
    <svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
      <rect width="512" height="512" fill="#000000" />
      <text x="256" y="295" font-family="Arial, sans-serif" font-weight="bold" font-size="200" fill="#ffffff" text-anchor="middle" alignment-baseline="middle">1017</text>
    </svg>
    `;

    const buffer = Buffer.from(svgText);

    // favicon.ico (We can just use a 32x32 PNG renamed to .ico, works in most browsers)
    await sharp(buffer).resize(32, 32).toFile('public/favicon.ico');
    
    // favicon-32x32.png
    await sharp(buffer).resize(32, 32).toFile('public/favicon-32x32.png');

    // favicon-16x16.png
    await sharp(buffer).resize(16, 16).toFile('public/favicon-16x16.png');

    // apple-touch-icon.png
    await sharp(buffer).resize(180, 180).toFile('public/apple-touch-icon.png');

    // android-chrome-192x192.png
    await sharp(buffer).resize(192, 192).toFile('public/android-chrome-192x192.png');

    // android-chrome-512x512.png
    await sharp(buffer).resize(512, 512).toFile('public/android-chrome-512x512.png');

    console.log("Favicons generated successfully!");
}

generate().catch(console.error);
