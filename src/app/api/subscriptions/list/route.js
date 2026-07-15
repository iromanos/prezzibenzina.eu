import {NextResponse} from 'next/server';
import mysql from 'mysql2/promise';
import jwt from 'jsonwebtoken';

// Middleware per verificare il token JWT (riutilizzato)
async function verifyToken(request) {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return {error: 'Token di autenticazione mancante o non valido.', status: 401};
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return {userId: decoded.userId};
    } catch (error) {
        return {error: 'Token di autenticazione non valido o scaduto.', status: 401};
    }
}

export async function GET(request) {
    const authResult = await verifyToken(request);
    if (authResult.error) {
        return NextResponse.json({error: authResult.error}, {status: authResult.status});
    }
    const userId = authResult.userId;

    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE,
        });

        // Recupera tutte le sottoscrizioni per l'utente autenticato
        const [subscriptions] = await connection.execute(
            'SELECT id, fuel_type, geo_level, geo_code, threshold_type, threshold_value, status, created_at, updated_at, last_notified_at FROM price_subscriptions WHERE user_id = ? ORDER BY created_at DESC',
            [userId]
        );

        await connection.end();

        return NextResponse.json(subscriptions, {status: 200});

    } catch (error) {
        console.error('Errore durante il recupero delle sottoscrizioni:', error);
        return NextResponse.json({error: 'Errore interno del server.'}, {status: 500});
    }
}