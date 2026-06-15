'use client';

import dynamic from 'next/dynamic';
import React from "react";
import MappaRisultati from "@/components/mappe/MappaRisultati";

// Import dinamico della mappa, solo lato client
const MappaDistributori = dynamic(() => import('./MappaDistributori'), {
    ssr: false,
});

export default function MappaWrapper({distributori, onMapLoad}) {

    const posizione = {
        lat: 45.46,
        lng: 9.19,
        zoom: 13
    };

    return <MappaRisultati
        posizione={posizione}
        distributoriIniziali={distributori}
        showFullScreen={true}
        showLinkHome={false}
        showFilter={false}
        headerHeight={0}
        initialFilters={
            {carburante: 'benzina', limite: 20, 'position': {lat: -1, lng: -1}}
        }
    />


    // return <MappaDistributori distributori={distributori} posizione={posizione} onMapLoad={onMapLoad}/>;
}
