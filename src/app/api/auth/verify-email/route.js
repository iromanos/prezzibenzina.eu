import {NextResponse} from 'next/server';
import mysql from 'mysql2/promise';

export async function GET(request) {
    try {
        const {searchParams} = new URL(request.url);
        const token = searchParams.get('token');

        if (!token) {
            return NextResponse.json({error: 'Token di verifica mancante.'}, {status: 400});
        }

        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE,
        });

        // Trova l'utente con il token di verifica
        const [users] = await connection.execute(
            'SELECT id FROM users WHERE verification_token = ?',
            [token]
        );

        if (users.length === 0) {
            await connection.end();
            return NextResponse.json({error: 'Token di verifica non valido o scaduto.'}, {status: 400});
        }

        const user = users[0];

        // Aggiorna lo stato dell'utente a verificato e rimuovi il token
        await connection.execute(
            'UPDATE users SET is_verified = TRUE, verification_token = NULL WHERE id = ?',
            [user.id]
        );

        await connection.end();

        // Reindirizza l'utente a una pagina di conferma o alla login
        return NextResponse.redirect(new URL('/auth/verification-success', request.url));

    } catch (error) {
        console.error('Errore durante la verifica email:', error);
        return NextResponse.json({error: 'Errore interno del server.'}, {status: 500});
    }
}