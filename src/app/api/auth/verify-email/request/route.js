import {NextResponse} from 'next/server';
import mysql from 'mysql2/promise';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

// Configurazione Nodemailer (riutilizzata da check-price-alerts.js)
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_PORT === 465,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export async function POST(request) {
    try {
        const {email} = await request.json();

        if (!email) {
            return NextResponse.json({error: 'Email è obbligatoria.'}, {status: 400});
        }

        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE,
        });

        // Trova l'utente
        const [users] = await connection.execute(
            'SELECT id, email_verified_at FROM users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            connection.end();
            return NextResponse.json({error: 'Utente non trovato.'}, {status: 404});
        }

        const user = users[0];

        if (user.email_verified_at !== null) {
            connection.end();
            return NextResponse.json({message: 'L\'email è già stata verificata.'}, {status: 200});
        }

        // Genera un token di verifica
        const verificationToken = crypto.randomBytes(32).toString('hex');

        // Salva il token nel database
        await connection.execute(
            'UPDATE users SET verification_token = ? WHERE id = ?',
            [verificationToken, user.id]
        );

        connection.end();

        // Invia l'email di verifica
        const verificationLink = `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/verify-email?token=${verificationToken}`;

        const mailOptions = {
            from: `"PrezziBenzina.eu" <${process.env.EMAIL_FROM}>`,
            to: email,
            subject: 'Verifica il tuo indirizzo email per PrezziBenzina.eu',
            html: `
                <p>Ciao,</p>
                <p>Grazie per esserti registrato a PrezziBenzina.eu. Per attivare il tuo account, clicca sul link qui sotto:</p>
                <p><a href="${verificationLink}">Verifica il tuo indirizzo email</a></p>
                <p>Se non hai richiesto questa verifica, puoi ignorare questa email.</p>
                <p>Il team di PrezziBenzina.eu</p>
            `,
        };

        await transporter.sendMail(mailOptions);

        return NextResponse.json({message: 'Link di verifica inviato alla tua email.'}, {status: 200});

    } catch (error) {
        console.error('Errore durante la richiesta di verifica email:', error);
        return NextResponse.json({error: 'Errore interno del server.'}, {status: 500});
    }
}