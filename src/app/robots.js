import {URI} from "@/functions/api";

export default async function robots() {


    const response = await fetch(URI + 'robots');

    // Genera l'elenco degli Allow (es. /lombardia/.../mi/milano)
    const siteMapUrls = await response.json();

    const allowRules = siteMapUrls.map(u => u.url);

    // Genera l'elenco dei Deny dinamici troncando l'ultimo pezzo (es. /lombardia/.../mi/*)
    const denyRules = allowRules.map(url => {
        const ultimoSlash = url.lastIndexOf('/');
        return url.substring(0, ultimoSlash) + '/*';
    });

    // Eliminiamo i duplicati dai Deny (es. benzina e diesel sulla stessa provincia producono lo stesso Deny)
    const uniqueDenyRules = [...new Set(denyRules)];

    return {
        rules: [
            {
                userAgent: '*',
                allow: [
                    '/',
                    '/sitemap.xml',
                    ...allowRules, // Dice SI ai capoluoghi (Milano)
                ],
                deny: [
                    ...uniqueDenyRules, // Dice NO a tutto il resto della provincia (Rho)

                    '/impianto/*',      // Blocca le schede dei singoli distributori
                    '*/marchio/*',      // Blocca i filtri dei marchi
                    '/*?*',             // Blocca le query string (?page, ?search, ecc.)
                ],
            },
        ],
        sitemap: 'https://www.prezzibenzina.eu/sitemap/capoluoghi',
    };
}