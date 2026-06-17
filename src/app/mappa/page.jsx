import {getElencoCarburanti, getMarchi} from "@/functions/api";
import MappaClient from "@/components/mappe/MappaClient";
import {capitalize} from "@/functions/helpers";
import {cookies, headers} from "next/headers";
import {notFound} from "next/navigation";
import {getCanonicalUrl} from "@/functions/server";
import {Verticale7119992054} from "@/components/ads/Verticale-7119992054";

//TODO: gestione utenti
//TODO: (MOBILE) quando si effettua la ricerca, eliminare la mappa e inserire solo il campo di ricerca a tutto schermo (stile GMaps)
export async function generateMetadata({params, searchParams}) {

    const queryParams = await searchParams;

    const fuel = capitalize(queryParams.carburante || "benzina");
    const brand = capitalize(queryParams.marchio || "");
    const headersList = await headers();

    const referer = headersList.get('X-WEFUEL-REFERER');

    let title = 'PrezziBenzina';

    if (referer === "wefuel") {
        title = 'WeFuel';
    }

    const canonicalUrl = getCanonicalUrl(headersList) + '/mappa';

    return {
        title: `Mappa Prezzi ${fuel}${brand ? ` - ${brand}` : ""} - Distributori e Carburanti | ` + title,
        description: `Consulta la mappa interattiva dei distributori di ${fuel}${brand ? ` marchio ${brand} ` : ""} in Italia ed Europa. Prezzi aggiornati per risparmiare sul rifornimento.`,
        alternates: {
            canonical: canonicalUrl,
            languages: {
                'it': canonicalUrl,
                'x-default': canonicalUrl,
            },
        },
    };
}

export default async function Mappa({searchParams}) {

    const queryParams = await searchParams;

    console.log(queryParams);

    const initialFilters = {};

    const fuel = queryParams.carburante || "";

    const elencoCarburanti = getElencoCarburanti();
    // log(elencoCarburanti);
    if (fuel !== "") {
        if (elencoCarburanti.filter(c => c.tipo === fuel.toLowerCase()).length === 0) {
            notFound();
        }
        initialFilters.carburante = fuel;
    }


    const brand = queryParams.marchio || "";
    if (brand !== "") {
        const marchi = await getMarchi();
        // log(marchi);
        if (marchi.filter(c => c.id === brand.toLowerCase()).length === 0) {
            notFound();
        }
        initialFilters.brand = brand;
    }

    let lat = parseFloat(queryParams.lat);
    let lng = parseFloat(queryParams.lng);
    let posizione = {};

    if (!lat || !lng) {
        lat = 42.5043;
        lng = 12.5726;
        initialFilters.position = {
            lat: -1,
            lng: -1
        }
    } else {
        initialFilters.position = {
            lat: lat,
            lng: lng
        };
    }

    posizione.lat = lat;
    posizione.lng = lng;

    const cookieStore = await cookies();
    let ckCarburante = cookieStore.get('carburante')?.value;
    let ckLimite = cookieStore.get('limit')?.value;
    if (ckCarburante === undefined) ckCarburante = 'benzina';
    if (ckLimite === undefined) ckLimite = 25;


    if (initialFilters.carburante === undefined) {
        initialFilters.carburante = ckCarburante;
    }

    if (initialFilters.limite === undefined) {
        initialFilters.limite = ckLimite;
    }


    if (posizione.lat === undefined) posizione.lat = 0;
    if (posizione.lng === undefined) posizione.lng = 0;

    console.log("POSIZIONE: ", posizione);

    let zoom = queryParams.zoom;

    if (!zoom) zoom = 5;

    const headersList = await headers();

    const referer = headersList.get('X-WEFUEL-REFERER') || 'pb';

    console.log("REFERER", referer);
    console.log("QUERY PARAMS: ", queryParams);

    return <>
        <div className={'d-flex'}>
            <div className={'col-1 bg-light-subtle border-end d-none d-xl-flex align-items-center'}>
                <div className={'col'}>
                    <Verticale7119992054/>
                </div>
            </div>
            <div className={'col'}>
                <MappaClient
                    client={referer}
                    zoomIniziale={zoom}
                    posizione={posizione}
                    initialFilters={initialFilters}/></div>
        </div>
    </>;

}
