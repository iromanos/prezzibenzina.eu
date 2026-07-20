// src/app/api/auth/register/route.js

import {NextResponse} from 'next/server';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';

export async function POST(request) {
    try {
        const {email, password} = await request.json();

        if (!email || !password) {
            return NextResponse.json({error: 'Email e password sono obbligatori.'}, {status: 400});
        }

        // Validazione base dell'email
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return NextResponse.json({error: 'Formato email non valido.'}, {status: 400});
        }

        // Validazione base della password (es. minimo 6 caratteri)
        if (password.length < 6) {
            return NextResponse.json({error: 'La password deve contenere almeno 6 caratteri.'}, {status: 400});
        }

        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE,
        });

        // Controlla se l'utente esiste già
        const [existingUsers] = await connection.execute(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );

        if (existingUsers.length > 0) {
            connection.end();
            return NextResponse.json({error: 'Un utente con questa email esiste già.'}, {status: 409});
        }

        // Hash della password
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Inserisci il nuovo utente nel database
        const [result] = await connection.execute(
            'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
            [email, email, passwordHash]
        );

        await connection.end();

        if (result.affectedRows === 1) {
            return NextResponse.json({message: 'Registrazione avvenuta con successo.'}, {status: 201});
        } else {
            return NextResponse.json({error: 'Errore durante la registrazione dell\'utente.'}, {status: 500});
        }

    } catch (error) {
        console.error('Errore durante la registrazione:', error);
        return NextResponse.json({error: 'Errore interno del server.'}, {status: 500});
    }
}