// src/cron/check-price-alerts.js

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs/promises';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

dotenv.config({path: path.resolve(process.cwd(), '.env')});

const LOG_FILE_PATH = path.resolve(process.cwd(), 'cron_logs/check-price-alerts.log');

// Configurazione Nodemailer
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_PORT === 465,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Funzione per salvare i log su file
async function logToFile(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;
    console.log(logMessage.trim());
    try {
        await fs.appendFile(LOG_FILE_PATH, logMessage, 'utf8');
    } catch (error) {
        console.error(`Errore durante la scrittura nel file di log: ${error.message}`);
    }
}

// Funzione per generare un token di disiscrizione sicuro
export function generateUnsubscribeToken(subscriptionId, userId) {
    const secret = process.env.NEXTAUTH_SECRET || 'fallback-secret-for-unsubscribe';
    return crypto.createHmac('sha256', secret)
        .update(`${subscriptionId}-${userId}`)
        .digest('hex');
}

// Mappatura tipo carburante a ID carburante nel DB
const FUEL_ID_MAPPING = {
    'benzina': 1,
    'gasolio': 2,
    'gpl': 3,
    'metano': 4
};

// Funzione per formattare una data
function formatDate(date) {
    if (!date) return 'N/D';
    const d = new Date(date);
    return d.toLocaleString('it-IT', {timeZone: 'Europe/Rome'});
}

export async function checkPriceAlerts() {
    let connection;
    try {
        await logToFile('--- INIZIO SCRIPT DI CONTROLLO PREZZI E NOTIFICHE ---');
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE,
        });
        await logToFile('Connessione al database stabilita.');

        // Recupera le sottoscrizioni attive che non sono state notificate nelle ultime 24 ore
        const [subscriptions] = await connection.execute(`
            SELECT s.*, u.email, u.name AS user_name
            FROM price_subscriptions s
                     JOIN users u ON s.user_id = u.id
            WHERE s.status = 'active'
              AND (s.last_notified_at IS NULL OR s.last_notified_at <= NOW() - INTERVAL 24 HOUR)
        `);

        await logToFile(`Trovate ${subscriptions.length} sottoscrizioni attive idonee per il controllo.`);

        for (const sub of subscriptions) {
            const {
                id: subId,
                user_id: userId,
                email,
                user_name,
                fuel_type,
                geo_level,
                geo_code,
                threshold_type,
                threshold_value
            } = sub;
            const fuelId = FUEL_ID_MAPPING[fuel_type.toLowerCase()];

            if (!fuelId) {
                await logToFile(`[ERRORE SOTTOSCRIZIONE #${subId}] Tipo carburante non valido: ${fuel_type}`);
                continue;
            }

            // Costruisci la query specifica in base al geo_level
            let query = '';
            let params = [];

            if (geo_level === 'distributore') {
                query = `
                    SELECT p.prezzo, p.dtcomu, i.nome_impianto, i.indirizzo, i.comune, i.provincia
                    FROM prezzi p
                             LEFT JOIN impianti i ON p.id_impianto = i.id_impianto
                    WHERE p.id_impianto = ?
                      AND p.fuel_id = ?
                      AND p.is_self = 1
                      AND p.prezzo > 0.5
                    ORDER BY p.prezzo
                    LIMIT 1
                `;
                params = [geo_code, fuelId];
            } else if (geo_level === 'comune') {
                query = `
                    SELECT p.prezzo, p.dtcomu, i.nome_impianto, i.indirizzo, i.comune, i.provincia
                    FROM prezzi p
                             JOIN impianti i ON p.id_impianto = i.id_impianto
                    WHERE i.comune = ?
                      AND p.fuel_id = ?
                      AND p.is_self = 1
                      AND p.prezzo > 0.5
                    ORDER BY p.prezzo
                    LIMIT 1
                `;
                params = [geo_code, fuelId];
            } else if (geo_level === 'provinciale') {
                query = `
                    SELECT p.prezzo, p.dtcomu, i.nome_impianto, i.indirizzo, i.comune, i.provincia
                    FROM prezzi p
                             JOIN impianti i ON p.id_impianto = i.id_impianto
                    WHERE i.provincia = ?
                      AND p.fuel_id = ?
                      AND p.is_self = 1
                      AND p.prezzo > 0.5
                    ORDER BY p.prezzo
                    LIMIT 1
                `;
                params = [geo_code, fuelId];
            } else if (geo_level === 'regionale') {
                query = `
                    SELECT p.prezzo, p.dtcomu, i.nome_impianto, i.indirizzo, i.comune, i.provincia
                    FROM prezzi p
                             JOIN impianti i ON p.id_impianto = i.id_impianto
                             JOIN provincie prov ON i.provincia = prov.id
                    WHERE prov.regione = ?
                      AND p.fuel_id = ?
                      AND p.is_self = 1
                      AND p.prezzo > 0.5
                    ORDER BY p.prezzo
                    LIMIT 1
                `;
                params = [geo_code, fuelId];
            } else if (geo_level === 'nazionale') {
                query = `
                    SELECT p.prezzo, p.dtcomu, i.nome_impianto, i.indirizzo, i.comune, i.provincia
                    FROM prezzi p
                             JOIN impianti i ON p.id_impianto = i.id_impianto
                    WHERE p.fuel_id = ?
                      AND p.is_self = 1
                      AND p.prezzo > 0.5
                    ORDER BY p.prezzo
                    LIMIT 1
                `;
                params = [fuelId];
            } else {
                await logToFile(`[ERRORE SOTTOSCRIZIONE #${subId}] Livello geo non valido: ${geo_level}`);
                continue;
            }

            const [priceRows] = await connection.execute(query, params);

            if (priceRows.length === 0) {
                await logToFile(`[INFO SOTTOSCRIZIONE #${subId}] Nessun prezzo trovato per ${fuel_type} a livello ${geo_level} con codice ${geo_code}.`);
                continue;
            }

            const currentCheapest = priceRows[0];
            const currentPrice = Number(currentCheapest.prezzo);
            let shouldNotify = false;

            if (threshold_type === 'cheapest_in_area') {
                shouldNotify = true; // Notifica sempre se c'è un prezzo minimo valido
            } else if (threshold_type === 'below_price') {
                const limitValue = Number(threshold_value);
                if (currentPrice <= limitValue) {
                    shouldNotify = true;
                }
            }

            if (shouldNotify) {
                await logToFile(`[ALERT TRIGGERATO #${subId}] Utente ${email}: Prezzo attuale ${currentPrice} soddisfa la soglia (${threshold_type} / ${threshold_value || 'N/A'}).`);

                // Invia l'email e logga nel database
                const success = await sendAlertEmail({
                    email,
                    userName: user_name,
                    subId,
                    userId,
                    fuelType: fuel_type,
                    geoLevel: geo_level,
                    geoCode: geo_code,
                    price: currentPrice,
                    stationName: currentCheapest.nome_impianto || 'Distributore senza nome',
                    stationAddress: `${currentCheapest.indirizzo || ''}, ${currentCheapest.comune || ''} (${currentCheapest.provincia || ''})`,
                    updateTime: currentCheapest.dtcomu
                });

                if (success) {
                    // Aggiorna last_notified_at
                    await connection.execute(
                        'UPDATE price_subscriptions SET last_notified_at = NOW() WHERE id = ?',
                        [subId]
                    );

                    // Logga come inviata
                    await connection.execute(`
                        INSERT INTO sent_notifications (subscription_id, user_id, fuel_type, geo_level, geo_code,
                                                        triggered_price, status)
                        VALUES (?, ?, ?, ?, ?, ?, 'sent')
                    `, [subId, userId, fuel_type, geo_level, geo_code, currentPrice]);

                    await logToFile(`[SUCCESS #${subId}] Notifica registrata nel database.`);
                } else {
                    // Logga come fallita
                    await connection.execute(`
                        INSERT INTO sent_notifications (subscription_id, user_id, fuel_type, geo_level, geo_code,
                                                        triggered_price, status)
                        VALUES (?, ?, ?, ?, ?, ?, 'failed')
                    `, [subId, userId, fuel_type, geo_level, geo_code, currentPrice]);

                    await logToFile(`[FAIL #${subId}] Notifica registrata come fallita.`);
                }
            }
        }

        await logToFile('--- COMPLETATO CONTROLLO PREZZI E NOTIFICHE ---');
    } catch (error) {
        await logToFile(`--- ERRORE FATALE SCRIPT CONTROLLO NOTIFICHE: ${error.message} ---`);
        console.error(error);
    } finally {
        if (connection) {
            await connection.end();
            await logToFile('Connessione al database chiusa.');
        }
    }
}

// Funzione per l'invio dell'email con template HTML premium
async function sendAlertEmail({
                                  email,
                                  userName,
                                  subId,
                                  userId,
                                  fuelType,
                                  geoLevel,
                                  geoCode,
                                  price,
                                  stationName,
                                  stationAddress,
                                  updateTime
                              }) {
    if (process.env.NODE_ENV === 'test') {
        await logToFile(`[TEST MODE] Email invio email reale a ${email} per la sottoscrizione #${subId}.`);
    }

    const unsubToken = generateUnsubscribeToken(subId, userId);
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.prezzibenzina.eu';
    const unsubscribeLink = `${baseUrl}/api/subscriptions/unsubscribe?id=${subId}&token=${unsubToken}`;
    const dashboardLink = `${baseUrl}/notifiche`;

    const htmlContent = `
    <!DOCTYPE html>
    <html lang="it">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>PrezziBenzina.eu - Avviso Prezzo</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                background-color: #f8f9fa; /* body-bg da custom.scss */
                margin: 0;
                padding: 0;
                -webkit-font-smoothing: antialiased;
                color: #212529; /* body-color da custom.scss */
            }
            .container {
                max-width: 600px;
                margin: 40px auto;
                background-color: #ffffff;
                border-radius: 12px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
                overflow: hidden;
            }
            .header {
                background: linear-gradient(135deg, #0F5398 0%, #1e6bb8 100%); /* $primary e #1e6bb8 da custom.scss */
                padding: 30px 20px;
                text-align: center;
                color: #ffffff;
            }
            .header img {
                max-width: 180px; /* Dimensione logo */
                height: auto;
                margin-bottom: 10px;
            }
            .header h1 {
                margin: 0;
                font-size: 24px;
                font-weight: 700;
                letter-spacing: -0.5px;
            }
            .header p {
                margin: 5px 0 0;
                font-size: 14px;
                opacity: 0.9;
            }
            .content {
                padding: 30px 20px;
                color: #212529; /* body-color da custom.scss */
            }
            .greeting {
                font-size: 16px;
                font-weight: 600;
                margin-bottom: 20px;
            }
            .price-card {
                background-color: #e0f2f7; /* Light blue derivato dal primario */
                border: 1px solid #0F5398; /* $primary per il bordo */
                border-radius: 8px;
                padding: 20px;
                text-align: center;
                margin-bottom: 25px;
            }
            .price-val {
                font-size: 36px;
                font-weight: 800;
                color: #0F5398; /* $primary per il prezzo */
                margin: 10px 0;
            }
            .details-table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 25px;
            }
            .details-table td {
                padding: 10px 0;
                border-bottom: 1px solid #f3f4f6;
                font-size: 14px;
            }
            .details-label {
                font-weight: 600;
                color: #4b5563;
                width: 35%;
            }
            .details-value {
                color: #1f2937;
            }
            .btn {
                display: inline-block;
                background-color: #0F5398; /* $primary per il bottone */
                color: #ffffff !important;
                text-decoration: none;
                padding: 12px 24px;
                border-radius: 6px;
                font-weight: 600;
                font-size: 15px;
                text-align: center;
                transition: background-color 0.2s;
            }
            .btn:hover {
                background-color: #1e6bb8; /* Darker primary per hover */
            }
            .footer {
                background-color: #f9fafb;
                padding: 20px;
                text-align: center;
                font-size: 12px;
                color: #9ca3af;
                border-top: 1px solid #f3f4f6;
            }
            .footer a {
                color: #0F5398; /* $primary per i link nel footer */
                text-decoration: none;
            }
            .footer a:hover {
                text-decoration: underline;
            }
            .unsubscribe-section {
                margin-top: 15px;
                border-top: 1px dashed #e5e7eb;
                padding-top: 15px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <img src="${baseUrl}/assets/logo-transparent.png" alt="PrezziBenzina.eu Logo" style="max-width: 180px; height: auto; margin-bottom: 10px;">
                <h1>Avviso Prezzo Carburante</h1>
                <p>Notifiche in Tempo Reale da PrezziBenzina.eu</p>
            </div>
            <div class="content">
                <div class="greeting">Ciao ${userName || 'Automobilista'},</div>
                <p>Ti informiamo che abbiamo trovato una tariffa conveniente per la tua sottoscrizione di notifica carburante.</p>
                
                <div class="price-card">
                    <div style="font-size: 14px; color: #0F5398; font-weight: 600; text-transform: uppercase;">Miglior prezzo trovato</div>
                    <div class="price-val">${price.toFixed(3)} &euro;/L</div>
                    <div style="font-size: 13px; color: #0F5398;">(${fuelType} - Self Service)</div>
                </div>

                <table class="details-table">
                    <tr>
                        <td class="details-label">Impianto:</td>
                        <td class="details-value"><strong>${stationName}</strong></td>
                    </tr>
                    <tr>
                        <td class="details-label">Indirizzo:</td>
                        <td class="details-value">${stationAddress}</td>
                    </tr>
                    <tr>
                        <td class="details-label">Area geografica:</td>
                        <td class="details-value" style="text-transform: capitalize;">${geoLevel} (${geoCode})</td>
                    </tr>
                    <tr>
                        <td class="details-label">Ultimo aggiornamento:</td>
                        <td class="details-value">${formatDate(updateTime)}</td>
                    </tr>
                </table>

                <div style="text-align: center; margin-top: 30px;">
                    <a href="${dashboardLink}" class="btn">Gestisci le tue notifiche</a>
                </div>
            </div>
            <div class="footer">
                <p>Questa email ti &egrave; stata inviata in base alle tue preferenze registrate su PrezziBenzina.eu.</p>
                <div class="unsubscribe-section">
                    Se desideri non ricevere più questo avviso, puoi <a href="${unsubscribeLink}">disiscriverti con un click</a>.<br>
                    Oppure modifica tutti i tuoi avvisi direttamente dall'area <a href="${dashboardLink}">Le mie notifiche</a>.
                </div>
            </div>
        </div>
    </body>
    </html>
    `;

    try {
        await transporter.sendMail({
            from: `"PrezziBenzina.eu" <${process.env.EMAIL_FROM}>`,
            to: email,
            subject: `🔔 PrezziBenzina.eu - Avviso Prezzo ${fuelType} a ${geoCode}: ${price.toFixed(3)} €/L`,
            html: htmlContent,
        });
        await logToFile(`[EMAIL SUCCESS] Email inviata con successo a ${email} per la sottoscrizione #${subId}`);
        return true;
    } catch (error) {
        await logToFile(`[EMAIL ERROR] Errore durante l'invio dell'email a ${email}: ${error.message}`);
        return false;
    }
}

if (process.argv[1] && process.argv[1].includes('check-price-alerts.js')) {
    fs.mkdir(path.dirname(LOG_FILE_PATH), {recursive: true})
        .then(() => checkPriceAlerts())
        .catch(error => console.error(`Errore iniziale nella creazione della directory di log o nell'esecuzione: ${error.message}`));
}