import ImpiantoScheda from '@/components/impianti/ImpiantoScheda';
import {getImpianto} from "@/functions/api";
import Header from "@/components/Header";
import {getCookie} from "@/functions/cookies";
import {getCanonicalUrl, getOpenGraph, getTwitter} from "@/functions/server";
import {headers} from "next/headers";
import {notFound, redirect} from "next/navigation";
import {logDebug, ucwords} from "@/functions/helpers";

export async function generateMetadata({params}) {

    const query = await params;

    const impianto = await getImpianto({query});

    if (impianto === null) {
        notFound();
    }

    const imageUrl = '/assets/logo-og.png';


    let nomeImpianto = impianto.nome_impianto.toLowerCase() + ' - ' + impianto.gestore;

    nomeImpianto = nomeImpianto.replace(impianto.comune.toLowerCase(), '');

    nomeImpianto = ucwords(nomeImpianto);

    const title = `${nomeImpianto} – ${impianto.comune} | PrezziBenzina.eu`;
    const description = `Prezzi aggiornati per il distributore ${nomeImpianto} a ${impianto.comune}. Consulta mappa, orari, carburanti e confronta con i vicini.`;
    const headerList = headers();

    const canonicalUrl = getCanonicalUrl(await headerList) + '/impianto/' + impianto.link;

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
        openGraph: getOpenGraph(await headerList, title, description, imageUrl),
        twitter: getTwitter(title, description, imageUrl),

    };
}

export default async function Page({params}) {

    const start = performance.now();
    const headersList = await headers();
    const pathname = headersList.get('x-url') || headersList.get('x-matched-path') || '';


    const query = await params;

    const impianto = await getImpianto({query});

    if (impianto === null) {
        notFound();
    }

    if (impianto.link !== query.impianto) {
        // console.log(`Link impianto (${impianto.link}) non corrisponde a query (${query.impianto}). Reindirizzamento necessario.`);
        redirect('/impianto/' + impianto.link);
    }

    const cookie = await getCookie();

    logDebug(impianto);

    // console.log(impianto.servizi);
    const end = performance.now();
    const serverDuration = (end - start).toFixed(2);

    const timestamp = new Date().toLocaleString('it-IT', {timeZone: 'Europe/Rome'});
    console.log(`[${timestamp}] [Server Render] ${pathname}: ${serverDuration}ms`);

    return <><Header/>
        <ImpiantoScheda impianto={impianto} cookie={cookie}/></>;
}
