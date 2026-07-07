import {getComune, getServizi} from "@/functions/api";

/**
 * @typedef {Object} Servizio
 * @property {number} id
 * @property {string} description
 * @property {string} icona
 * @property {string|null} deleted_at
 * @property {string} created_at
 * @property {string} updated_at
 * @property {string} slug
 */

/**
 * @typedef {Object} Comune
 * @property {string} id
 * @property {string} provincia_id
 * @property {string} description
 * @property {string} created_at
 * @property {string} updated_at
 * @property {string} bounds JSON string con bbox e coordinates
 * @property {string} link
 */

/**
 * @typedef {Object} PrezzoCarburante
 * @property {number} id
 * @property {number} id_impianto
 * @property {string} desc_carburante
 * @property {string} prezzo Valore testuale (es. "1.639")
 * @property {number} is_self 1 se self, 0 se servito
 * @property {string} dtcomu Data ultimo aggiornamento
 * @property {number} fuel_id
 */

/**
 * @typedef {Object} Distributore
 * @property {number} id_impianto
 * @property {string} gestore
 * @property {string} bandiera Nome del marchio (es. Esso, Eni)
 * @property {string} tipo_impianto
 * @property {string} nome_impianto
 * @property {string} indirizzo
 * @property {string} comune
 * @property {string} provincia
 * @property {number} latitudine
 * @property {number} longitudine
 * @property {number} prezzoMinimo
 * @property {number} prezzo
 * @property {PrezzoCarburante[]} fuels Elenco prezzi carburanti
 * @property {string} id_impianto_pb ID stringa (es. IT-53665)
 * @property {string} image Percorso logo marchio
 * @property {string} link Slug per il dettaglio
 * @property {Object} impianto_servizi
 * @property {Array<{id: string, description: string}>} impianto_servizi.services
 * @property {PrezzoCarburante[]} prezzi Duplicato di fuels per compatibilità
 */

/**
 * Simula il recupero del nome di un servizio dal suo slug.
 * @param {string} slug Lo slug del servizio (es. "autolavaggio").
 * @returns {Promise<Servizio | null>} L'oggetto del servizio o null se non trovato.
 */
export async function getServiceBySlug(slug) {
    if (slug) {
        const records = await getServizi();
        const service = records.find(item => item.slug === slug);

        if (service) {
            return service;
        }
    }
    return null;
}

/**
 * Simula il recupero del nome di un comune dal suo slug.
 * @param {string} slug Lo slug del comune (es. "milano").
 * @returns {Promise<Comune | null>} L'oggetto del comune o null se non trovato.
 */
export async function getComuneBySlug(slug) {
    if (slug) {
        return await getComune(slug);
    }
    return null;
}
