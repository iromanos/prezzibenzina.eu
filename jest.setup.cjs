// jest.setup.cjs
// Questo file viene eseguito prima di tutte le suite di test.
// Viene utilizzato per configurare l'ambiente di test, come il caricamento delle variabili d'ambiente.
require('dotenv').config({path: '.env'}); // Carica .env.test per l'ambiente di test

// Imposta valori predefiniti per le variabili d'ambiente critiche se non sono definite.
// Questo assicura che i test possano essere eseguiti anche se .env.test è incompleto o mancante.
process.env.DB_HOST = process.env.DB_HOST || 'localhost';
process.env.DB_USER = process.env.DB_USER || 'testuser';
process.env.DB_PASSWORD = process.env.DB_PASSWORD || 'testpassword';
process.env.DB_DATABASE = process.env.DB_DATABASE || 'testdb';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret';
process.env.EMAIL_HOST = process.env.EMAIL_HOST || 'smtp.test.com';
process.env.EMAIL_PORT = process.env.EMAIL_PORT || '587';
process.env.EMAIL_USER = process.env.EMAIL_USER || 'test@test.com';
process.env.EMAIL_PASS = process.env.EMAIL_PASS || 'testpass';
process.env.EMAIL_FROM = process.env.EMAIL_FROM || 'no-reply@test.com';
process.env.NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';