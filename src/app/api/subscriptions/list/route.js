// src/app/api/subscriptions/list/route.js

import {NextResponse} from 'next/server';
import mysql from 'mysql2/promise';
import {getServerSession} from "next-auth/next";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";

export async function GET(request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
        return NextResponse.json({error: 'Non autorizzato'}, {status: 401});
    }

    const userId = session.user.id;
    let connection;

    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE,
        });

        const [rows] = await connection.execute(
            "SELECT * FROM price_subscriptions WHERE user_id = ? AND status != 'deleted' ORDER BY created_at DESC",
            [userId]
        );

        return NextResponse.json(rows);

    } catch (error) {
        console.error('Errore API /api/subscriptions/list:', error);
        return NextResponse.json({error: 'Errore interno del server.'}, {status: 500});
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}
