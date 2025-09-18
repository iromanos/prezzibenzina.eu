'use client'


import React from "react";
import {log} from "@/functions/helpers";

export default function ImpiantoCardClient({impianto, apriMappa = true}) {

    const {
        nome_impianto,
        latitudine,
        longitudine,
        link,
    } = impianto;

    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitudine},${longitudine}`;
    const schedaUrl = `/impianto/${link}`;

    const apriSuMappa = () => {
        window.dispatchEvent(new CustomEvent('map:focus', {
            detail: {
                lat: impianto.latitudine,
                lng: impianto.longitudine,
                zoom: 15,
                id: impianto.id_impianto,
            }
        }));
    };

    const confrontaVicini = () => {
        log('compare:open');
        window.dispatchEvent(new CustomEvent('compare:open', {
            detail: {
                lat: impianto.latitudine,
                lng: impianto.longitudine,
                id: impianto.id_impianto,
                radius: 2,
            }
        }));
    };

    return <>
        {apriMappa ?
            <button

                onClick={apriSuMappa}

                className="btn btn-primary btn-sm"
                aria-label={`Apri ${impianto.nome_impianto} sulla mappa`}>
                Apri sulla mappa
            </button> : null}

        <a href={mapsUrl} target="_blank" rel="noopener"
           className="btn btn-outline-secondary btn-sm"
           aria-label={`Naviga verso ${nome_impianto}`}>
            Vai con Google Maps
        </a>
        <button className="btn btn-outline-primary btn-sm"
                onClick={confrontaVicini}
            //onClick={() => window.dispatchEvent(new CustomEvent('compare:open', { detail: impianto }))}
        >
            Confronta vicini
        </button>

        <button className="btn btn-link btn-sm p-0"
            //onClick={() => window.dispatchEvent(new CustomEvent('alert:open', { detail: impianto }))}

        >
            Avvisami se scende sotto…
        </button>

        <a href={schedaUrl} className="btn btn-link btn-sm p-0 text-decoration-underline">
            Scheda impianto
        </a>

    </>

}