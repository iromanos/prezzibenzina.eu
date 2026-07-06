'use client';

import React, {memo, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import Map, {Marker} from 'react-map-gl/maplibre';
import useSupercluster from 'use-supercluster';
import 'maplibre-gl/dist/maplibre-gl.css';
import {BsFuelPumpFill} from "react-icons/bs";

// Estraiamo il singolo Marker in un componente memoizzato per migliorare le performance
// quando ci sono molti impianti sulla mappa.
const StationMarker = memo(({d, URI_IMAGE}) => (
    <Marker
        latitude={d.latitudine}
        longitude={d.longitudine}
        anchor="bottom"
    >
        <div
            className="d-flex flex-column align-items-center"
            style={{cursor: 'pointer'}}
            onClick={() => {
                const el = document.getElementById(`impianto-${d.id_impianto}`);
                el?.scrollIntoView({behavior: 'smooth', block: 'center'});
            }}
        >
            <div className="bg-success text-white rounded-pill px-2 py-1 small shadow-sm border border-white">
                {d.prezzo}€
            </div>
            <div
                className="bg-white rounded-circle shadow-sm d-flex align-items-center justify-content-center border"
                style={{width: '30px', height: '30px', marginTop: '-5px'}}
            >
                {d.image ? (
                    <img src={`${URI_IMAGE}${d.image}`} alt=""
                         style={{width: '20px', height: '20px', objectFit: 'contain'}}/>
                ) : (
                    <BsFuelPumpFill className="text-primary" size={14}/>
                )}
            </div>
        </div>
    </Marker>
));

// Componente per il cluster che mostra il numero di distributori
const ClusterMarker = memo(({cluster, onClusterClick}) => {
    const [longitude, latitude] = cluster.geometry.coordinates;
    const {point_count: pointCount} = cluster.properties;

    return (
        <Marker latitude={latitude} longitude={longitude}>
            <div
                className="d-flex align-items-center justify-content-center bg-light text-secondary rounded-circle shadow fw-bold border border-secondary-subtle"
                style={{
                    width: `${35 + Math.min(pointCount, 20)}px`,
                    height: `${35 + Math.min(pointCount, 20)}px`,
                    cursor: 'pointer',
                    fontSize: '14px'
                }}
                onClick={() => onClusterClick(cluster.id, [longitude, latitude])}
            >
                {pointCount}
            </div>
        </Marker>
    );
});

export default function MapComponent({distributori, comuneData}) {
    const mapRef = useRef(null);
    const [isMapLoaded, setIsMapLoaded] = useState(false);
    const [bounds, setBounds] = useState(null);
    const [viewState, setViewState] = useState({
        latitude: 45.4642,
        longitude: 9.1897,
        zoom: 11
    });

    const URI_IMAGE = process.env.NEXT_PUBLIC_IMAGE_ENDPOINT;

    // 1. Filtriamo solo i distributori con coordinate valide per evitare errori di calcolo
    const validDistributori = useMemo(() => {
        return distributori?.filter(d =>
            d.latitudine && d.longitudine &&
            d.latitudine !== 0 && d.longitudine !== 0
        ) || [];
    }, [distributori]);

    // Centro iniziale (usato solo al primo caricamento)
    const initialViewState = useMemo(() => {
        if (validDistributori.length > 0) {
            const lats = validDistributori.map(d => d.latitudine);
            const lons = validDistributori.map(d => d.longitudine);
            return {
                latitude: (Math.min(...lats) + Math.max(...lats)) / 2,
                longitude: (Math.min(...lons) + Math.max(...lons)) / 2,
                zoom: 11
            };
        }
        return {
            latitude: 45.4642, longitude: 9.1897, zoom: 11
        };
    }, [validDistributori]);

    // Aggiorna lo stato locale quando cambia la visuale iniziale calcolata
    useEffect(() => {
        if (initialViewState) setViewState(initialViewState);
    }, [initialViewState]);

    // 1.5 Convertiamo i distributori in GeoJSON per il clustering
    const points = useMemo(() => validDistributori.map(d => ({
        type: "Feature",
        properties: {cluster: false, station: d},
        geometry: {
            type: "Point",
            coordinates: [parseFloat(d.longitudine), parseFloat(d.latitudine)]
        }
    })), [validDistributori]);

    // Eseguiamo il clustering
    const {clusters, supercluster} = useSupercluster({
        points,
        bounds,
        zoom: viewState.zoom,
        options: {radius: 75, maxZoom: 18}
    });

    // Gestione aggiornamento bounds e viewState durante il movimento
    const onMove = useCallback((evt) => {
        setViewState(evt.viewState);
        const mapBounds = evt.target.getBounds().toArray().flat();
        setBounds(mapBounds);
    }, []);

    // Funzione per espandere il cluster al click
    const handleClusterClick = useCallback((id, coordinates) => {
        const expansionZoom = Math.min(
            supercluster.getClusterExpansionZoom(id),
            20
        );
        mapRef.current.flyTo({
            center: coordinates,
            zoom: expansionZoom,
            speed: 1.5
        });
    }, [supercluster]);

    // 1.8 Ascolta l'evento dal carosello per centrare la mappa su un distributore specifico
    useEffect(() => {
        const handleCenterOnStation = (e) => {
            const stationId = e.detail?.id;
            const station = validDistributori.find(s => s.id_impianto === stationId);

            if (station && mapRef.current && isMapLoaded) {
                mapRef.current.flyTo({
                    center: [station.longitudine, station.latitudine],
                    zoom: 13, // Livello di zoom ravvicinato per vedere bene l'impianto
                    essential: true,
                    duration: 1000 // Animazione fluida di un secondo
                });
            }
        };

        window.addEventListener('pb-scroll-to-impianto', handleCenterOnStation);
        return () => window.removeEventListener('pb-scroll-to-impianto', handleCenterOnStation);
    }, [validDistributori, isMapLoaded]);


    // 2. Ogni volta che cambiano i distributori, adattiamo la visuale (fitBounds)
    useEffect(() => {
        if (isMapLoaded && mapRef.current && validDistributori.length > 0) {
            const lons = validDistributori.map(d => d.longitudine);
            const lats = validDistributori.map(d => d.latitudine);

            const minLon = Math.min(...lons);
            const maxLon = Math.max(...lons);
            const minLat = Math.min(...lats);
            const maxLat = Math.max(...lats);

            // Se c'è più di un distributore, inquadriamoli tutti
            if (validDistributori.length > 1) {
                mapRef.current.fitBounds(
                    [minLon, minLat, maxLon, maxLat],
                    {padding: 60, duration: 1000}
                );
            } else {
                mapRef.current.flyTo({center: [minLon, minLat], zoom: 14});
            }
        }
    }, [validDistributori, isMapLoaded]);

    return (
        <div className="rounded shadow-sm overflow-hidden border"
             style={{height: '100%', width: '100%', position: 'relative'}}>
            <Map
                attributionControl={false}
                ref={mapRef}
                onLoad={() => {
                    setIsMapLoaded(true);
                    const b = mapRef.current.getBounds().toArray().flat();
                    setBounds(b);
                }}
                {...viewState}
                onMove={onMove}
                mapStyle="https://tiles.basemaps.cartocdn.com/gl/positron-gl-style/style.json"
                style={{width: '100%', height: '100%'}}
            >
                {/*<NavigationControl position="top-right" />*/}

                {clusters.map((cluster) => {
                    const [longitude, latitude] = cluster.geometry.coordinates;
                    const {cluster: isCluster, station} = cluster.properties;

                    if (isCluster) {
                        return (
                            <ClusterMarker
                                key={`cluster-${cluster.id}`}
                                cluster={cluster}
                                onClusterClick={handleClusterClick}
                            />
                        );
                    }

                    return (
                        <StationMarker
                            key={`station-${station.id_impianto}`}
                            d={station}
                            URI_IMAGE={URI_IMAGE}
                        />
                    );
                })}
            </Map>
        </div>
    );
}