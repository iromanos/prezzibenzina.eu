'use client'


import React from "react";
import {log} from "@/functions/helpers";

export default function ImpiantoCardClientVer2({impianto, apriMappa = true}) {

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
                zoom: 16,
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

    return <div className={'d-flex gap-2 flex-wrap align-items-center'}>
        {apriMappa ?
            <button

                onClick={apriSuMappa}

                className="btn btn-primary btn-sm"
                aria-label={`Apri ${impianto.nome_impianto} sulla mappa`}>
                Apri sulla mappa
            </button> : null}
        <button className="btn btn-outline-primary btn-sm"
                onClick={confrontaVicini}>
            Confronta vicini
        </button>

        <a href={mapsUrl} target="_blank" rel="noopener"
           className="small"
           aria-label={`Naviga verso ${nome_impianto}`}>
            Vai con Google Maps
        </a>

        {/*<button className="btn btn-link btn-sm p-0"*/}
        {/*    //onClick={() => window.dispatchEvent(new CustomEvent('alert:open', { detail: impianto }))}*/}

        {/*>*/}
        {/*    Avvisami se scende sotto…*/}
        {/*</button>*/}
        {impianto.stato === "IT" &&

        <a href={schedaUrl} className="text-decoration-underline small">
            Scheda impianto
        </a>}

    </div>

}