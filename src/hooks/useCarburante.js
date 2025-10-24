import {useEffect, useState} from 'react';

export default function useCarburante(defaultValue = '') {
    const [carburante, setCarburanteState] = useState(defaultValue);

    useEffect(() => {
        if (defaultValue !== '') return;
        const match = document.cookie.match(/(?:^|; )carburante=([^;]*)/);
        if (match) {
            setCarburanteState(decodeURIComponent(match[1]));
        } else setCarburanteState(defaultValue);
    }, []);

    const setCarburante = (tipo) => {
        const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toUTCString(); // 30 giorni
        document.cookie = `carburante=${encodeURIComponent(tipo)}; path=/; expires=${expires}; SameSite=Lax`;
        setCarburanteState(tipo);
    };

    return {carburante, setCarburante};
}
