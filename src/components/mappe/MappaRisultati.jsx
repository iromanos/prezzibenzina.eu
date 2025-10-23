'use client';

import Map, {Popup} from 'react-map-gl/maplibre';
import {forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState} from 'react';
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
import ImpiantoPopupMobile from "@/components/impianti/ImpiantoPopupMobile";
import Loader from "@/components/home/Loader";
import Cluster from "@/components/home/Cluster";
import Supercluster from "supercluster";
import Link from "react-bootstrap/NavLink"
import Image from 'next/image';
import ImpiantoMarker from "@/components/impianti/ImpiantoMarker";

const MappaRisultati = forwardRef(({
                                           posizione, distributoriIniziali = [], onFetchDistributori,
                                           rightWidth = 0,
                                       footerHeight = 0, initialFilters, showFilter = true, showLinkHome = true
                                   }, ref) => {

    useImperativeHandle(ref, () => ({
        flyTo: (options) => {
            const map = mapRef.current;
            map.flyTo(options);
        }
    }));


    const headerHeight = 0;

    const [distributori, setDistributori] = useState(distributoriIniziali);
    const [popupInfo, setPopupInfo] = useState(null);

    const styleUrl = 'https://tiles.stadiamaps.com/styles/outdoors.json?api_key=9441d3ae-fe96-489a-8511-2b1a3a433d29';
    const lastBoundsRef = useRef(null);

    const mapRef = useRef(null);

    const boundsRef = useRef(null);

    const {carburante} = useCarburante(initialFilters.carburante);
    const {limit} = useLimit();
    const [filter, setFilter] = useState(initialFilters);
    const [zoom, setZoom] = useState(posizione.zoom);
    const [bounds, setBounds] = useState(null);

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


        await fetchImpianti(bounds, _filter);
    });

    const fetchImpianti = async (bounds, _filter) => {
        //setFadeOutMarker(true);
        setDistributori([]);
        rowsRef.current = [];
        await fetchStream(bounds, _filter);
        isFetching.current = false;
    }

    const fetchStream = async (bounds, _filter) => {
        setFadeOutMarker(true);

        const response = await getImpiantiByBounds(bounds, _filter.carburante, 'price', _filter.limite, _filter.brand?.nome);

        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let buffer = '';
        setFadeOutMarker(false);
        while (true) {
            const {value, done} = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, {stream: true});

            let lines = buffer.split('\n');
            buffer = lines.pop(); // conserva l'ultima riga incompleta

            for (const line of lines) {
                if (line.trim()) {
                    const json = JSON.parse(line);
                    handleNewRow(json);
                }
            }

        }
        onFetchDistributori(rowsRef.current.slice(0, filter.limite));
        setDistributori([...rowsRef.current]);
    }

    const rowsRef = useRef([]);

    function handleNewRow(row) {
        rowsRef.current.push(row);
        if (rowsRef.current.length % 1000 === 0) {
            log(`rowsRef: ${rowsRef.current.length}`);
            log(`distributori: ${distributori.length}`);
            setDistributori([...rowsRef.current]);
        }
    }

    const calcolaBounds = () => {
        const map = mapRef.current;
        if (map === null) return null;
        if (map === undefined) return null;

        const container = map.getContainer();
        const padding = {top: headerHeight, bottom: 96, left: 0, right: rightWidth}; // come da setPadding

        const width = container.clientWidth;
        const height = container.clientHeight;

        const sw = map.unproject([padding.left, height - padding.bottom]);
        const ne = map.unproject([width - padding.right, padding.top]);


        boundsRef.current = [sw.lng, sw.lat, ne.lng, ne.lat];

        //setBounds([ sw.lng, sw.lat, ne.lng , ne.lat ]);
        setZoom(map.getZoom());
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

        log("FILTRI: " + JSON.stringify(filter));

        if (filter.carburante === '') return;

        log(isFetching.current);

        if (isFetching.current) return;
        isFetching.current = true;

        await fetchImpianti(bounds, filter);

    }, 600); //

    const posizioneAttuale = usePosizioneAttuale();
    const handlePosizione = (pos) => {

        const map = mapRef.current;

        log(map.getCenter());

        log(pos);
        log(mapRef);
        map.flyTo({center: [pos.lon, pos.lat], zoom: 14});
    };

    // const [clusters, setClusters] = useState([]);


    const firstNDistributori = useMemo(() => {
        return distributori.slice(0, filter.limite);
    }, [distributori]);

    const superclusterRef = useRef(
        // const radius = 120;
        new Supercluster({
            radius: 120,
            minPoints: 2,
            map: props => ({
                prezzo: props.prezzo ?? 0,
                color: props.color ?? 0
            }),
            reduce: (a, b) => {
                a.somma = (a.somma || 0) + a.prezzo;
                a.totale = (a.totale || 0) + 1;
                a.media = a.somma / a.totale;
                a.sommaColore = (a.sommaColore || 0) + a.color;
                a.mediaColore = a.sommaColore / a.totale;
            }
        })
    );

    const clusters = useMemo(() => {
        const clusteredPoints = distributori.slice(filter.limite);
        log('clusterPoints: ' + clusteredPoints.length);
        if (clusteredPoints.length === 0) return [];
        superclusterRef.current.load(distributori);
        return superclusterRef.current.getClusters(boundsRef.current, zoom);
    }, [distributori]);

    log(mapRef.current?.zoom);
    log("RIGHT WIDTH: " + rightWidth);
    log('MappaRisultati: BUILD');
    log('Filtri: ' + filter.carburante);
    log('Clusters: ' + clusters.length);
    log(`initialFilters: ` + JSON.stringify(initialFilters));
    log('Distributori: ' + distributori.length);
    log('FadeOut: ' + fadeOutMarker);

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
                        onSelectStato={(c) => {
                            setFadeOutMarker(true);
                            // setDistributori([]);
                            mapRef.current.flyTo({
                                center: [c.lng, c.lat], zoom: c.zoom,
                            });
                        }}
                        onSearch={(place) => {
                            mapRef.current?.flyTo({zoom: 12, center: [place.lon, place.lat]});
                        }}
                        onChange={(state) => {
                            const currentFilter = {
                                ...filter, ...state
                            };
                            debouncedFilterChange(currentFilter);
                        }}/>
                    <PosizioneAttualeButton
                        onPosizione={handlePosizione}
                        rightWidth={rightWidth}
                        footerHeight={footerHeight}/></> : null}


            {showLinkHome && showFilter && <Link

                style={{
                    bottom: footerHeight,
                    right: rightWidth
                }}

                className={'position-absolute z-3 m-3 shadow-sm'} title={'Home'} href={'/'}>
                <Image className={'rounded'} width={90} height={90}
                       src={'/assets/logo-180.png'} alt={'PrezzoBenzina.eu'}/>
            </Link>}

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
                <Cluster
                    fadeOut={fadeOutMarker}
                    clusters={clusters}
                    onClusterClick={(c) => {
                        // const [lng, lat] = c.geometry.coordinates;
                        // const expansionZoom = clusterIndex.getClusterExpansionZoom(c.id);
                        // mapRef.current.getMap().flyTo({center: [lng, lat], zoom: expansionZoom});
                    }}/>
                <>
                    {firstNDistributori.map((d) => {

                        const impianto = d.properties;

                        return <ImpiantoMarker
                            fadeOut={fadeOutMarker}
                            onClick={e => {
                                e.originalEvent.stopPropagation(); // evita chiusura globale
                                mapRef.current?.flyTo({
                                    center: [impianto.longitudine, impianto.latitudine],
                                    essential: true
                                });
                                setPopupInfo(impianto);
                            }}
                            key={impianto.id_impianto} d={impianto}/>;
                    })}</>

            </Map>
        </>

    );
});


export default MappaRisultati;