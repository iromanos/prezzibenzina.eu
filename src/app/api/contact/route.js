import {NextResponse} from 'next/server';
import nodemailer from 'nodemailer';

// Configurazione Nodemailer (riutilizzata)
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
        const {name, email, subject, message, recaptchaToken} = await request.json();

        // 1. Validazione input base
        if (!name || !email || !subject || !message || !recaptchaToken) {
            return NextResponse.json({error: 'Tutti i campi del form e la verifica reCAPTCHA sono obbligatori.'}, {status: 400});
        }

        // 2. Verifica reCAPTCHA
        const recaptchaSecretKey = process.env.RECAPTCHA_SECRET_KEY;
        const recaptchaVerifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${recaptchaSecretKey}&response=${recaptchaToken}`;

        const recaptchaResponse = await fetch(recaptchaVerifyUrl, {method: 'POST'});
        const recaptchaData = await recaptchaResponse.json();

        if (!recaptchaData.success || recaptchaData.score < 0.5) { // Score threshold, adjust as needed
            console.warn('reCAPTCHA verification failed:', recaptchaData);
            return NextResponse.json({error: 'Verifica reCAPTCHA fallita. Sei un robot?'}, {status: 400});
        }

        // 3. Invio email
        const mailOptions = {
            from: `"Modulo Contatti PrezziBenzina.eu" <${process.env.EMAIL_FROM}>`,
            to: process.env.EMAIL_FROM, // L'email a cui inviare i messaggi
            subject: `[Contatto Sito] ${subject} da ${name}`,
            html: `
                <p><strong>Nome:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Oggetto:</strong> ${subject}</p>
                <p><strong>Messaggio:</strong></p>
                <p>${message}</p>
                <hr>
                <p>Questo messaggio è stato inviato tramite il modulo contatti di PrezziBenzina.eu.</p>
            `,
            replyTo: email, // Permette di rispondere direttamente all'utente
        };

        await transporter.sendMail(mailOptions);

        return NextResponse.json({message: 'Messaggio inviato con successo!'}, {status: 200});

    } catch (error) {
        console.error('Errore durante l\'invio del modulo contatti:', error);
        return NextResponse.json({error: 'Errore interno del server durante l\'invio del messaggio.'}, {status: 500});
    }
}