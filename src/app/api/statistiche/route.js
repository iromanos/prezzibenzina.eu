// src/app/api/statistiche/route.js

import {NextResponse} from 'next/server';
import mysql from 'mysql2/promise';

export async function GET(request) {
    const {searchParams} = new URL(request.url);

    const livello_geo = searchParams.get('livello_geo');
    const codice_geo = searchParams.get('codice_geo');
    const desc_carburante = searchParams.get('desc_carburante');
    let startDate = searchParams.get('startDate'); // Usiamo let perché potremmo modificarlo
    const endDate = searchParams.get('endDate');

    if (!livello_geo || !codice_geo || !desc_carburante) {
        return NextResponse.json({error: 'Parametri mancanti: livello_geo, codice_geo e desc_carburante sono obbligatori.'}, {status: 400});
    }

    // Se startDate non è valorizzato, imposta il filtro per gli ultimi 90 giorni
    if (!startDate) {
        const today = new Date();
        const ninetyDaysAgo = new Date(today);
        ninetyDaysAgo.setDate(today.getDate() - 90);
        startDate = ninetyDaysAgo.toISOString().split('T')[0]; // Formato YYYY-MM-DD
    }

    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE,
        });

        let query = 'SELECT data, prezzo_medio, prezzo_min, prezzo_max FROM prezzi_storici WHERE ';
        const params = [];

        const conditions = [
            'livello_geo = ?',
            'codice_geo = ?',
            'desc_carburante = ?'
        ];
        params.push(livello_geo, codice_geo, desc_carburante);

        // startDate è sempre valorizzato a questo punto
        conditions.push('data >= ?');
        params.push(startDate);
        
        if (endDate) {
            conditions.push('data <= ?');
            params.push(endDate);
        }

        query += ' ' + conditions.join(' AND ');
        query += ' ORDER BY data ASC';

        console.log(query);

        const [rows] = await connection.execute(query, params);

        return NextResponse.json(rows);

    } catch (error) {
        console.error('Errore API /api/statistiche:', error);
        return NextResponse.json({error: 'Errore interno del server.'}, {status: 500});
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}