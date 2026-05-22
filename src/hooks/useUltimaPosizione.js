import {useEffect, useState} from "react";


export default function useUltimaPosizione() {

    const [posizione, setPosizione] = useState(null);

    useEffect(() => {
        const record = localStorage.getItem('position');
        if (record) {
            setPosizione(JSON.parse(record));
        } else setPosizione(false);
    }, []);


    const aggiornaPosizione = (pos) => {
        setPosizione(pos);
        localStorage.setItem('position', JSON.stringify(pos));
    }

    return {posizione, aggiornaPosizione};

}
