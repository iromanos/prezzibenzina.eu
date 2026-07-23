import {notFound} from 'next/navigation';
import {getPrezziMediRegioneAggregati} from '@/repos/prezzi-medi.jsx'; // *** CORRETTO IL PERCORSO DI IMPORTAZIONE ***
import Header from "@/components/Header.jsx";
import React from "react";
import RegionFuelBarChart from '@/components/prezzi-medi-regione/RegionFuelBarChart.jsx';
import Link from "next/link"; // Importa il nuovo componente grafico

// Mappatura dei codici regione (slug) ai nomi completi
const REGION_NAMES_MAP = {
    'abruzzo': 'Abruzzo',
    'basilicata': 'Basilicata',
    'calabria': 'Calabria',
    'campania': 'Campania',
    'emilia-romagna': 'Emilia-Romagna',
    'friuli-venezia-giulia': 'Friuli-Venezia Giulia',
    'lazio': 'Lazio',
    'liguria': 'Liguria',
    'lombardia': 'Lombardia',
    'marche': 'Marche',
    'molise': 'Molise',
    'piemonte': 'Piemonte',
    'puglia': 'Puglia',
    'sardegna': 'Sardegna',
    'sicilia': 'Sicilia',
    'toscana': 'Toscana',
    'trentino-alto-adige': 'Trentino-Alto Adige',
    'umbria': 'Umbria',
    'valle-daosta': 'Valle d\'Aosta',
    'veneto': 'Veneto',
};

// Tipi di carburante da mostrare come colonne (ora il repository restituisce "Diesel")
const FUEL_TYPES_DISPLAY = ['Benzina', 'Diesel', 'GPL', 'Metano'];

// Metadata per SEO (Next.js App Router)
export const metadata = {
    title: 'Prezzi medi dei carburanti per regione - Confronta i Costi in Italia',
    description: 'Scopri i prezzi medi aggiornati dei carburanti (benzina, diesel, GPL e metano) per ogni regione d\'Italia. Confronta i costi e trova le regioni più convenienti per fare rifornimento.',
    keywords: ['prezzi medi carburante', 'prezzi benzina regione', 'costo diesel Italia', 'GPL regione', 'metano regione', 'confronto prezzi carburante', 'prezzi carburante Italia'],
    openGraph: {
        title: 'Prezzi medi dei carburanti per regione - Confronta i Costi in Italia',
        description: 'Scopri i prezzi medi aggiornati dei carburanti (benzina, diesel, GPL e metano) per ogni regione d\'Italia. Confronta i costi e trova le regioni più convenienti per fare rifornimento.',
        url: 'https://www.prezzibenzina.eu/prezzi-medi-regione',
        siteName: 'PrezziBenzina.eu',
        images: [
            {
                url: 'https://www.prezzibenzina.eu/og-image.jpg', // Sostituisci con l'URL di un'immagine Open Graph rilevante
                width: 1200,
                height: 630,
                alt: 'Prezzi medi dei carburanti per regione',
            },
        ],
        locale: 'it_IT',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Prezzi medi dei carburanti per regione - Confronta i Costi in Italia',
        description: 'Scopri i prezzi medi aggiornati dei carburanti (benzina, diesel, GPL e metano) per ogni regione d\'Italia. Confronta i costi e trova le regioni più convenienti per fare rifornimento.',
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
    canonical: 'https://www.prezzibenzina.eu/prezzi-medi-regione',
};


export default async function PrezziMediRegionePage() {
    let prezziAggregati;
    try {
        prezziAggregati = await getPrezziMediRegioneAggregati();
    } catch (error) {
        console.error("Errore nel recupero dei dati per la pagina:", error);
        notFound();
    }

    if (!prezziAggregati || prezziAggregati.length === 0) {
        return (
            <div className="container py-4 text-center">
                <h1 className="h3 mb-4">Prezzi medi dei carburanti per regione</h1>
                <p>Nessun dato sui prezzi medi dei carburanti disponibile al momento.</p>
            </div>
        );
    }

    // Ordina le regioni alfabeticamente per nome
    const sortedPrezziAggregati = prezziAggregati.sort((a, b) => {
        const nameA = REGION_NAMES_MAP[a.codice_geo] || a.codice_geo;
        const nameB = REGION_NAMES_MAP[b.codice_geo] || b.codice_geo;
        return nameA.localeCompare(nameB, 'it', {sensitivity: 'base'});
    });

    // Genera lo Schema Markup JSON-LD
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": metadata.title,
        "description": metadata.description,
        "url": metadata.canonical,
        "mainEntity": {
            "@type": "Table",
            "name": "Tabella Prezzi Medi Carburanti per Regione",
            "description": "Tabella che mostra i prezzi medi di benzina, diesel, GPL e metano per ogni regione d'Italia.",
            "about": {
                "@type": "Dataset",
                "name": "Dati Prezzi Medi Carburanti Italia per Regione",
                "description": "Dataset contenente i prezzi medi dei carburanti (benzina, diesel, GPL, metano) per regione in Italia, aggiornati quotidianamente.",
                "url": metadata.canonical,
                "keywords": metadata.keywords,
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
                    <h1 className="h3 mb-4 text-center">Prezzi medi dei carburanti per regione</h1>
                    <p className="lead text-muted mb-4 text-center">
                        Confronta i prezzi medi di benzina, diesel, GPL e metano in tutte le regioni d'Italia.
                        I dati sono aggiornati e ti aiutano a trovare le regioni più convenienti per fare rifornimento.
                    </p>

                    <p className="mb-4 text-muted text-center">
                        Benvenuto nella sezione dedicata ai prezzi medi dei carburanti in Italia, suddivisi per regione.
                        Qui puoi trovare un'analisi dettagliata e sempre aggiornata del costo di benzina, diesel, GPL e
                        metano,
                        per aiutarti a monitorare le fluttuazioni del mercato e a individuare le regioni più vantaggiose
                        per il tuo rifornimento.
                        Utilizza questa tabella per confrontare rapidamente i prezzi e ottimizzare le tue spese di
                        viaggio.
                    </p>

                    <div className="table-responsive shadow-sm rounded">
                        <table className="table table-striped table-hover mb-0">
                            <thead>
                            <tr>
                                <th scope="col" className="text-start small text-muted">
                                    Regione
                                </th>
                                {FUEL_TYPES_DISPLAY.map((fuelType) => (
                                    <th key={fuelType} scope="col" className="text-start small text-muted">
                                        {fuelType} (€/L)
                                    </th>
                                ))}
                            </tr>
                            </thead>
                            <tbody>
                            {sortedPrezziAggregati.map((regionData) => (
                                <tr key={regionData.codice_geo}>
                                  <td className="py-2 text-nowrap ">
                                    <Link className={''} href={`/prezzi-medi-regione/${regionData.codice_geo}`}>
                                      {REGION_NAMES_MAP[regionData.codice_geo] || regionData.codice_geo}</Link>
                                    </td>
                                    {FUEL_TYPES_DISPLAY.map((fuelType) => {
                                        const fuelPrice = regionData.carburanti[fuelType];
                                        return (
                                            <td key={fuelType} className="py-2 text-nowrap text-muted">
                                                {fuelPrice ? fuelPrice.prezzo_medio.toFixed(3) : 'N/D'}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-4 small text-muted text-center">
                        <p>Ultimo aggiornamento dati: {new Date().toLocaleDateString('it-IT')}</p>
                        <p>I prezzi medi sono calcolati sui dati più recenti disponibili per ciascuna regione e tipo di
                            carburante.</p>
                    </div>

                    {/* Inserimento del nuovo componente grafico */}
                    <div className="mt-5">
                        <RegionFuelBarChart prezziAggregati={sortedPrezziAggregati}/>
                    </div>

                </div>
            </div>
        </>
    );
}