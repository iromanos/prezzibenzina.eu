import ImpiantoScheda from '@/components/impianti/ImpiantoScheda';
import {getImpianto} from "@/functions/api";
import Header from "@/components/Header";
import {getCookie} from "@/functions/cookies";
import {getOpenGraph, getTwitter} from "@/functions/server";
import {headers} from "next/headers"; // Re-importa headers per Server Component
import {notFound, redirect} from "next/navigation";
import {ucwords} from "@/functions/helpers";
import {
    BsCreditCard,
    BsCupHot,
    BsDroplet,
    BsExclamationTriangle,
    BsPCircle,
    BsPersonWheelchair,
    BsTools,
    BsWater
} from "react-icons/bs";
import React from "react";
import Display5745053645 from "@/components/ads/Display-5745053645";
import Link from "next/link";
import slugify from "slugify";
import {FaBaby, FaCarSide, FaChargingStation, FaWifi} from "react-icons/fa6";
import ImpiantoNotifyButton from '@/components/impianti/ImpiantoNotifyButton';
import {StatisticheWrapper} from "@/components/statistiche/StatisticheChart.jsx"; // Importa il nuovo componente

export const revalidate = 300;

const SERVIZI_ICON_COMPONENTS = {
    'bi bi-cup-hot': BsCupHot,
    'bi bi-tools': BsTools,
    'bi bi-p-circle': BsPCircle,
    'bi bi-water': BsWater,
    'fa-solid fa-baby': FaBaby,
    'bi bi-credit-card': BsCreditCard,
    'bi-person-wheelchair': BsPersonWheelchair,
    'fa-solid fa-wifi': FaWifi,
    'fa-solid fa-car-side': FaCarSide,
    'bi bi-droplet': BsDroplet,
    'fa-solid fa-charging-station': FaChargingStation,
};

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
    let cleanNome = lowerNome.replace(lowerBandiera, '').replace(lowerComune, '').trim();
    const finalNomeImpianto = ucwords(`${lowerBandiera} ${cleanNome}`.trim());
    let fuelsList = impianto.prezzi
        ?.map(f => f.desc_carburante)
        .filter((value, index, self) => self.indexOf(value) === index) // Rimuove duplicati
    const titleFuels = fuelsList?.length > 3 ? fuelsList.slice(0, 3).join(', ') + '...' : fuelsList?.join(', ');
    const availableFuels = fuelsList?.join(', ');
    const title = `Prezzo ${titleFuels || 'Carburante'} ${finalNomeImpianto} a ${impianto.comune} | PrezziBenzina.eu`;
    const description = `Prezzi aggiornati per ${availableFuels || 'Benzina, Diesel, Metano e GPL'} al distributore ${finalNomeImpianto} a ${impianto.comune}. Consulta mappa, orari, servizi e confronta i prezzi oggi.`;
    const canonicalUrl = process.env.NEXT_PUBLIC_BASE_URL + '/impianto/' + impianto.link;
    const headerList = headers(); // Chiamata a headers() per getCanonicalUrl
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

export default async function Page({params}) { // Re-aggiunto async
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

    // console.log("ICONE", SERVIZI_ICON_COMPONENTS);
    // console.log(impianto);

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
                <div className={'container'}>
                    <div className="card mb-4">
                        <div className="card-body">
                            <h5 className="card-title">Andamento del prezzo della {cookie.carburante}</h5>
                            <StatisticheWrapper filters={{
                                desc_carburante: cookie.carburante,
                                livello_geo: 'distributore',
                                codice_geo: impianto.id_impianto,
                            }}/>
                        </div>
                    </div>
                </div>
                <ImpiantoNotifyButton
                    impiantoId={impianto.id_impianto}
                    defaultFuelType={cookie.carburante}
                />

                {/* CTA alla pagina di segnalazione */}
                <div className="my-4 d-flex justify-content-center">
                    <Link href={`/impianto/${impianto.link}/segnala`}
                          className="btn btn-light btn-sm border text-secondary px-4 rounded-pill shadow-sm hover-shadow transition-all">
                        <BsExclamationTriangle className="me-2 text-danger"/>
                        Hai trovato un errore? <span className="fw-bold text-dark ms-1">Segnalalo qui</span>
                    </Link>
                </div>

                {impianto.elencoServizi &&
                    <div className={'container'}>
                    <section className="mb-5 p-4 bg-light rounded border ">
                    <h3 className="h6 fw-bold text-uppercase text-muted mb-3">Cerca altro a {impianto.comune}</h3>
                    <div className="d-flex flex-wrap gap-2">
                        {impianto.elencoServizi.map((service) => {

                            console.log(service.icona);

                            const IconComponent = SERVIZI_ICON_COMPONENTS[service.icona];

                            return (
                                <Link
                                    key={service.id}
                                    href={`/distributori/${service.slug !== '' ? service.slug : slugify(service.description.toLowerCase())}/${impianto.impiantoComune.id}`}
                                    className="btn btn-white bg-white btn-sm border rounded-pill shadow-sm d-flex align-items-center hover-shadow transition-all px-3"
                                >
                                    {IconComponent && <IconComponent className="me-2"/>}{service.description}
                                </Link>
                            );
                        })}
                    </div>
                    </section>
                    </div>
                }

                <div className={'container'}>
                    <Display5745053645/>
                </div>
            </main>
        </div>
    );
}