'use client'


import React from "react";
import {log} from "@/functions/helpers";
import Button from "react-bootstrap/Button";
import MapIcon from '@mui/icons-material/Map';
import DirectionsIcon from '@mui/icons-material/Directions';

export default function ImpiantoCardClient({impianto, apriMappa = true, vicini = true, isMobile = false}) {

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
                zoom: 14,
                id: impianto.id_impianto,
                impianto: impianto
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
                radius: 2000,
            }
        }));
    };

    return <div className={'d-flex gap-2 flex-wrap align-items-center'}>
        {apriMappa && isMobile && <Button
            onClick={apriSuMappa}
            className="btn btn-primary btn-sm">
            <MapIcon/>
        </Button>}
        {apriMappa && isMobile === false ?
            <button
                onClick={apriSuMappa}
                className="btn btn-primary btn-sm"
                aria-label={`Apri ${impianto.nome_impianto} sulla mappa`}>
                Apri sulla mappa
            </button> : null}
        {vicini &&
        <button className="btn btn-outline-primary btn-sm"
                onClick={confrontaVicini}>
            Confronta vicini
        </button>}

        <a href={mapsUrl} target="_blank" rel="noopener"
           className="btn btn-outline-primary btn-sm"
           aria-label={`Naviga verso ${nome_impianto}`}>
            <DirectionsIcon/> Naviga
        </a>
        {impianto.stato !== "AT" &&
            <a href={schedaUrl} className="btn btn-link btn-sm">
                Scheda
        </a>}

    </div>

}