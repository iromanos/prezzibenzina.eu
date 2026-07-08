import ImpiantoScheda from '@/components/impianti/ImpiantoScheda';
import {getImpianto} from "@/functions/api";
import Header from "@/components/Header";
import {getCookie} from "@/functions/cookies";
import {getOpenGraph, getTwitter} from "@/functions/server";
// import {headers} from "next/headers";
import {notFound, redirect} from "next/navigation";
import {ucwords} from "@/functions/helpers";
import {BsArrowRightShort} from "react-icons/bs";
import React from "react";
import Display5745053645 from "@/components/ads/Display-5745053645";
import Link from "next/link";
import slugify from "slugify";

export const revalidate = 300;

export async function generateMetadata({params}) {

    const query = await params;

    const impianto = await getImpianto({query});

    if (impianto === null) {
        notFound();
    }

    console.log("impianto", impianto);

    const imageUrl = '/assets/logo-og.png';


    const lowerNome = impianto.nome_impianto.toLowerCase();
    const lowerBandiera = impianto.bandiera.toLowerCase();
    const lowerComune = impianto.comune.toLowerCase();

    // Puliamo il nome dell'impianto rimuovendo ridondanze con la bandiera e il comune
    // per evitare nomi come "Esso Esso Roma"
    let cleanNome = lowerNome.replace(lowerBandiera, '').replace(lowerComune, '').trim();

    // Costruiamo il nome finale anteponendo la bandiera (es. "Eni Corso Sempione")
    const finalNomeImpianto = ucwords(`${lowerBandiera} ${cleanNome}`.trim());

    // Estraiamo i carburanti disponibili per il titolo e la descrizione
    let fuelsList = impianto.prezzi
        ?.map(f => f.desc_carburante)
        .filter((value, index, self) => self.indexOf(value) === index) // Rimuove duplicati

    // Se la lista è troppo lunga per il titolo, prendiamo solo i primi 3 per non tagliare il brand/comune
    const titleFuels = fuelsList?.length > 3 ? fuelsList.slice(0, 3).join(', ') + '...' : fuelsList?.join(', ');
    const availableFuels = fuelsList?.join(', ');

    const title = `Prezzo ${titleFuels || 'Carburante'} ${finalNomeImpianto} a ${impianto.comune} | PrezziBenzina.eu`;
    const description = `Prezzi aggiornati per ${availableFuels || 'Benzina, Diesel, Metano e GPL'} al distributore ${finalNomeImpianto} a ${impianto.comune}. Consulta mappa, orari, servizi e confronta i prezzi oggi.`;

    const canonicalUrl = process.env.NEXT_PUBLIC_BASE_URL + '/impianto/' + impianto.link;

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
        openGraph: getOpenGraph(canonicalUrl, title, description, imageUrl),
        twitter: getTwitter(title, description, imageUrl),

    };
}

export default async function Page({params}) {
    const query = await params;

    const impianto = await getImpianto({query});

    if (impianto === null) {
        notFound();
    }

    if (impianto.link !== query.impianto) {
        redirect('/impianto/' + impianto.link);
    }

    const cookie = await getCookie();

    const URI_IMAGE = process.env.NEXT_PUBLIC_IMAGE_ENDPOINT;
    const DOMAIN = process.env.NEXT_PUBLIC_BASE_URL;

    // JSON-LD specifico per la stazione (GasStation)
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "GasStation",
        "name": `${impianto.bandiera} - ${impianto.nome_impianto}`,
        "description": `Prezzi e servizi del distributore ${impianto.bandiera} a ${impianto.comune}.`,
        "image": impianto.image ? `${URI_IMAGE}${impianto.image}` : undefined,
        "address": {
            "@type": "PostalAddress",
            "streetAddress": impianto.indirizzo,
            "addressLocality": impianto.comune,
            "addressRegion": impianto.provincia,
            "addressCountry": "IT"
        },
        "geo": {
            "@type": "GeoCoordinates",
            "latitude": impianto.latitudine,
            "longitude": impianto.longitudine
        },
        "url": `${DOMAIN}/impianto/${impianto.link}`,
        "amenityFeature": impianto.impianto_servizi?.services?.map(s => ({
            "@type": "LocationFeatureSpecification",
            "name": s.description,
            "value": true
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
                "name": `Impianto ${impianto.bandiera} ${impianto.comune}`,
                "item": `${DOMAIN}/impianto/${impianto.link}`
            }
        ]
    };

    return (
        <div className="pb-page-wrapper">
            <Header/>

            {/* Iniezione Dati Strutturati JSON-LD */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{__html: JSON.stringify(jsonLd)}}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{__html: JSON.stringify(breadcrumbLd)}}
            />

            <main className="container">

                <ImpiantoScheda impianto={impianto} cookie={cookie}/>

                <section className="mb-5 p-4 bg-light rounded border border-light-subtle shadow-sm">
                    <h3 className="h6 fw-bold text-uppercase text-muted mb-3">Cerca altro a {impianto.comune}</h3>
                    <div className="d-flex flex-wrap gap-2">
                        {impianto.elencoServizi.map((service) => (
                            <Link
                                key={service.id}
                                href={`/distributori/${service.slug !== '' ? service.slug : slugify(service.description.toLowerCase())}/${impianto.impiantoComune.id}`}
                                className="btn btn-white bg-white btn-sm border rounded-pill shadow-sm d-flex align-items-center hover-shadow transition-all px-3"
                            >
                                {service.description} <BsArrowRightShort className="ms-1"/>
                            </Link>
                        ))}
                    </div>
                </section>


                {/* Sezione Pubblicità e SEO a tutta larghezza */}
                <div className="row mt-5">
                    <div className="col-12">
                        <div className="mb-5 text-center">
                            <Display5745053645/>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
}
