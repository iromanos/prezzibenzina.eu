import {notFound} from 'next/navigation';
import Header from "@/components/Header.jsx";
import React from "react";
import Link from "next/link";
import {getPrezziMediProvincialiPerRegione} from '@/repos/prezzi-medi.jsx';
import {getRegioni} from "@/repos/geo.jsx";
import {getRouteLink} from "@/functions/helpers.jsx";
import {StatisticheWrapper} from "@/components/statistiche/StatisticheChart.jsx"; // Importa direttamente dal repository

// Mappatura semplificata delle sigle provinciali ai nomi completi
// Questa mappa dovrebbe essere estesa o gestita da una fonte dati esterna se più complessa.
const PROVINCE_CODE_TO_NAME_MAP = {
    'AQ': 'L\'Aquila',
    'CH': 'Chieti',
    'PE': 'Pescara',
    'TE': 'Teramo', // Abruzzo
    'MT': 'Matera',
    'PZ': 'Potenza', // Basilicata
    'CZ': 'Catanzaro',
    'CS': 'Cosenza',
    'KR': 'Crotone',
    'RC': 'Reggio Calabria',
    'VV': 'Vibo Valentia', // Calabria
    'AV': 'Avellino',
    'BN': 'Benevento',
    'CE': 'Caserta',
    'NA': 'Napoli',
    'SA': 'Salerno', // Campania
    'BO': 'Bologna',
    'FE': 'Ferrara',
    'FC': 'Forlì-Cesena',
    'MO': 'Modena',
    'PR': 'Parma',
    'PC': 'Piacenza',
    'RA': 'Ravenna',
    'RE': 'Reggio Emilia',
    'RN': 'Rimini', // Emilia-Romagna
    'GO': 'Gorizia',
    'PN': 'Pordenone',
    'TS': 'Trieste',
    'UD': 'Udine', // Friuli-Venezia Giulia
    'FR': 'Frosinone',
    'LT': 'Latina',
    'RI': 'Rieti',
    'RM': 'Roma',
    'VT': 'Viterbo', // Lazio
    'GE': 'Genova',
    'IM': 'Imperia',
    'SP': 'La Spezia',
    'SV': 'Savona', // Liguria
    'BG': 'Bergamo',
    'BS': 'Brescia',
    'CO': 'Como',
    'CR': 'Cremona',
    'LC': 'Lecco',
    'LO': 'Lodi',
    'MN': 'Mantova',
    'MI': 'Milano',
    'MB': 'Monza e Brianza',
    'PV': 'Pavia',
    'SO': 'Sondrio',
    'VA': 'Varese', // Lombardia
    'AN': 'Ancona',
    'AP': 'Ascoli Piceno',
    'FM': 'Fermo',
    'MC': 'Macerata',
    'PU': 'Pesaro e Urbino', // Marche
    'CB': 'Campobasso',
    'IS': 'Isernia', // Molise
    'AL': 'Alessandria',
    'AT': 'Asti',
    'BI': 'Biella',
    'CN': 'Cuneo',
    'NO': 'Novara',
    'TO': 'Torino',
    'VB': 'Verbano-Cusio-Ossola',
    'VC': 'Vercelli', // Piemonte
    'BA': 'Bari',
    'BT': 'Barletta-Andria-Trani',
    'FG': 'Foggia',
    'LE': 'Lecce',
    'TA': 'Taranto', // Puglia
    'CA': 'Cagliari',
    'NU': 'Nuoro',
    'OR': 'Oristano',
    'SS': 'Sassari',
    'SU': 'Sud Sardegna', // Sardegna (SU e SS sono nuove province, da verificare)
    'AG': 'Agrigento',
    'CL': 'Caltanissetta',
    'CT': 'Catania',
    'EN': 'Enna',
    'ME': 'Messina',
    'PA': 'Palermo',
    'RG': 'Ragusa',
    'SR': 'Siracusa',
    'TP': 'Trapani', // Sicilia
    'AR': 'Arezzo',
    'FI': 'Firenze',
    'GR': 'Grosseto',
    'LI': 'Livorno',
    'LU': 'Lucca',
    'MS': 'Massa-Carrara',
    'PI': 'Pisa',
    'PT': 'Pistoia',
    'PO': 'Prato',
    'SI': 'Siena', // Toscana
    'BZ': 'Bolzano',
    'TN': 'Trento', // Trentino-Alto Adige
    'PG': 'Perugia',
    'TR': 'Terni', // Umbria
    'AO': 'Aosta', // Valle d'Aosta
    'BL': 'Belluno',
    'PD': 'Padova',
    'RO': 'Rovigo',
    'TV': 'Treviso',
    'VE': 'Venezia',
    'VR': 'Verona',
    'VI': 'Vicenza', // Veneto
};


// Tipi di carburante da mostrare come colonne
const FUEL_TYPES_DISPLAY = ['Benzina', 'Diesel', 'GPL', 'Metano'];

// Generazione dinamica dei metadati
export async function generateMetadata({params}) {

    const regioni = await getRegioni();

    const paramRegione = await params;
    const record = regioni.find((r) => r.key === paramRegione.regione);

    if (!record) return {title: 'Regione non trovata'};

    const regionName = record.name;

    const title = `Prezzi medi dei carburanti per provincia in ${regionName} - Confronta i Costi`;
    const description = `Scopri i prezzi medi aggiornati di benzina, diesel, GPL e metano per ogni provincia in ${regionName}. Confronta i costi e trova le province più convenienti.`;
    const canonicalUrl = `https://www.prezzibenzina.eu/prezzi-medi-regione/${paramRegione.regione}`; // Assicurati che il dominio sia corretto

    return {
        title: title,
        description: description,
        keywords: [`prezzi medi carburante ${regionName}`, `prezzi benzina ${regionName}`, `costo diesel ${regionName}`, `GPL ${regionName}`, `metano ${regionName}`, `confronto prezzi carburante ${regionName}`, `prezzi carburante ${regionName} province`],
        openGraph: {
            title: title,
            description: description,
            url: canonicalUrl,
            siteName: 'PrezziBenzina.eu',
            images: [
                {
                    url: 'https://www.prezzibenzina.eu/og-image.jpg', // Sostituisci con l'URL di un'immagine Open Graph rilevante
                    width: 1200,
                    height: 630,
                    alt: title,
                },
            ],
            locale: 'it_IT',
            type: 'website',
        },
        alternates: {
            canonical: canonicalUrl,
        },
        twitter: {
            card: 'summary_large_image',
            title: title,
            description: description,
            creator: '@YourTwitterHandle', // Sostituisci con il tuo handle Twitter
            images: ['https://www.prezzibenzina.eu/og-image.jpg'], // Sostituisci con l'URL di un'immagine Twitter Card rilevante
        },
        robots: {
            index: true,
            follow: true,
            googleBot: {
                index: true,
                follow: true,
                'max-video-preview': -1,
                'max-image-preview': 'large',
                'max-snippet': -1,
            },
        },
    };
}


export default async function PrezziMediProvinciaPage({params}) {
    const {regione: regionSlug} = await params;

    const regioni = await getRegioni();

    const record = regioni.find((r) => r.key === regionSlug);

    // Safety check: if the region slug is invalid, return a 404
    if (!record) {
        notFound();
    }

    const regionName = record.name;

    // Define these here so they are accessible to the component and JSON-LD
    const title = `Prezzi medi dei carburanti per provincia in ${regionName} - Confronta i Costi`;
    const description = `Scopri i prezzi medi aggiornati di benzina, diesel, GPL e metano per ogni provincia della ${regionName}. Confronta i costi e trova le province più convenienti.`;
    const canonicalUrl = `https://www.prezzibenzina.eu/prezzi-medi-regione/${regionSlug}`;
    const keywords = [
        `prezzi medi carburante ${regionName}`, `prezzi benzina ${regionName}`,
        `costo diesel ${regionName}`, `GPL ${regionName}`, `metano ${regionName}`,
        `confronto prezzi carburante ${regionName}`, `prezzi carburante ${regionName} province`
    ];

    let prezziProvincialiAggregati;
    try {
        // Chiamata diretta alla funzione del repository
        prezziProvincialiAggregati = await getPrezziMediProvincialiPerRegione(regionSlug);
    } catch (error) {
        console.error(`Errore nel recupero dei dati provinciali per ${regionSlug}:`, error);
        notFound(); // Mostra la pagina 404 se i dati non possono essere recuperati
    }

    if (!prezziProvincialiAggregati || prezziProvincialiAggregati.length === 0) {
        return (
            <><Header/>
                <div className="container py-4 text-center">
                    <h1 className="h3 mb-4">Prezzi medi dei carburanti per provincia in {regionName}</h1>
                    <p>Nessun dato sui prezzi medi dei carburanti disponibile per le province in {regionName} al
                        momento.</p>
                    <Link href="/prezzi-medi-regione" className="btn btn-primary mt-3">Torna ai Prezzi Medi
                        Regionali</Link>
                </div>
            </>
        );
    }

    // Ordina le province alfabeticamente per nome
    const sortedPrezziProvincialiAggregati = prezziProvincialiAggregati.sort((a, b) => {
        const nameA = PROVINCE_CODE_TO_NAME_MAP[a.codice_geo] || a.codice_geo;
        const nameB = PROVINCE_CODE_TO_NAME_MAP[b.codice_geo] || b.codice_geo;
        return nameA.localeCompare(nameB, 'it', {sensitivity: 'base'});
    });

    // Genera lo Schema Markup JSON-LD
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": title,
        "description": description,
        "url": canonicalUrl,
        "mainEntity": {
            "@type": "Table",
            "name": `Tabella Prezzi Medi Carburanti per Provincia in ${regionName}`,
            "description": `Tabella che mostra i prezzi medi di benzina, diesel, GPL e metano per ogni provincia della ${regionName}.`,
            "about": {
                "@type": "Dataset",
                "name": `Dati Prezzi Medi Carburanti Italia per Provincia in ${regionName}`,
                "description": `Dataset contenente i prezzi medi dei carburanti (benzina, diesel, GPL, metano) per provincia nella ${regionName}, aggiornati quotidianamente.`,
                "url": canonicalUrl,
                "keywords": keywords,
                "creator": {
                    "@type": "Organization",
                    "name": "PrezziBenzina.eu"
                },
                "license": "https://www.formez.it/iodl/2.0/",
                "isBasedOn": "https://www.mimit.gov.it/",
                "dateModified": new Date().toISOString().split('T')[0] // Data di oggi come ultima modifica
            }
        }
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{__html: JSON.stringify(jsonLd)}}
            />
            <Header/>
            <div className="container-fluid py-4 bg-secondary-subtle">
                <div className='container'>
                    <h1 className="h3 mb-4 text-center">Prezzi medi dei carburanti per provincia in {regionName}</h1>
                    <p className="lead text-muted mb-4 text-center">
                        Confronta i prezzi medi di benzina, diesel, GPL e metano in tutte le province in {regionName}.
                        I dati sono aggiornati e ti aiutano a trovare le province più convenienti per fare rifornimento.
                    </p>

                    <div className="table-responsive rounded shadow-sm">
                        <table className="table table-striped table-hover mb-0">
                            <thead className="table-light">
                            <tr>
                                <th scope="col" className="text-start small text-muted">
                                    Provincia
                                </th>
                                {FUEL_TYPES_DISPLAY.map((fuelType) => (
                                    <th key={fuelType} scope="col" className="text-start small text-muted">
                                        {fuelType} (€/L)
                                    </th>
                                ))}
                            </tr>
                            </thead>
                            <tbody>
                            {sortedPrezziProvincialiAggregati.map((provinceData) => {

                                const urlProvincia = getRouteLink(regionSlug, 'benzina', null, provinceData.codice_geo.toLowerCase());

                                return (
                                    <tr key={provinceData.codice_geo}>
                                        <td className="py-2 text-nowrap">
                                            <Link title={urlProvincia.title} className={''} href={urlProvincia.link}>
                                                {PROVINCE_CODE_TO_NAME_MAP[provinceData.codice_geo] || provinceData.codice_geo}</Link>
                                        </td>
                                        {FUEL_TYPES_DISPLAY.map((fuelType) => {
                                            const fuelPrice = provinceData.carburanti[fuelType];
                                            return (
                                                <td key={fuelType} className="py-2 text-nowrap text-muted">
                                                    {fuelPrice ? fuelPrice.prezzo_medio.toFixed(3) : 'N/D'}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-4 small text-muted text-center">
                        <p>Ultimo aggiornamento dati: {new Date().toLocaleDateString('it-IT')}</p>
                        <p>I prezzi medi sono calcolati sui dati più recenti disponibili per ciascuna provincia e tipo
                            di carburante.</p>
                    </div>

                    <div className="card mb-4">
                        <div className="card-body">
                            <h5 className="card-title">{regionName} - Andamento del prezzo della benzina</h5>
                            <StatisticheWrapper filters={{
                                desc_carburante: 'benzina',
                                livello_geo: 'regionale',
                                codice_geo: regionSlug,
                            }}/>
                        </div>
                    </div>
                    <div className="text-center mt-4">
                        <Link href="/prezzi-medi-regione" className="btn btn-primary">Torna ai Prezzi Medi
                            Regionali</Link>
                    </div>
                </div>
            </div>
        </>
    );
}