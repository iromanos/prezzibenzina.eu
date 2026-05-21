'use client';

import {useRef, useState} from 'react';
import {getElencoStati} from "@/functions/api";
import Button from 'react-bootstrap/Button';
// import MappaRisultati from "@/components/mappe/MappaRisultati";
import {usePreferitiGlobal} from "@/context/PreferitiProvider";

import dynamic from 'next/dynamic';
import Image from "next/image";

// Import dinamico della mappa, solo lato client
const MappaRisultati = dynamic(() => import('@/components/mappe/MappaRisultati'), {
    ssr: false,
});




export function MapSection() {
    const mapRef = useRef();

    const elencoStati = getElencoStati();

    const [attivaInterattiva, setAttivaInterattiva] = useState(false);

    const [stato, setStato] = useState(elencoStati[elencoStati.length - 1]);
    const {preferiti, ModalComponent, ModalResult} = usePreferitiGlobal();

    return (
        <div className="mb-4">
            <h2 className="text-center fw-bold mb-4">Mappa interattiva: Italia e Svizzera in un colpo d’occhio</h2>
            <div
                style={{
                    height: '616px'
                }}
                className="d-flex border rounded overflow-hidden position-relative justify-content-center align-items-center">
                {attivaInterattiva === false &&
                    <Image

                        onMouseEnter={() => {
                            setAttivaInterattiva(true);
                        }}
                        priority={true}
                        sizes="(max-width: 768px) 100vw, 1170px"
                        fill={true}
                        src={'/assets/static/staticmap-home.jpg'}
                        alt={'Mappa impianti'}
                        fetchPriority="high"
                    />}
                {attivaInterattiva &&
                <MappaRisultati
                    ref={mapRef}
                    showFullScreen={true}
                    showLinkHome={false}
                    showFilter={false}
                    posizione={{
                        longitude: stato.lng,
                        latitude: stato.lat,
                        zoom: stato.zoom,
                    }}
                    onMapClick={() => {
                    }}
                    initialFilters={{carburante: 'benzina', limite: 20, 'position': {lat: -1, lng: -1}}}
                />}
            </div>


            <div className="d-flex justify-content-center gap-2 mt-3">

                {elencoStati.map((c, i) => {
                    return <Button
                        key={i}
                        variant={` ${stato !== null && stato.id === c.id ? 'btn-primary' : 'btn-light'} `}
                        onClick={() => {
                            mapRef.current.flyTo({
                                center: [c.lng, c.lat], zoom: c.zoom,
                            });
                            setStato(c)
                        }}> {c.icon} {c.name}</Button>
                })}
            </div>
            {ModalComponent}
            {ModalResult}
        </div>
    );
}
