'use client'

import React, {useRef, useState} from "react";
import MapIcon from "@mui/icons-material/Map";

import Button from 'react-bootstrap/Button';
import MappaRisultati from "./mappe/MappaRisultati";

export default function Mappa({
                                  distributori,
                                  posizione,
                                  title = true,
                                  carburante,
                                  limit = 10,
                                  stato = null,
                                  bounds = null,
                                  titolo = "Mappa dei distributori"
                              }) {

    const containerRef = useRef(null);
    const [isVisible, setIsVisible] = useState(true);

    const [state, setState] = useState();

    return <section className={"mb-4"}>
        {title ? <h2 className="h6 mb-3 text-uppercase">{titolo}</h2> : null}
        <div ref={containerRef} className={'border rounded position-relative mb-4 vh-75'}>
            {isVisible ? <><MappaRisultati
                cooperativeGestures={false}
                showPositionButton={false}
                isReadOnly={true}
                stato={stato}
                zoomLimit={posizione.zoom}
                posizione={posizione}
                distributoriIniziali={distributori}
                showFullScreen={true}
                showLinkHome={false}
                showFilter={false}
                headerHeight={0}
                initialFilters={
                    {carburante: carburante, limite: limit, 'position': {lat: -1, lng: -1}}
                }
            />
            </> : <></>}</div>


        <Button onClick={event => {
            if (posizione) {
                const uri = `lat=${posizione.latitude}&lng=${posizione.longitude}&zoom=${posizione.zoom}`;
                window.location.href = `/mappa?${uri}`;
            }
        }} variant={'success'}><MapIcon/> Mostra tutti gli impianti</Button>
    </section>;
}