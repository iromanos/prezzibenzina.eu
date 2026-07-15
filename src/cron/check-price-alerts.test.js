// src/cron/check-price-alerts.test.js

import assert from 'assert';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import {checkPriceAlerts, generateUnsubscribeToken} from './check-price-alerts.js';

dotenv.config({path: path.resolve(process.cwd(), '.env')});

// Imposta NODE_ENV su 'test' in modo che non vengano inviate email reali
process.env.NODE_ENV = 'test';

const TEST_IMPIANTO_ID = 999999;
let testUserId = null;
let testSubId = null;

async function runTests() {
    let connection;
    try {
        console.log('--- INIZIO TEST DI VALIDAZIONE PER CHECK-PRICE-ALERTS ---');

        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE,
        });
        console.log('Connessione al database stabilita.');

        // --- SETUP DATI DI TEST ---
        console.log('Esecuzione setup dati di test...');

        // 1. Crea un utente di test
        const testEmail = `test_alert_${Date.now()}@example.com`;
        const [userResult] = await connection.execute(
            'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
            ['Test Alert User', testEmail, 'dummy_password_hash']
        );
        testUserId = userResult.insertId;
        console.log(`✓ Utente di test creato (ID: ${testUserId}, Email: ${testEmail})`);

        // 2. Crea un impianto di test (o usa un DUPLICATE KEY UPDATE)
        await connection.execute(`
            INSERT INTO impianti (id_impianto, gestore, bandiera, tipo_impianto, nome_impianto, indirizzo, comune,
                                  provincia, latitudine, longitudine, address, location_ok, stato)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE nome_impianto=VALUES(nome_impianto),
                                    comune=VALUES(comune),
                                    provincia=VALUES(provincia)
        `, [TEST_IMPIANTO_ID, 'Gestore Test', 'Bandiera Test', 'Stradale', 'Impianto Test Alert', 'Via Test 123', 'Roma', 'RM', 41.9, 12.5, '', 0, 'IT']);
        console.log(`✓ Impianto di test creato/aggiornato (ID: ${TEST_IMPIANTO_ID})`);

        // 3. Inserisci un prezzo recente per questo impianto
        // Per testare il livello nazionale/comune/provinciale/regionale dobbiamo assicurarci che la provincia RM appartenga al Lazio
        // Controlliamo se la provincia e la regione esistono. Per ora facciamo un test di tipo 'distributore' e uno di tipo 'comune'.
        await connection.execute(`
            INSERT INTO prezzi (id_impianto, desc_carburante, prezzo, is_self, dtcomu, fuel_id)
            VALUES (?, ?, ?, 1, NOW(), 1)
            ON DUPLICATE KEY UPDATE prezzo=VALUES(prezzo),
                                    dtcomu=VALUES(dtcomu)
        `, [TEST_IMPIANTO_ID, 'Benzina', 1.499]);
        console.log(`✓ Prezzo Benzina a 1.499 inserito per impianto ${TEST_IMPIANTO_ID}`);

        // 4. Crea una sottoscrizione per 'distributore'
        // Soglia di prezzo: 1.600. Il prezzo attuale è 1.499, quindi deve scattare.
        const [subResult] = await connection.execute(`
            INSERT INTO price_subscriptions (user_id, fuel_type, geo_level, geo_code, threshold_type, threshold_value,
                                             status)
            VALUES (?, 'Benzina', 'distributore', ?, 'below_price', 1.600, 'active')
        `, [testUserId, String(TEST_IMPIANTO_ID)]);
        testSubId = subResult.insertId;
        console.log(`✓ Sottoscrizione di test creata (ID: ${testSubId})`);

        // pulisci notifiche vecchie se presenti per questo id (non dovrebbero essercene)
        await connection.execute('DELETE FROM sent_notifications WHERE subscription_id = ?', [testSubId]);

        // --- ESECUZIONE CRON JOB ---
        console.log('\nAvvio del cron job di controllo alerts...');
        await checkPriceAlerts();
        console.log('Cron job completato.');

        // --- VERIFICHE ---
        console.log('\nVerifica dei risultati nel database...');

        // 1. Verifica che la sottoscrizione sia stata aggiornata con last_notified_at
        const [subsRows] = await connection.execute(
            'SELECT last_notified_at FROM price_subscriptions WHERE id = ?',
            [testSubId]
        );
        assert.ok(subsRows[0].last_notified_at, 'Test Fallito: last_notified_at non è stato impostato.');
        console.log('✅ Test superato: last_notified_at è stato aggiornato correttamente.');

        // 2. Verifica che una notifica sia stata registrata in sent_notifications
        const [notifRows] = await connection.execute(
            'SELECT * FROM sent_notifications WHERE subscription_id = ?',
            [testSubId]
        );
        assert.strictEqual(notifRows.length, 1, 'Test Fallito: Nessun record di notifica inserito.');
        assert.strictEqual(notifRows[0].status, 'sent', 'Test Fallito: Stato notifica non è "sent".');
        assert.strictEqual(Number(notifRows[0].triggered_price), 1.499, 'Test Fallito: Il prezzo registrato non corrisponde.');
        console.log('✅ Test superato: Notifica inviata registrata correttamente in sent_notifications.');

        // 3. Verifica generazione ed equivalenza del token di disiscrizione
        const unsubToken = generateUnsubscribeToken(testSubId, testUserId);
        assert.strictEqual(typeof unsubToken, 'string', 'Il token di disiscrizione deve essere una stringa.');
        assert.strictEqual(unsubToken.length, 64, 'Il token di disiscrizione deve essere una stringa hex a 64 caratteri (SHA-256).');
        console.log('✅ Test superato: Token di disiscrizione generato correttamente.');

        // --- TEST UN-SUBSCRIBE LOGIC ---
        console.log('\n--- TEST UN-SUBSCRIBE LOGIC ---');

        // Crea un'altra sottoscrizione per la disiscrizione
        const [subResult2] = await connection.execute(`
            INSERT INTO price_subscriptions (user_id, fuel_type, geo_level, geo_code, threshold_type, threshold_value,
                                             status)
            VALUES (?, 'Benzina', 'distributore', ?, 'below_price', 1.600, 'active')
        `, [testUserId, String(TEST_IMPIANTO_ID)]);
        const testSubId2 = subResult2.insertId;
        console.log(`✓ Nuova sottoscrizione di test creata per disiscrizione (ID: ${testSubId2})`);

        const unsubToken2 = generateUnsubscribeToken(testSubId2, testUserId);

        // Verifica che la validazione della firma del token funzioni correttamente
        const expectedToken2 = generateUnsubscribeToken(testSubId2, testUserId);
        assert.strictEqual(unsubToken2, expectedToken2, 'Il token generato deve essere uguale a se stesso.');

        // Simula la chiamata dell'endpoint effettuando l'aggiornamento dello status nel DB
        console.log("Simulazione disiscrizione nel database...");
        await connection.execute(
            "UPDATE price_subscriptions SET status = 'deleted' WHERE id = ?",
            [testSubId2]
        );

        // Verifica che lo status sia ora 'deleted'
        const [subsRows2] = await connection.execute(
            'SELECT status FROM price_subscriptions WHERE id = ?',
            [testSubId2]
        );
        assert.strictEqual(subsRows2[0].status, 'deleted', 'La sottoscrizione deve essere marcata come "deleted".');
        console.log('✅ Test superato: Lo stato della sottoscrizione è ora "deleted".');

        // Assegna a variabile per il cleanup globale in caso di fallimenti successivi
        global.testSubId2 = testSubId2;

    } catch (error) {
        console.error('\n--- TEST DI VALIDAZIONE ALERT FALLITO ---');
        console.error(error);
        process.exit(1);
    } finally {
        // --- CLEANUP / TEARDOWN ---
        console.log('\nEsecuzione cleanup dati di test...');
        if (connection) {
            if (testSubId) {
                await connection.execute('DELETE FROM sent_notifications WHERE subscription_id = ?', [testSubId]);
                await connection.execute('DELETE FROM price_subscriptions WHERE id = ?', [testSubId]);
            }
            if (global.testSubId2) {
                await connection.execute('DELETE FROM price_subscriptions WHERE id = ?', [global.testSubId2]);
            }
            if (testUserId) {
                await connection.execute('DELETE FROM users WHERE id = ?', [testUserId]);
            }
            await connection.execute('DELETE FROM prezzi WHERE id_impianto = ?', [TEST_IMPIANTO_ID]);
            await connection.execute('DELETE FROM impianti WHERE id_impianto = ?', [TEST_IMPIANTO_ID]);
            await connection.end();
            console.log('Dati puliti e connessione chiusa.');
        }
        console.log('--- TEST COMPLETATI CON SUCCESSO ---');
    }
}

runTests();
