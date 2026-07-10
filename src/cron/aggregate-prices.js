// src/cron/aggregate-prices.js

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';

// Carica le variabili d'ambiente dal file .env nella root del progetto
dotenv.config({path: path.resolve(process.cwd(), '.env')});

/**
 * Questo script aggrega i prezzi dei carburanti su base giornaliera.
 */
async function aggregatePrices() {
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

        // Query aggiornata con i JOIN corretti come da schema fornito
        const [rows] = await connection.execute(`
            SELECT p.id_impianto,
                   p.fuel_id,
                   p.prezzo,
                   i.provincia,
                   prov.regione -- Corretto: 'regione' viene dalla tabella 'provincie'
            FROM prezzi p
                     JOIN impianti i ON p.id_impianto = i.id_impianto -- Corretto: join su id_impianto
                     JOIN provincie prov ON i.provincia = prov.id -- Aggiunto: join per ottenere la regione
            WHERE p.dtcomu >= NOW() - INTERVAL 48 HOUR
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
            if (!row.fuel_id || !row.id_impianto) continue; // Salta righe con dati incompleti
            recordsToInsert.push([
                today,
                row.fuel_id,
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
                const key = `${level}_${code}_${row.fuel_id}`;
                if (!aggregations[key]) {
                    aggregations[key] = {
                        sum: 0,
                        count: 0,
                        min: Infinity,
                        max: -Infinity,
                    };
                }
                const stats = aggregations[key];
                stats.sum += row.prezzo;
                stats.count++;
                if (row.prezzo < stats.min) stats.min = row.prezzo;
                if (row.prezzo > stats.max) stats.max = row.prezzo;
            }
        }

        for (const key in aggregations) {
            const [level, code, fuelId] = key.split('_');
            const stats = aggregations[key];
            recordsToInsert.push([
                today,
                parseInt(fuelId, 10),
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
                console.log(`Cancellati i record esistenti per la data ${today}.`);

                const sql = `
                    INSERT INTO prezzi_storici (data, id_carburante, livello_geo, codice_geo, prezzo_medio, prezzo_min,
                                                prezzo_max)
                    VALUES ?
                `;
                await connection.query(sql, [recordsToInsert]);

                await connection.commit();
                console.log(`Inseriti con successo ${recordsToInsert.length} record.`);
            } catch (err) {
                await connection.rollback();
                console.error('Errore durante la transazione, rollback eseguito.', err);
                throw err;
            }
        }

        console.log('Aggregazione completata con successo.');
    } catch (error) {
        console.error("Errore fatale durante l'aggregazione:", error);
    } finally {
        if (connection) {
            await connection.end();
            console.log('Connessione al database chiusa.');
        }
    }
}

aggregatePrices();
