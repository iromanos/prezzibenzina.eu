import {NextResponse} from 'next/server';
import mysql from 'mysql2/promise';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

// Configurazione Nodemailer (riutilizzata)
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_PORT == 465,
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
            'SELECT id FROM users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            connection.end();
            // Non rivelare se l'utente esiste per motivi di sicurezza
            return NextResponse.json({message: 'Se l\'email è registrata, riceverai un link per il reset della password.'}, {status: 200});
        }

        const user = users[0];

        // Genera un token di reset e imposta una scadenza (es. 1 ora)
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetExpires = new Date(Date.now() + 3600000); // 1 ora da adesso

        // Salva il token e la scadenza nel database
        await connection.execute(
            'UPDATE users SET reset_password_token = ?, reset_password_expires = ? WHERE id = ?',
            [resetToken, resetExpires, user.id]
        );

        connection.end();

        // Invia l'email con il link di reset
        const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/reset-password?token=${resetToken}`; // Pagina frontend per il reset

        const mailOptions = {
            from: `"PrezziBenzina.eu" <${process.env.EMAIL_FROM}>`,
            to: email,
            subject: 'Reset della password per PrezziBenzina.eu',
            html: `
                <p>Ciao,</p>
                <p>Hai richiesto un reset della password per il tuo account su PrezziBenzina.eu.</p>
                <p>Clicca sul link qui sotto per resettare la tua password:</p>
                <p><a href="${resetLink}">Reset della Password</a></p>
                <p>Questo link scadrà tra 1 ora.</p>
                <p>Se non hai richiesto un reset della password, puoi ignorare questa email.</p>
                <p>Il team di PrezziBenzina.eu</p>
            `,
        };

        await transporter.sendMail(mailOptions);

        return NextResponse.json({message: 'Se l\'email è registrata, riceverai un link per il reset della password.'}, {status: 200});

    } catch (error) {
        console.error('Errore durante la richiesta di reset password:', error);
        return NextResponse.json({error: 'Errore interno del server.'}, {status: 500});
    }
}