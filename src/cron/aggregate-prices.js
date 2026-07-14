// src/cron/aggregate-prices.js

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs/promises'; // Importa il modulo fs/promises per operazioni asincrone
import nodemailer from 'nodemailer'; // Importa nodemailer

dotenv.config({path: path.resolve(process.cwd(), '.env')});

const LOG_FILE_PATH = path.resolve(process.cwd(), 'cron_logs/aggregate-prices.log');

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
            to: process.env.EMAIL_SYSTEM, // Invia all'utente configurato per l'invio
            subject: subject,
            text: body,
        });
        await logToFile(`[EMAIL] Notifica email inviata: "${subject}"`);
    } catch (error) {
        await logToFile(`[EMAIL ERROR] Errore durante l'invio dell'email "${subject}": ${error.message}`);
        console.error(`[EMAIL ERROR] Errore durante l'invio dell'email "${subject}":`, error);
    }
}

function getCanonicalFuelName(desc) {
    const lowerDesc = String(desc).toLowerCase();
    if (lowerDesc.includes('benzina')) return 'Benzina';
    if (lowerDesc.includes('gasolio')) return 'Gasolio';
    if (lowerDesc.includes('gpl')) return 'GPL';
    if (lowerDesc.includes('metano')) return 'Metano';
    return null;
}

export async function aggregatePrices() {
    let connection;
    try {
        await logToFile('--- INIZIO SCRIPT DI AGGREGAZIONE PREZZI ---');
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE,
        });
        await logToFile('Connessione al database stabilita.');

        const today = new Date().toISOString().slice(0, 10);

        await connection.beginTransaction();
        await logToFile('Transazione avviata.');

        // --- FASE 1: Importa dati a livello 'distributore' ---
        await logToFile('Fase 1: Inizio importazione dati a livello distributore...');
        await connection.execute('DELETE FROM prezzi_storici WHERE data = ?', [today]);
        await logToFile(`  - Record esistenti per la data ${today} cancellati.`);

        const [prezziRecenti] = await connection.execute(`
            SELECT p.id_impianto, p.desc_carburante, p.prezzo
            FROM prezzi p
            WHERE p.dtcomu >= NOW() - INTERVAL 48 HOUR
              AND p.is_self = 1
              AND p.prezzo > 0.5
        `);

        if (prezziRecenti.length === 0) {
            await logToFile('Nessun prezzo recente trovato. Rollback e uscita.');
            await connection.rollback();
            await sendEmailNotification(
                'CRON Job: Aggregazione Prezzi - Nessun Dato',
                'Il CRON job di aggregazione prezzi è terminato senza trovare prezzi recenti da aggregare.'
            );
            return;
        }

        const distributoreRecords = prezziRecenti.map(row => {
            const fuelName = getCanonicalFuelName(row.desc_carburante);
            if (!fuelName) return null;
            return [today, fuelName, 'distributore', row.id_impianto, row.prezzo, row.prezzo, row.prezzo];
        }).filter(Boolean);

        if (distributoreRecords.length > 0) {
            const sql = 'INSERT INTO prezzi_storici (data, desc_carburante, livello_geo, codice_geo, prezzo_medio, prezzo_min, prezzo_max) VALUES ?';
            await connection.query(sql, [distributoreRecords]);
            await logToFile(`  - Inserite ${distributoreRecords.length} righe a livello distributore.`);
        } else {
            await logToFile('Nessun record valido a livello distributore da inserire.');
        }


        // --- FASE 2: Calcola aggregati superiori ---
        await logToFile('\nFase 2: Inizio calcolo aggregati superiori...');
        const [distributoriDiOggi] = await connection.execute(`
            SELECT ps.desc_carburante,
                   ps.prezzo_medio,
                   i.comune,
                   i.provincia,
                   prov.regione
            FROM prezzi_storici ps
                     JOIN impianti i ON ps.codice_geo = i.id_impianto
                     JOIN provincie prov ON i.provincia = prov.id
            WHERE ps.data = ?
              AND ps.livello_geo = 'distributore'
        `, [today]);

        if (distributoriDiOggi.length === 0) {
            await logToFile('Nessun dato a livello distributore da aggregare. Commit e uscita.');
            await connection.commit();
            await sendEmailNotification(
                'CRON Job: Aggregazione Prezzi - Nessun Dato Aggregabile',
                'Il CRON job di aggregazione prezzi è terminato senza dati a livello distributore da aggregare ulteriormente.'
            );
            return;
        }
        await logToFile(`  - Letti ${distributoriDiOggi.length} record per l'aggregazione.`);

        const aggregations = {};
        for (const row of distributoriDiOggi) {
            // mysql2 restituisce le colonne DECIMAL come stringa: converto a numero
            const prezzoMedio = Number(row.prezzo_medio);
            if (!Number.isFinite(prezzoMedio)) continue;

            const geoLevels = {
                comune: row.comune,
                provinciale: row.provincia,
                regionale: row.regione,
                nazionale: 'IT',
            };

            for (const [level, code] of Object.entries(geoLevels)) {
                if (!code) continue;
                const key = `${level}_${code}_${row.desc_carburante}`;
                if (!aggregations[key]) {
                    aggregations[key] = {sum: 0, count: 0, min: Infinity, max: -Infinity};
                }
                const stats = aggregations[key];
                stats.sum += prezzoMedio;
                stats.count++;
                if (prezzoMedio < stats.min) stats.min = prezzoMedio;
                if (prezzoMedio > stats.max) stats.max = prezzoMedio;
            }
        }

        const aggregatedRecords = Object.entries(aggregations).map(([key, stats]) => {
            const [level, code, fuelName] = key.split('_');
            return [today, fuelName, level, code, stats.sum / stats.count, stats.min, stats.max];
        });

        if (aggregatedRecords.length > 0) {
            const sql = 'INSERT INTO prezzi_storici (data, desc_carburante, livello_geo, codice_geo, prezzo_medio, prezzo_min, prezzo_max) VALUES ?';
            await connection.query(sql, [aggregatedRecords]);
            await logToFile(`  - Inserite ${aggregatedRecords.length} righe aggregate.`);
        } else {
            await logToFile('Nessun record aggregato da inserire.');
        }


        await connection.commit();
        await logToFile('\nTransazione completata con successo!');
        await sendEmailNotification(
            'CRON Job Success: Aggregazione Prezzi',
            'L\'aggregazione giornaliera dei prezzi è stata completata con successo.'
        );

    } catch (error) {
        await logToFile(`\n--- ERRORE FATALE DURANTE L'AGGREGAZIONE ---`);
        await logToFile(error.message);
        if (connection) {
            await logToFile('Rollback della transazione in corso...');
            await connection.rollback();
        }
        await sendEmailNotification(
            'CRON Job Fallito: Aggregazione Prezzi',
            `L'aggregazione giornaliera dei prezzi è fallita: ${error.message}`
        );
    } finally {
        if (connection) {
            await connection.end();
            await logToFile('Connessione al database chiusa.');
        }
        await logToFile('Fine esecuzione script aggregazione prezzi.');
    }
}

if (process.argv[1] && process.argv[1].includes('aggregate-prices.js')) {
    // Assicurati che la directory di log esista
    fs.mkdir(path.dirname(LOG_FILE_PATH), {recursive: true})
        .then(() => aggregatePrices())
        .catch(error => console.error(`Errore iniziale nella creazione della directory di log o nell'esecuzione: ${error.message}`));
}