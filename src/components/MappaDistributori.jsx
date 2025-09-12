'use client';

import { useMemo } from 'react';
import Map, { Marker } from 'react-map-gl/maplibre';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

export default function MappaDistributori({ distributori }) {

    const URI_IMAGE = "http://localhost:8080";


    const styleUrl = 'https://tiles.stadiamaps.com/styles/outdoors.json?api_key=9441d3ae-fe96-489a-8511-2b1a3a433d29';

    // Calcola bounds
    const bounds = useMemo(() => {
        const coords = distributori
            .filter((d) => Number.isFinite(d.longitudine) && Number.isFinite(d.latitudine))
            .map((d) => [d.longitudine, d.latitudine]);

        if (coords.length === 0) return null;

        const b = new maplibregl.LngLatBounds();
        coords.forEach((c) => b.extend(c));
        return b;
    }, [distributori]);

    // Funzione da eseguire quando la mappa è pronta
    const handleMapLoad = (event) => {
        const map = event.target;
        if (bounds) {
            map.fitBounds(bounds, {
                padding: 80,
                duration: 500,
            });
        }
    };

    return (
        <div className="border rounded overflow-hidden" style={{ height: '560px', width: '100%' }}>
            <Map
                mapLib={maplibregl}
                mapStyle={styleUrl}
                initialViewState={{
                    longitude: 9.19,
                    latitude: 45.46,
                    zoom: 8,
                }}
                style={{ width: '100%', height: '100%' }}
                attributionControl={true}
                onLoad={handleMapLoad}
            >
                {distributori.map((d) => {
                    const color = d.color === -1 ? '#dc3545' : '#198754';

                    return (
                        <Marker
                            key={d.id_impianto}
                            longitude={d.longitudine}
                            latitude={d.latitudine}
                            anchor="bottom"
                        >
                            <div className={'border border-white rounded py-1 px-1'}
                                style={{
                                    backgroundColor: color,
                                    color: 'white',
                                    textAlign: 'center',
                                }}
                            >
                                <img className={'d-block'} alt={d.bandiera} width="32" height="32" src={ URI_IMAGE + d.image} />
                                {d.prezzo.toFixed(3)}
                            </div>
                        </Marker>
                    );
                })}
            </Map>
        </div>
    );
}
