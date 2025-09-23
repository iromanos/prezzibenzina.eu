'use client';

import {Marker} from 'react-map-gl/maplibre';

export default function PosizioneAttualeMarker({lat, lon}) {
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;

    return (
        <Marker latitude={lat} longitude={lon} anchor="center">
            <div
                className="posizione-marker"
                title="Tu sei qui"
                style={{
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    backgroundColor: '#007aff',
                    boxShadow: '0 0 0 4px rgba(0,122,255,0.3)',
                    animation: 'pulse 2s infinite'
                }}
            />
            <style jsx>{`
                @keyframes pulse {
                    0% {
                        box-shadow: 0 0 0 4px rgba(0, 122, 255, 0.3);
                    }
                    50% {
                        box-shadow: 0 0 0 8px rgba(0, 122, 255, 0.1);
                    }
                    100% {
                        box-shadow: 0 0 0 4px rgba(0, 122, 255, 0.3);
                    }
                }
            `}</style>
        </Marker>
    );
}
