'use client';

import {useEffect, useRef, useState} from 'react';
import Map, {Marker} from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';


import Supercluster from 'supercluster';
import {isMobile} from "react-device-detect";
import {getImpiantiByBounds} from "@/functions/api";

const INITIAL_VIEW = {longitude: 8.5, latitude: 46.5, zoom: 6}; // centro CH/IT
const MAP_STYLE = 'https://tiles.stadiamaps.com/styles/outdoors.json?api_key=9441d3ae-fe96-489a-8511-2b1a3a433d29';

export default function MapSection() {
    const mapRef = useRef();
    const [clusters, setClusters] = useState([]);
    const [supercluster, setSupercluster] = useState(null);

    // Bounding box: [west, south], [east, north]
    const bounds = [
        [5.6, 35.5],   // SW corner
        [18.9, 47.9]   // NE corner
    ];

    // Mock distributori
    const points = [
        {
            type: 'Feature',
            geometry: {type: 'Point', coordinates: [7.9735, 47.1928]}, // Svizzera
            properties: {id: 'ch1', nation: 'ch', brand: 'AVIA'},
        },
        {
            type: 'Feature',
            geometry: {type: 'Point', coordinates: [9.1900, 45.4642]}, // Milano
            properties: {id: 'it1', nation: 'it', brand: 'Eni'},
        },
        {
            type: 'Feature',
            geometry: {type: 'Point', coordinates: [8.55, 46.2]}, // misto
            properties: {id: 'mix1', nation: 'ch', brand: 'Coop'},
        },
    ];

    useEffect(() => {
        const cluster = new Supercluster({
            radius: 60,
            maxZoom: 16,
            map: props => ({nation: props.nation}),
            reduce: (accumulated, props) => {
                accumulated.nationCount = accumulated.nationCount || {};
                accumulated.nationCount[props.nation] = (accumulated.nationCount[props.nation] || 0) + 1;
            },
        });

        cluster.load(points);
        setSupercluster(cluster);
    }, []);


    const handleMapLoad = async (event) => {
        const map = event.target;
        map.fitBounds(bounds, {
            padding: 20,
            duration: 1000
        });
        map.setMaxBounds(bounds);

        const response = await getImpiantiByBounds(map.getBounds(), 'benzina', 'price', null);

    };


    useEffect(() => {
        if (!supercluster || !mapRef.current) return;

        const bounds = mapRef.current.getMap().getBounds().toArray().flat();
        const zoom = mapRef.current.getMap().getZoom();
        const results = supercluster.getClusters(bounds, Math.round(zoom));
        setClusters(results);
    }, [supercluster]);

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

            onMove={() => {
                if (!supercluster || !mapRef.current) return;
                const bounds = mapRef.current.getMap().getBounds().toArray().flat();
                const zoom = mapRef.current.getMap().getZoom();
                const results = supercluster.getClusters(bounds, Math.round(zoom));
                setClusters(results);
            }}
        >
            {clusters.map((c, i) => {
                const [lng, lat] = c.geometry.coordinates;
                const isCluster = c.properties.cluster;
                const count = c.properties.point_count;
                const isMixed = c.properties.nationCount && Object.keys(c.properties.nationCount).length > 1;
                const color = isMixed ? 'purple' : c.properties.nation === 'it' ? 'blue' : 'red';

                return (
                    <Marker key={i} longitude={lng} latitude={lat}>
                        <div
                            className={`rounded-circle text-white fw-bold d-flex align-items-center justify-content-center`}
                            style={{
                                width: isCluster ? 40 : 24,
                                height: isCluster ? 40 : 24,
                                backgroundColor: color,
                                border: '2px solid white',
                                fontSize: isCluster ? '1rem' : '0.75rem',
                                cursor: 'pointer',
                            }}
                            title={isCluster ? `${count} impianti` : c.properties.brand}
                            onClick={() => {
                                if (isCluster && supercluster) {
                                    const expansionZoom = supercluster.getClusterExpansionZoom(c.id);
                                    mapRef.current.getMap().flyTo({center: [lng, lat], zoom: expansionZoom});
                                }
                            }}
                        >
                            {isCluster ? count : '⛽'}
                        </div>
                    </Marker>
                );
            })}
        </Map>
    );
}
