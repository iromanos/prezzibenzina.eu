import {useEffect, useState} from "react";


export default function useBrand() {

    const [brand, setBrandState] = useState(null);

    useEffect(() => {
        const match = document.cookie.match(/(?:^|; )brand=([^;]*)/);

        if (match) {
            try {
                const json = atob(match[1]);
                const record = JSON.parse(json);
                setBrandState(record);
            } catch (e) {
                setBrandState(null);
            }
        } else setBrandState(null);
    }, []);

    const setBrand = (record) => {
        const json = JSON.stringify(record);
        const base64 = btoa(json);
        const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toUTCString(); // 30 giorni
        document.cookie = `brand=${encodeURIComponent(base64)}; path=/; expires=${expires}; SameSite=Lax`;
        setBrandState(record);
    };

    return {brand, setBrand};

}