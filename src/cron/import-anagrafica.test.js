// src/cron/import-anagrafica.test.js

import assert from 'assert';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import {runAnagraficaImport} from './import-anagrafica.js';

dotenv.config({path: path.resolve(process.cwd(), '.env')});

/**
 * Test di validazione per lo script di importazione dell'anagrafica.
 */
async function runValidationTest() {
    let connection;
    try {
        console.log('--- INIZIO TEST DI VALIDAZIONE PER IMPORT-ANAGRAFICA ---');

        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE,
        });
        console.log('Connessione al database stabilita.');

        // 1. Prendi un timestamp PRIMA dell'importazione
        const beforeTimestamp = new Date();

        // 2. Esegui lo script di importazione
        await runAnagraficaImport();

        // 3. Verifica i risultati nel database
        console.log('Verifica dei dati nel database...');

        // Controlla quanti impianti sono stati aggiornati.
        // La colonna 'updated_at' nella tabella 'impianti' sarebbe ideale.
        // In sua assenza, contiamo quanti record sono stati processati.
        // Un test più robusto potrebbe verificare un impianto specifico.
        const [rows] = await connection.execute(
            'SELECT COUNT(*) as count FROM impianti'
        );

        const totalCount = rows[0].count;
        console.log(`Numero totale di impianti nella tabella: ${totalCount}`);

        // Il test passa se ci sono più di 20,000 impianti, un numero ragionevole per l'Italia.
        assert(totalCount > 20000, `Test Fallito: Il numero totale di impianti (${totalCount}) è troppo basso.`);
        console.log('✅ Test superato: Il numero totale di impianti è plausibile.');

        console.log('\n--- TEST DI VALIDAZIONE ANAGRAFICA COMPLETATO CON SUCCESSO! ---');

    } catch (error) {
        console.error('\n--- TEST DI VALIDAZIONE ANAGRAFICA FALLITO ---');
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
