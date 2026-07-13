// src/cron/import-daily.js

import https from 'https';
import {pipeline} from 'stream/promises';
import {parse} from 'csv-parse';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs/promises'; // Import fs for logging to file
import nodemailer from 'nodemailer'; // Importa nodemailer

dotenv.config({path: path.resolve(process.cwd(), '.env')});

const DAILY_URL = 'https://www.mimit.gov.it/images/exportCSV/prezzo_alle_8.csv';
const BATCH_SIZE = 1000;
const LOG_FILE_PATH = path.resolve(process.cwd(), 'cron_logs', 'import-daily.log'); // Modificato per coerenza

// Configurazione Nodemailer
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_PORT == 465, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Funzione per l'invio di notifiche email
async function sendEmailNotification(subject, body) {
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to: process.env.EMAIL_USER, // Invia all'utente configurato per l'invio
            subject: subject,
            text: body,
        });
        await logToFile(`[EMAIL] Notifica email inviata: "${subject}"`);
    } catch (error) {
        await logToFile(`[EMAIL ERROR] Errore durante l'invio dell'email "${subject}": ${error.message}`);
        console.error(`[EMAIL ERROR] Errore durante l'invio dell'email "${subject}":`, error);
    }
}

// Funzione per il salvataggio dei log su file
async function logToFile(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;
    console.log(logMessage.trim()); // Log to console as well
    try {
        await fs.appendFile(LOG_FILE_PATH, logMessage, 'utf8');
    } catch (error) {
        console.error(`Errore durante la scrittura del log su file ${LOG_FILE_PATH}:`, error);
    }
}

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
        await logToFile('--- INIZIO SCRIPT DI IMPORTAZIONE GIORNALIERA ---');
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE,
        });
        await logToFile('Connessione al database stabilita.');

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
                await logToFile(`Errore durante il bulk insert: ${error.sqlMessage || error.message}`);
                console.error('\nErrore durante il bulk insert:', error.sqlMessage);
                batch = [];
                throw error; // Rilancia l'errore per essere catturato dal blocco catch esterno
            }
        };

        parser.on('readable', async () => {
            let record;
            while ((record = parser.read()) !== null) {
                const [id_impianto, desc_carburante, prezzo, is_self, dtcomu] = record;
                const prezzoFloat = parseFloat(String(prezzo).replace(',', '.'));
                const mysqlDateTime = formatDateTimeForMySQL(dtcomu);
                if (!id_impianto || isNaN(prezzoFloat) || prezzoFloat <= 0 || !mysqlDateTime) {
                    // await logToFile(`  - Record scartato per dati mancanti/invalidi: ${JSON.stringify(record)}`);
                    continue;
                }

                let fuel_id = null;
                const desc = String(desc_carburante).toLowerCase();
                if (desc.includes('benzina')) fuel_id = 1;
                else if (desc.includes('gasolio')) fuel_id = 2;
                else if (desc.includes('gpl')) fuel_id = 3;
                else if (desc.includes('metano')) fuel_id = 4;
                if (fuel_id === null) fuel_id = 999;

                batch.push([id_impianto, desc_carburante, prezzoFloat, is_self, mysqlDateTime, fuel_id]);
                if (batch.length >= BATCH_SIZE) {
                    await insertBatch();
                }
            }
        });

        await logToFile(`Download e processamento di: ${DAILY_URL}`);

        const response = await new Promise((resolve, reject) => https.get(DAILY_URL, resolve).on('error', reject));
        if (response.statusCode !== 200) {
            throw new Error(`Download fallito con codice di stato: ${response.statusCode}`);
        }

        await pipeline(response, parser);
        await insertBatch(); // Inserisci l'ultimo batch

        process.stdout.write(`\n`);
        await logToFile(`--- IMPORTAZIONE GIORNALIERA COMPLETATA. Righe totali processate: ${totalImported} ---`);
        await sendEmailNotification(
            'CRON Job Success: Importazione Giornaliera Prezzi',
            `L'importazione giornaliera dei prezzi è stata completata con successo. Righe processate: ${totalImported}.`
        );

    } catch (error) {
        await logToFile(`--- ERRORE FATALE DURANTE L'IMPORTAZIONE GIORNALIERA: ${error.message} ---`);
        console.error('\n--- ERRORE FATALE DURANTE L\'IMPORTAZIONE GIORNALIERA ---');
        console.error(error);
        await sendEmailNotification(
            'CRON Job Fallito: Importazione Giornaliera Prezzi',
            `L'importazione giornaliera dei prezzi è fallita: ${error.message}`
        );
    } finally {
        if (connection) {
            await connection.end();
            await logToFile('Connessione al database chiusa.');
        }
        await logToFile('Fine esecuzione script importazione giornaliera.');
    }
}

if (process.argv[1] && process.argv[1].includes('import-daily.js')) {
    // Assicurati che la directory di log esista
    fs.mkdir(path.dirname(LOG_FILE_PATH), {recursive: true})
        .then(() => runDailyImport())
        .catch(error => console.error(`Errore iniziale nella creazione della directory di log o nell'esecuzione: ${error.message}`));
}