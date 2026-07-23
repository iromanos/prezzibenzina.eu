import path from 'path';
import sharp from 'sharp';
import {fileURLToPath} from 'url';

// Ricostruiamo __dirname per l'ambiente ES Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Poiché lo script si trova in src/scripts, dobbiamo salire di due livelli per raggiungere la root
const svgPath = path.resolve(__dirname, '../../public/assets/svg/facebook-cover.svg');
const outputPath = path.resolve(__dirname, '../../public/assets/facebook-cover.png');

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