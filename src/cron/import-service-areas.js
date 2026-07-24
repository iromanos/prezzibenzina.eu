import 'dotenv/config'
import path from "path";
import fs from "fs/promises";
import mysql from "mysql2/promise";

const API_BASE_URL = 'https://carburanti.mise.gov.it/ospzApi/registry/servicearea/';
const LOG_FILE_PATH = path.resolve(process.cwd(), 'cron_logs', 'import-service-areas.log'); // Modificato per coerenza

async function logToFile(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;
    console.log(logMessage.trim()); // Log to console as well
    try {
        await fs.appendFile(LOG_FILE_PATH, logMessage, 'utf8');
    } catch (error) {
        console.error(`Errore durante la scrittura del log su file ${LOG_FILE_PATH}:`, error);
    }
}


async function fetchServiceArea(idImpianto) {
    try {
        const response = await fetch(`${API_BASE_URL}${idImpianto}`);
        if (!response.ok) {
            if (response.status === 404) {
                console.warn(`Service area data not found for id_impianto: ${idImpianto}. Skipping.`);
                return null;
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Error fetching service area for id_impianto ${idImpianto}:`, error);
        return null;
    }
}

async function importServiceAreas() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE,
        });

        const [impianti] = await connection.query(`select impianti.id_impianto
                                                   from impianti
                                                   where impianti.id_impianto not in (SELECT id_impianto
                                                                                      from impianto_servizi
                                                                                      where updated_at is not null)`);

        await logToFile(`Found ${impianti.length} impianti to process.`);

        for (const impianto of impianti) {
            const idImpianto = impianto.id_impianto;
            await logToFile(`Processing id_impianto: ${idImpianto}`);

            const serviceData = await fetchServiceArea(idImpianto);

            if (serviceData) {
                const servicesJson = JSON.stringify(serviceData.services || []);
                const orariAperturaJson = JSON.stringify(serviceData.orariapertura || {});

                // Check if a record already exists for this id_impianto
                const [existing] = await connection.query(
                    'SELECT id_impianto FROM impianto_servizi WHERE id_impianto = ?',
                    [idImpianto]
                );

                if (existing.length > 0) {
                    // Update existing record
                    await connection.query(
                        `UPDATE impianto_servizi
                         SET services      = ?,
                             orariapertura = ?,
                             updated_at    = NOW()
                         WHERE id_impianto = ?`,
                        [servicesJson, orariAperturaJson, idImpianto]
                    );
                    await logToFile(`Updated service data for id_impianto: ${idImpianto}`);
                } else {
                    // Insert new record
                    await connection.query(
                        `INSERT INTO impianto_servizi (id_impianto, services, orariapertura, created_at, updated_at)
                         VALUES (?, ?, ?, NOW(), NOW())`,
                        [idImpianto, servicesJson, orariAperturaJson]
                    );
                    await logToFile(`Inserted service data for id_impianto: ${idImpianto}`);
                }
            }

            break;
        }

        await logToFile('Service area import completed.');

    } catch (error) {
        await logToFile('Error during service area import:', error);
    } finally {
        if (connection) {
            connection.end();
        }
    }
}

// Execute the import function
importServiceAreas();
