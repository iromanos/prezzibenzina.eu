// src/app/api/subscriptions/[id]/route.js

import {NextResponse} from 'next/server';
import mysql from 'mysql2/promise';
import {getServerSession} from "next-auth/next";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";

async function connectAndVerifyOwner(subscriptionId, userId) {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
    });

    const [rows] = await connection.execute(
        "SELECT user_id FROM price_subscriptions WHERE id = ?",
        [subscriptionId]
    );

    if (rows.length === 0) {
        await connection.end();
        return {connection: null, error: 'Sottoscrizione non trovata.', status: 404};
    }

    if (rows[0].user_id !== userId) {
        await connection.end();
        return {connection: null, error: 'Non autorizzato.', status: 403};
    }

    return {connection, error: null, status: 200};
}

export async function PUT(req, {params}) {
    const session = await getServerSession(req, null, authOptions); // res è null in App Router
    const subscriptionId = params.id;

    if (!session || !session.user || !session.user.id) {
        return NextResponse.json({error: 'Non autorizzato'}, {status: 401});
    }

    const userId = session.user.id;
    let connection;

    try {
        const verification = await connectAndVerifyOwner(subscriptionId, userId);
        if (verification.error) {
            return NextResponse.json({error: verification.error}, {status: verification.status});
        }
        connection = verification.connection;

        const body = await req.json();
        const {status} = body;

        if (!status || !['active', 'paused'].includes(status)) {
            return NextResponse.json({error: 'Valore di stato non valido.'}, {status: 400});
        }

        await connection.execute(
            "UPDATE price_subscriptions SET status = ? WHERE id = ?",
            [status, subscriptionId]
        );

        return NextResponse.json({message: 'Sottoscrizione aggiornata con successo.'});

    } catch (error) {
        console.error(`Errore API PUT /api/subscriptions/${subscriptionId}:`, error);
        return NextResponse.json({error: 'Errore interno del server.'}, {status: 500});
    } finally {
        if (connection) await connection.end();
    }
}

export async function DELETE(req, {params}) {
    const session = await getServerSession(req, null, authOptions);
    const subscriptionId = params.id;

    if (!session || !session.user || !session.user.id) {
        return NextResponse.json({error: 'Non autorizzato'}, {status: 401});
    }

    const userId = session.user.id;
    let connection;

    try {
        const verification = await connectAndVerifyOwner(subscriptionId, userId);
        if (verification.error) {
            return NextResponse.json({error: verification.error}, {status: verification.status});
        }
        connection = verification.connection;

        await connection.execute(
            "UPDATE price_subscriptions SET status = 'deleted' WHERE id = ?",
            [subscriptionId]
        );

        return NextResponse.json({message: 'Sottoscrizione eliminata con successo.'});

    } catch (error) {
        console.error(`Errore API DELETE /api/subscriptions/${subscriptionId}:`, error);
        return NextResponse.json({error: 'Errore interno del server.'}, {status: 500});
    } finally {
        if (connection) await connection.end();
    }
}
