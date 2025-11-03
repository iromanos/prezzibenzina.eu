'use client';

import dynamic from 'next/dynamic';

// Import dinamico della mappa, solo lato client
const MappaDistributori = dynamic(() => import('./MappaDistributori'), {
    ssr: false,
});

export default function MappaWrapper({distributori, onMapLoad}) {

    const posizione = {
        lat: 45.46,
        lng: 9.19
    };


    return <MappaDistributori distributori={distributori} posizione={posizione} onMapLoad={onMapLoad}/>;
}
