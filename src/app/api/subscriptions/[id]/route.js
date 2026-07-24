import {NextResponse} from 'next/server';
import mysql from 'mysql2/promise';
import {authMiddleware} from '../../auth/middleware';
import {connectToDatabase} from "@/repos/mysql"; // Importa il middleware

// Funzione per gestire la modifica di una sottoscrizione (PUT)
async function updateSubscriptionHandler(request, {params}) {
    try {
        const subscriptionId = (await params).id;
        const userId = request.user.id; // Ottieni l'ID utente dal middleware
        const {fuel_type, geo_level, geo_code, threshold_type, threshold_value, status} = await request.json();

        // Validazione input
        if (!fuel_type || !geo_level || !geo_code || !threshold_type || !status) {
            return NextResponse.json({error: 'Campi obbligatori mancanti.'}, {status: 400});
        }

        if (threshold_type === 'below_price' && (typeof threshold_value !== 'number' || threshold_value <= 0)) {
            return NextResponse.json({error: 'Il valore della soglia deve essere un numero positivo per il tipo "below_price".'}, {status: 400});
        }

        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE,
        });

        // Verifica che la sottoscrizione appartenga all'utente autenticato
        const [existingSubs] = await connection.execute(
            'SELECT id FROM price_subscriptions WHERE id = ? AND user_id = ?',
            [subscriptionId, userId]
        );

        if (existingSubs.length === 0) {
            //await connection.end();
            return NextResponse.json({error: 'Sottoscrizione non trovata o non autorizzata.'}, {status: 404});
        }

        // Aggiorna la sottoscrizione
        const [result] = await connection.execute(
            `UPDATE price_subscriptions
             SET fuel_type = ?,
                 geo_level = ?,
                 geo_code = ?,
                 threshold_type = ?,
                 threshold_value = ?,
                 status = ?,
                 updated_at = NOW()
             WHERE id = ?
               AND user_id = ?`,
            [fuel_type, geo_level, geo_code, threshold_type, threshold_value, status, subscriptionId, userId]
        );

        //await connection.end();

        if (result.affectedRows === 1) {
            return NextResponse.json({message: 'Sottoscrizione aggiornata con successo.'}, {status: 200});
        } else {
            return NextResponse.json({error: 'Errore durante l\'aggiornamento della sottoscrizione.'}, {status: 500});
        }

    } catch (error) {
        console.error('Errore durante l\'aggiornamento della sottoscrizione:', error);
        return NextResponse.json({error: 'Errore interno del server.'}, {status: 500});
    }
}

// Funzione per gestire l'eliminazione di una sottoscrizione (DELETE)
async function deleteSubscriptionHandler(request, {params}) {
    try {
        const subscriptionId = (await params).id;
        const userId = request.user.id; // Ottieni l'ID utente dal middleware

        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE,
        });

        // Verifica che la sottoscrizione appartenga all'utente autenticato
        const [existingSubs] = await connection.execute(
            'SELECT id FROM price_subscriptions WHERE id = ? AND user_id = ?',
            [subscriptionId, userId]
        );

        if (existingSubs.length === 0) {
            //await connection.end();
            return NextResponse.json({error: 'Sottoscrizione non trovata o non autorizzata.'}, {status: 404});
        }

        // Elimina la sottoscrizione
        const [result] = await connection.execute(
            'DELETE FROM price_subscriptions WHERE id = ? AND user_id = ?',
            [subscriptionId, userId]
        );

        //await connection.end();

        if (result.affectedRows === 1) {
            return NextResponse.json({message: 'Sottoscrizione eliminata con successo.'}, {status: 200});
        } else {
            return NextResponse.json({error: 'Errore durante l\'eliminazione della sottoscrizione.'}, {status: 500});
        }

    } catch (error) {
        console.error('Errore durante l\'eliminazione della sottoscrizione:', error);
        return NextResponse.json({error: 'Errore interno del server.'}, {status: 500});
    }
}

async function getSubscriptionsHandler(request, {params}) {
    try {

        const _params = await params;

        const subscriptionId = _params.id;

        console.log(_params);

        const userId = request.user.id; // Ottieni l'ID utente dal middleware

        const connection = await connectToDatabase();

        const [existingSubs] = await connection.execute(
            'SELECT * FROM price_subscriptions WHERE id = ? AND user_id = ?',
            [subscriptionId, userId]
        );

        //await connection.end();

        if (existingSubs.length === 0) {
            return NextResponse.json({error: 'Sottoscrizione non trovata o non autorizzata.'}, {status: 404})
        }

        return NextResponse.json(existingSubs[0], {status: 200});

    } catch (error) {
        console.error('Errore durante l\'eliminazione della sottoscrizione:', error);
        return NextResponse.json({error: 'Errore interno del server.'}, {status: 500});
    }
}

export const PUT = authMiddleware(updateSubscriptionHandler);
export const DELETE = authMiddleware(deleteSubscriptionHandler);
export const GET = authMiddleware(getSubscriptionsHandler);
