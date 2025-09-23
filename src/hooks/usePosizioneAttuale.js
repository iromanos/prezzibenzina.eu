import {useEffect, useState} from 'react';

export function usePosizioneAttuale() {
    const [posizione, setPosizione] = useState(null);

    useEffect(() => {
        if (!navigator.geolocation) return;

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const {latitude, longitude} = pos.coords;
                setPosizione({lat: latitude, lon: longitude});
            },
            (err) => {
                console.warn('Geolocalizzazione fallita:', err);
            },
            {enableHighAccuracy: true, timeout: 5000}
        );
    }, []);

    return posizione;
}
