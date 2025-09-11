'use client';

import 'maplibre-gl/dist/maplibre-gl.css';
import { RMap, RMarker } from 'maplibre-react-components';

export default function MappaDistributori({ distributori }) {


    const styleUrlStadia = "https://tiles.stadiamaps.com/styles/outdoors.json";
    const apiKey = "9441d3ae-fe96-489a-8511-2b1a3a433d29";

    const styleUrl = styleUrlStadia + "?api_key=" + apiKey;


    const cartoMapStyle = "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json"

    const center = distributori.length
        ? [distributori[0].longitudine, distributori[0].latitudine]
        : [9.19, 45.46]; // Default: Milano

    return (
        <div className={'rounded overflow-hidden'} style={{ height: '400px', width: '100%' }}>
            <RMap
                initialZoom={8}
                initialCenter={center}
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
