// src/cron/import-daily.js

import https from 'https';
import {pipeline} from 'stream/promises';
import {parse} from 'csv-parse';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({path: path.resolve(process.cwd(), '.env')});

const DAILY_URL = 'https://www.mimit.gov.it/images/exportCSV/prezzo_alle_8.csv';
const BATCH_SIZE = 1000;

function formatDateTimeForMySQL(dateTimeString) {
    if (!dateTimeString || dateTimeString.length < 19) return null;
    const [datePart, timePart] = dateTimeString.split(' ');
    if (!datePart || !timePart) return null;
    const [day, month, year] = datePart.split('/');
    if (!day || !month || !year) return null;
    return `${year}-${month}-${day} ${timePart}`;
}

export async function runDailyImport() {
    let connection;
    try {
        console.log('--- INIZIO SCRIPT DI IMPORTAZIONE GIORNALIERA ---');
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE,
        });
        console.log('Connessione al database stabilita.');

        const parser = parse({
            delimiter: ';', // I CSV europei usano spesso il punto e virgola
            from_line: 2,
            relax_column_count: true,
        });

        let batch = [];
        let totalImported = 0;

        const insertBatch = async () => {
            if (batch.length === 0) return;
            try {
                // Questa query previene i duplicati aggiornando i record esistenti
                const sql = 'INSERT INTO prezzi (id_impianto, desc_carburante, prezzo, is_self, dtcomu, fuel_id) VALUES ? ON DUPLICATE KEY UPDATE prezzo=VALUES(prezzo), dtcomu=VALUES(dtcomu)';
                await connection.query(sql, [batch]);
                totalImported += batch.length;
                process.stdout.write(`  - Righe processate: ${totalImported}\r`);
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

        console.log(`  - Download e processamento di: ${DAILY_URL}`);

        const response = await new Promise((resolve, reject) => https.get(DAILY_URL, resolve).on('error', reject));
        if (response.statusCode !== 200) {
            throw new Error(`Download fallito con codice di stato: ${response.statusCode}`);
        }

        await pipeline(response, parser);
        await insertBatch(); // Inserisci l'ultimo batch

        process.stdout.write(`\n`);
        console.log(`\n--- IMPORTAZIONE GIORNALIERA COMPLETATA. Righe totali processate: ${totalImported} ---`);

    } catch (error) {
        console.error('\n--- ERRORE FATALE DURANTE L\'IMPORTAZIONE GIORNALIERA ---');
        console.error(error);
        throw error;
    } finally {
        if (connection) {
            await connection.end();
            console.log('Connessione al database chiusa.');
        }
    }
}

if (process.argv[1] && process.argv[1].includes('import-daily.js')) {
    runDailyImport();
}
