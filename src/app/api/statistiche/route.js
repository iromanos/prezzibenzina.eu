// src/app/api/statistiche/route.js

import {NextResponse} from 'next/server';
import mysql from 'mysql2/promise';

/**
 * API Endpoint per recuperare i dati storici dei prezzi.
 *
 * Query Params supportati:
 * - livello_geo: 'nazionale', 'regionale', 'provinciale', 'distributore' (obbligatorio)
 * - codice_geo: 'IT', 'Lombardia', 'MI', '101' (obbligatorio)
 * - id_carburante: ID numerico del carburante (obbligatorio)
 * - startDate: Data di inizio (opzionale, formato YYYY-MM-DD)
 * - endDate: Data di fine (opzionale, formato YYYY-MM-DD)
 */
export async function GET(request) {
    const {searchParams} = new URL(request.url);

    const livello_geo = searchParams.get('livello_geo');
    const codice_geo = searchParams.get('codice_geo');
    const id_carburante = searchParams.get('id_carburante');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!livello_geo || !codice_geo || !id_carburante) {
        return NextResponse.json({error: 'Parametri mancanti: livello_geo, codice_geo e id_carburante sono obbligatori.'}, {status: 400});
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

        // Costruzione dinamica e sicura della query
        let query = 'SELECT data, prezzo_medio, prezzo_min, prezzo_max FROM prezzi_storici WHERE ';
        const params = [];

        const conditions = [
            'livello_geo = ?',
            'codice_geo = ?',
            'id_carburante = ?'
        ];
        params.push(livello_geo, codice_geo, id_carburante);

        if (startDate) {
            conditions.push('data >= ?');
            params.push(startDate);
        }
        if (endDate) {
            conditions.push('data <= ?');
            params.push(endDate);
        }

        query += ' ' + conditions.join(' AND ');
        query += ' ORDER BY data ASC'; // Ordina i risultati per data, essenziale per i grafici

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
