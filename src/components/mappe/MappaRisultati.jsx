'use client';

import Map, {Popup} from 'react-map-gl/maplibre';
import {forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState} from 'react';
import 'maplibre-gl/dist/maplibre-gl.css';
import {log} from "@/functions/helpers";
import {getClustersByBounds, getImpiantiByDistance} from "@/functions/api";
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

import {bboxPolygon, booleanContains} from '@turf/turf';

const MappaRisultati = forwardRef(({
                                       posizione,
                                       distributoriIniziali = [],
                                       onFetchDistributori,
                                       rightWidth = 0,
                                       footerHeight = 0,
                                       initialFilters,
                                       showFilter = true,
                                       showLinkHome = true,
                                       onMoveEnd,
                                       isReadOnly = false,
                                   }, ref) => {

    useImperativeHandle(ref, () => ({
        flyTo: (options) => {
            const map = mapRef.current;
            map.flyTo(options);
        }
    }));

    const ultimoRiquadroRef = useRef(null);
    const mapRef = useRef(null);
    const boundsRef = useRef([]);
    const isFetching = useRef(false);
    const listImpiantiRef = useRef([]);


    const headerHeight = 0;

    const [distributori, setDistributori] = useState(distributoriIniziali);
    const [clusteredPoints, setClusteredPoints] = useState([]);

    const [popupInfo, setPopupInfo] = useState(null);

    const styleUrl = 'https://tiles.stadiamaps.com/styles/outdoors.json?api_key=9441d3ae-fe96-489a-8511-2b1a3a433d29';

    const {carburante} = useCarburante(initialFilters.carburante);
    const {limit} = useLimit();
    const [filter, setFilter] = useState(initialFilters);
    const [zoom, setZoom] = useState(posizione.zoom);
    const [bounds, setBounds] = useState(null);


    const [fadeOutMarker, setFadeOutMarker] = useState(false);

    useEffect(() => {
        const handleFocus = e => {
            // log(e);
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

        if (ultimoRiquadraRef.current === null) {
            bounds = calcolaBounds();
        } else bounds = JSON.parse(ultimoRiquadraRef.current);

        // setFilter(_filter);
//        await fetchImpianti(bounds, _filter);
    }, 150);

    const fetchImpianti = async (bounds, _filter, bounds_prev = null) => {
        try {
            rowsRef.current = [];
            await fetchStream(bounds, _filter, bounds_prev);
        } catch (e) {
        }
        isFetching.current = false;
    }

    const fetchStream = async (bounds, _filter, bounds_prev = null) => {

        const response = await getClustersByBounds(bounds, _filter.carburante, 'price', _filter.limite, _filter.brand?.nome, bounds_prev);
        //setFadeOutMarker(true);

        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let buffer = '';
        //setFadeOutMarker(false);
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
        // onFetchDistributori?.(rowsRef.current.slice(0, filter.limite));
        listImpiantiRef.current = [...listImpiantiRef.current, ...rowsRef.current];

        if (rowsRef.current.length > 0) {
            setClusteredPoints([...listImpiantiRef.current]);
        }

        log("ROWS REF:" + rowsRef.current.length);
        log("IMPIANTI REF:" + listImpiantiRef.current.length);
    }

    const rowsRef = useRef([]);

    function handleNewRow(row) {
        rowsRef.current.push(row);
        if (rowsRef.current.length % 1000 === 0) {
            log(`rowsRef: ${rowsRef.current.length}`);
            log(`distributori: ${distributori.length}`);
            //setDistributori([...rowsRef.current]);
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

        return new maplibregl.LngLatBounds(sw, ne);
    }

    const debouncedBoundsChange = useDebouncedCallback(async () => {
        if (isReadOnly) return;
        if (popupInfo) return;

        const riquadroAttuale = calcolaBounds();

        const center = mapRef.current.getCenter();
        onMoveEnd?.(center.lat, center.lng);

        const ultimoRiquadro = ultimoRiquadroRef.current;

        const hasMovedEnough = ultimoRiquadro != null ? !isContained(riquadroAttuale, ultimoRiquadro) : true;
        setBounds(toEnvelopeArray(riquadroAttuale));
        setZoom(mapRef.current.getZoom());

        log("HAS MOVED ENOUGH: " + hasMovedEnough);
//        setFadeOutMarker(true);

        const response = await getImpiantiByDistance(
            {
                bounds: riquadroAttuale,
                carburante: filter.carburante,
                sort: 'price',
                limit: filter.limite,
                brand: filter.brand?.nome
            });


        const record = await response.json();

        setDistributori(record);
        onFetchDistributori?.(record);

        if (!hasMovedEnough) {
            //setFadeOutMarker(false);
            return;
        }

        if (filter.carburante === '') return;
        if (isFetching.current) return;
        isFetching.current = true;

        await fetchImpianti(riquadroAttuale, filter, ultimoRiquadro);
        bboxUnion(ultimoRiquadro, riquadroAttuale);

    }, 150); //

    const posizioneAttuale = usePosizioneAttuale();
    const handlePosizione = (pos) => {
        const map = mapRef.current;
        //setFadeOutMarker(true);
        map.flyTo({center: [pos.lon, pos.lat], zoom: 14});
    };

    const superclusterRef = useRef(
        new Supercluster({
            radius: 120,
            minPoints: 2,
            map: props => ({
                prezzo: props.prezzo ?? 0,
                color: props.color ?? 0
            }),
            reduce: (a, b) => {

                a.min = Math.min(a.min ?? Infinity, b.prezzo);
                a.max = Math.max(a.max ?? -Infinity, b.prezzo);

                a.somma = (a.somma || 0) + a.prezzo;
                a.totale = (a.totale || 0) + 1;
                a.media = a.somma / a.totale;
                a.sommaColore = (a.sommaColore || 0) + a.color;
                a.mediaColore = a.sommaColore / a.totale;
                /*
                log(`min: ${a.min}`);
                log(`max: ${a.max}`);
                log(`media: ${a.media}`);
                log(`prezzo: ${b.prezzo}`);
                log(`totale: ${a.totale}`); */
            }
        })
    );

    const clusters = useMemo(() => {
        if (boundsRef.current === null) return [];
        log('clusterPoints: ' + clusteredPoints.length);
        if (clusteredPoints.length === 0) return [];
        superclusterRef.current.load(clusteredPoints);
        const record = superclusterRef.current.getClusters(boundsRef.current, zoom);
        log('clusters: ' + record.length);
        setFadeOutMarker(false);
        return record;

    }, [clusteredPoints, zoom, bounds]);


    function toEnvelopeArray(bbox) {
        return [
            bbox._sw.lng,
            bbox._sw.lat,
            bbox._ne.lng,
            bbox._ne.lat,
        ];
    }


    // calcola l'unione di due bounding box
    function bboxUnion(geometry, bboxB) {
        if (geometry === null) {
            geometry = {
                type: 'Feature',
                geometry: {
                    type: 'MultiPolygon',
                    coordinates: [],
                },
                properties: {},
            };
        }
        const polyA = bboxPolygon(toEnvelopeArray(bboxB));
        if (polyA !== null) {
            geometry.geometry.coordinates.push(polyA.geometry.coordinates);
        }
        ultimoRiquadroRef.current = geometry;
    }

    function isContained(bbox, geometry) {
        try {
            const bboxPoly = bboxPolygon(toEnvelopeArray(bbox));
            return booleanContains(geometry, bboxPoly);
        } catch (e) {
        }
        return false;
    }

    // log('MappaRisultati: BUILD');
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
                            //setFadeOutMarker(true);
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

                onMoveStart={() => {
                    log('move start');
                    setFadeOutMarker(true);
                }}

                onMoveEnd={() => {
                    debouncedBoundsChange();
                    log('move end');
                }}

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
                    onClusterClick={(cluster) => {
                        const [lng, lat] = cluster.geometry.coordinates;
                        const expansionZoom = superclusterRef.current.getClusterExpansionZoom(cluster.id);
                        mapRef.current.getMap().flyTo({center: [lng, lat], zoom: expansionZoom});
                    }}/>
                <>
                    {distributori.map((d) => {

                        const impianto = d.properties;
                        if (impianto.latitudine === undefined) return null;
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