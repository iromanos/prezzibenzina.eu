import DistributoriPage from "@/components/DistributoriPage";
import React from "react";
import {generateMicrodataGraph, getLink, log, ucwords} from "@/functions/helpers";
import {getCarburanti, getDistributoriRegione, getMarchi, getSeoRegione} from "@/functions/api";
import {notFound} from "next/navigation";


export async function generateMetadata({params}) {
    return getMetadataMilano({params});
}


export default async function Page({params}) {

    const record = await params;

    record.comune = "milano";


    return <DistributoriPage params={record}/>

}

export async function getMetadataMilano({params}) {
    const {regione, carburante, marchio, sigla} = await params;

    const comune = "milano";

    const carburanti = getCarburanti();
    const elencoMarchi = await getMarchi();

    if (carburanti[carburante] === undefined) {
        notFound();
    }

    if (marchio !== undefined) {
        if (elencoMarchi.filter(m => m.id === marchio).length === 0) {
            notFound();
        }
    }

    const response = await getDistributoriRegione(regione, carburante, marchio, sigla, comune);
    const riepilogo = await getSeoRegione(regione, carburante, marchio, sigla, comune);


    log(riepilogo);

    const date = new Date(riepilogo.dataAggiornamento);

    const dateFormatted = new Intl.DateTimeFormat('it-IT', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }).format(date);


    const distributori = await response.json();

    const descrizioneCarburante = carburante ? carburante.toLowerCase() : 'carburante';

    const localizzazione = comune
        ? `a ${ucwords(riepilogo.request.comune.description)}, ${sigla?.toUpperCase()}`
        : sigla
            ? `in provincia di ${sigla.toUpperCase()}`
            : `in ${ucwords(regione)}`;

    const descrizioneMarchio = marchio ? ` ${marchio.toUpperCase()}` : '';

    const titolo = `${ucwords(descrizioneCarburante)} ${localizzazione}${descrizioneMarchio}: scopri i distributori più economici oggi [${dateFormatted}]`;

    const stats = riepilogo.carburanti[carburante] || {};

    const prezzoMinimo = stats.min;

    const descrizione = `Consulta i prezzi di ${carburante} ${localizzazione}${descrizioneMarchio} in tempo reale. 
    Trova i distributori più conveniente tra ${riepilogo.totaleImpianti} impianti, a partire da ${prezzoMinimo} €/L. Dati ufficiali MIMIT aggiornati al ${dateFormatted}`;

    const canonicalUrl = getLink(regione, carburante, marchio, sigla, riepilogo.request.comune);
    const imageUrl = '/assets/logo.png';

    log("CANONICAL URL: " + canonicalUrl.link);

    const microdata = generateMicrodataGraph(distributori);

    return {
        other: {
            'application/ld+json': JSON.stringify(microdata),
        },
        title: titolo,
        description: descrizione,
        alternates: {
            canonical: canonicalUrl.link,
            languages: {
                'it': canonicalUrl.link,
                'x-default': canonicalUrl.link,
            },
        },
        openGraph: {
            title: titolo,
            description: descrizione,
            url: canonicalUrl.link,
            siteName: 'PrezziBenzina.eu',

            images: [
                {
                    url: imageUrl,
                    width: 1200,
                    height: 630,
                    alt: titolo,
                },
            ],
            locale: 'it_IT',
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: titolo,
            description: descrizione,
            images: [imageUrl],
        },
    };

}
