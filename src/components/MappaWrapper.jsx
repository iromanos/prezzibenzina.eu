'use client';

import dynamic from 'next/dynamic';

// Import dinamico della mappa, solo lato client
const MappaDistributori = dynamic(() => import('./MappaDistributori'), {
    ssr: false,
});

export default function MappaWrapper({ distributori }) {
    return <MappaDistributori distributori={distributori} />;
}
