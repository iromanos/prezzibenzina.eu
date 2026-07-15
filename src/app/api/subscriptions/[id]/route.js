import {NextResponse} from 'next/server';
import mysql from 'mysql2/promise';
import jwt from 'jsonwebtoken';

// Middleware per verificare il token JWT (riutilizzato)
async function verifyToken(request) {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return {error: 'Token di autenticazione mancante o non valido.', status: 401};
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return {userId: decoded.userId};
    } catch (error) {
        return {error: 'Token di autenticazione non valido o scaduto.', status: 401};
    }
}

export async function PUT(request, {params}) {
    const authResult = await verifyToken(request);
    if (authResult.error) {
        return NextResponse.json({error: authResult.error}, {status: authResult.status});
    }
    const userId = authResult.userId;
    const subscriptionId = params.id;

    try {
        const {fuel_type, geo_level, geo_code, threshold_type, threshold_value, status} = await request.json();

        // Validazione input
        if (!fuel_type || !geo_level || !geo_code || !threshold_type || !status) {
            return NextResponse.json({error: 'Campi obbligatori mancanti.'}, {status: 400});
        }

        const validFuelTypes = ['Benzina', 'Gasolio', 'GPL', 'Metano'];
        if (!validFuelTypes.includes(fuel_type)) {
            return NextResponse.json({error: 'Tipo di carburante non valido.'}, {status: 400});
        }

        const validGeoLevels = ['nazionale', 'regionale', 'provinciale', 'comune'];
        if (!validGeoLevels.includes(geo_level)) {
            return NextResponse.json({error: 'Livello geografico non valido.'}, {status: 400});
        }

        const validThresholdTypes = ['cheapest_in_area', 'below_price'];
        if (!validThresholdTypes.includes(threshold_type)) {
            return NextResponse.json({error: 'Tipo di soglia non valido.'}, {status: 400});
        }

        if (threshold_type === 'below_price' && (typeof threshold_value !== 'number' || threshold_value <= 0)) {
            return NextResponse.json({error: 'Valore soglia non valido per il tipo "below_price".'}, {status: 400});
        }

        const validStatus = ['active', 'paused', 'deleted'];
        if (!validStatus.includes(status)) {
            return NextResponse.json({error: 'Stato non valido.'}, {status: 400});
        }

        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE,
        });

        // Verifica che la sottoscrizione appartenga all'utente
        const [existingSubs] = await connection.execute(
            'SELECT id FROM price_subscriptions WHERE id = ? AND user_id = ?',
            [subscriptionId, userId]
        );

        if (existingSubs.length === 0) {
            await connection.end();
            return NextResponse.json({error: 'Sottoscrizione non trovata o non autorizzata.'}, {status: 404});
        }

        // Aggiorna la sottoscrizione
        const [result] = await connection.execute(
            'UPDATE price_subscriptions SET fuel_type = ?, geo_level = ?, geo_code = ?, threshold_type = ?, threshold_value = ?, status = ?, updated_at = NOW() WHERE id = ?',
            [fuel_type, geo_level, geo_code, threshold_type, threshold_value, status, subscriptionId]
        );

        await connection.end();

        if (result.affectedRows === 1) {
            return NextResponse.json({message: 'Sottoscrizione aggiornata con successo.'}, {status: 200});
        } else {
            return NextResponse.json({error: 'Nessuna modifica apportata o sottoscrizione non trovata.'}, {status: 404});
        }

    } catch (error) {
        console.error('Errore durante l\'aggiornamento della sottoscrizione:', error);
        return NextResponse.json({error: 'Errore interno del server.'}, {status: 500});
    }
}

export async function DELETE(request, {params}) {
    const authResult = await verifyToken(request);
    if (authResult.error) {
        return NextResponse.json({error: authResult.error}, {status: authResult.status});
    }
    const userId = authResult.userId;
    const subscriptionId = params.id;

    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE,
        });

        // Verifica che la sottoscrizione appartenga all'utente
        const [existingSubs] = await connection.execute(
            'SELECT id FROM price_subscriptions WHERE id = ? AND user_id = ?',
            [subscriptionId, userId]
        );

        if (existingSubs.length === 0) {
            await connection.end();
            return NextResponse.json({error: 'Sottoscrizione non trovata o non autorizzata.'}, {status: 404});
        }

        // Elimina la sottoscrizione
        const [result] = await connection.execute(
            'DELETE FROM price_subscriptions WHERE id = ? AND user_id = ?',
            [subscriptionId, userId]
        );

        await connection.end();

        if (result.affectedRows === 1) {
            return NextResponse.json({message: 'Sottoscrizione eliminata con successo.'}, {status: 200});
        } else {
            return NextResponse.json({error: 'Sottoscrizione non trovata o non eliminata.'}, {status: 404});
        }

    } catch (error) {
        console.error('Errore durante l\'eliminazione della sottoscrizione:', error);
        return NextResponse.json({error: 'Errore interno del server.'}, {status: 500});
    }
}