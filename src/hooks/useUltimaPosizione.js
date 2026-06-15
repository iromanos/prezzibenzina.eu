import {useEffect, useState} from "react";


export default function useUltimaPosizione() {

    const posizioneDefault = {
        center: {
            lng: 9.1896346,
            lat: 45.4641943,
        },
        zoom: 12
    }

    const [posizione, setPosizione] = useState(null);

    useEffect(() => {
        const record = localStorage.getItem('position');
        if (record) {
            setPosizione(JSON.parse(record));
        } else setPosizione(posizioneDefault);
    }, []);


    const aggiornaPosizione = (pos) => {
        setPosizione(pos);
        localStorage.setItem('position', JSON.stringify(pos));
    }

    return {posizione, aggiornaPosizione};

}
