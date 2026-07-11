// src/scripts/import-storico.test.js

import assert from 'assert';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import {runImport} from './import-storico.js';

dotenv.config({path: path.resolve(process.cwd(), '.env')});

/**
 * Test di validazione per lo script import-storico.
 * Esegue lo script con gli URL reali e verifica che i dati
 * siano stati inseriti/aggiornati correttamente in 'prezzi_storici'.
 */
async function runValidationTest() {
    let connection;
    const testDate = '2026-01-15'; // Una data che sappiamo essere presente nei file di test

    try {
        console.log('--- INIZIO TEST DI VALIDAZIONE PER IMPORT-STORICO ---');

        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE,
        });
        console.log('Connessione al database stabilita.');

        // Pulisci i dati di test precedenti se esistono, per garantire un test pulito
        await connection.execute("DELETE FROM prezzi_storici WHERE data = ?", [testDate]);
        console.log(`Puliti i record di test esistenti per la data ${testDate}`);

        // 1. Esegui lo script di importazione
        await runImport();

        // 2. Verifica i risultati nel database
        console.log('Verifica dei dati in prezzi_storici...');

        const [rows] = await connection.execute(
            "SELECT * FROM prezzi_storici WHERE data = ? AND livello_geo = 'distributore'",
            [testDate]
        );

        assert(rows.length > 0, `Test Fallito: Nessun record trovato in prezzi_storici per la data ${testDate}.`);
        console.log(`✅ Test superato: Trovati ${rows.length} record per la data di controllo.`);

        // Verifica la coerenza di un record a campione
        const sample = rows[0];
        assert(sample.prezzo_min <= sample.prezzo_medio, 'Incoerenza: prezzo_min > prezzo_medio');
        assert(sample.prezzo_medio <= sample.prezzo_max, 'Incoerenza: prezzo_medio > prezzo_max');
        console.log('✅ Test superato: Il record a campione ha prezzi coerenti.');


        console.log('\n--- TEST DI VALIDAZIONE STORICO COMPLETATO CON SUCCESSO! ---');

    } catch (error) {
        console.error('\n--- TEST DI VALIDAZIONE STORICO FALLITO ---');
        console.error(error);
        process.exit(1);
    } finally {
        if (connection) {
            // Pulisci i dati inseriti dal test per mantenere il DB pulito
            await connection.end();
            console.log('Connessione al database chiusa.');
        }
    }
}

runValidationTest();
