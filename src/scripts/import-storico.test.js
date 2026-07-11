// src/scripts/import-storico.test.js

import assert from 'assert';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import {runImport} from './import-storico.js';

dotenv.config({path: path.resolve(process.cwd(), '.env')});

/**
 * Test di validazione end-to-end per lo script import-storico.
 * Esegue lo script usando gli URL reali e verifica che i dati
 * siano stati effettivamente aggiunti al database.
 *
 * ATTENZIONE: Questo test richiede una connessione a internet e può
 * richiedere molto tempo per essere completato.
 */
async function runValidationTest() {
    let connection;
    try {
        console.log('--- INIZIO TEST DI VALIDAZIONE END-TO-END PER IMPORT-STORICO ---');

        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE,
        });
        console.log('Connessione al database stabilita.');

        // 1. Conta le righe PRIMA dell'importazione
        const [beforeRows] = await connection.execute('SELECT COUNT(*) as count FROM prezzi');
        const countBefore = beforeRows[0].count;
        console.log(`Numero di righe nella tabella 'prezzi' prima dell'importazione: ${countBefore}`);

        // 2. Esegui lo script di importazione con gli URL reali
        // (chiamando runImport senza argomenti)
        await runImport();

        // 3. Conta le righe DOPO l'importazione
        const [afterRows] = await connection.execute('SELECT COUNT(*) as count FROM prezzi');
        const countAfter = afterRows[0].count;
        console.log(`Numero di righe nella tabella 'prezzi' dopo l'importazione: ${countAfter}`);

        // 4. Verifica che il numero di righe sia aumentato
        assert(countAfter > countBefore, `Test Fallito: Il numero di righe non è aumentato. Prima: ${countBefore}, Dopo: ${countAfter}`);
        console.log(`✅ Test superato: Il numero di righe è aumentato di ${countAfter - countBefore}.`);

        // 5. Verifica opzionale: controlla se esistono dati per una data specifica attesa
        const [checkDateRows] = await connection.execute("SELECT COUNT(*) as count FROM prezzi WHERE DATE(dtcomu) = '2026-01-15'");
        const countForDate = checkDateRows[0].count;
        assert(countForDate > 0, "Test Fallito: Non sono stati trovati record per la data di controllo '2026-01-15'.");
        console.log(`✅ Test superato: Trovati ${countForDate} record per la data di controllo.`);


        console.log('\n--- TEST DI VALIDAZIONE COMPLETATO CON SUCCESSO! ---');

    } catch (error) {
        console.error('\n--- TEST DI VALIDAZIONE FALLITO ---');
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
