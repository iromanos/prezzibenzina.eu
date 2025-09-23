'use client';

import Map from 'react-map-gl/maplibre';
import {useRef, useState} from 'react';
import 'maplibre-gl/dist/maplibre-gl.css';
import {log} from "@/functions/helpers";
import {getImpiantiByBounds} from "@/functions/api";
import ImpiantoMarker from "@/components/impianti/ImpiantoMarker";
import {useDebouncedCallback} from '@/hooks/useDebouncedCallback';
import PosizioneAttualeButton from "@/components/PosizioneAttualeButton";
import {usePosizioneAttuale} from '@/hooks/usePosizioneAttuale';
import PosizioneAttualeMarker from "@/components/PosizioneAttualeMarker";

export default function MappaRisultati({posizione, distributoriIniziali = [], onFetchDistributori}) {
    const [distributori, setDistributori] = useState(distributoriIniziali);

    const styleUrl = 'https://tiles.stadiamaps.com/styles/outdoors.json?api_key=9441d3ae-fe96-489a-8511-2b1a3a433d29';
    const lastBoundsRef = useRef(null);

    const mapRef = useRef();

    const debouncedBoundsChange = useDebouncedCallback(async (bounds) => {

        const boundsKey = JSON.stringify(bounds);

        if (boundsKey === lastBoundsRef.current) return;
        lastBoundsRef.current = boundsKey;

        const response = await getImpiantiByBounds(bounds, 'benzina', 'price', 30);
        const data = await response.json();
        onFetchDistributori?.(data);
        setDistributori(data);
    }, 600); //

    const posizioneAttuale = usePosizioneAttuale();
    const handlePosizione = (pos) => {

        const map = mapRef.current;

        log(map.getCenter());

        log(pos);
        log(mapRef);
        map.flyTo({center: [pos.lon, pos.lat], zoom: 14});
    };

    return (
        <><PosizioneAttualeButton onPosizione={handlePosizione}/>

            <Map
                ref={mapRef}
                initialViewState={posizione}
                mapStyle={styleUrl}
                mapLib={import('maplibre-gl')}
                style={{width: '100%', height: '100%'}}
                onMoveEnd={(e) => {
                    log("MOVE END");
                    debouncedBoundsChange(e.target.getBounds());
                }}
            >
                {posizioneAttuale && (
                    <PosizioneAttualeMarker
                        lat={posizioneAttuale.lat}
                        lon={posizioneAttuale.lon}
                    />
                )}


                {distributori.map((d) => <ImpiantoMarker

                    onClick={e => {
                        e.originalEvent.stopPropagation(); // evita chiusura globale
                        // setPopupInfo(d);
                    }}

                    key={d.id_impianto} d={d}/>)}

            </Map></>

    );
}
