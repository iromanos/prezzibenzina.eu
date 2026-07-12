// src/cron/import-anagrafica.js

import https from 'https';
import {pipeline} from 'stream/promises';
import {parse} from 'csv-parse';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({path: path.resolve(process.cwd(), '.env')});

const ANAGRAFICA_URL = 'https://www.mimit.gov.it/images/exportCSV/anagrafica_impianti_attivi.csv';
const BATCH_SIZE = 500; // L'anagrafica ha meno righe, un batch più piccolo va bene

export async function runAnagraficaImport() {
    let connection;
    try {
        console.log('--- INIZIO SCRIPT DI IMPORTAZIONE ANAGRAFICA IMPIANTI ---');
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE,
        });
        console.log('Connessione al database stabilita.');

        const parser = parse({
            delimiter: ';',
            from_line: 2, // Salta l'intestazione
            relax_column_count: true, // Il file ha molte colonne, alcune potrebbero non interessarci
            columns: [ // Mappiamo le colonne per nome per chiarezza
                'id_impianto', 'gestore', 'bandiera', 'tipo_impianto',
                'nome_impianto', 'indirizzo', 'comune', 'provincia',
                'latitudine', 'longitudine'
            ]
        });

        let batch = [];
        let totalProcessed = 0;

        const insertBatch = async () => {
            if (batch.length === 0) return;
            try {
                const sql = `
                    INSERT INTO impianti (id_impianto, gestore, bandiera, tipo_impianto, nome_impianto, indirizzo,
                                          comune, provincia, latitudine, longitudine)
                    VALUES ?
                    ON DUPLICATE KEY UPDATE gestore=VALUES(gestore),
                                            bandiera=VALUES(bandiera),
                                            tipo_impianto=VALUES(tipo_impianto),
                                            nome_impianto=VALUES(nome_impianto),
                                            indirizzo=VALUES(indirizzo),
                                            comune=VALUES(comune),
                                            provincia=VALUES(provincia),
                                            latitudine=VALUES(latitudine),
                                            longitudine=VALUES(longitudine)
                `;
                await connection.query(sql, [batch]);
                totalProcessed += batch.length;
                process.stdout.write(`  - Impianti processati: ${totalProcessed}\r`);
                batch = [];
            } catch (error) {
                console.error('\nErrore durante il bulk insert dell\'anagrafica:', error.sqlMessage);
                batch = [];
            }
        };

        parser.on('readable', async () => {
            let record;
            while ((record = parser.read()) !== null) {
                // Validazione dei dati essenziali
                const lat = parseFloat(record.latitudine);
                const lon = parseFloat(record.longitudine);
                if (!record.id_impianto || !record.provincia || isNaN(lat) || isNaN(lon)) {
                    continue;
                }

                batch.push([
                    record.id_impianto, record.gestore, record.bandiera, record.tipo_impianto,
                    record.nome_impianto, record.indirizzo, record.comune, record.provincia.toUpperCase(),
                    lat, lon
                ]);

                if (batch.length >= BATCH_SIZE) await insertBatch();
            }
        });

        console.log(`  - Download e processamento di: ${ANAGRAFICA_URL}`);

        const response = await new Promise((resolve, reject) => https.get(ANAGRAFICA_URL, resolve).on('error', reject));
        if (response.statusCode !== 200) {
            throw new Error(`Download fallito con codice di stato: ${response.statusCode}`);
        }

        await pipeline(response, parser);
        await insertBatch(); // Inserisci l'ultimo batch

        process.stdout.write(`\n`);
        console.log(`\n--- IMPORTAZIONE ANAGRAFICA COMPLETATA. Impianti totali processati: ${totalProcessed} ---`);

    } catch (error) {
        console.error('\n--- ERRORE FATALE DURANTE L\'IMPORTAZIONE ANAGRAFICA ---');
        console.error(error);
        throw error;
    } finally {
        if (connection) {
            await connection.end();
            console.log('Connessione al database chiusa.');
        }
    }
}

if (process.argv[1] && process.argv[1].includes('import-anagrafica.js')) {
    runAnagraficaImport();
}
