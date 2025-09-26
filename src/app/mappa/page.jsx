import {getImpiantiByDistance} from "@/functions/api";
import MappaClient from "@/components/mappe/MappaClient";
import {log} from "@/functions/helpers";
import {cookies} from "next/headers";


export default async function Mappa({searchParams}) {

    const params = await searchParams;

    const lat = parseFloat(params.lat);
    const lng = parseFloat(params.lng);

    const posizione = {
        lat: lat ? lat : 45.46,
        lng: lng? lng : 9.19
    };

    const cookieStore = await cookies();
    let ckCarburante = cookieStore.get('carburante')?.value;
    let ckLimite = cookieStore.get('limit')?.value;

    if (ckCarburante === undefined) ckCarburante = 'benzina';
    if (ckLimite === undefined) ckLimite = 50;
    const response = await getImpiantiByDistance(posizione.lat, posizione.lng, 10, ckCarburante, 'price', ckLimite);

    const distributori = await response.json();


    log("MAPPA: BUILD");

    return <MappaClient posizione={posizione} distributoriIniziali={distributori}/>;

}
