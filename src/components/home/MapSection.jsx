'use client';

import {useEffect, useRef, useState} from 'react';
import {getElencoStati} from "@/functions/api";
import Button from 'react-bootstrap/Button';
// import MappaRisultati from "@/components/mappe/MappaRisultati";
import {usePreferitiGlobal} from "@/context/PreferitiProvider";

import dynamic from 'next/dynamic';
import Image from "next/image";
import useUltimaPosizione from "@/hooks/useUltimaPosizione";
import useInteraction from "@/hooks/useInteraction";

const MappaRisultati = dynamic(() => import('@/components/mappe/MappaRisultati'), {
    ssr: false,
});

export function MapSection() {
    const mapRef = useRef();

    const elencoStati = getElencoStati();

    const [attivaInterattiva, setAttivaInterattiva] = useState(false);

    const [stato, setStato] = useState(elencoStati[elencoStati.length - 1]);
    const {preferiti, ModalComponent, ModalResult} = usePreferitiGlobal();

    const hookUltimaPosizione = useUltimaPosizione();

    const [viewState, setViewState] = useState(null);


    useEffect(() => {
        if (hookUltimaPosizione.posizione === null) return;

        if (hookUltimaPosizione.posizione === false) {
            setViewState({
                latitude: stato.lat,
                longitude: stato.lng,
                zoom: stato.zoom,
            });
            return;
        }
        console.log('AGGIORNA VIEW STATE CON ULTIMA POSIZIONE: ', hookUltimaPosizione.posizione);
        setViewState({
            latitude: hookUltimaPosizione.posizione.center.lat,
            longitude: hookUltimaPosizione.posizione.center.lng,
            zoom: hookUltimaPosizione.posizione.zoom
        });
    }, [hookUltimaPosizione.posizione]);

    const {active} = useInteraction();

    return (
        <div className="mb-4">
            <h2 className="text-center fw-bold mb-4">Mappa interattiva: Italia e Svizzera in un colpo d’occhio</h2>
            <div
                style={{
                    height: '616px'
                }}
                className="d-flex border rounded overflow-hidden position-relative justify-content-center align-items-center">
                {active === false &&
                    <div
                        // onClick={() => setAttivaInterattiva(true)}
                        style={{cursor: 'pointer'}}
                        className="position-relative w-100 h-100"
                    >
                    <Image
                        width={1170}
                        height={616}
                        priority={true}
                        src={'/assets/static/staticmap-home.jpg'}
                        alt={'Mappa impianti'}
                        fetchPriority="high"
                    />

                        {/* Un piccolo overlay per far capire che è cliccabile */}
                        <div className="position-absolute top-50 start-50 translate-middle btn btn-dark opacity-90">
                            Attiva Mappa Interattiva
                        </div>

                    </div>}
                {active &&
                <MappaRisultati

                    ref={mapRef}
                    showFullScreen={true}
                    showLinkHome={false}
                    showFilter={false}
                    posizione={viewState}
                    headerHeight={0}
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
