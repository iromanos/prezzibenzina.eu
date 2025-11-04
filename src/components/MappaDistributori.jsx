'use client';

import {useEffect, useRef, useState} from 'react';
import Map, {Popup} from 'react-map-gl/maplibre';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import {isMobile} from 'react-device-detect';
import ImpiantoPopup from "@/components/impianti/ImpiantoPopup";
import ImpiantoMarker from "@/components/impianti/ImpiantoMarker";
import TuttoSchermoButton from "@/components/TuttoSchermoButton";
import {log} from "@/functions/helpers";

export default function MappaDistributori({
                                              distributori, posizione, onMapLoad
                                          }) {

    const styleUrl = 'https://tiles.stadiamaps.com/styles/outdoors.json?api_key=9441d3ae-fe96-489a-8511-2b1a3a433d29';
    const [bounds, setBounds] = useState(null);
    const [popupInfo, setPopupInfo] = useState(null);

    const mapRef = useRef(null);

    const coords = distributori
        .filter((d) => Number.isFinite(d.longitudine) && Number.isFinite(d.latitudine))
        .map((d) => [d.longitudine, d.latitudine]);

    const b = new maplibregl.LngLatBounds();
    coords.forEach((c) => b.extend(c));

    log("bboX: " + JSON.stringify(coords));
    log("bboX: " + JSON.stringify(distributori));

    const initState = {
        bounds: b
    }


    useEffect(() => {
        const handleFocus = e => {
            console.log(e);
            const canvas = mapRef.current?.getMap()?.getCanvas();
            canvas?.scrollIntoView({behavior: 'smooth', block: 'start'});

            const {lat, lng, zoom} = e.detail;
            mapRef.current?.flyTo({center: [lng, lat], zoom, essential: true});
        };

        window.addEventListener('map:focus', handleFocus);
        return () => window.removeEventListener('map:focus', handleFocus);
    }, []);

    /*
    useEffect(() => {
        const map = mapRef.current;
        log(map);
        log(bounds);
        if (map === null) return;
        map.fitBounds(bounds, {
            padding: 80,
            duration: 500,
            // maxZoom: maxZoom
        });
    }, [bounds]);
    */
    return (
        <><Map
            ref={mapRef}
            mapLib={maplibregl}
            mapStyle={styleUrl}
            initialViewState={initState}
            style={{width: '100%', height: '100%'}}
            attributionControl={false}
            // onLoad={handleMapLoad}
            onMoveEnd={() => {
                const map = mapRef.current;
                if (map === null) return;
                onMapLoad?.(map.getCenter(), map.getZoom());
            }}
            dragPan={!isMobile}             // ❌ disabilita pan con un dito
            scrollZoom={!isMobile}          // ❌ disabilita zoom con scroll
            doubleClickZoom={!isMobile}     // ❌ disabilita zoom con doppio tap
            touchZoomRotate={true}      // ✅ abilita pinch-to-zoom e rotazione con due dita
            interactive={true}          // ✅ mantiene la mappa attiva
        >

            {popupInfo ? <Popup

                longitude={popupInfo.longitudine}
                latitude={popupInfo.latitudine}
                anchor="top"
                closeOnClick={false}
                onClose={() => setPopupInfo(null)}>

                <ImpiantoPopup impianto={popupInfo}/>


            </Popup> : null}

            {distributori.map((d) => <ImpiantoMarker

                onClick={e => {
                    e.originalEvent.stopPropagation(); // evita chiusura globale
                    setPopupInfo(d);
                }}

                key={d.id_impianto} d={d}/>)}
        </Map>

            <TuttoSchermoButton onClick={() => {
                if (!mapRef.current) return;
                const center = mapRef.current.getCenter();
                const zoom = mapRef.current.getZoom();
                const uri = `lat=${center.lat}&lng=${center.lng}&zoom=${zoom}`;
                window.location.href = `/mappa?${uri}`;
            }}/></>
    );
}
