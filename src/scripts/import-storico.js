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
    'https://opendatacarburanti.mise.gov.it/categorized/prezzo_alle_8/2026/2026_2_tr.tar.gz'
];

function formatDateTimeForMySQL(dateTimeString) {
    if (!dateTimeString || dateTimeString.length < 19) return null;
    const [datePart, timePart] = dateTimeString.split(' ');
    if (!datePart || !timePart) return null;
    const [day, month, year] = datePart.split('/');
    if (!day || !month || !year) return null;
    return `${year}-${month}-${day} ${timePart}`;
}

function getCanonicalFuelName(desc) {
    const lowerDesc = String(desc).toLowerCase();
    if (lowerDesc.includes('benzina')) return 'Benzina';
    if (lowerDesc.includes('gasolio')) return 'Gasolio';
    if (lowerDesc.includes('gpl')) return 'GPL';
    if (lowerDesc.includes('metano')) return 'Metano';
    return null;
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
                if (res.statusCode !== 200) return reject(new Error(`Download fallito: ${res.statusCode}`));
                res.pipe(createWriteStream(archivePath)).on('finish', resolve).on('error', reject);
            }).on('error', reject);
        });
        console.log(`  - Download completato.`);

        // Estrai l'archivio
        await tar.x({file: archivePath, cwd: tempDir});

        // Trova la sottocartella creata dall'estrazione
        const tempDirContents = await fs.readdir(tempDir);
        const subDirName = tempDirContents.find(item => item !== 'archive.tar.gz');
        if (!subDirName) throw new Error('Nessuna sottocartella trovata dopo l\'estrazione.');

        const subDirPath = path.join(tempDir, subDirName);
        const dataFiles = (await fs.readdir(subDirPath)).filter(f => f.endsWith('.csv') || f.endsWith('.txt'));

        if (dataFiles.length === 0) throw new Error('Nessun file CSV/TXT trovato nella sottocartella dell\'archivio.');

        console.log(`  - Trovati ${dataFiles.length} file di dati da importare.`);

        let grandTotalImported = 0;

        for (const csvFile of dataFiles) {
            const csvPath = path.join(subDirPath, csvFile);
            console.log(`\n  -- Processando file: ${csvFile}`);

            const parser = parse({delimiter: '|', from_line: 2, relax_column_count: true});
            const readStream = createReadStream(csvPath);

            let batch = [];

            parser.on('readable', () => {
                let record;
                while ((record = parser.read()) !== null) {
                    const [id_impianto, desc_carburante, prezzo, is_self, dtcomu] = record;
                    const prezzoFloat = parseFloat(String(prezzo).replace(',', '.'));
                    const mysqlDateTime = formatDateTimeForMySQL(dtcomu);
                    const fuelName = getCanonicalFuelName(desc_carburante);

                    if (!id_impianto || !fuelName || isNaN(prezzoFloat) || prezzoFloat <= 0 || !mysqlDateTime || String(is_self) !== '1') continue;

                    batch.push({id_impianto, fuelName, prezzo: prezzoFloat, data: mysqlDateTime.split(' ')[0]});
                }
            });

            await pipeline(readStream, parser);

            if (batch.length === 0) continue;

            console.log(`     - Letti ${batch.length} record validi dal file. Inizio aggregazione...`);

            const dailyAverages = {};
            for (const row of batch) {
                const key = `${row.data}_${row.id_impianto}_${row.fuelName}`;
                if (!dailyAverages[key]) {
                    dailyAverages[key] = {sum: 0, count: 0, min: Infinity, max: -Infinity};
                }
                const stats = dailyAverages[key];
                stats.sum += row.prezzo;
                stats.count++;
                if (row.prezzo < stats.min) stats.min = row.prezzo;
                if (row.prezzo > stats.max) stats.max = row.prezzo;
            }

            const recordsToInsert = Object.entries(dailyAverages).map(([key, stats]) => {
                const [data, id_impianto, fuelName] = key.split('_');
                return [data, fuelName, 'distributore', id_impianto, stats.sum / stats.count, stats.min, stats.max];
            });

            if (recordsToInsert.length > 0) {
                const sql = 'INSERT INTO prezzi_storici (data, desc_carburante, livello_geo, codice_geo, prezzo_medio, prezzo_min, prezzo_max) VALUES ? ON DUPLICATE KEY UPDATE prezzo_medio=VALUES(prezzo_medio), prezzo_min=VALUES(prezzo_min), prezzo_max=VALUES(prezzo_max)';
                await connection.query(sql, [recordsToInsert]);
                grandTotalImported += recordsToInsert.length;
                console.log(`     - Inserite/Aggiornate ${recordsToInsert.length} righe aggregate in prezzi_storici.`);
            }
        }
        console.log(`\nProcessamento di ${url} completato. Totale righe aggregate: ${grandTotalImported}`);

    } finally {
        await fs.rm(tempDir, {recursive: true, force: true});
        console.log(`  - Pulizia della directory temporanea completata.`);
    }
}

export async function runImport(urls = DEFAULT_URLS) {
    let connection;
    try {
        console.log('--- INIZIO SCRIPT DI IMPORTAZIONE STORICO ---');
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

        console.log('\n--- IMPORTAZIONE STORICO COMPLETATA CON SUCCESSO! ---');
    } catch (error) {
        console.error('\n--- ERRORE FATALE DURANTE L\'IMPORTAZIONE STORICO ---');
        console.error(error);
        throw error;
    } finally {
        if (connection) {
            // await connection.end();
            console.log('Connessione al database chiusa.');
        }
    }
}

if (process.argv[1] && process.argv[1].includes('import-storico.js')) {
    runImport();
}
