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

        const today = new Date().toISOString().slice(0, 10);

        await connection.beginTransaction();
        console.log('Transazione avviata.');

        // --- FASE 1: Importa dati a livello 'distributore' ---
        console.log('Fase 1: Inizio importazione dati a livello distributore...');
        await connection.execute('DELETE FROM prezzi_storici WHERE data = ?', [today]);
        console.log(`  - Record esistenti per la data ${today} cancellati.`);

        const [prezziRecenti] = await connection.execute(`
            SELECT p.id_impianto, p.desc_carburante, p.prezzo
            FROM prezzi p
            WHERE p.dtcomu >= NOW() - INTERVAL 48 HOUR
              AND p.is_self = 1
              AND p.prezzo > 0.5
        `);

        if (prezziRecenti.length === 0) {
            console.log('Nessun prezzo recente trovato. Rollback e uscita.');
            await connection.rollback();
            return;
        }

        const distributoreRecords = prezziRecenti.map(row => {
            const fuelName = getCanonicalFuelName(row.desc_carburante);
            if (!fuelName) return null;
            return [today, fuelName, 'distributore', row.id_impianto, row.prezzo, row.prezzo, row.prezzo];
        }).filter(Boolean);

        if (distributoreRecords.length > 0) {
            const sql = 'INSERT INTO prezzi_storici (data, desc_carburante, livello_geo, codice_geo, prezzo_medio, prezzo_min, prezzo_max) VALUES ?';
            await connection.query(sql, [distributoreRecords]);
            console.log(`  - Inserite ${distributoreRecords.length} righe a livello distributore.`);
        }

        // --- FASE 2: Calcola aggregati superiori ---
        console.log('\nFase 2: Inizio calcolo aggregati superiori...');
        const [distributoriDiOggi] = await connection.execute(`
            SELECT ps.desc_carburante,
                   ps.prezzo_medio,
                   i.comune,
                   i.provincia,
                   prov.regione
            FROM prezzi_storici ps
                     JOIN impianti i ON ps.codice_geo = i.id_impianto
                     JOIN provincie prov ON i.provincia = prov.id
            WHERE ps.data = ?
              AND ps.livello_geo = 'distributore'
        `, [today]);

        if (distributoriDiOggi.length === 0) {
            console.log('Nessun dato a livello distributore da aggregare. Commit e uscita.');
            await connection.commit();
            return;
        }
        console.log(`  - Letti ${distributoriDiOggi.length} record per l'aggregazione.`);

        const aggregations = {};
        for (const row of distributoriDiOggi) {
            const geoLevels = {
                comune: row.comune,
                provinciale: row.provincia,
                regionale: row.regione,
                nazionale: 'IT',
            };

            for (const [level, code] of Object.entries(geoLevels)) {
                if (!code) continue;
                const key = `${level}_${code}_${row.desc_carburante}`;
                if (!aggregations[key]) {
                    aggregations[key] = {sum: 0, count: 0, min: Infinity, max: -Infinity};
                }
                const stats = aggregations[key];
                stats.sum += row.prezzo_medio;
                stats.count++;
                if (row.prezzo_medio < stats.min) stats.min = row.prezzo_medio;
                if (row.prezzo_medio > stats.max) stats.max = row.prezzo_medio;
            }
        }

        const aggregatedRecords = Object.entries(aggregations).map(([key, stats]) => {
            const [level, code, fuelName] = key.split('_');
            return [today, fuelName, level, code, stats.sum / stats.count, stats.min, stats.max];
        });

        if (aggregatedRecords.length > 0) {
            const sql = 'INSERT INTO prezzi_storici (data, desc_carburante, livello_geo, codice_geo, prezzo_medio, prezzo_min, prezzo_max) VALUES ?';
            await connection.query(sql, [aggregatedRecords]);
            console.log(`  - Inserite ${aggregatedRecords.length} righe aggregate.`);
        }

        await connection.commit();
        console.log('\nTransazione completata con successo!');

    } catch (error) {
        console.error("\n--- ERRORE FATALE DURANTE L'AGGREGAZIONE ---");
        console.error(error);
        if (connection) {
            console.log('Rollback della transazione in corso...');
            await connection.rollback();
        }
    } finally {
        if (connection) {
            await connection.end();
            console.log('Connessione al database chiusa.');
        }
    }
}

if (process.argv[1] && process.argv[1].includes('aggregate-prices.js')) {
    aggregatePrices();
}
