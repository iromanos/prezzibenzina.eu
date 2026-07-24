import {connectToDatabase} from './mysql';
import {getProvincieByRegion} from "@/repos/geo.jsx";

// Definisci i tipi di carburante comuni per cui vogliamo recuperare i dati
const FUEL_TYPES = ['Benzina', 'Gasolio', 'GPL', 'Metano']; // Usiamo 'Gasolio' qui per la query al DB

// Mappatura semplificata degli slug delle regioni ai codici delle province.
// Questa mappa dovrebbe essere estesa o gestita da una fonte dati esterna se più complessa.
const PROVINCE_MAP_BY_REGION = {
    'abruzzo': ['AQ', 'CH', 'PE', 'TE'],
    'basilicata': ['MT', 'PZ'],
    'calabria': ['CZ', 'CS', 'KR', 'RC', 'VV'],
    'campania': ['AV', 'BN', 'CE', 'NA', 'SA'],
    'emilia-romagna': ['BO', 'FE', 'FC', 'MO', 'PR', 'PC', 'RA', 'RE', 'RN'],
    'friuli-venezia-giulia': ['GO', 'PN', 'TS', 'UD'],
    'lazio': ['FR', 'LT', 'RI', 'RM', 'VT'],
    'liguria': ['GE', 'IM', 'SP', 'SV'],
    'lombardia': ['BG', 'BS', 'CO', 'CR', 'LC', 'LO', 'MN', 'MI', 'MB', 'PV', 'SO', 'VA'],
    'marche': ['AN', 'AP', 'FM', 'MC', 'PU'],
    'molise': ['CB', 'IS'],
    'piemonte': ['AL', 'AT', 'BI', 'CN', 'NO', 'TO', 'VB', 'VC'],
    'puglia': ['BA', 'BT', 'FG', 'LE', 'TA'],
    'sardegna': ['CA', 'NU', 'OR', 'SS', 'SU', 'SS'], // SU e SS sono nuove province, da verificare
    'sicilia': ['AG', 'CL', 'CT', 'EN', 'ME', 'PA', 'RG', 'SR', 'TP'],
    'toscana': ['AR', 'FI', 'GR', 'LI', 'LU', 'MS', 'PI', 'PT', 'PO', 'SI'],
    'trentino-alto-adige': ['BZ', 'TN'],
    'umbria': ['PG', 'TR'],
    'valle-daosta': ['AO'],
    'veneto': ['BL', 'PD', 'RO', 'TV', 'VE', 'VR', 'VI'],
};


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
            // await connection.end();
        }
    }
}

export async function getPrezziMediProvincialiPerRegione(regionSlug) {
    let connection;
    try {
        connection = await connectToDatabase();

        const provinceCodes = await getProvincieByRegion(regionSlug);

        if (!provinceCodes || provinceCodes.length === 0) {
            return []; // Nessuna provincia trovata per la regione
        }

        // La query è simile a quella regionale, ma filtra per livello_geo='provinciale' e per i codici delle province
        const query = `
            SELECT codice_geo,
                   desc_carburante,
                   prezzo_medio,
                   data
            FROM prezzi_storici
            WHERE livello_geo = 'provinciale'
              AND codice_geo IN (?)
              AND desc_carburante IN (?)
            ORDER BY data DESC
        `;

        // Esegui la query. Il driver mysql2/promise gestisce automaticamente l'espansione dell'array in IN (?)
        const [results] = await connection.query(query, [provinceCodes.map((m) => m.id), FUEL_TYPES]);

        // Aggregazione simile a quella regionale, per ottenere l'ultimo prezzo per ogni provincia e carburante
        const aggregatedPrices = {};

        results.forEach(row => {
            const {codice_geo, desc_carburante, prezzo_medio, data} = row;

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
        console.error(`Errore nel recupero dei prezzi medi provinciali per la regione ${regionSlug} dal repository:`, error);
        throw error;
    } finally {
        if (connection) {
            // await connection.end();
        }
    }
}