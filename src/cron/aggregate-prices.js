// src/cron/aggregate-prices.js

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({path: path.resolve(process.cwd(), '.env')});

function getCanonicalFuelName(desc) {
    const lowerDesc = String(desc).toLowerCase();
    if (lowerDesc.includes('benzina')) return 'Benzina';
    if (lowerDesc.includes('gasolio')) return 'Gasolio';
    if (lowerDesc.includes('gpl')) return 'GPL';
    if (lowerDesc.includes('metano')) return 'Metano';
    return null;
}

export async function aggregatePrices() {
    let connection;
    try {
        console.log('Inizio aggregazione prezzi...');

        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE,
        });
        console.log('Connessione al database stabilita.');

        const [rows] = await connection.execute(`
            SELECT
                p.id_impianto,
                p.desc_carburante,
                p.prezzo,
                i.provincia,
                prov.regione
            FROM prezzi p
            JOIN impianti i ON p.id_impianto = i.id_impianto
            JOIN provincie prov ON i.provincia = prov.id
            WHERE
                p.dtcomu >= NOW() - INTERVAL 48 HOUR
                AND p.is_self = 1
                AND p.prezzo > 0.5
        `);

        if (rows.length === 0) {
            console.log('Nessun prezzo recente da aggregare. Uscita.');
            return;
        }
        console.log(`Trovati ${rows.length} prezzi recenti da elaborare.`);

        const today = new Date().toISOString().slice(0, 10);
        const aggregations = {};
        const recordsToInsert = [];

        for (const row of rows) {
            const fuelName = getCanonicalFuelName(row.desc_carburante);
            if (!fuelName || !row.id_impianto) continue;

            recordsToInsert.push([
                today,
                fuelName,
                'distributore',
                row.id_impianto.toString(),
                row.prezzo,
                row.prezzo,
                row.prezzo,
            ]);

            const geoLevels = {
                provinciale: row.provincia,
                regionale: row.regione,
                nazionale: 'IT',
            };

            for (const [level, code] of Object.entries(geoLevels)) {
                if (!code) continue;
                const key = `${level}_${code}_${fuelName}`;
                if (!aggregations[key]) {
                    aggregations[key] = {sum: 0, count: 0, min: Infinity, max: -Infinity};
                }
                const stats = aggregations[key];
                stats.sum += row.prezzo;
                stats.count++;
                if (row.prezzo < stats.min) stats.min = row.prezzo;
                if (row.prezzo > stats.max) stats.max = row.prezzo;
            }
        }

        for (const key in aggregations) {
            const [level, code, fuelName] = key.split('_');
            const stats = aggregations[key];
            recordsToInsert.push([
                today,
                fuelName,
                level,
                code,
                stats.sum / stats.count,
                stats.min,
                stats.max,
            ]);
        }

        console.log(`Preparati ${recordsToInsert.length} record da inserire in 'prezzi_storici'.`);

        if (recordsToInsert.length > 0) {
            await connection.beginTransaction();
            try {
                await connection.execute('DELETE FROM prezzi_storici WHERE data = ?', [today]);

                const sql = 'INSERT INTO prezzi_storici (data, desc_carburante, livello_geo, codice_geo, prezzo_medio, prezzo_min, prezzo_max) VALUES ? ON DUPLICATE KEY UPDATE prezzo_medio=VALUES(prezzo_medio), prezzo_min=VALUES(prezzo_min), prezzo_max=VALUES(prezzo_max)';
                await connection.query(sql, [recordsToInsert]);

                await connection.commit();
                console.log(`Inseriti con successo ${recordsToInsert.length} record.`);
            } catch (err) {
                await connection.rollback();
                throw err;
            }
        }
    } catch (error) {
        console.error("Errore fatale durante l'aggregazione:", error);
    } finally {
        if (connection) await connection.end();
    }
}

if (process.argv[1] && process.argv[1].includes('aggregate-prices.js')) {
    aggregatePrices();
}
