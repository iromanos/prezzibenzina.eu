import ImpiantoScheda from '@/components/impianti/ImpiantoScheda';
import {getImpianto} from "@/functions/api";
import {log} from "@/functions/helpers";
import Header from "@/components/Header";
import {getCookie} from "@/functions/cookies";
import {getCanonicalUrl, getOpenGraph, getTwitter} from "@/functions/server";
import {headers} from "next/headers";

export async function generateMetadata({params}) {
    const res = await getImpianto({params});
    const impianto = await res.json();
    const imageUrl = '/assets/logo-og.png';

    const title = `${impianto.nome_impianto} – ${impianto.comune} | PrezziBenzina.eu`;
    const description = `Prezzi aggiornati per ${impianto.nome_impianto} a ${impianto.comune}. Consulta mappa, orari, carburanti e confronta con i vicini.`;
    const headerList = headers();

    const canonicalUrl = getCanonicalUrl(headerList) + '/impianto/' + params.impianto;


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
        openGraph: getOpenGraph(headerList, title, description, imageUrl),
        twitter: getTwitter(title, description, imageUrl),

    };
}

export default async function Page({params}) {

    const res = await getImpianto({params});
    const impianto = await res.json();
    const cookie = await getCookie();

    log(impianto);
    log(cookie);

    return <><Header/>
        <ImpiantoScheda impianto={impianto} cookie={cookie}/></>;
}
