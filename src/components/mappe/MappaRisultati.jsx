'use client';

import Map from 'react-map-gl/maplibre';
import { useState } from 'react';
import 'maplibre-gl/dist/maplibre-gl.css';

// import { useDistributoriDaBbox } from '@/hooks/useDistributoriDaBbox';

export default function MappaRisultati({ posizione, distributoriIniziali }) {
    const [bounds, setBounds] = useState(null);


    const styleUrl = 'https://tiles.stadiamaps.com/styles/outdoors.json?api_key=9441d3ae-fe96-489a-8511-2b1a3a433d29';

    return (
            <Map
                initialViewState={{
                    latitude: posizione.lat,
                    longitude: posizione.lng,
                    zoom: 13
                }}
                mapStyle={styleUrl}
                mapLib={import('maplibre-gl')}
                style={{ width: '100%', height: '100%' }}
                onMoveEnd={(e) => setBounds(e.target.getBounds())}
            />

    );
}
