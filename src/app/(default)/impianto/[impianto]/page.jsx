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

    // console.log(impianto);

    return <><Header/>
        <ImpiantoScheda impianto={impianto} cookie={cookie}/></>;
}
