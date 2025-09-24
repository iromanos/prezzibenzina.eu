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
import FiltriMappaModerni from "@/components/mappe/FiltriMappaModerni";
import maplibregl from "maplibre-gl";

export default function MappaRisultati({posizione, distributoriIniziali = [], onFetchDistributori, footerHeight = 0}) {
    const [distributori, setDistributori] = useState(distributoriIniziali);

    const [filtri, setFiltri] = useState({carburante: '', marchio: '', limite: 25});

    const styleUrl = 'https://tiles.stadiamaps.com/styles/outdoors.json?api_key=9441d3ae-fe96-489a-8511-2b1a3a433d29';
    const lastBoundsRef = useRef(null);

    const mapRef = useRef();

    const debouncedBoundsChange = useDebouncedCallback(async () => {
        const map = mapRef.current;

        const container = map.getContainer();
        const padding = {top: 0, bottom: footerHeight, left: 0, right: 0}; // come da setPadding

        const width = container.clientWidth;
        const height = container.clientHeight;

        // Calcola coordinate visive tenendo conto del padding
        const sw = map.unproject([padding.left, height - padding.bottom]);
        const ne = map.unproject([width - padding.right, padding.top]);

        const bounds = new maplibregl.LngLatBounds(sw, ne);


        //const bounds = map.getBounds();

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

    const handleMapLoad = (event) => {
        const map = mapRef.current;
    };

    return (
        <>
            <FiltriMappaModerni onChange={setFiltri}/>

            <PosizioneAttualeButton onPosizione={handlePosizione} footerHeight={footerHeight}/>

            <Map
                padding={{bottom: footerHeight}}
                ref={mapRef}
                initialViewState={posizione}
                mapStyle={styleUrl}
                mapLib={import('maplibre-gl')}
                style={{width: '100%', height: '100%'}}
                // onLoad={handleMapLoad}
                onMoveEnd={debouncedBoundsChange}
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
