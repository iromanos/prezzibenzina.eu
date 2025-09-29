import axios from "axios";
import {NextResponse} from "next/server";
import {log} from "@/functions/helpers";
import {deprecatedPropType} from "@mui/material";
import LocalGasStationIcon from "@mui/icons-material/LocalGasStation";
import PropaneIcon from "@mui/icons-material/Propane";
import BubbleChartIcon from "@mui/icons-material/BubbleChart";
import EvStationIcon from "@mui/icons-material/EvStation";

const URI = process.env.NEXT_PUBLIC_API_ENDPOINT + '/pb/';

@deprecatedPropType()
const Carburanti = {
    'benzina': '1-x',
    'diesel': '2-x',
    'metano': '3-x',
    'gpl': '4-x',
};

export function getCarburanti() {
    return Carburanti;
}

export async function getMarchi() {
    const response = await fetch(URI + 'marchi', {
        method: 'GET',
        headers: {
            Accept: 'application/json',
        },
    });

    return response.json();
}

export function getElencoCarburanti() {
    const r = [];

    r.push({
        id: '1-x',
        tipo: 'benzina',
        icon: <LocalGasStationIcon/>,
        fuel_id: 1
    });

    r.push({
        id: '2-x',
        tipo: 'diesel',
        icon: <EvStationIcon/>,
        fuel_id: 2
    });

    r.push({
        id: '3-x',
        tipo: 'metano',
        icon: <BubbleChartIcon/>,
        fuel_id: 3
    });

    r.push({
        id: '4-x',
        tipo: 'gpl',
        icon: <PropaneIcon/>,
        fuel_id: 4
    });

    return r;
}

export async function getImpianto({params}) {
    let request = URI + `impianto/${params.impianto}`;

    log(request);

    return await fetch(request, {
        headers: {
            Accept: 'application/json',
        },
        next: {revalidate: 3600},
    });

}

export async function getSiteMap({tipo, regione, provincia}) {


    let request = URI + 'sitemap/' + tipo;

    if (regione) {
        request += "?regione=" + regione;

        if (provincia) {
            request += "&provincia=" + provincia;
        }
    }

    log(tipo);
    log(regione);
    log(request);

    const res = await fetch(request);

    const xml = await res.text();


    return new NextResponse(xml, {
            headers: {
                'Content-Type': 'application/xml',
                'Cache-Control': 'no-cache',
                'Last-Modified': new Date().toUTCString(),
            }
        }
    );
}

export async function getDistributoriRegione(regione, carburante, marchio, provincia, comune) {

    let fuel = '';
    if (carburante === 'benzina') fuel = '1-x';
    if (carburante === 'diesel') fuel = '2-x';
    if (carburante === 'metano') fuel = '3-x';
    if (carburante === 'gpl') fuel = '4-x';

    let request = URI + "prezzi/r/" + regione + "/" + fuel;

    if (provincia) {
        request = URI + "prezzi/p/" + provincia + "/" + fuel;
    }

    if (comune) {
        request = URI + "prezzi/c/" + comune + "/" + fuel;
    }

    if (marchio) {
        request += "?marchio=" + marchio;
    }
    log(request);

    const res = await fetch(request, {
        headers: {
            Accept: 'application/json',
        },
        next: {revalidate: 3600},
    });

    const data = await res.json();

    // log(data);

    const response = NextResponse.json(data);
    response.headers.set('Last-Modified', new Date(data.lastUpdate).toUTCString());
    response.headers.set('Cache-Control', 'no-cache');

    return response;

//    return data;
}

export async function getSeoRegione(regione, carburante, marchio, provincia, comune) {

    let fuel = null;
    if (carburante === 'benzina') fuel = '1-x';
    if (carburante === 'diesel') fuel = '2-x';
    if (carburante === 'metano') fuel = '3-x';
    if (carburante === 'gpl') fuel = '4-x';


    let request = URI + `seo/regione/${regione}?`;

    if (fuel) {
        request += `fuel=${fuel}&`;
    }

    if (provincia) {
        request += `provincia=${provincia}&`;
    }

    if (comune) {
        request += `comune=${comune}&`;
    }

    if(marchio) {
        request += `marchio=${marchio}&`;
    }
    log(request);

    const res = await axios.get(request);

    // console.log(res.data);

    return res.data;

}

export async function getImpiantiByDistance(lat, lng, distance, carburante, sort, limit = 100, brand = null) {

    const fuel = Carburanti[carburante];

    let request = URI + `impianti/distanza?lat=${lat}&lng=${lng}&distance=${distance}&fuel=${fuel}&sort=${sort}&limit=${limit}`;

    if (brand !== null) request += `&brand=${brand}`;

    log(request);

    return await fetch(request, {
        method: 'GET',
        headers: {
            Accept: 'application/json',
        },
        next: {revalidate: 3600},
    });

}

export async function getImpiantiByBounds(bounds, carburante, sort = 'price', limit = 5, brand = null) {

    const carburanti = getCarburanti();

    const fuel = carburanti[carburante];

    log(bounds);

    let request = URI + `impianti/mappa`;

    log(request);

//    limit = 100;


    return await fetch(request, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
        },
        body: JSON.stringify({
            'fuel': fuel,
            'bounds': bounds,
            'sort': sort,
            'limit': limit,
            'brand': brand
        })
    });

}

export async function getRouteByPosition(payload) {

    const request = URI + 'route';

    return await fetch(request, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
        },
        body: JSON.stringify(payload),
    });

}