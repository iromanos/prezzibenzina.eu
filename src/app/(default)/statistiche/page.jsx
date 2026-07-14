// src/app/(default)/statistiche/page.jsx
import {getCanonicalUrl, getOpenGraph, getTwitter} from "@/functions/server";
import {headers} from "next/headers";
import {cache} from 'react';
import mysql from 'mysql2/promise';
import StatisticheClient from './StatisticheClient';

// Mappatura semplificata per i nomi geografici (da espandere se necessario)
const GEO_NAMES = {
    'IT': 'Italia',
    'LOM': 'Lombardia',
    'MI': 'Milano',
    // Aggiungere altre mappature se i codici non sono auto-esplicativi
};

// Formatta una data ISO (YYYY-MM-DD) nel formato italiano
function formatDateIt(value) {
    if (!value) return null;
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d.toLocaleDateString('it-IT');
}

// Risolve il nome leggibile dell'area geografica interrogando il DB.
// Avvolta in cache() per deduplicare la query tra generateMetadata e il componente pagina
// (stessa request, stessi argomenti => una sola esecuzione).
const resolveGeoName = cache(async function resolveGeoName(livello_geo, codice_geo) {
    if (livello_geo !== 'regionale' && livello_geo !== 'provinciale') return null;

    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE,
        });

        if (livello_geo === 'regionale') {
            const [rows] = await connection.execute('SELECT name FROM regioni WHERE `key` = ? LIMIT 1', [codice_geo]);
            return rows[0]?.name || null;
        }

        const [rows] = await connection.execute('SELECT description AS name FROM provincie WHERE id = ? LIMIT 1', [codice_geo]);
        return rows[0]?.name || null;
    } catch (error) {
        console.error('Errore risoluzione nome geografico:', error);
        return null;
    } finally {
        if (connection) {
            await connection.end();
        }
    }
});

// Costruisce il testo introduttivo lato server (per la SEO) in base ai parametri di ricerca
async function buildIntroParagraph(params) {
    const carburante = params.desc_carburante || 'Benzina';
    const livelloGeo = params.livello_geo || 'nazionale';
    const codiceGeo = params.codice_geo || 'IT';

    let areaText = 'a livello nazionale';
    if (livelloGeo === 'regionale') {
        const name = await resolveGeoName(livelloGeo, codiceGeo);
        areaText = name ? `nella regione ${name}` : 'a livello regionale';
    } else if (livelloGeo === 'provinciale') {
        const name = await resolveGeoName(livelloGeo, codiceGeo);
        areaText = name ? `nella provincia di ${name}` : 'a livello provinciale';
    }

    const startText = formatDateIt(params.startDate);
    const endText = formatDateIt(params.endDate);
    const dateText = startText && endText ? ` nel periodo dal ${startText} al ${endText}` : '';

    return `Benvenuto nella sezione Statistiche Prezzi Carburanti di PrezziBenzina.eu. In questa pagina puoi analizzare l'andamento storico dei prezzi di ${carburante} ${areaText}${dateText}. Utilizza i filtri a sinistra per cambiare il tipo di carburante, l'area geografica e l'intervallo di date che ti interessano. Il grafico mostra l'evoluzione del prezzo medio, minimo e massimo, mentre il riepilogo ti fornisce i dati salienti del periodo selezionato.`;
}

export async function generateMetadata({searchParams}) {

    const queryParams = (await searchParams) || {};

    const carburante = queryParams.desc_carburante || 'Benzina';
    const livelloGeo = queryParams.livello_geo || 'nazionale';
    const codiceGeo = queryParams.codice_geo || 'IT';
    const startDate = queryParams.startDate;
    const endDate = queryParams.endDate;

    // Risolve il nome geografico dal DB per regioni/province, con fallback alla mappa statica
    const resolvedGeoName = await resolveGeoName(livelloGeo, codiceGeo);
    const geoName = resolvedGeoName || GEO_NAMES[codiceGeo] || codiceGeo;

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
    const introParagraph = await buildIntroParagraph(queryParams);
    return <StatisticheClient initialParams={queryParams} introParagraph={introParagraph}/>;
}
