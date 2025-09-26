import {useMemo} from 'react';
import {log} from "@/functions/helpers";

function distanzaKm(lat1, lng1, lat2, lng2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function raggruppaImpianti(impianti, sogliaKm = 0.5) {
    const gruppi = [];

    for (const impianto of impianti) {
        let assegnato = false;

        for (const gruppo of gruppi) {
            const centro = gruppo[0];
            const distanza = distanzaKm(centro.latitudine, centro.longitudine, impianto.latitudine, impianto.longitudine);
            if (distanza <= sogliaKm) {
                gruppo.push(impianto);
                assegnato = true;
                break;
            }
        }

        if (!assegnato) gruppi.push([impianto]);
    }

    return gruppi;
}

function getCentroide(gruppo) {
    const lat = gruppo.reduce((sum, i) => sum + i.latitudine, 0) / gruppo.length;
    const lng = gruppo.reduce((sum, i) => sum + i.longitudine, 0) / gruppo.length;
    return {lat, lng};
}

function getPrezzoMedio(gruppo, tipo) {
    const validi = gruppo.filter(i => i.prezzo);
    if (validi.length === 0) return null;
    const somma = validi.reduce((sum, i) => sum + i.prezzo, 0);
    return (somma / validi.length).toFixed(3);
}

function getSogliaKmPerZoom(zoom) {
    if (zoom >= 16) return 0.2;   // molto zoomato → cluster stretti (~200m)
    if (zoom >= 14) return 0.4;
    if (zoom >= 12) return 0.8;
    return 2.0;                   // panoramica → cluster larghi (~3km)
}

export default function useClusterMarkers(impianti, tipoCarburante = 'benzina', zoom = 14) {

    log("Zoom: " + zoom);

    const sogliaKm = getSogliaKmPerZoom(zoom);
    log(sogliaKm);
    return useMemo(() => {
        const gruppi = raggruppaImpianti(impianti, sogliaKm);

        return gruppi.map((gruppo) => {
            const centro = getCentroide(gruppo);
            const prezzo = getPrezzoMedio(gruppo, tipoCarburante);
            return {
                latitudine: centro.lat,
                longitudine: centro.lng,
                count: gruppo.length,
                prezzoMedio: prezzo,
                impianti: gruppo
            };
        });
    }, [impianti, tipoCarburante, sogliaKm]);
}
