// src/cron/import-anagrafica.js

import https from 'https';
import {pipeline} from 'stream/promises';
import {parse} from 'csv-parse';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs/promises'; // Importa il modulo fs/promises per operazioni asincrone
import nodemailer from 'nodemailer'; // Importa nodemailer

dotenv.config({path: path.resolve(process.cwd(), '.env')});

const ANAGRAFICA_URL = 'https://www.mimit.gov.it/images/exportCSV/anagrafica_impianti_attivi.csv';
const BATCH_SIZE = 500; // L'anagrafica ha meno righe, un batch più piccolo va bene
const LOG_FILE_PATH = path.resolve(process.cwd(), 'cron_logs/import-anagrafica.log');

// Configurazione Nodemailer
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Funzione per salvare i log su file
async function logToFile(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;
    console.log(logMessage.trim()); // Stampa anche in console per visibilità immediata
    try {
        await fs.appendFile(LOG_FILE_PATH, logMessage, 'utf8');
    } catch (error) {
        console.error(`Errore durante la scrittura nel file di log: ${error.message}`);
    }
}

// Funzione per l'invio di notifiche email
async function sendEmailNotification(subject, body) {
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to: process.env.EMAIL_SYSTEM,
            subject: subject,
            text: body,
        });
        await logToFile(`[EMAIL] Notifica email inviata: "${subject}"`);
    } catch (error) {
        await logToFile(`[EMAIL ERROR] Errore durante l'invio dell'email "${subject}": ${error.message}`);
        console.error(`[EMAIL ERROR] Errore durante l'invio dell'email "${subject}":`, error);
    }
}

export async function runAnagraficaImport() {
    let connection;
    try {
        await logToFile('--- INIZIO SCRIPT DI IMPORTAZIONE ANAGRAFICA IMPIANTI ---');
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE,
        });
        await logToFile('Connessione al database stabilita.');

        const parser = parse({
            delimiter: '|',
            from_line: 3, // Salta l'intestazione
            relax_column_count: true, // Il file ha molte colonne, alcune potrebbero non interessarci
            columns: [ // Mappiamo le colonne per nome per chiarezza
                'id_impianto', 'gestore', 'bandiera', 'tipo_impianto',
                'nome_impianto', 'indirizzo', 'comune', 'provincia',
                'latitudine', 'longitudine'
            ],
            quote: '', // Aggiunto: indica che i campi non sono racchiusi tra virgolette
            skip_empty_lines: true, // Aggiunto: ignora le righe vuote
        });

        let batch = [];
        let totalProcessed = 0;

        const insertBatch = async () => {
            if (batch.length === 0) return;
            try {
                const sql = `
                    INSERT INTO impianti (id_impianto, gestore, bandiera, tipo_impianto, nome_impianto, indirizzo,
                                          comune, provincia, latitudine, longitudine, address, location_ok, stato)
                    VALUES ?
                    ON DUPLICATE KEY UPDATE gestore=VALUES(gestore),
                                            bandiera=VALUES(bandiera),
                                            tipo_impianto=VALUES(tipo_impianto),
                                            nome_impianto=VALUES(nome_impianto),
                                            indirizzo=VALUES(indirizzo),
                                            comune=VALUES(comune),
                                            provincia=VALUES(provincia),
                                            latitudine=VALUES(latitudine),
                                            longitudine=VALUES(longitudine),
                                            address=VALUES(address),
                                            location_ok=VALUES(location_ok),
                                            stato=VALUES(stato)`;

                await connection.query(sql, [batch]);
                totalProcessed += batch.length;
                await logToFile(`  - Impianti processati: ${totalProcessed} (ultimo batch di ${batch.length})`);
                batch = [];
            } catch (error) {
                await logToFile(`Errore durante il bulk insert dell'anagrafica: ${error.sqlMessage || error.message}`);
                batch = [];
                throw error; // Rilancia l'errore per essere catturato dal blocco catch esterno
            }
        };

        parser.on('readable', async () => {
            let record;
            while ((record = parser.read()) !== null) {
                // Validazione dei dati essenziali
                const lat = parseFloat(record.latitudine);
                const lon = parseFloat(record.longitudine);
                if (!record.id_impianto || !record.provincia || isNaN(lat) || isNaN(lon)) {
                    // await logToFile(`  - Record scartato per dati mancanti/invalidi: ${JSON.stringify(record)}`);
                    continue;
                }

                batch.push([
                    record.id_impianto, record.gestore, record.bandiera, record.tipo_impianto,
                    record.nome_impianto, record.indirizzo, record.comune, record.provincia.toUpperCase(),
                    lat, lon, '', 0, 'IT'
                ]);

                if (batch.length >= BATCH_SIZE) {
                    await insertBatch();
                }
            }
        });

        await logToFile(`  - Download e processamento di: ${ANAGRAFICA_URL}`);

        const response = await new Promise((resolve, reject) => https.get(ANAGRAFICA_URL, resolve).on('error', reject));
        if (response.statusCode !== 200) {
            throw new Error(`Download fallito con codice di stato: ${response.statusCode}`);
        }

        await pipeline(response, parser);
        await insertBatch(); // Inserisci l'ultimo batch

        await logToFile(`\n--- IMPORTAZIONE ANAGRAFICA COMPLETATA. Impianti totali processati: ${totalProcessed} ---`);
        await sendEmailNotification(
            'CRON Job Success: Importazione Anagrafica',
            `L'importazione dell'anagrafica è stata completata con successo. Impianti processati: ${totalProcessed}.`
        );

    } catch (error) {
        await logToFile('\n--- ERRORE FATALE DURANTE L\'IMPORTAZIONE ANAGRAFICA ---');
        await logToFile(error.message);
        if (connection) {
            // Non c'è una transazione esplicita qui, quindi non serve rollback
        }
        await sendEmailNotification(
            'CRON Job Fallito: Importazione Anagrafica',
            `L'importazione dell'anagrafica è fallita: ${error.message}`
        );
    } finally {
        if (connection) {
            await connection.end();
            await logToFile('Connessione al database chiusa.');
        }
        await logToFile('Fine esecuzione script importazione anagrafica.');
    }
}

if (process.argv[1] && process.argv[1].includes('import-anagrafica.js')) {
    // Assicurati che la directory di log esista
    fs.mkdir(path.dirname(LOG_FILE_PATH), {recursive: true})
        .then(() => runAnagraficaImport())
        .catch(error => console.error(`Errore iniziale nella creazione della directory di log o nell'esecuzione: ${error.message}`));
}