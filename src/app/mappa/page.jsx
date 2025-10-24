import {getElencoCarburanti, getImpiantiByDistance, getLocationByIp, getMarchi} from "@/functions/api";
import MappaClient from "@/components/mappe/MappaClient";
import {capitalize, log} from "@/functions/helpers";
import {cookies, headers} from "next/headers";
import {notFound} from "next/navigation";

//TODO: link diretto a Svizzera e Italia

export async function generateMetadata({params, searchParams}) {

    const queryParams = await searchParams;


    const fuel = capitalize(queryParams.carburante || "benzina");
    const brand = capitalize(queryParams.marchio || "");
    // Mappa Prezzi Benzina in Italia - Distributori e Carburanti
    return {
        title: `Mappa Prezzi ${fuel}${brand ? ` - ${brand}` : ""} in Italia - Distributori e Carburanti | PrezziBenzina`,
        description: `Consulta la mappa interattiva dei distributori di ${fuel}${brand ? ` marchio ${brand} ` : ""} in Italia. Prezzi aggiornati per risparmiare sul rifornimento.`,
    };
}

export default async function Mappa({searchParams}) {

    const queryParams = await searchParams;

    log(queryParams);

    const initialFilters = {};

    const fuel = queryParams.carburante || "";

    const elencoCarburanti = getElencoCarburanti();
    log(elencoCarburanti);
    if (fuel !== "") {
        if (elencoCarburanti.filter(c => c.tipo === fuel.toLowerCase()).length === 0) {
            notFound();
        }
        initialFilters.carburante = fuel;
    }


    const brand = queryParams.marchio || "";
    if (brand !== "") {
        const marchi = await getMarchi();
        log(marchi);
        if (marchi.filter(c => c.id === brand.toLowerCase()).length === 0) {
            notFound();
        }
        initialFilters.brand = brand;
    }

    let lat = parseFloat(queryParams.lat);
    let lng = parseFloat(queryParams.lng);
    let posizione = {};

    if (!lat || !lng) {

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
        }
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

    log("DISTRIBUTORI: " + JSON.stringify(posizione));

    const response = await getImpiantiByDistance(posizione.lat, posizione.lng, 30000, initialFilters.carburante, 'price', ckLimite, initialFilters.brand);
    const distributori = await response.json();

    log("MAPPA: BUILD");

    const zoom = queryParams.zoom;

    return <MappaClient
        zoomIniziale={zoom}
        posizione={posizione} distributoriIniziali={distributori} initialFilters={initialFilters}/>;

}
