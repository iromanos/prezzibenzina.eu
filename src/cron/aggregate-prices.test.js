// src/cron/aggregate-prices.test.js

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import {aggregatePrices} from './aggregate-prices.js';
import assert from 'assert';

dotenv.config({path: path.resolve(process.cwd(), '.env')});

/**
 * Test di validazione per lo script di aggregazione.
 * Esegue lo script sui dati reali presenti nel database e verifica
 * la coerenza e la correttezza dei dati aggregati.
 */
async function runValidationTest() {
    let connection;
    try {
        console.log('--- INIZIO TEST DI VALIDAZIONE SUI DATI REALI ---');

        // --- 1. ESECUZIONE: Chiamata alla funzione da testare ---
        console.log('1. Esecuzione dello script di aggregazione...');
        await aggregatePrices();
        console.log('Script di aggregazione completato.');

        // --- 2. VERIFICA: Connessione al DB per controllare i risultati ---
        console.log('\n2. Verifica dei dati aggregati...');
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE,
        });

        const today = new Date().toISOString().slice(0, 10);
        const [results] = await connection.query('SELECT * FROM prezzi_storici WHERE data = ?', [today]);

        // --- Controlli di coerenza (Sanity Checks) ---

        // Test 1: Verifica che siano stati inseriti dei record
        assert(results.length > 0, 'Test di validazione fallito: Nessun record è stato inserito in prezzi_storici.');
        console.log(`✅ Test superato: Sono stati inseriti ${results.length} record.`);

        // Test 2: Verifica della presenza di tutti i livelli geografici
        const geoLevels = new Set(results.map(r => r.livello_geo));
        assert(geoLevels.has('nazionale'), 'Test di validazione fallito: Manca il livello "nazionale".');
        assert(geoLevels.has('regionale'), 'Test di validazione fallito: Manca il livello "regionale".');
        assert(geoLevels.has('provinciale'), 'Test di validazione fallito: Manca il livello "provinciale".');
        assert(geoLevels.has('distributore'), 'Test di validazione fallito: Manca il livello "distributore".');
        console.log('✅ Test superato: Tutti i livelli geografici sono presenti.');

        // Test 3: Verifica della coerenza dei prezzi (min <= medio <= max)
        for (const record of results) {
            const isConsistent = record.prezzo_min <= record.prezzo_medio && record.prezzo_medio <= record.prezzo_max;
            assert(isConsistent, `Test di validazione fallito: Incoerenza prezzi per ${record.livello_geo} ${record.codice_geo} (min: ${record.prezzo_min}, medio: ${record.prezzo_medio}, max: ${record.prezzo_max})`);
        }
        console.log('✅ Test superato: Tutti i record hanno prezzi coerenti (min <= medio <= max).');

        // Test 4: Verifica che i prezzi medi non siano nulli o zero
        const hasInvalidAverage = results.some(r => !r.prezzo_medio || r.prezzo_medio <= 0);
        assert(!hasInvalidAverage, 'Test di validazione fallito: Trovati record con prezzo medio non valido.');
        console.log('✅ Test superato: Tutti i prezzi medi sono validi.');


        console.log('\n--- TEST DI VALIDAZIONE SUPERATO CON SUCCESSO! ---');

    } catch (error) {
        console.error('\n--- TEST DI VALIDAZIONE FALLITO ---');
        console.error(error);
        process.exit(1); // Esci con un codice di errore
    } finally {
        if (connection) {
            await connection.end();
            console.log('Connessione di verifica chiusa.');
        }
    }
}

runValidationTest();
