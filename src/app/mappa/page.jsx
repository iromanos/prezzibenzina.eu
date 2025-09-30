import {getElencoCarburanti, getImpiantiByDistance, getMarchi} from "@/functions/api";
import MappaClient from "@/components/mappe/MappaClient";
import {capitalize, log} from "@/functions/helpers";
import {cookies} from "next/headers";
import {notFound} from "next/navigation";


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

    const lat = parseFloat(queryParams.lat);
    const lng = parseFloat(queryParams.lng);

    const posizione = {
        lat: lat ? lat : 45.46,
        lng: lng? lng : 9.19
    };

    const cookieStore = await cookies();
    let ckCarburante = cookieStore.get('carburante')?.value;
    let ckLimite = cookieStore.get('limit')?.value;
    if (ckCarburante === undefined) ckCarburante = 'benzina';
    if (ckLimite === undefined) ckLimite = 25;


    if (initialFilters.carburante === undefined) {
        initialFilters.carburante = ckCarburante;
    }


    const response = await getImpiantiByDistance(posizione.lat, posizione.lng, 10, initialFilters.carburante, 'price', ckLimite, initialFilters.brand);
    const distributori = await response.json();


    log("MAPPA: BUILD");

    return <MappaClient posizione={posizione} distributoriIniziali={distributori} initialFilters={initialFilters}/>;

}
