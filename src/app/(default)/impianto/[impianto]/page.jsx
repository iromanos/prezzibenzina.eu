import ImpiantoScheda from '@/components/impianti/ImpiantoScheda';
import {getImpianto} from "@/functions/api";
import Header from "@/components/Header";
import {getCookie} from "@/functions/cookies";
import {getOpenGraph, getTwitter} from "@/functions/server";
// import {headers} from "next/headers";
import {notFound, redirect} from "next/navigation";
import {ucwords} from "@/functions/helpers";

export const revalidate = 300;

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

    console.log(impianto);

    return <><Header/>
        <ImpiantoScheda impianto={impianto} cookie={cookie}/></>;
}
