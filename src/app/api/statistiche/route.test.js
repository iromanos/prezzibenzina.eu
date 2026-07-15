// src/app/api/statistiche/route.test.js

import assert from 'assert';

// L'URL base del server di sviluppo Next.js
const BASE_URL = 'http://localhost:3000';

/**
 * Suite di test di integrazione per l'endpoint /api/statistiche.
 * Assicurati che il server di sviluppo Next.js sia in esecuzione prima di lanciare questo script.
 */
async function runApiTest() {
    try {
        console.log('--- INIZIO TEST DI INTEGRAZIONE API /api/statistiche ---');

        // --- Test 1: Chiamata valida con parametri base ---
        console.log('\n1. Esecuzione test: Chiamata valida...');
        const url1 = `${BASE_URL}/api/statistiche?livello_geo=nazionale&codice_geo=IT&desc_carburante=benzina`;
        const response1 = await fetch(url1);

        assert.strictEqual(response1.status, 200, 'Test 1 Fallito: Lo stato della risposta non è 200 OK.');
        const data1 = await response1.json();
        assert(Array.isArray(data1), 'Test 1 Fallito: Il corpo della risposta non è un array.');
        if (data1.length > 0) {
            assert('data' in data1[0] && 'prezzo_medio' in data1[0], 'Test 1 Fallito: I dati nell\'array non hanno il formato atteso.');
        }
        console.log('✅ Test 1 Superato: La chiamata valida ha restituito dati corretti.');


        // --- Test 2: Chiamata con parametri mancanti ---
        console.log('\n2. Esecuzione test: Parametri mancanti...');
        const url2 = `${BASE_URL}/api/statistiche?livello_geo=nazionale&id_carburante=1`; // Manca codice_geo
        const response2 = await fetch(url2);

        assert.strictEqual(response2.status, 400, 'Test 2 Fallito: Lo stato della risposta non è 400 Bad Request.');
        const error2 = await response2.json();
        assert(error2.error.includes('Parametri mancanti'), 'Test 2 Fallito: Il messaggio di errore non è quello atteso.');
        console.log('✅ Test 2 Superato: La chiamata con parametri mancanti è stata gestita correttamente.');


        // --- Test 3: Chiamata con filtro per data ---
        console.log('\n3. Esecuzione test: Filtro per data...');
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const startDate = yesterday.toISOString().slice(0, 10);

        const url3 = `${BASE_URL}/api/statistiche?livello_geo=nazionale&codice_geo=IT&desc_carburante=benzina&startDate=${startDate}&endDate=${startDate}`;
        const response3 = await fetch(url3);

        assert.strictEqual(response3.status, 200, 'Test 3 Fallito: Lo stato della risposta per il filtro data non è 200 OK.');
        const data3 = await response3.json();
        assert(Array.isArray(data3), 'Test 3 Fallito: Il corpo della risposta per il filtro data non è un array.');
        // Ci aspettiamo 0 o 1 risultato per un singolo giorno
        assert(data3.length <= 1, 'Test 3 Fallito: Il filtro per un singolo giorno ha restituito più di un risultato.');
        console.log('✅ Test 3 Superato: Il filtro per data funziona come previsto.');


        console.log('\n--- TUTTI I TEST API SONO STATI SUPERATI CON SUCCESSO! ---');

    } catch (error) {
        console.error('\n--- TEST API FALLITO ---');
        console.error('Assicurati che il server di sviluppo Next.js sia in esecuzione su', BASE_URL);
        console.error(error);
        process.exit(1);
    }
}

runApiTest();
