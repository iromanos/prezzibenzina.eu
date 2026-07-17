import {NextResponse} from 'next/server';
import {authMiddleware} from '../../auth/middleware';
import {connectToDatabase} from "@/repos/mysql.jsx"; // Importa il middleware

async function listSubscriptionsHandler(request) {
    try {
        const userId = request.user.id; // Ottieni l'ID utente dal middleware

        const connection = await connectToDatabase();

        // Recupera tutte le sottoscrizioni attive per l'utente
        const [subscriptions] = await connection.execute(
            'SELECT id, fuel_type, geo_level, geo_code, threshold_type, threshold_value, status FROM price_subscriptions WHERE user_id = ? AND status = \'active\'',
            [userId]
        );

        await connection.end();

        return NextResponse.json(subscriptions, {status: 200});

    } catch (error) {
        console.error('Errore durante il recupero delle sottoscrizioni:', error);
        return NextResponse.json({error: 'Errore interno del server.'}, {status: 500});
    }
}

export const GET = authMiddleware(listSubscriptionsHandler);