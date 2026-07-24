// src/scripts/recalculate-aggregates.js

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({path: path.resolve(process.cwd(), '.env')});

async function recalculateAggregates() {
    let connection;
    try {
        console.log('--- INIZIO SCRIPT DI RICALCOLO AGGREGATI STORICI ---');
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE,
        });
        console.log('Connessione al database stabilita.');

        const [dates] = await connection.execute(
            "SELECT DISTINCT data FROM prezzi_storici WHERE livello_geo = 'distributore' AND data >= '2026-01-01' ORDER BY data ASC"
        );
        const uniqueDates = dates.map(d => d.data.toISOString().slice(0, 10));

        if (uniqueDates.length === 0) {
            console.log('Nessuna data da processare. Uscita.');
            return;
        }
        console.log(`Trovate ${uniqueDates.length} date uniche da processare.`);

        for (const date of uniqueDates) {
            console.log(`\n--- Processando data: ${date} ---`);

            await connection.execute(
                "DELETE FROM prezzi_storici WHERE data = ? AND livello_geo != 'distributore'",
                [date]
            );
            console.log(`  - Aggregati esistenti per il ${date} cancellati.`);

            const [distributoriDelGiorno] = await connection.execute(`
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
            `, [date]);

            if (distributoriDelGiorno.length === 0) {
                console.log('  - Nessun dato a livello distributore per questa data. Salto.');
                continue;
            }
            console.log(`  - Letti ${distributoriDelGiorno.length} record per l'aggregazione.`);

            const aggregations = {};
            for (const row of distributoriDelGiorno) {
                // --- FIX DEFINITIVO: Conversione e validazione esplicita del prezzo ---
                const price = parseFloat(row.prezzo_medio);
                if (isNaN(price) || price <= 0) {
                    // Se il prezzo non è un numero valido, scarta questo record e non usarlo per le medie.
                    continue;
                }
                // --- FINE FIX ---

                const geoLevels = {
                    comune: row.comune,
                    provinciale: row.provincia,
                    regionale: row.regione,
                    nazionale: 'IT',
                };

                for (const [level, code] of Object.entries(geoLevels)) {
                    if (!code || !row.desc_carburante) continue;

                    const key = `${level}-${code}-${row.desc_carburante}`;

                    if (!aggregations[key]) {
                        aggregations[key] = {
                            level,
                            code,
                            fuelName: row.desc_carburante,
                            sum: 0,
                            count: 0,
                            min: Infinity,
                            max: -Infinity,
                        };
                    }
                    const stats = aggregations[key];
                    // Usa il prezzo validato e convertito
                    stats.sum += price;
                    stats.count++;
                    if (price < stats.min) stats.min = price;
                    if (price > stats.max) stats.max = price;
                }
            }

            const aggregatedRecords = Object.values(aggregations).map((stats) => {
                const prezzoMedio = stats.count > 0 ? stats.sum / stats.count : 0;
                return [date, stats.fuelName, stats.level, stats.code, prezzoMedio, stats.min, stats.max];
            });

            if (aggregatedRecords.length > 0) {
                const sql = 'INSERT INTO prezzi_storici (data, desc_carburante, livello_geo, codice_geo, prezzo_medio, prezzo_min, prezzo_max) VALUES ?';
                await connection.query(sql, [aggregatedRecords]);
                console.log(`  - Inserite ${aggregatedRecords.length} righe aggregate per il ${date}.`);
            }
        }

        console.log('\n--- RICALCOLO COMPLETATO CON SUCCESSO! ---');

    } catch (error) {
        console.error("\n--- ERRORE FATALE DURANTE IL RICALCOLO ---");
        console.error(error);
    } finally {
        if (connection) {
            // await connection.end();
            console.log('Connessione al database chiusa.');
        }
    }
}

recalculateAggregates();
