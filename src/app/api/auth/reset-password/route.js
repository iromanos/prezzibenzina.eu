import {NextResponse} from 'next/server';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';

export async function POST(request) {
    try {
        const {token, newPassword} = await request.json();

        if (!token || !newPassword) {
            return NextResponse.json({error: 'Token e nuova password sono obbligatori.'}, {status: 400});
        }

        // Validazione base della password (es. minimo 6 caratteri)
        if (newPassword.length < 6) {
            return NextResponse.json({error: 'La nuova password deve contenere almeno 6 caratteri.'}, {status: 400});
        }

        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE,
        });

        // Trova l'utente con il token di reset valido e non scaduto
        const [users] = await connection.execute(
            'SELECT id FROM users WHERE reset_password_token = ? AND reset_password_expires > NOW()',
            [token]
        );

        if (users.length === 0) {
            await connection.end();
            return NextResponse.json({error: 'Token di reset non valido o scaduto.'}, {status: 400});
        }

        const user = users[0];

        // Hash della nuova password
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(newPassword, saltRounds);

        // Aggiorna la password e invalida il token di reset
        await connection.execute(
            'UPDATE users SET password_hash = ?, reset_password_token = NULL, reset_password_expires = NULL WHERE id = ?',
            [passwordHash, user.id]
        );

        await connection.end();

        return NextResponse.json({message: 'Password resettata con successo.'}, {status: 200});

    } catch (error) {
        console.error('Errore durante il reset password:', error);
        return NextResponse.json({error: 'Errore interno del server.'}, {status: 500});
    }
}