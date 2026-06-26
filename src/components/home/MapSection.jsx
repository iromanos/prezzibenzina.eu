'use client';

import React, {useEffect, useRef, useState} from 'react';
import {getElencoStati} from "@/functions/api";
import Button from 'react-bootstrap/Button';
// import MappaRisultati from "@/components/mappe/MappaRisultati";
import {usePreferitiGlobal} from "@/context/PreferitiProvider";

import dynamic from 'next/dynamic';
import Image from "next/image";
import useUltimaPosizione from "@/hooks/useUltimaPosizione";
import InFeed4656802013 from "@/components/ads/InFeed-4656802013";
import Display6977770298 from "@/components/ads/Display-6977770298";
import ImpiantoCardMobile from "../impianti/ImpiantoCardMobile";

const MappaRisultati = dynamic(() => import('@/components/mappe/MappaRisultati'), {
    ssr: false,
});

export function MapSection() {
    const mapRef = useRef();

    const [prezzoMedio, setPrezzoMedio] = useState(null);

    const [record, setRecord] = useState([]);

    const elencoStati = getElencoStati();

    const [stato, setStato] = useState(elencoStati[elencoStati.length - 1]);
    const {preferiti, ModalComponent, ModalResult} = usePreferitiGlobal();

    const hookUltimaPosizione = useUltimaPosizione();


    const [viewState, setViewState] = useState(null);

    useEffect(() => {
        if (hookUltimaPosizione.posizione === null) return;

        if (hookUltimaPosizione.posizione === false) return;

        // console.log('AGGIORNA VIEW STATE CON ULTIMA POSIZIONE: ', hookUltimaPosizione.posizione);
        setViewState({
            latitude: hookUltimaPosizione.posizione.center.lat,
            longitude: hookUltimaPosizione.posizione.center.lng,
            zoom: hookUltimaPosizione.posizione.zoom
        });
    }, [hookUltimaPosizione.posizione]);

    const active = true; // useInteraction();


    // console.log(`VIEWSTATE: ${viewState}`);

    return (
        <div className="mb-4">
            {/*<h2 className="text-center fw-bold mb-4">Mappa interattiva: Italia e Svizzera in un colpo d’occhio</h2>*/}

            <div className={'row'}>

                <div className={'col-lg-8'}>
                    <div
                        style={{
                            height: 'calc(100vh * 2/3)'
                        }}
                        className="d-flex border rounded overflow-hidden position-relative justify-content-center align-items-center">
                        {active === false &&
                            <div
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

                                <div
                                    className="position-absolute top-50 start-50 translate-middle btn btn-dark opacity-90 rounded">
                                    Attiva Mappa Interattiva
                                </div>

                            </div>}
                        {viewState &&
                            <MappaRisultati
                                onFetchDistributori={(record) => {
                                    setRecord(record);
                                }}
                                onPrezzoMedio={(prezzo) => {
                                    setPrezzoMedio(prezzo)
                                }}
                                ref={mapRef}
                                showFullScreen={true}
                                showLinkHome={false}
                                showFilter={false}
                                posizione={viewState}
                                headerHeight={0}
                                initialFilters={{carburante: 'benzina', limite: 20, 'position': {lat: -1, lng: -1}}}
                            />}
                    </div>
                    <div className="d-flex justify-content-center gap-2 my-3">

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
                    <Display6977770298 className={'mb-3'}/>

                </div>


                <div className={'col-lg-4'}>

                    {prezzoMedio && <p className={'border rounded px-2 text-uppercase'}>Prezzo medio: <span
                        className={'h6'}>{prezzoMedio.toFixed(3)} €/L</span></p>}


                    {record.length === 0 &&
                        <p>Nessun distribuitore presente in questa zona. Prova a fare lo zoom sulla mappa o a
                            spostare la posizione.</p>}
                    {record.length !== 0 &&
                        <><h2 className={'text-uppercase h5'}>Distributori</h2>
                    {record.slice(0, 3).map((d, index) => {
                        return (
                            <div key={index}
                                 className={index === 0 ? 'bg-success-subtle rounded overflow-hidden' : null}>
                                {index === 0 &&
                                    <p className={'m-0 text-center bg-success text-white text-uppercase small fw-bold'}>Il
                                        più conveniente</p>}
                                <ImpiantoCardMobile
                                    key={d.properties.id_impianto} impianto={d.properties}/>
                                {(index + 1) % 2 === 0 &&
                                    <InFeed4656802013 className={'mb-3'}/>}
                            </div>
                        );
                    })}</>
                    }


                </div>
            </div>
            {ModalComponent}
            {ModalResult}
        </div>
    );
}
