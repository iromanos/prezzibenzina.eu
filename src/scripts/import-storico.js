// src/scripts/import-storico.js

import https from 'https';
import http from 'http';
import {pipeline} from 'stream/promises';
import {createReadStream, createWriteStream} from 'fs';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import {createRequire} from 'module';
import {parse} from 'csv-parse';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

const require = createRequire(import.meta.url);
const tar = require('tar');

dotenv.config({path: path.resolve(process.cwd(), '.env')});

const DEFAULT_URLS = [
    'https://opendatacarburanti.mise.gov.it/categorized/prezzo_alle_8/2026/2026_1_tr.tar.gz',
    'https://opendatacarburanti.mise.gov.it/categorized/prezzo_alle_8/2026/2026_2_tr.tar.gz'
];

const BATCH_SIZE = 1000;

function formatDateTimeForMySQL(dateTimeString) {
    if (!dateTimeString || dateTimeString.length < 19) return null;
    const [datePart, timePart] = dateTimeString.split(' ');
    if (!datePart || !timePart) return null;
    const [day, month, year] = datePart.split('/');
    if (!day || !month || !year) return null;
    return `${year}-${month}-${day} ${timePart}`;
}

async function processUrl(url, connection) {
    console.log(`\nInizio processamento di: ${url}`);
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'prezzibenzina-import-'));
    console.log(`  - Creata directory temporanea: ${tempDir}`);

    try {
        const archivePath = path.join(tempDir, 'archive.tar.gz');
        const client = url.startsWith('https') ? https : http;

        await new Promise((resolve, reject) => {
            client.get(url, (res) => {
                if (res.statusCode !== 200) {
                    return reject(new Error(`Download fallito con codice di stato: ${res.statusCode}`));
                }
                const fileStream = createWriteStream(archivePath);
                res.pipe(fileStream);
                fileStream.on('finish', resolve);
                fileStream.on('error', reject);
            }).on('error', reject);
        });
        console.log(`  - Download completato: ${archivePath}`);

        // Correzione: Aggiunto 'strip: 1' per rimuovere la directory di primo livello dall'archivio
        await tar.x({file: archivePath, cwd: tempDir, strip: 1});

        const files = await fs.readdir(tempDir);

        console.log(files);

        const csvFile = files.find(f => f.endsWith('.csv') || f.endsWith('.txt'));
        if (!csvFile) throw new Error('Nessun file CSV/TXT trovato nell\'archivio.');
        const csvPath = path.join(tempDir, csvFile);
        console.log(`  - Estrazione completata: ${csvFile}`);

        const parser = parse({delimiter: '|', from_line: 2, relax_column_count: true});
        const readStream = createReadStream(csvPath);

        let batch = [];
        let totalImported = 0;

        const insertBatch = async () => {
            if (batch.length === 0) return;
            try {
                const sql = 'INSERT INTO prezzi (id_impianto, desc_carburante, prezzo, is_self, dtcomu, fuel_id) VALUES ? ON DUPLICATE KEY UPDATE prezzo=VALUES(prezzo), dtcomu=VALUES(dtcomu)';
                await connection.query(sql, [batch]);
                totalImported += batch.length;
                process.stdout.write(`  - Righe importate: ${totalImported}\r`);
                batch = [];
            } catch (error) {
                console.error('\nErrore durante il bulk insert:', error.sqlMessage);
                batch = [];
            }
        };

        parser.on('readable', async () => {
            let record;
            while ((record = parser.read()) !== null) {
                const [id_impianto, desc_carburante, prezzo, is_self, dtcomu] = record;
                const prezzoFloat = parseFloat(String(prezzo).replace(',', '.'));
                const mysqlDateTime = formatDateTimeForMySQL(dtcomu);
                if (!id_impianto || isNaN(prezzoFloat) || prezzoFloat <= 0 || !mysqlDateTime) continue;

                let fuel_id = null;
                const desc = String(desc_carburante).toLowerCase();
                if (desc.includes('benzina')) fuel_id = 1;
                else if (desc.includes('gasolio')) fuel_id = 2;
                else if (desc.includes('gpl')) fuel_id = 3;
                else if (desc.includes('metano')) fuel_id = 4;
                if (fuel_id === null) fuel_id = 999;

                batch.push([id_impianto, desc_carburante, prezzoFloat, is_self, mysqlDateTime, fuel_id]);
                if (batch.length >= BATCH_SIZE) await insertBatch();
            }
        });

        console.log('  - Inizio parsing e importazione...');
        await pipeline(readStream, parser);
        await insertBatch();

        process.stdout.write(`\n`);
        console.log(`Processamento di ${url} completato. Totale righe importate: ${totalImported}`);

    } finally {
        await fs.rm(tempDir, {recursive: true, force: true});
        console.log(`  - Pulizia della directory temporanea completata.`);
    }
}

export async function runImport(urls = DEFAULT_URLS) {
    let connection;
    try {
        console.log('--- INIZIO SCRIPT DI IMPORTAZIONE ---');
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE,
        });
        console.log('Connessione al database stabilita.');

        for (const url of urls) {
            await processUrl(url, connection);
        }

        console.log('\n--- IMPORTAZIONE COMPLETATA CON SUCCESSO! ---');
    } catch (error) {
        console.error('\n--- ERRORE FATALE DURANTE L\'IMPORTAZIONE ---');
        console.error(error);
        throw error;
    } finally {
        if (connection) {
            await connection.end();
            console.log('Connessione al database chiusa.');
        }
    }
}

if (process.argv[1] && process.argv[1].includes('import-storico.js')) {
    runImport();
}
