'use client';

import {useRef, useState} from 'react';
import 'maplibre-gl/dist/maplibre-gl.css';
import {getElencoStati} from "@/functions/api";
import TuttoSchermoButton from "@/components/TuttoSchermoButton";
import Button from 'react-bootstrap/Button';
import MappaRisultati from "@/components/mappe/MappaRisultati";

export function MapSection() {
    const mapRef = useRef();

    const elencoStati = getElencoStati();

    const [stato, setStato] = useState(elencoStati[elencoStati.length - 1]);


    return (
        <div className="container mb-4">
            <h2 className="text-center fw-bold mb-4">Mappa interattiva: Italia e Svizzera in un colpo d’occhio</h2>
            <div
                style={{
                    height: '75vh'
                }}
                className="col border rounded overflow-hidden position-relative">
                <MappaRisultati
                    ref={mapRef}
                    showLinkHome={false}
                    showFilter={false}
                    posizione={{
                        longitude: stato.lng,
                        latitude: stato.lat,
                        zoom: stato.zoom,
                    }}
                    initialFilters={{'carburante': 'benzina'}}
                />
                <TuttoSchermoButton onClick={() => {
                    const uri = `lat=${stato.lat}&lng=${stato.lng}&zoom=${stato.zoom}`;
                    window.location.href = `/mappa?${uri}`;
                }}/>
            </div>


            <div className="d-flex justify-content-center gap-2 mt-3">

                {elencoStati.map((c, i) => {
                    return <Button
                        key={i}
                        variant={` ${stato !== null && stato.id === c.id ? 'btn-primary' : 'btn-outline-primary'} `}
                        onClick={() => {
                            mapRef.current.flyTo({
                                center: [c.lng, c.lat], zoom: c.zoom,
                            });
                            setStato(c)
                        }}> {c.icon} {c.name}</Button>
                })}
            </div>
        </div>
    );
}
