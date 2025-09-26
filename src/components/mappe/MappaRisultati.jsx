'use client';

import Map, {Popup} from 'react-map-gl/maplibre';
import {useEffect, useRef, useState} from 'react';
import 'maplibre-gl/dist/maplibre-gl.css';
import {log} from "@/functions/helpers";
import {getImpiantiByBounds} from "@/functions/api";
import {useDebouncedCallback} from '@/hooks/useDebouncedCallback';
import PosizioneAttualeButton from "@/components/PosizioneAttualeButton";
import {usePosizioneAttuale} from '@/hooks/usePosizioneAttuale';
import PosizioneAttualeMarker from "@/components/PosizioneAttualeMarker";
import FiltriMappaModerni from "@/components/mappe/FiltriMappaModerni";
import maplibregl from "maplibre-gl";
import ImpiantoPopup from "@/components/impianti/ImpiantoPopup";
import ComparaVicini from "@/components/ComparaVicini";
import useCarburante from "@/hooks/useCarburante";
import useLimit from "@/hooks/useLimit";
import ImpiantoMarker from "@/components/impianti/ImpiantoMarker";
import NominatimAutocomplete from "@/components/NominatimAutocomplete";

export default function MappaRisultati({posizione, distributoriIniziali = [], onFetchDistributori, footerHeight = 0}) {

    const [distributori, setDistributori] = useState(distributoriIniziali);
    const [popupInfo, setPopupInfo] = useState(null);

    const styleUrl = 'https://tiles.stadiamaps.com/styles/outdoors.json?api_key=9441d3ae-fe96-489a-8511-2b1a3a433d29';
    const lastBoundsRef = useRef(null);

    const mapRef = useRef();

    const {carburante} = useCarburante();
    const {limit} = useLimit();
    const [filter, setFilter] = useState({carburante: null});

    const isFetching = useRef(false);

    const [fadeOutMarker, setFadeOutMarker] = useState(false);

    useEffect(() => {
        setFilter((prev) => ({
            ...prev, ...{carburante: carburante}, ...{limite: limit}
        }))
    }, [carburante, limit]);


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
        log('MappaRisultati: MOUNTED');
    }, []);

    const [loading, setLoading] = useState(false);

    const debouncedFilterChange = useDebouncedCallback(async (_filter) => {

        let bounds = null;

        if (lastBoundsRef.current === null) {
            bounds = calcolaBounds();
        } else bounds = JSON.parse(lastBoundsRef.current);
        const response = await getImpiantiByBounds(bounds, _filter.carburante, 'price', _filter.limite, _filter.brand?.nome);
        const data = await response.json();
        onFetchDistributori?.(data);
        setDistributori(data);
        setFilter(_filter);
    });

    const calcolaBounds = () => {
        const map = mapRef.current;

        const container = map.getContainer();
        const padding = {top: 0, bottom: footerHeight, left: 0, right: 0}; // come da setPadding

        const width = container.clientWidth;
        const height = container.clientHeight;

        const sw = map.unproject([padding.left, height - padding.bottom]);
        const ne = map.unproject([width - padding.right, padding.top]);

        return new maplibregl.LngLatBounds(sw, ne);
    }

    const debouncedBoundsChange = useDebouncedCallback(async () => {

        const bounds = calcolaBounds();

        const boundsKey = JSON.stringify(bounds);

        if (boundsKey === lastBoundsRef.current) return;

        const hasMovedEnough = () => {
            if (!lastBoundsRef.current) return true;

            const lastBounds = JSON.parse(lastBoundsRef.current);

            const deltaLat = Math.abs(bounds._ne.lat - lastBounds._ne.lat);
            const deltaLng = Math.abs(bounds._ne.lng - lastBounds._ne.lng);

            log("DELTALAG :" + deltaLat);

            return deltaLat > 0.01 || deltaLng > 0.01; // soglia minima
        };

        if (!hasMovedEnough()) return;

        lastBoundsRef.current = boundsKey;

        log("FILTRI: " + filter);

        if (filter.carburante === '') return;

        log(isFetching.current);

        if (isFetching.current) return;
        isFetching.current = true;

        const response = await getImpiantiByBounds(bounds, filter.carburante, 'price', filter.limite, filter.brand?.nome);
        const data = await response.json();
        isFetching.current = false;

        setFadeOutMarker(true);

        onFetchDistributori?.(data);
        setDistributori(data);
        setFadeOutMarker(false);
    }, 600); //

    const posizioneAttuale = usePosizioneAttuale();
    const handlePosizione = (pos) => {

        const map = mapRef.current;

        log(map.getCenter());

        log(pos);
        log(mapRef);
        map.flyTo({center: [pos.lon, pos.lat], zoom: 14});
    };

    log(mapRef.current?.zoom);
    /*
    const clusterMarkers = useClusterMarkers(distributori, filter.carburante, mapRef.current?.getZoom());

    function getMarkerSize(count) {
        const minSize = 60;
        const maxSize = 240;
         // 3px per impianto
        return Math.min(maxSize, minSize + count * 4);
    }


    function getMarkerColor(prezzo) {
        if (prezzo === null || isNaN(prezzo)) return '#6c757d'; // grigio per dati mancanti

        const p = parseFloat(prezzo);

        if (p < 1.70) return '#198754';     // verde: ottimo prezzo
        if (p < 1.85) return '#ffc107';     // giallo: medio
        return '#dc3545';                   // rosso: caro
    }
    */
    log('MappaRisultati: BUILD');
    log('Filtri: ' + filter.carburante);
    return (
        <>
            {loading ? <div className="modal fade show d-block" tabIndex="-1" role="dialog"
                            style={{backgroundColor: 'rgba(0, 0, 0, 0.5)', transition: 'opacity 0.5s ease'}}
                >
                    <div className="modal-dialog modal-dialog-centered" role="document">
                        <div className="modal-content text-center">
                            <div className="modal-body py-4">
                                <div className="spinner-border text-primary mb-3" role="status"/>
                                <p className="mb-0 text-muted">Caricamento in corso…</p>
                            </div>
                        </div>
                    </div>
                </div>

                : null}

            {filter.carburante ? <>
                <ComparaVicini carburante={filter.carburante}/></> : null}

            <FiltriMappaModerni onChange={(state) => {

                const currentFilter = {
                    ...filter, ...state
                };

                debouncedFilterChange(currentFilter);
            }}/>

            <PosizioneAttualeButton onPosizione={handlePosizione} footerHeight={footerHeight}/>

            <div className="position-absolute top-0 start-50 translate-middle-x mt-3 z-3 bg-white"
                 style={{width: '90%', maxWidth: '400px'}}>
                <NominatimAutocomplete
                    onSelect={(place) => {
                        log('Selezionato:' + place);
                    }}
                />
            </div>


            <Map
                padding={{bottom: footerHeight}}
                ref={mapRef}
                attributionControl={false}

                initialViewState={posizione}
                mapStyle={styleUrl}
                mapLib={import('maplibre-gl')}
                style={{width: '100%', height: '100%'}}
                onMoveEnd={debouncedBoundsChange}
            >
                {posizioneAttuale && (
                    <PosizioneAttualeMarker
                        lat={posizioneAttuale.lat}
                        lon={posizioneAttuale.lon}
                    />
                )}

                {popupInfo ? <Popup

                    longitude={popupInfo.longitudine}
                    latitude={popupInfo.latitudine}
                    anchor="top"
                    closeOnClick={false}
                    onClose={() => setPopupInfo(null)}>

                    <ImpiantoPopup impianto={popupInfo}/>


                </Popup> : null}

                {distributori.map((d) => <ImpiantoMarker
                    fadeOut={fadeOutMarker}
                    onClick={e => {
                        e.originalEvent.stopPropagation(); // evita chiusura globale
                        setPopupInfo(d);
                    }}

                    key={d.id_impianto} d={d}/>)}

            </Map>
        </>

    );
}
