import {useEffect, useState} from 'react';
import {getElencoCarburanti, postCookie} from "@/functions/api";

export default function useCarburante(defaultValue = '') {
    const [carburante, setCarburanteState] = useState(null);


    useEffect(() => {
        const elencoCarburanti = getElencoCarburanti();
        const match = localStorage.getItem('carburante');
        const tipo = elencoCarburanti.find(u => u.tipo === match) || elencoCarburanti[0];
        setCarburanteState(tipo);
    }, [defaultValue]);

    const setCarburante = (tipo) => {
        const elencoCarburanti = getElencoCarburanti();
        localStorage.setItem('carburante', tipo);
        const record = elencoCarburanti.find(u => u.tipo === tipo) || elencoCarburanti[0];
        setCarburanteState(record);

        postCookie({carburante: tipo});

    };

    return {carburante, setCarburante};
}
