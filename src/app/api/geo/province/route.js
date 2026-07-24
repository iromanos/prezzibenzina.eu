// src/app/api/geo/province/route.js

import {NextResponse} from 'next/server';
import mysql from 'mysql2/promise';

export async function GET() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE,
        });

        // La tabella 'provincie' ha 'id', 'description' (come nome) e 'regione'
        const [rows] = await connection.execute('SELECT id, description as name, regione FROM provincie ORDER BY name ASC');

        return NextResponse.json(rows);

    } catch (error) {
        console.error('Errore API /api/geo/province:', error);
        return NextResponse.json({error: 'Errore interno del server.'}, {status: 500});
    } finally {
        if (connection) {
            //await connection.end();
        }
    }
}
