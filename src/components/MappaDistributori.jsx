'use client';

import {useEffect, useRef, useState} from 'react';
import Map, {Popup} from 'react-map-gl/maplibre';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import {isMobile} from 'react-device-detect';
import ImpiantoPopup from "@/components/impianti/ImpiantoPopup";
import ImpiantoMarker from "@/components/impianti/ImpiantoMarker";

export default function MappaDistributori({
                                              distributori, posizione = {

        lat: 45.46,
        lng: 9.19
    }
                                          }) {

    const styleUrl = 'https://tiles.stadiamaps.com/styles/outdoors.json?api_key=9441d3ae-fe96-489a-8511-2b1a3a433d29';
    const [bounds, setBounds] = useState(null);
    const [popupInfo, setPopupInfo] = useState(null);

    const mapRef = useRef(null);


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


    useEffect(() => {
        const coords = distributori
            .filter((d) => Number.isFinite(d.longitudine) && Number.isFinite(d.latitudine))
            .map((d) => [d.longitudine, d.latitudine]);

        if (coords.length === 0) return;

        const b = new maplibregl.LngLatBounds();
        coords.forEach((c) => b.extend(c));
        setBounds(b);
    }, [distributori]);

    // Funzione da eseguire quando la mappa è pronta
    const handleMapLoad = (event) => {
        const map = event.target;
        if (bounds) {

            let maxZoom = 15;
            if (distributori.length === 1) maxZoom = 10;
            map.fitBounds(bounds, {
                padding: 80,
                duration: 500,
                maxZoom: maxZoom
            });
        }
    };

    return (
            <Map
                ref={mapRef}
                mapLib={maplibregl}
                mapStyle={styleUrl}
                initialViewState={{
                    longitude: posizione.lng,
                    latitude: posizione.lat,
                    zoom: 8,
                }}
                style={{ width: '100%', height: '100%' }}
                attributionControl={false}
                onLoad={handleMapLoad}

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
    );
}
