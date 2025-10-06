'use client';

import {useRef, useState} from 'react';
import Map, {Marker} from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import {isMobile} from "react-device-detect";
import {getImpiantiClusterByBounds} from "@/functions/api";
import {log} from "@/functions/helpers";
import {useCluster} from "@/hooks/useCluster";

const INITIAL_VIEW = {longitude: 8.5, latitude: 46.5, zoom: 6}; // centro CH/IT
const MAP_STYLE = 'https://tiles.stadiamaps.com/styles/outdoors.json?api_key=9441d3ae-fe96-489a-8511-2b1a3a433d29';

export default function MapSection() {
    const mapRef = useRef();
    const [supercluster, setSupercluster] = useState(null);

    // Bounding box: [west, south], [east, north]
    const initialBounds = [
        [5.6, 35.5],   // SW corner
        [18.9, 47.9]   // NE corner
    ];

    const [zoom, setZoom] = useState(6);
    const [bounds, setBounds] = useState(null);

    const [points, setPoints] = useState([]);

    const {clusters, clusterIndex} = useCluster(points, zoom, bounds);

    const handleMapLoad = async (event) => {
        const map = event.target;
        map.fitBounds(initialBounds, {
            padding: 20,
            duration: 1000
        });

        const bounds = {
            _ne: {
                lng: initialBounds[1][0],
                lat: initialBounds[1][1],
            },
            _sw: {
                lng: initialBounds[0][0],
                lat: initialBounds[0][1],
            }
        };

        const response = await getImpiantiClusterByBounds(bounds, 'benzina', 'price', null);
        const json = await response.json();
        setPoints(json);
    };

    log("CLUSTERS: " + clusters.length);

    return (
        <Map
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
            {clusters.map((c, i) => {

                log("CLUSTERS: " + c);

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
        </Map>
    );
}
