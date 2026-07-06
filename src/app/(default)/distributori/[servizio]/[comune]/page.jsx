import {notFound} from 'next/navigation';
import {getComuneBySlug, getServiceBySlug} from "@/functions/data";
import Header from "../../../../../components/Header";
import {getDistributoriRegione, getElencoCarburanti, getMarchi, getServizi} from "@/functions/api";
import React from "react";
import MapComponent from "../../../../../components/distributori/MapComponent";
import DistributoriList from "../../../../../components/distributori/DistributoriList";
import FilterBar from "../../../../../components/distributori/FilterBar";
import MobileViewManager from "../../../../../components/distributori/MobileViewManager";
import {generateDistributorSeoText} from "@/functions/seo";

//TODO: inserire i metadati strutturati e faq
const DOMAIN = process.env.NEXT_PUBLIC_BASE_URL;

/**
 * Genera i metadati SEO dinamici per la pagina.
 * @returns {Promise<import('next').Metadata>}
 */
export async function generateMetadata({params}) {
    const {servizio, comune} = await params;

    const [service, comuneData] = await Promise.all([
        getServiceBySlug(servizio),
        getComuneBySlug(comune)
    ]);

    if (!service || !comuneData) {
        notFound();
    }

    return {
        title: `Distributori con ${service.description} a ${comuneData.description} | PrezziBenzina.eu`,
        description: `Elenco e mappa dei distributori con ${service.description} a ${comuneData.description}. Orari, prezzi e servizi aggiornati.`,
        alternates: {
            canonical: `${DOMAIN}/distributori/${servizio}/${comune}`,
        },
        openGraph: {
            title: `Distributori con ${service.description} a ${comuneData.description} | PrezziBenzina.eu`,
            description: `Trova i migliori distributori con ${service.description} a ${comuneData.description}. Visualizza mappa, orari e prezzi aggiornati.`,
            url: `${DOMAIN}/distributori/${servizio}/${comune}`,
            siteName: `${DOMAIN}`,
            locale: 'it_IT',
            type: 'website',
            images: [
                {
                    url: `${DOMAIN}/images/logo_og.png`,
                    width: 1200,
                    height: 630,
                    alt: `Prezzi Benzina a ${comuneData.description}`,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title: `Distributori con ${service.description} a ${comuneData.description}`,
            description: `Mappa e prezzi dei distributori con ${service.description} a ${comuneData.description}.`,
            images: [`${DOMAIN}/images/logo_og.png`],
        },
    };
}

/**
 * Il componente React che renderizza la pagina.
 */
export default async function PaginaDistributoreServizioComune({params, searchParams}) {

    const URI_IMAGE = process.env.NEXT_PUBLIC_IMAGE_ENDPOINT;

    const {servizio: servizioSlug, comune: comuneSlug} = await params;
    const {marchio: marchioId, fuel: fuelParam} = await searchParams;

    const currentFuel = fuelParam || 'benzina';

    const [service, comuneData] = await Promise.all([
        getServiceBySlug(servizioSlug),
        getComuneBySlug(comuneSlug)
    ]);

    // Recuperiamo l'elenco completo di servizi, marchi e carburanti per i filtri
    const [servizi, marchi, elencoCarburanti] = await Promise.all([
        getServizi(),
        getMarchi(),
        getElencoCarburanti()
    ]);

    if (!service || !comuneData) {
        notFound();
    }

    // Recuperiamo i distributori filtrati per comune e servizio.
    const distributori = await getDistributoriRegione(null, currentFuel, marchioId, null, comuneData.id, service.id, 50);

    // Generiamo il testo SEO unico e approfondito (200+ parole)
    const seoParagraphs = generateDistributorSeoText({
        service,
        comuneData,
        distributori,
        marchioId,
        currentFuel,
        marchi
    });

    // JSON-LD per i Distributori (ItemList di GasStation)
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": `Distributori con ${service.description} a ${comuneData.description}`,
        "description": `Elenco dei distributori di carburante che offrono il servizio di ${service.description} nel comune di ${comuneData.description}`,
        "itemListElement": (distributori || []).slice(0, 20).map((d, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "item": {
                "@type": "GasStation",
                "name": `${d.bandiera} - ${d.nome_impianto}`,
                "address": {
                    "@type": "PostalAddress",
                    "streetAddress": d.indirizzo,
                    "addressLocality": d.comune,
                    "addressRegion": d.provincia,
                    "addressCountry": "IT"
                },
                "geo": {
                    "@type": "GeoCoordinates",
                    "latitude": d.latitudine,
                    "longitude": d.longitudine
                },
                "url": `${DOMAIN}/impianto/${d.link}`,
                "image": d.image ? `${URI_IMAGE}${d.image}` : undefined,
                "amenityFeature": d.impianto_servizi?.services?.map(s => ({
                    "@type": "LocationFeatureSpecification",
                    "name": s.description,
                    "value": true
                }))
            }
        }))
    };

    // JSON-LD per il Breadcrumb
    const breadcrumbLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Home", "item": DOMAIN},
            {
                "@type": "ListItem",
                "position": 2,
                "name": `Distributori ${service.description} ${comuneData.description}`,
                "item": `${DOMAIN}/distributori/${servizioSlug}/${comuneSlug}`
            }
        ]
    };

    return (
        <div className="pb-page-wrapper">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{__html: JSON.stringify(jsonLd)}}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{__html: JSON.stringify(breadcrumbLd)}}
            />

            <MobileViewManager
                header={<Header/>}
                filterBar={
                    <FilterBar
                        servizi={servizi}
                        marchi={marchi}
                        URI_IMAGE={URI_IMAGE}
                        carburanti={elencoCarburanti}
                        currentServiceSlug={servizioSlug}
                        currentComuneSlug={comuneSlug}
                    />
                }
                title={`Distributori con ${service.description} a ${comuneData.description}`}
                count={distributori?.length || 0}
                comuneName={comuneData.description}
                listComponent={<DistributoriList distributori={distributori} URI_IMAGE={URI_IMAGE}/>}
                mapComponent={<MapComponent distributori={distributori} comuneData={comuneData}/>}
                seoParagraphs={seoParagraphs}
                serviceDescription={service.description}
                distributori={distributori}
                URI_IMAGE={URI_IMAGE}
            />
        </div>
    );
}
