'use client';

import {useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';

export default function GeolocationHandler({serviceSlug}) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const {latitude, longitude} = position.coords;
                    router.replace(`/distributori/${serviceSlug}/vicino-a-me?lat=${latitude}&lon=${longitude}`);
                },
                (error) => {
                    console.error("Errore geolocalizzazione:", error);
                    // Fallback a Milano
                    router.replace(`/distributori/${serviceSlug}/milano`);
                },
                {enableHighAccuracy: true, timeout: 10000, maximumAge: 0}
            );
        } else {
            console.error("Geolocalizzazione non supportata dal browser.");
            // Fallback a Milano
            router.replace(`/distributori/${serviceSlug}/milano`);
        }
    }, [serviceSlug, router]);

    if (loading) {
        return (
            <div className="container py-5 text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Caricamento posizione...</span>
                </div>
                <p className="mt-3 text-muted">Rilevamento posizione in corso...</p>
            </div>
        );
    }

    return null; // Questo componente reindirizza, quindi non renderizza nulla dopo il caricamento
}