import {getServizi} from "@/functions/api";

/**
 * Simula il recupero del nome di un servizio dal suo slug.
 * @param {string} slug Lo slug del servizio (es. "autolavaggio").
 * @returns {Promise<{name: string} | null>} L'oggetto del servizio o null se non trovato.
 */
export async function getServiceBySlug(slug) {

    if (slug) {

        const record = await getServizi();
        console.log(record);

        const name = slug.replace(/-/g, ' ');
        return {name: name.charAt(0).toUpperCase() + name.slice(1)};
    }
    return null;
}

/**
 * Simula il recupero del nome di un comune dal suo slug.
 * @param {string} slug Lo slug del comune (es. "milano").
 * @returns {Promise<{name: string} | null>} L'oggetto del comune o null se non trovato.
 */
export async function getComuneBySlug(slug) {
    if (slug) {
        const name = slug.replace(/-/g, ' ');
        return {name: name.charAt(0).toUpperCase() + name.slice(1)};
    }
    return null;
}
