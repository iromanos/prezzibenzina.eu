import {getElencoCarburanti, getImpiantiByDistance, getMarchi} from "@/functions/api";
import MappaClient from "@/components/mappe/MappaClient";
import {capitalize} from "@/functions/helpers";
import {cookies, headers} from "next/headers";
import {notFound} from "next/navigation";
import {getCanonicalUrl} from "@/functions/server";

//TODO: link diretto a Svizzera e Italia
//TODO: quando cambia la posizione aggiorna il titolo della pagina
//TODO: quando cambia la posizione aggiorna il campo di ricerca con l'indirizzo
//TODO: quando cambia il filtro aggionna url della pagina
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

    // Mappa Prezzi Benzina in Italia - Distributori e Carburanti
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

    // log(queryParams);

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
        /*
        //TODO va in timeout
        let ip = '185.180.180.225';
        try {
            const h = await headers();
            const forwarded = h.get('x-forwarded-for');
            ip = forwarded?.split(',')[0]?.trim() || '8.8.8.8';
            if (ip === '::1' || !ip) {
                ip = '185.180.180.225';
            }
            const json = await getLocationByIp(ip);
            lat = json.lat;
            lng = json.lon;
        } catch (e) {
        }*/
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

    console.log("POSIZIONE: " + JSON.stringify(posizione));

    let distributori = [];

    if (posizione.lat !== null && posizione.lng !== null) {

        const response = await getImpiantiByDistance(
            {
                lat: posizione.lat,
                lng: posizione.lng,
                distance: 30000,
                carburante: initialFilters.carburante,
                sort: 'price',
                limit: 10,
                brand: initialFilters.brand
            });
        distributori = await response.json();
        console.log("DISTRIBUTORI: " + distributori.length);
    }
    // log(distributori);

    // log("MAPPA: BUILD");

    let zoom = queryParams.zoom;

    if (!zoom) zoom = 5;

    const headersList = await headers();

    const referer = headersList.get('X-WEFUEL-REFERER');

    console.log("REFERER: " + referer);
    console.log("QUERY PARAMS: " + JSON.stringify(queryParams));

    return <MappaClient
        client={referer}
        zoomIniziale={zoom}
        posizione={posizione}
        distributoriIniziali={distributori}
        initialFilters={initialFilters}/>;

}
