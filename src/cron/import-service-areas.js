import 'dotenv/config'
import {connectToDatabase} from "../repos/mysql.js"

const API_BASE_URL = 'https://carburanti.mise.gov.it/ospzApi/registry/servicearea/';

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
        connection = await connectToDatabase();

        // 1. Get all id_impianto from the impianti table
        //    Assuming 'impianti' is the table where id_impianto are stored.
        //    Adjust table/column name if different.
        const [impianti] = await connection.query(`select impianti.id_impianto
                                                   from impianti
                                                   where id_impianto not in (SELECT id_impianto
                                                                             from impianto_servizi
                                                                             where services = ''
                                                                               and updated_at IS NULL)`);

        console.log(`Found ${impianti.length} impianti to process.`);

        for (const impianto of impianti) {
            const idImpianto = impianto.id_impianto;
            console.log(`Processing id_impianto: ${idImpianto}`);

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
                    console.log(`Updated service data for id_impianto: ${idImpianto}`);
                } else {
                    // Insert new record
                    await connection.query(
                        `INSERT INTO impianto_servizi (id_impianto, services, orariapertura, created_at, updated_at)
                         VALUES (?, ?, ?, NOW(), NOW())`,
                        [idImpianto, servicesJson, orariAperturaJson]
                    );
                    console.log(`Inserted service data for id_impianto: ${idImpianto}`);
                }
            }

            break;
        }

        console.log('Service area import completed.');

    } catch (error) {
        console.error('Error during service area import:', error);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

// Execute the import function
importServiceAreas();
