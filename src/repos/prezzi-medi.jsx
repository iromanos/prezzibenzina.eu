import {connectToDatabase} from './mysql';

// Definisci i tipi di carburante comuni per cui vogliamo recuperare i dati
const FUEL_TYPES = ['Benzina', 'Gasolio', 'GPL', 'Metano']; // Usiamo 'Gasolio' qui per la query al DB

export async function getPrezziMediRegioneAggregati() {
    let connection;
    try {
        connection = await connectToDatabase();

        const query = `
            SELECT codice_geo,
                   desc_carburante,
                   prezzo_medio,
                   data
            FROM prezzi_storici
            WHERE livello_geo = 'regionale'
              AND desc_carburante IN (?)
            ORDER BY data DESC
        `;

        const [results] = await connection.query(query, [FUEL_TYPES]);

        const aggregatedPrices = {};

        results.forEach(row => {
            const {codice_geo, desc_carburante, prezzo_medio, data} = row;

            // Mappa 'Gasolio' a 'Diesel' per il frontend
            const frontendFuelName = desc_carburante === 'Gasolio' ? 'Diesel' : desc_carburante;

            if (!aggregatedPrices[codice_geo]) {
                aggregatedPrices[codice_geo] = {
                    codice_geo: codice_geo,
                    carburanti: {}
                };
            }

            if (!aggregatedPrices[codice_geo].carburanti[frontendFuelName]) {
                aggregatedPrices[codice_geo].carburanti[frontendFuelName] = {
                    prezzo_medio: parseFloat(prezzo_medio),
                    data
                };
            }
        });

        return Object.values(aggregatedPrices);
    } catch (error) {
        console.error('Errore nel recupero dei prezzi medi regionali aggregati dal repository:', error);
        throw error;
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}