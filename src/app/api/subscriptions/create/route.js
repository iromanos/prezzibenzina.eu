import {NextResponse} from 'next/server';
import mysql from 'mysql2/promise';
import jwt from 'jsonwebtoken';

// Middleware per verificare il token JWT
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

export async function POST(request) {
    const authResult = await verifyToken(request);
    if (authResult.error) {
        return NextResponse.json({error: authResult.error}, {status: authResult.status});
    }
    const userId = authResult.userId;

    try {
        const {fuel_type, geo_level, geo_code, threshold_type, threshold_value} = await request.json();

        // Validazione input
        if (!fuel_type || !geo_level || !geo_code || !threshold_type) {
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

        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE,
        });

        // Inserisci la nuova sottoscrizione
        const [result] = await connection.execute(
            'INSERT INTO price_subscriptions (user_id, fuel_type, geo_level, geo_code, threshold_type, threshold_value) VALUES (?, ?, ?, ?, ?, ?)',
            [userId, fuel_type, geo_level, geo_code, threshold_type, threshold_value]
        );

        await connection.end();

        if (result.affectedRows === 1) {
            return NextResponse.json({
                message: 'Sottoscrizione creata con successo.',
                subscriptionId: result.insertId
            }, {status: 201});
        } else {
            return NextResponse.json({error: 'Errore durante la creazione della sottoscrizione.'}, {status: 500});
        }

    } catch (error) {
        console.error('Errore durante la creazione della sottoscrizione:', error);
        return NextResponse.json({error: 'Errore interno del server.'}, {status: 500});
    }
}