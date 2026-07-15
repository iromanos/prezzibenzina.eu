// src/app/api/subscriptions.test.js

import assert from 'assert';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import bcrypt from 'bcryptjs';
import {encode} from 'next-auth/jwt';

dotenv.config({path: path.resolve(process.cwd(), '.env')});

const BASE_URL = 'http://localhost:3000';

let testUser = {
    id: null,
    name: 'Test User',
    email: `testuser_${Date.now()}@example.com`,
};

let sessionCookie = null;
let createdSubscriptionId = null;

// Funzione per creare un token JWT valido per il nostro utente utilizzando next-auth/jwt
async function createSessionToken(user) {
    const token = await encode({
        token: {
            sub: String(user.id),
            name: user.name,
            email: user.email,
            id: user.id
        },
        secret: process.env.NEXTAUTH_SECRET,
        maxAge: 3600
    });
    return `next-auth.session-token=${token}`;
}

async function setupTestUser() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
    });

    const password_hash = await bcrypt.hash('password123', 10);
    const [result] = await connection.execute(
        'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
        [testUser.name, testUser.email, password_hash]
    );
    testUser.id = result.insertId;
    console.log(`✓ Utente di test creato con ID: ${testUser.id}`);

    // Crea manualmente il token di sessione
    sessionCookie = await createSessionToken(testUser);
    console.log('✓ Cookie di sessione generato manualmente.');

    await connection.end();
}

async function teardownTestUser() {
    if (!testUser.id) return;
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
    });

    await connection.execute('DELETE FROM users WHERE id = ?', [testUser.id]);
    console.log(`✓ Utente di test con ID: ${testUser.id} eliminato.`);
    await connection.end();
}

async function runApiTests() {
    try {
        console.log('--- INIZIO TEST API SOTTOSCRIZIONI ---');
        await setupTestUser();

        // --- Test 1: Crea una sottoscrizione valida ---
        console.log('\n1. Test: POST /create (autenticato)');
        const createResponse = await fetch(`${BASE_URL}/api/subscriptions/create`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json', 'Cookie': sessionCookie},
            body: JSON.stringify({
                fuel_type: 'Benzina',
                geo_level: 'provinciale',
                geo_code: 'MI',
                threshold_type: 'cheapest_in_area',
            }),
        });
        assert.strictEqual(createResponse.status, 201, `Test 1 Fallito: Lo stato non è 201. Body: ${await createResponse.text()}`);
        console.log('✓ Test 1 Superato.');

        // --- Test 2: Recupera la lista delle sottoscrizioni ---
        console.log('\n2. Test: GET /list');
        const listResponse = await fetch(`${BASE_URL}/api/subscriptions/list`, {
            headers: {'Cookie': sessionCookie},
        });
        assert.strictEqual(listResponse.status, 200, 'Test 2 Fallito: Lo stato non è 200.');
        const subscriptions = await listResponse.json();
        assert.strictEqual(subscriptions.length, 1, 'Test 2 Fallito: La lista non contiene 1 sottoscrizione.');
        assert.strictEqual(subscriptions[0].geo_code, 'MI', 'Test 2 Fallito: Il geo_code non corrisponde.');
        createdSubscriptionId = subscriptions[0].id; // Salva l'ID per i prossimi test
        console.log('✓ Test 2 Superato.');

        // --- Test 3: Aggiorna una sottoscrizione ---
        console.log('\n3. Test: PUT /subscriptions/[id]');
        const updateResponse = await fetch(`${BASE_URL}/api/subscriptions/${createdSubscriptionId}`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json', 'Cookie': sessionCookie},
            body: JSON.stringify({status: 'paused'}),
        });
        assert.strictEqual(updateResponse.status, 200, 'Test 3 Fallito: Lo stato non è 200.');
        console.log('✓ Test 3 Superato.');

        // --- Test 4: Elimina una sottoscrizione ---
        console.log('\n4. Test: DELETE /subscriptions/[id]');
        const deleteResponse = await fetch(`${BASE_URL}/api/subscriptions/${createdSubscriptionId}`, {
            method: 'DELETE',
            headers: {'Cookie': sessionCookie},
        });
        assert.strictEqual(deleteResponse.status, 200, 'Test 4 Fallito: Lo stato non è 200.');
        // Verifica che la lista ora sia vuota (perché filtriamo per status != 'deleted')
        const finalListResponse = await fetch(`${BASE_URL}/api/subscriptions/list`, {headers: {'Cookie': sessionCookie}});
        const finalList = await finalListResponse.json();
        assert.strictEqual(finalList.length, 0, 'Test 4 Fallito: La lista non è vuota dopo la cancellazione.');
        console.log('✓ Test 4 Superato.');

    } catch (error) {
        console.error('\n--- TEST FALLITO ---');
        console.error(error);
        process.exit(1);
    } finally {
        await teardownTestUser();
        console.log('\n--- TEST COMPLETATI ---');
    }
}

runApiTests();
