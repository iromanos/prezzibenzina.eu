import axios from "axios";
import {NextResponse} from "next/server";
import {logDebug} from "@/functions/helpers";
import {deprecatedPropType} from "@mui/material";
import LocalGasStationIcon from "@mui/icons-material/LocalGasStation";
import PropaneIcon from "@mui/icons-material/Propane";
import BubbleChartIcon from "@mui/icons-material/BubbleChart";
import EvStationIcon from "@mui/icons-material/EvStation";
import PublicIcon from "@mui/icons-material/Public";
import {cache} from "react";

export const URI = process.env.NEXT_PUBLIC_API_ENDPOINT + '/pb/';

export const INTERNAL_URI = process.env.INTERNAL_API_URL + '/pb/';

@deprecatedPropType()
const Carburanti = {
    'benzina': '1-x',
    'diesel': '2-x',
    'metano': '3-x',
    'gpl': '4-x',
};


export async function getPrezzoMedioByComune(comune, fuel) {

    const response = await axios.post(URI + 'comune/medio', {
        comune: comune,
        fuel: fuel,
    });

    return response.data;

}


export async function postCookie(data) {
    const response = await axios.post('/api/set-cookie', data);
}

export async function fetchImpiantiByRoute(data, tipo_impianto, servizi) {
    const coords = data.features[0].geometry.coordinates;

    // console.log('IMPIANTI REQUEST');

    const response = await axios.post(process.env.NEXT_PUBLIC_API_ENDPOINT + '/api/route/poi', {
        steps: coords,
        fuel: 1,
        order: 'price',
        limit: 10,
        servizi: [],
        // tipoImpianto: tipo_impianto
    });

    return response.data;
}

export async function getDrivingCar(payload) {

    const response = await fetch('/api/pb/directions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    return response.json();

}

export async function getPreferiti(impianti) {

    const body = {
        ids: impianti
    };

    const response = await fetch(process.env.NEXT_PUBLIC_API_ENDPOINT + '/pb/preferiti-guest', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify(body)
    });

    return response.json();

}

export function getElencoStati() {
    const r = [];

    r.push({
        id: 'it',
        name: 'Italia',
        icon: <span className="fi fi-it"/>,
        lat: 42.5043,
        lng: 12.5726,
        zoom: 5,
        key: 'italia'
    });

    r.push({
        id: 'ch',
        name: 'Svizzera',
        icon: <span className="fi fi-ch"/>,
        lat: 46.74050975478198,
        lng: 8.178787663331718,
        zoom: 6.80,
        key: 'svizzera'
    });

    r.push({
        id: '--',
        name: 'Tutti',
        icon: <PublicIcon/>,
        lat: 42.5043,
        lng: 12.5726,
        zoom: 4.8,
        key: 'tutti'
    });

    return r;
}

export async function getNominatimReverse(position) {
    const uri = "https://nominatim.openstreetmap.org/reverse?format=json&lat=" + position.lat + "&lon=" + position.lon;
    const response = await fetch(uri);
    logDebug(uri);
    logDebug(response);

    return response.json();
}

export async function getLocationByIp(ip) {
    const response = await fetch(`http://ip-api.com/json/${ip}`);
    return response.json();
}

export function getCarburanti() {
    return Carburanti;
}

export async function getServizi() {
    return cacheFetch(INTERNAL_URI + 'servizi');
}

export async function getMarchi() {
    return cacheFetch(URI + 'marchi');
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

export async function getImpianto({query}) {
    let request = URI + `impianto/${query.impianto}`;

    logDebug(request);

    return await cacheFetch(request);

}

export async function getSiteMap({tipo, regione, provincia}) {


    let request = URI + 'sitemap/' + tipo;

    if (regione) {
        request += "?regione=" + regione;

        if (provincia) {
            request += "&provincia=" + provincia;
        }
    }

    logDebug(tipo);
    logDebug(regione);
    logDebug(request);

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

const cacheFetch = cache(async (url) => {
    const res = await fetch(url, {
        headers: {Accept: 'application/json'},
        next: {revalidate: 300}
    });
    return res.json();
});

export async function getDistributoriRegione(regione, carburante, marchio, provincia, comune, servizio) {

    let fuel = '';
    if (carburante === 'benzina') fuel = '1-x';
    if (carburante === 'diesel') fuel = '2-x';
    if (carburante === 'metano') fuel = '3-x';
    if (carburante === 'gpl') fuel = '4-x';

    let request = INTERNAL_URI + "prezzi/r/" + regione + "/" + fuel;

    if (provincia) {
        request = INTERNAL_URI + "prezzi/p/" + provincia + "/" + fuel;
    }

    if (comune) {
        request = INTERNAL_URI + "prezzi/c/" + comune + "/" + fuel;
    }

    if (marchio) {
        request += "?marchio=" + marchio;
    }

    if (servizio) {
        if (marchio) {
            request += "&servizio=" + servizio;
        } else request += "?servizio=" + servizio;
    }


    return cacheFetch(request);
}

export async function getSeoRegioneEstera(stato, regione, carburante) {
    let fuel = null;
    if (carburante === 'benzina') fuel = '1-x';
    if (carburante === 'diesel') fuel = '2-x';
    if (carburante === 'metano') fuel = '3-x';
    if (carburante === 'gpl') fuel = '4-x';

    const request = URI + `seo/estero`;

    const body = {
        'fuel': fuel,
        // 'bounds': bounds,
        // 'sort': sort,
        // 'limit': limit,
        // 'brand': brand,
        'stato': stato
    };

    return await fetch(request, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify(body)
    });


}

export async function getSeoRegione(regione, carburante, marchio, provincia, comune) {

    let fuel = null;
    if (carburante === 'benzina') fuel = '1-x';
    if (carburante === 'diesel') fuel = '2-x';
    if (carburante === 'metano') fuel = '3-x';
    if (carburante === 'gpl') fuel = '4-x';


    let request = INTERNAL_URI + `seo/regione/${regione}?`;

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

    return cacheFetch(request);

}

export async function getMediaByBounds({
                                           lat,
                                           lng,
                                           distance,
                                           carburante,
                                           sort,
                                           limit = 100,
                                           brand = null,
                                           bounds = null,
                                           stato = null
                                       }) {
    const fuel = Carburanti[carburante];

    let request = URI + "impianti/media";

    const body = {
        'lat': lat,
        'lng': lng,
        'fuel': fuel,
        'bounds': bounds,
        'sort': sort,
        'limit': 2000,
        'brand': brand,
    };

    return await fetch(request, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Internal-Secret': '0CD6ED9B-9DAC-4E30-962E-EB16F03F6207'
        },
        body: JSON.stringify(body)
    });
}


export async function getImpiantiByDistance({
                                                lat,
                                                lng,
                                                distance,
                                                carburante,
                                                sort,
                                                limit = 100,
                                                brand = null,
                                                bounds = null,
                                                stato = null
                                            }) {

    const fuel = Carburanti[carburante];

    let request = URI + "impianti/distanza";

    const body = {
        'lat': lat,
        'lng': lng,
        'distance': distance,
        'fuel': fuel,
        'bounds': bounds,
        'sort': sort,
        'limit': limit,
        'brand': brand,
        'stato': stato
    };

    return await fetch(request, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Internal-Secret': '0CD6ED9B-9DAC-4E30-962E-EB16F03F6207'
        },
        body: JSON.stringify(body)
    });

}

export async function getImpiantiByBounds(bounds, carburante, sort = 'price', limit = null, brand = null, bounds_prev = null) {

    const carburanti = getCarburanti();

    const fuel = carburanti[carburante];

    logDebug(bounds);

    let request = URI + `impianti/stream`;

    logDebug(request);

    return await fetch(request, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify({
            'fuel': fuel,
            'bounds': bounds,
            'sort': sort,
            'limit': limit,
            'brand': brand,
            'bounds_prev': bounds_prev
        })
    });

}


export async function getClustersByBounds(bounds, carburante, sort = 'price', limit = null, brand = null, bounds_prev = null) {

    const carburanti = getCarburanti();

    const fuel = carburanti[carburante];

    logDebug(bounds);

    let request = URI + `impianti/stream`;

    logDebug(request);

    return await fetch(request, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify({
            'fuel': fuel,
            'bounds': bounds,
            'sort': sort,
            'limit': limit,
            'brand': brand,
            'bounds_prev': bounds_prev
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