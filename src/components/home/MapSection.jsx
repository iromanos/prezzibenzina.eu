'use client';

import {useEffect, useRef, useState} from 'react';
import Map, {Marker} from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import {isMobile} from "react-device-detect";
import {getElencoStati, getImpiantiClusterByBounds} from "@/functions/api";
import {useCluster} from "@/hooks/useCluster";
import PublicIcon from "@mui/icons-material/Public";
import TuttoSchermoButton from "@/components/TuttoSchermoButton";
import Button from 'react-bootstrap/Button';
import Loader from "@/components/home/Loader";

const INITIAL_VIEW = {longitude: 8.5, latitude: 46.5, zoom: 6}; // centro CH/IT
const MAP_STYLE = 'https://tiles.stadiamaps.com/styles/outdoors.json?api_key=9441d3ae-fe96-489a-8511-2b1a3a433d29';

export function MapSection() {
    const mapRef = useRef();

    // Bounding box: [west, south], [east, north]
    const initialBounds = [
        5.6, 35.5,   // SW corner
        18.9, 47.9   // NE corner
    ];

    const [stato, setStato] = useState(undefined);

    const [zoom, setZoom] = useState(6);
    const [bounds, setBounds] = useState(null);

    const [points, setPoints] = useState([]);

    const {clusters, clusterIndex} = useCluster(points, zoom, bounds);

    const [loading, setLoading] = useState(true);


    const handleMapLoad = async (event) => {
        const map = event.target;
        map.fitBounds(initialBounds, {
            padding: 20,
            duration: 1000
        });

        const bounds = {
            _ne: {
                lng: initialBounds[2],
                lat: initialBounds[3],
            },
            _sw: {
                lng: initialBounds[0],
                lat: initialBounds[1],
            }
        };

        const response = await getImpiantiClusterByBounds(bounds, 'benzina', 'price', null);
        const json = await response.json();
        setLoading(false);
        setPoints(json);
    };

    useEffect(() => {
        if (points.length === 0) return;
        const lngs = points.map(i => i.geometry.coordinates[0]);
        const lats = points.map(i => i.geometry.coordinates[1]);

        const minLng = Math.min(...lngs);
        const maxLng = Math.max(...lngs);
        const minLat = Math.min(...lats);
        const maxLat = Math.max(...lats);

        const bounds = [
            [minLng, minLat],
            [maxLng, maxLat],
        ];

        mapRef.current.fitBounds(bounds, {
            padding: 50,
            duration: 1000,
            maxZoom: 16,
        });
    }, [points]);

    useEffect(() => {

        if (stato === undefined) return;

        const fetchData = async (bounds, stato) => {
            const latlngBounds = {
                _ne: {
                    lng: bounds[2],
                    lat: bounds[3],
                },
                _sw: {
                    lng: bounds[0],
                    lat: bounds[1],
                }
            };

            setLoading(true);
            const response = await getImpiantiClusterByBounds(latlngBounds, 'benzina', 'price', null, null, stato.id);
            const json = await response.json();
            setPoints(json);
            setLoading(false);

        }

        fetchData(initialBounds, stato);


    }, [stato])

    const elencoStati = getElencoStati();

    return (
        <div className="container mb-4">
            <h2 className="text-center fw-bold mb-4">Mappa interattiva: Italia e Svizzera in un colpo d’occhio</h2>
            <div

                style={{
                    height: '75vh'
                }}

                className="col border rounded overflow-hidden"><Map
                attributionControl={false}
                ref={mapRef}
                initialViewState={INITIAL_VIEW}
                style={{width: '100%', height: '100%'}}
                mapStyle={MAP_STYLE}
                onLoad={handleMapLoad}
                dragPan={!isMobile}             // ❌ disabilita pan con un dito
                scrollZoom={!isMobile}          // ❌ disabilita zoom con scroll
                doubleClickZoom={!isMobile}     // ❌ disabilita zoom con doppio tap
                touchZoomRotate={true}      // ✅ abilita pinch-to-zoom e rotazione con due dita
                interactive={true}          // ✅ mantiene la mappa attiva
                onMoveEnd={(e) => {
                    const b = e.target.getBounds();
                    setBounds([b.getWest(), b.getSouth(), b.getEast(), b.getNorth()]);
                    setZoom(e.viewState.zoom);
                }}
            >
                {loading && (
                    <Loader/>
                )}


                <TuttoSchermoButton onClick={() => {
                    const uri = `lat=${stato.lat}&lng=${stato.lng}&zoom=${stato.zoom}`;

                    window.location.href = `/mappa?${uri}`;

                }}/>

                {clusters.map((c, i) => {
                    const [lng, lat] = c.geometry.coordinates;
                    const isCluster = c.properties.cluster;
                    const count = c.properties.point_count;

                    const size = Math.min(120, 24 + Math.log2(count) * 6);

                    return (
                        <Marker key={i} longitude={lng} latitude={lat}>
                            <div

                                style={{
                                    width: size,
                                    height: size,
                                }}

                                className={`d-flex align-items-center justify-content-center bg-success 
                            text-white
                                                        bg-opacity-75 rounded-circle border border-2 border-white`}
                                title={isCluster ? `${count} impianti` : c.properties.brand}
                                onClick={() => {
                                    const expansionZoom = clusterIndex.getClusterExpansionZoom(c.id);
                                    mapRef.current.getMap().flyTo({center: [lng, lat], zoom: expansionZoom});
                                }}
                            >
                                {isCluster ? count : 1}
                            </div>
                        </Marker>
                    );
                })}
            </Map></div>


            <div className="d-flex justify-content-center gap-2 mt-3">

                {elencoStati.map((c, i) => {
                    return <Button
                        key={i}
                        variant={` ${stato !== undefined && stato.id === c.id ? 'btn-primary' : 'btn-outline-primary'} `}
                        onClick={() => {
                            setPoints([]);
                            mapRef.current.flyTo({
                                center: [c.lng, c.lat], zoom: c.zoom,
                            });
                            setStato(c)
                        }}> {c.icon} {c.name}</Button>

                })}
                <button

                    onClick={() => {
                        setPoints([]);
                        mapRef.current.fitBounds(initialBounds, {
                            padding: 20,
                            duration: 1000
                        });
                        setStato(null);
                    }}


                    className={`btn ${stato == null ? 'btn-primary' : 'btn-outline-primary'} `}>Tutti <PublicIcon/>
                </button>
            </div>
        </div>
    );
}
