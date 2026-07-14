// src/app/(default)/statistiche/page.jsx
import {getCanonicalUrl, getOpenGraph, getTwitter} from "@/functions/server";
import {headers} from "next/headers";
import StatisticheClient from './StatisticheClient';

// Mappatura semplificata per i nomi geografici (da espandere se necessario)
const GEO_NAMES = {
    'IT': 'Italia',
    'LOM': 'Lombardia',
    'MI': 'Milano',
    // Aggiungere altre mappature se i codici non sono auto-esplicativi
};

export async function generateMetadata({searchParams}) {

    const queryParams = (await searchParams) || {};

    const carburante = queryParams.desc_carburante || 'Benzina';
    const codiceGeo = queryParams.codice_geo || 'IT';
    const startDate = queryParams.startDate;
    const endDate = queryParams.endDate;

    const geoName = GEO_NAMES[codiceGeo] || codiceGeo; // Usa il nome mappato o il codice

    let title = `Andamento Prezzo ${carburante} in ${geoName} - Statistiche Storiche | PrezziBenzina.eu`;
    let description = `Scopri l'andamento storico del prezzo della ${carburante} in ${geoName}. Grafici e dati aggiornati per aiutarti a risparmiare.`;

    if (startDate && endDate) {
        description += ` Dati dal ${new Date(startDate).toLocaleDateString('it-IT')} al ${new Date(endDate).toLocaleDateString('it-IT')}.`;
    }

    const headerList = await headers();
    const canonicalUrl = getCanonicalUrl(headerList) + '/statistiche';

    return {
        title: title,
        description: description,
        alternates: {
            canonical: canonicalUrl,
            languages: {
                'it': canonicalUrl,
                'x-default': canonicalUrl,
            },
        },
        openGraph: getOpenGraph(canonicalUrl, title, description, '/assets/logo-og.png'),
        twitter: getTwitter(title, description, '/assets/logo-og.png'),
    };
}

export default async function StatistichePage({searchParams}) {
    const queryParams = (await searchParams) || {};
    return <StatisticheClient initialParams={queryParams}/>;
}
