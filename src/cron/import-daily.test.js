// src/cron/import-daily.test.js

import assert from 'assert';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import {runDailyImport} from './import-daily.js';

dotenv.config({path: path.resolve(process.cwd(), '.env')});

/**
 * Test di validazione end-to-end per lo script di importazione giornaliera.
 * Esegue lo script con l'URL reale e verifica che i dati nel database
 * siano stati aggiornati correttamente.
 */
async function runValidationTest() {
    let connection;
    try {
        console.log('--- INIZIO TEST DI VALIDAZIONE PER IMPORT-DAILY ---');

        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE,
        });
        console.log('Connessione al database stabilita.');

        // 1. Esegui lo script di importazione giornaliera
        await runDailyImport();

        // 2. Verifica i risultati nel database
        console.log('Verifica dei dati nel database...');

        // Prendi la data di oggi in formato AAAA-MM-GG
        const today = new Date().toISOString().slice(0, 10);

        // Controlla quanti record sono stati aggiornati oggi.
        // Ci aspettiamo che un numero significativo di record abbia la data di oggi.
        const [rows] = await connection.execute(
            'SELECT COUNT(*) as count FROM prezzi WHERE DATE(dtcomu) = ?',
            [today]
        );

        const updatedCount = rows[0].count;
        console.log(`Numero di record aggiornati con la data di oggi (${today}): ${updatedCount}`);

        // Il test passa se almeno 10,000 record sono stati aggiornati oggi.
        // È un numero ragionevole per un'importazione nazionale.
        assert(updatedCount > 10000, `Test Fallito: Il numero di record aggiornati (${updatedCount}) è troppo basso.`);
        console.log('✅ Test superato: Un numero significativo di record è stato aggiornato oggi.');

        console.log('\n--- TEST DI VALIDAZIONE GIORNALIERO COMPLETATO CON SUCCESSO! ---');

    } catch (error) {
        console.error('\n--- TEST DI VALIDAZIONE GIORNALIERO FALLITO ---');
        console.error(error);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
            console.log('Connessione al database chiusa.');
        }
    }
}

runValidationTest();
