'use client';

import 'maplibre-gl/dist/maplibre-gl.css';
import { RMap, RMarker } from 'maplibre-react-components';
import {useMemo} from "react";

export default function MappaDistributori({ distributori }) {


    const styleUrlStadia = "https://tiles.stadiamaps.com/styles/outdoors.json";
    const apiKey = "9441d3ae-fe96-489a-8511-2b1a3a433d29";

    const styleUrl = styleUrlStadia + "?api_key=" + apiKey;


    const cartoMapStyle = "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json"

    const center = distributori.length
        ? [distributori[0].longitudine, distributori[0].latitudine]
        : [9.19, 45.46]; // Default: Milano

    // Calcola i bounds per includere tutti i marker
    const bounds = useMemo(() => {
        const coords = distributori
            .filter((d) => Number.isFinite(d.longitudine) && Number.isFinite(d.latitudine))
            .map((d) => [d.longitudine, d.latitudine]);

        if (coords.length === 0) return null;
        if (coords.length === 1) return [coords[0], coords[0]];

        const lons = coords.map((c) => c[0]);
        const lats = coords.map((c) => c[1]);
        const minLon = Math.min(...lons);
        const maxLon = Math.max(...lons);
        const minLat = Math.min(...lats);
        const maxLat = Math.max(...lats);

        return [
            [minLon, minLat],
            [maxLon, maxLat],
        ];
    }, [distributori]);

    return (
        <div className={'border rounded overflow-hidden'} style={{ height: '400px', width: '100%' }}>
            <RMap
                initialZoom={8}
                initialCenter={center}
                fitBounds={bounds}
                fitBoundsOptions={{ padding: 40 }}
                mapStyle={styleUrlStadia}
            >
                {distributori.map((d) => {

                    let color = 'bg-success';
                    if (d.color === -1) color = 'bg-danger';
                    return (
                        <RMarker key={d.id_impianto}

                                 longitude={d.longitudine} latitude={d.latitudine}
                        >
                            <div
                                className={color + ' rounded p-2 py-1 border border-white'}
                                style={{
                                    color: 'white',
                                    fontSize: '12px',
                                }}
                            >
                                {d.bandiera} <br/> {d.prezzo.toFixed(3)} €/L
                            </div>
                        </RMarker>
                    );
                })}
            </RMap>
        </div>
    );
}
