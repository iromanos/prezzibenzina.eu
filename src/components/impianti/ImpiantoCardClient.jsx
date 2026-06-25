'use client'


import React from "react";
import {logDebug} from "@/functions/helpers";
import Button from "react-bootstrap/Button";
import MapIcon from '@mui/icons-material/Map';
import DirectionsIcon from '@mui/icons-material/Directions';
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import {usePreferitiGlobal} from "@/context/PreferitiProvider";

export default function ImpiantoCardClient({
                                               impianto,
                                               apriMappa = true,
                                               vicini = true,
                                               isMobile = false,
                                               onClickPreferiti = null
                                           }) {

    const {
        nome_impianto,
        latitudine,
        longitudine,
    } = impianto;

    const {preferiti, gestisciClickCuore} = usePreferitiGlobal();

    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitudine},${longitudine}`;
    const isPreferito = () => {

        const _r = preferiti.includes(impianto.id_impianto_pb);

        return _r;
    };


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
        logDebug('compare:open');
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
            aria-label={"Apri sulla mappa"}
            onClick={apriSuMappa}
            className="btn btn-primary btn-sm">
            <MapIcon/>
        </Button>}

        <a href={`/impianto/${impianto.link}`}
           className="btn btn-outline-primary btn-sm"
           aria-label={`Naviga verso ${nome_impianto}`}>
            <span className="visually-hidden">Naviga verso {nome_impianto}</span>
            <DirectionsIcon/>
        </a>

        <Button
            aria-label={isPreferito() ? "Rimuovi dai preferiti" : "Aggiungi ai preferiti"}
            onClick={() => {
                gestisciClickCuore(impianto);
            }}
            size={"sm"} variant={isPreferito() ? 'danger' : ''} className={isPreferito() ? null : 'text-danger'}>
            {isPreferito() ? <FavoriteIcon/> : <FavoriteBorderIcon/>}
        </Button>

    </div>

}