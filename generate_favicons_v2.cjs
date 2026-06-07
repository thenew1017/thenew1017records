const sharp = require('sharp');
const fs = require('fs');

async function generate() {
    const inputBuffer = fs.readFileSync('public/official_logo.png');

    // Create a black background base and composite the logo over it
    // Using fit: 'contain' to ensure the logo is fully visible on the black background
    const processImage = async (size) => {
        return sharp({
            create: {
                width: size,
                height: size,
                channels: 4,
                background: { r: 0, g: 0, b: 0, alpha: 1 }
            }
        })
        .composite([{
            input: await sharp(inputBuffer).resize(Math.round(size * 0.8), Math.round(size * 0.8), { fit: 'contain', background: {r:0,g:0,b:0,alpha:0} }).toBuffer(),
            gravity: 'center'
        }])
        .png()
        .toBuffer();
    };

    const icoBuffer = await processImage(32);
    fs.writeFileSync('public/favicon.ico', icoBuffer);
    
    fs.writeFileSync('public/favicon-16x16.png', await processImage(16));
    fs.writeFileSync('public/favicon-32x32.png', await processImage(32));
    fs.writeFileSync('public/favicon-48x48.png', await processImage(48));
    fs.writeFileSync('public/apple-touch-icon.png', await processImage(180));
    fs.writeFileSync('public/android-chrome-192x192.png', await processImage(192));
    fs.writeFileSync('public/android-chrome-512x512.png', await processImage(512));

    console.log("Favicons generated successfully with black background!");
}

generate().catch(console.error);
