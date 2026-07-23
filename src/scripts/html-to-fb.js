import fs from 'fs/promises';
import path from 'path';
import {fileURLToPath} from 'url';
import {toBold, toItalic} from './fb-formatter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Converte snippet HTML in testo formattato per Facebook
 */
async function convertHtmlToFb(filePath) {
    try {
        const absolutePath = path.resolve(process.cwd(), filePath);
        let html = await fs.readFile(absolutePath, 'utf-8');

        // 1. Gestione a capo
        html = html.replace(/<br\s*\/?>/gi, '\n');
        html = html.replace(/<\/p>|<\/div>/gi, '\n\n');

        // 2. Conversione Grassetto (b, strong)
        // Usiamo una regex che cattura il contenuto tra i tag
        html = html.replace(/<(b|strong)>(.*?)<\/\1>/gis, (_, tag, content) => toBold(content));

        // 3. Conversione Corsivo (i, em)
        html = html.replace(/<(i|em)>(.*?)<\/\1>/gis, (_, tag, content) => toItalic(content));

        // 4. Rimozione di tutti gli altri tag HTML
        let text = html.replace(/<[^>]*>/g, '');

        // 5. Decodifica entità HTML base
        text = text
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"');

        // 6. Pulizia spazi bianchi eccessivi
        text = text.trim().replace(/\n{3,}/g, '\n\n');

        console.log("\n🚀 TESTO FORMATTATO PER FACEBOOK:\n");
        console.log("------------------------------------------");
        console.log(text);
        console.log("------------------------------------------\n");

    } catch (error) {
        console.error("❌ Errore durante la conversione:", error.message);
    }
}

// Cattura l'argomento da riga di comando
const inputFile = process.argv[2];

if (!inputFile) {
    console.log("Uso: node src/scripts/html-to-fb.js <percorso_file_html>");
} else {
    convertHtmlToFb(inputFile);
}