import {NextResponse} from 'next/server';
import {authMiddleware} from '../../auth/middleware';
import {connectToDatabase} from "@/repos/mysql"; // Importa il middleware

async function createSubscriptionHandler(request) {
    try {
        const {fuel_type, geo_level, geo_code, threshold_type, threshold_value} = await request.json();
        const userId = request.user.id; // Ottieni l'ID utente dal middleware

        // Validazione input
        if (!fuel_type || !geo_level || !geo_code || !threshold_type) {
            return NextResponse.json({error: 'Campi obbligatori mancanti.'}, {status: 400});
        }

        if (threshold_type === 'below_price' && (typeof threshold_value !== 'number' || threshold_value <= 0)) {
            return NextResponse.json({error: 'Il valore della soglia deve essere un numero positivo per il tipo "below_price".'}, {status: 400});
        }

        const connection = await connectToDatabase();

        // Inserisci la nuova sottoscrizione
        const [result] = await connection.execute(
            `INSERT INTO price_subscriptions (user_id, fuel_type, geo_level, geo_code, threshold_type, threshold_value)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [userId, fuel_type, geo_level, geo_code, threshold_type, threshold_value]
        );

        //await connection.end();

        if (result.affectedRows === 1) {
            return NextResponse.json({
                message: 'Sottoscrizione creata con successo.',
                id: result.insertId
            }, {status: 201});
        } else {
            return NextResponse.json({error: 'Errore durante la creazione della sottoscrizione.'}, {status: 500});
        }

    } catch (error) {
        console.error('Errore durante la creazione della sottoscrizione:', error);
        return NextResponse.json({error: 'Errore interno del server.'}, {status: 500});
    }
}

export const POST = authMiddleware(createSubscriptionHandler);