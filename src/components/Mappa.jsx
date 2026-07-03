'use client'

import React, {useRef} from "react";
import MapIcon from "@mui/icons-material/Map";

import Button from 'react-bootstrap/Button';
import MappaRisultati from "./mappe/MappaRisultati";
import useInteraction from "@/hooks/useInteraction";

export default function Mappa({
                                  distributori,
                                  posizione,
                                  title = true,
                                  carburante,
                                  limit = 10,
                                  stato = null,
                                  maxBounds = null,
                                  titolo = "Mappa dei distributori",
                                  params
                              }) {

    const {active} = useInteraction();

    const containerRef = useRef(null);

    // console.log(params);

    return <section className={"mb-4"}>
        {title ? <h2 className="h6 mb-2 text-uppercase">{titolo}</h2> : null}
        <div ref={containerRef} className={'border rounded position-relative mb-4 vh-60'}>
            {active ? <><MappaRisultati
                // maxBounds={maxBounds}
                cooperativeGestures={true}
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
                    {
                        brand: params.marchio,
                        carburante: carburante, limite: limit, 'position': {lat: -1, lng: -1}
                    }
                }

                onFetchDistributori={(record) => {
                    const eventoCustom = new CustomEvent('mappa-aggiornata', {detail: record});
                    window.dispatchEvent(eventoCustom);
                }}

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