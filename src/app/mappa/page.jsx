import {getImpiantiByDistance} from "@/functions/api";
import MappaClient from "@/components/mappe/MappaClient";
import {log} from "@/functions/helpers";


export default async function Mappa({searchParams}) {

    const params = await searchParams;

    const lat = parseFloat(params.lat);
    const lng = parseFloat(params.lng);

    const posizione = {
        lat: lat ? lat : 45.46,
        lng: lng? lng : 9.19
    };


    const response = await getImpiantiByDistance(posizione.lat, posizione.lng, 10, 'benzina', 'price', 30);

    const distributori = await response.json();


    log("MAPPA: BUILD");

    return <MappaClient posizione={posizione} distributoriIniziali={distributori}/>;

}
