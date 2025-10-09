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
import ComparaVicini from "@/components/ComparaVicini";
import useCarburante from "@/hooks/useCarburante";
import useLimit from "@/hooks/useLimit";
import ImpiantoMarker from "@/components/impianti/ImpiantoMarker";
import ImpiantoPopupMobile from "@/components/impianti/ImpiantoPopupMobile";
import Loader from "@/components/home/Loader";

export default function MappaRisultati({
                                           posizione, distributoriIniziali = [], onFetchDistributori,
                                           rightWidth = 0,
                                           footerHeight = 0, initialFilters, showFilter = true
                                       }) {
    const headerHeight = 256;

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
            log(e);
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
        setLoading(true);
        const response = await getImpiantiByBounds(bounds, _filter.carburante, 'price', _filter.limite, _filter.brand?.nome);
        const data = await response.json();
        onFetchDistributori?.(data);
        setLoading(false);
        setDistributori(data);
        setFilter(_filter);
    });

    const calcolaBounds = () => {
        const map = mapRef.current;

        const container = map.getContainer();
        const padding = {top: headerHeight, bottom: 96, left: 0, right: rightWidth}; // come da setPadding

        const width = container.clientWidth;
        const height = container.clientHeight;

        const sw = map.unproject([padding.left, height - padding.bottom]);
        const ne = map.unproject([width - padding.right, padding.top]);

        return new maplibregl.LngLatBounds(sw, ne);
    }

    const debouncedBoundsChange = useDebouncedCallback(async () => {

        if (popupInfo) return;

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
        setLoading(true);

        const response = await getImpiantiByBounds(bounds, filter.carburante, 'price', filter.limite, filter.brand?.nome);
        const data = await response.json();
        isFetching.current = false;
        setLoading(false);

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

    log("RIGHT WIDTH: " + rightWidth);

    log('MappaRisultati: BUILD');
    log('Filtri: ' + filter.carburante);
    return (
        <>

            {loading && (
                <Loader rightWidth={rightWidth}/>
            )}

            {filter.carburante ? <>
                <ComparaVicini carburante={filter.carburante}/></> : null}
            {showFilter ?
                <>
            <FiltriMappaModerni
                initialFilters={initialFilters}
                rightWidth={rightWidth}
                onSearch={(place) => {
                    mapRef.current?.flyTo({zoom: 12, center: [place.lon, place.lat]});
                }}
                onChange={(state) => {
                const currentFilter = {
                    ...filter, ...state
                };
                debouncedFilterChange(currentFilter);
            }}/>
                    <PosizioneAttualeButton onPosizione={handlePosizione}

                                            rightWidth={rightWidth}

                                            footerHeight={footerHeight}/></> : null}

            <Map
                padding={{bottom: 96, top: headerHeight, right: rightWidth}}
                ref={mapRef}
                attributionControl={false}
                onLoad={debouncedBoundsChange}
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

                    <ImpiantoPopupMobile impianto={popupInfo}/>


                </Popup> : null}

                {distributori.map((d) => <ImpiantoMarker
                    fadeOut={fadeOutMarker}
                    onClick={e => {
                        e.originalEvent.stopPropagation(); // evita chiusura globale
                        mapRef.current?.flyTo({center: [d.longitudine, d.latitudine], essential: true});
                        setPopupInfo(d);
                    }}

                    key={d.id_impianto} d={d}/>)}

            </Map>
        </>

    );
}
