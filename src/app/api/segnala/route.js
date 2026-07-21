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
        const body = await request.json();
        const {tipo_segnalazione, messaggio, email, recaptchaToken, impianto} = body;
        const isLocal = process.env.NODE_ENV === 'development';

        // 1. Validazione input
        if (!tipo_segnalazione || !messaggio || (!recaptchaToken && !isLocal)) {
            return NextResponse.json(
                {error: 'Dati incompleti: oggetto, messaggio e verifica sono obbligatori.'},
                {status: 400}
            );
        }

        if (!isLocal) {
            // 2. Verifica reCAPTCHA v3
            const secretKey = process.env.RECAPTCHA_SECRET_KEY;
            const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${recaptchaToken}`;

            const recaptchaResponse = await fetch(verifyUrl, {method: 'POST'});
            const recaptchaData = await recaptchaResponse.json();

            // In v3 controlliamo il punteggio (0.0 - 1.0). 0.5 è solitamente una soglia sicura.
            if (!recaptchaData.success || recaptchaData.score < 0.5) {
                return NextResponse.json(
                    {error: 'Verifica anti-spam non superata. Riprova.'},
                    {status: 403}
                );
            }
        }
        // 3. Elaborazione della segnalazione
        // Qui andrebbe la logica per inviare una email (es. tramite Resend/Nodemailer) 
        // o salvare la segnalazione nel database.
        console.log('Segnalazione Ricevuta:', {
            impianto_id: impianto?.id_impianto,
            impianto_nome: impianto?.nome_impianto,
            tipo: tipo_segnalazione,
            testo: messaggio,
            utente: email || 'Anonimo'
        });

        // 3. Invio email
        const mailOptions = {
            from: `"Modulo Contatti PrezziBenzina.eu" <${process.env.EMAIL_FROM}>`,
            to: process.env.EMAIL_FROM, // L'email a cui inviare i messaggi
            subject: `[Segnalazione] ${tipo_segnalazione}${impianto ? ' - Impianto ID: ' + impianto.id_impianto : ''}`,
            html: `
                <h2>Nuova segnalazione ricevuta</h2>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Tipo Segnalazione:</strong> ${tipo_segnalazione}</p>
                ${impianto ? `<p><strong>Impianto:</strong> ${impianto.nome_impianto} (ID: ${impianto.id_impianto})<br>${impianto.indirizzo}, ${impianto.comune}</p>` : ''}
                <p><strong>Messaggio:</strong></p>
                <p>${messaggio}</p>
                <hr>
                <p>Questo messaggio è stato inviato tramite il modulo segnalazioni di PrezziBenzina.eu.</p>
            `,
            replyTo: email || undefined, // Permette di rispondere direttamente all'utente se ha fornito l'email
        };

        await transporter.sendMail(mailOptions);


        // Risposta di successo
        return NextResponse.json({
            message: 'Grazie! La tua segnalazione è stata presa in carico.'
        }, {status: 200});

    } catch (error) {
        console.error('Errore API Segnala:', error);
        return NextResponse.json(
            {error: 'Si è verificato un errore durante l\'invio. Riprova più tardi.'},
            {status: 500}
        );
    }
}