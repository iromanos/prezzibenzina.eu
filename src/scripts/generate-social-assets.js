const sharp = require('sharp');
const path = require('path');

const svgPath = path.join(__dirname, '../public/assets/svg/facebook-cover.svg');
const outputPath = path.join(__dirname, '../public/assets/images/facebook-cover.png');

async function generateFacebookCover() {
    try {
        await sharp(svgPath)
            .png()
            .toFile(outputPath);

        console.log('✅ Facebook Cover PNG generata con successo in: ' + outputPath);
    } catch (error) {
        console.error('❌ Errore durante la generazione della copertina:', error);
    }
}

generateFacebookCover();

// Per eseguire lo script:
// node scripts/generate-social-assets.js