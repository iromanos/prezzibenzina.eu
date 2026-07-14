// src/app/api/subscriptions/create/route.js

import {NextResponse} from 'next/server';
import mysql from 'mysql2/promise';
import {getServerSession} from "next-auth/next";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";

export async function POST(req, res) {
    const session = await getServerSession(req, res, authOptions);

    if (!session || !session.user || !session.user.id) {
        return NextResponse.json({error: 'Non autorizzato'}, {status: 401});
    }

    const userId = session.user.id;
    let connection;

    try {
        const body = await req.json();
        const {fuel_type, geo_level, geo_code, threshold_type, threshold_value} = body;

        if (!fuel_type || !geo_level || !geo_code || !threshold_type) {
            return NextResponse.json({error: 'Dati mancanti. Tutti i campi sono obbligatori.'}, {status: 400});
        }
        if (threshold_type === 'below_price' && (threshold_value === undefined || threshold_value === null)) {
            return NextResponse.json({error: 'Il valore di soglia è obbligatorio per il tipo "below_price".'}, {status: 400});
        }

        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE,
        });

        const sql = `
            INSERT INTO price_subscriptions (user_id, fuel_type, geo_level, geo_code, threshold_type, threshold_value)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const params = [userId, fuel_type, geo_level, geo_code, threshold_type, threshold_type === 'below_price' ? threshold_value : null];

        await connection.execute(sql, params);

        return NextResponse.json({message: 'Sottoscrizione creata con successo.'}, {status: 201});

    } catch (error) {
        console.error('Errore API /api/subscriptions/create:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return NextResponse.json({error: 'Una sottoscrizione simile esiste già.'}, {status: 409});
        }
        return NextResponse.json({error: 'Errore interno del server.'}, {status: 500});
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}
