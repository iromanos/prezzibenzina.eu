// src/app/api/subscriptions/unsubscribe/route.js

import {NextResponse} from 'next/server';
import mysql from 'mysql2/promise';
import {generateUnsubscribeToken} from '@/cron/check-price-alerts';

export async function GET(request) {
    const {searchParams} = new URL(request.url);
    const idStr = searchParams.get('id');
    const token = searchParams.get('token');

    if (!idStr || !token) {
        return new NextResponse(renderErrorPage("Parametri di disiscrizione non validi o mancanti."), {
            status: 400,
            headers: {'Content-Type': 'text/html; charset=utf-8'}
        });
    }

    const subscriptionId = parseInt(idStr, 10);
    if (isNaN(subscriptionId)) {
        return new NextResponse(renderErrorPage("ID sottoscrizione non valido."), {
            status: 400,
            headers: {'Content-Type': 'text/html; charset=utf-8'}
        });
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

        // Recupera la sottoscrizione per verificare il proprietario
        const [rows] = await connection.execute(
            "SELECT user_id, fuel_type, geo_level, geo_code, status FROM price_subscriptions WHERE id = ?",
            [subscriptionId]
        );

        if (rows.length === 0) {
            return new NextResponse(renderErrorPage("La sottoscrizione specificata non è stata trovata."), {
                status: 404,
                headers: {'Content-Type': 'text/html; charset=utf-8'}
            });
        }

        const sub = rows[0];

        // Verifica la firma del token per sicurezza
        const expectedToken = generateUnsubscribeToken(subscriptionId, sub.user_id);
        if (token !== expectedToken) {
            return new NextResponse(renderErrorPage("Token di disiscrizione non valido o scaduto."), {
                status: 403,
                headers: {'Content-Type': 'text/html; charset=utf-8'}
            });
        }

        if (sub.status === 'deleted') {
            return new NextResponse(renderSuccessPage(sub.fuel_type, sub.geo_level, sub.geo_code, true), {
                headers: {'Content-Type': 'text/html; charset=utf-8'}
            });
        }

        // Segna come eliminata
        await connection.execute(
            "UPDATE price_subscriptions SET status = 'deleted' WHERE id = ?",
            [subscriptionId]
        );

        return new NextResponse(renderSuccessPage(sub.fuel_type, sub.geo_level, sub.geo_code, false), {
            headers: {'Content-Type': 'text/html; charset=utf-8'}
        });

    } catch (error) {
        console.error("Errore disiscrizione:", error);
        return new NextResponse(renderErrorPage("Si è verificato un errore interno durante la disiscrizione. Riprova più tardi."), {
            status: 500,
            headers: {'Content-Type': 'text/html; charset=utf-8'}
        });
    } finally {
        if (connection) {
            //await connection.end();
        }
    }
}

// Template HTML per la pagina di errore
function renderErrorPage(errorMessage) {
    return `
    <!DOCTYPE html>
    <html lang="it">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>PrezziBenzina.eu - Errore Disiscrizione</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                background-color: #f3f4f6;
                margin: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                color: #1f2937;
            }
            .card {
                background: white;
                padding: 40px;
                border-radius: 16px;
                box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
                max-width: 450px;
                width: 100%;
                text-align: center;
            }
            .icon-wrapper {
                background-color: #fee2e2;
                color: #ef4444;
                width: 64px;
                height: 64px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 24px;
            }
            h1 {
                font-size: 22px;
                margin: 0 0 12px;
                font-weight: 700;
            }
            p {
                font-size: 15px;
                color: #4b5563;
                line-height: 1.5;
                margin: 0 0 28px;
            }
            .btn {
                display: inline-block;
                background-color: #10b981;
                color: white;
                text-decoration: none;
                padding: 12px 24px;
                border-radius: 8px;
                font-weight: 600;
                font-size: 15px;
                transition: background-color 0.2s;
            }
            .btn:hover {
                background-color: #059669;
            }
        </style>
    </head>
    <body>
        <div class="card">
            <div class="icon-wrapper">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" style="width: 32px; height: 32px;">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
            </div>
            <h1>Si è verificato un errore</h1>
            <p>${errorMessage}</p>
            <a href="https://www.prezzibenzina.eu" class="btn">Vai alla Home</a>
        </div>
    </body>
    </html>
    `;
}

// Template HTML per la pagina di successo
function renderSuccessPage(fuelType, geoLevel, geoCode, alreadyDeleted) {
    const message = alreadyDeleted
        ? "La sottoscrizione era già stata annullata in precedenza."
        : "La disiscrizione è avvenuta con successo.";

    return `
    <!DOCTYPE html>
    <html lang="it">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>PrezziBenzina.eu - Disiscrizione</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                background-color: #f3f4f6;
                margin: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                color: #1f2937;
            }
            .card {
                background: white;
                padding: 40px;
                border-radius: 16px;
                box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
                max-width: 450px;
                width: 100%;
                text-align: center;
            }
            .icon-wrapper {
                background-color: #d1fae5;
                color: #10b981;
                width: 64px;
                height: 64px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 24px;
            }
            h1 {
                font-size: 22px;
                margin: 0 0 12px;
                font-weight: 700;
            }
            p {
                font-size: 15px;
                color: #4b5563;
                line-height: 1.5;
                margin: 0 0 28px;
            }
            .details {
                background-color: #f9fafb;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                padding: 12px;
                font-size: 14px;
                margin-bottom: 24px;
                text-align: left;
            }
            .details-item {
                margin: 4px 0;
            }
            .btn {
                display: inline-block;
                background-color: #10b981;
                color: white;
                text-decoration: none;
                padding: 12px 24px;
                border-radius: 8px;
                font-weight: 600;
                font-size: 15px;
                transition: background-color 0.2s;
            }
            .btn:hover {
                background-color: #059669;
            }
        </style>
    </head>
    <body>
        <div class="card">
            <div class="icon-wrapper">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" style="width: 32px; height: 32px;">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
            </div>
            <h1>Disiscrizione completata</h1>
            <p>${message}</p>
            <div class="details">
                <div class="details-item"><strong>Carburante:</strong> ${fuelType}</div>
                <div class="details-item" style="text-transform: capitalize;"><strong>Livello:</strong> ${geoLevel}</div>
                <div class="details-item"><strong>Codice Area:</strong> ${geoCode}</div>
            </div>
            <a href="https://www.prezzibenzina.eu" class="btn">Torna al sito</a>
        </div>
    </body>
    </html>
    `;
}
