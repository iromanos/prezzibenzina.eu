import {useEffect, useState} from 'react';

export default function useLimit(defaultValue = 0) {
    const [limit, setLimitState] = useState(defaultValue);

    useEffect(() => {
        const match = document.cookie.match(/(?:^|; )limit=([^;]*)/);
        if (match) {
            setLimitState(decodeURIComponent(match[1]));
        }
    }, []);

    const setLimit = (limite) => {
        const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toUTCString(); // 30 giorni
        document.cookie = `limit=${encodeURIComponent(limite)}; path=/; expires=${expires}; SameSite=Lax`;
        setLimitState(limite);
    };


    return {limit, setLimit};
}