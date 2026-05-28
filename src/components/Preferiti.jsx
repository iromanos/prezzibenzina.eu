'use client'
import React, {useEffect, useState} from "react";
import Mappa from "@/components/Mappa";
import ElencoDistributori from "@/components/ElencoDistributori";
import {usePreferitiGlobal} from "@/context/PreferitiProvider";
import {getPreferiti} from "@/functions/api";


export default function Preferiti() {

    const [impianti, setImpianti] = useState([]);

    const {preferiti} = usePreferitiGlobal();

    useEffect(() => {
        if (preferiti.length === 0) {
            setImpianti([]);
            return;
        }
        getPreferiti(preferiti).then(value => {

            const record = value.impianti.map((m) => {
                return m.properties;
            });

            setImpianti(record);
        })
    }, [preferiti]);


    return <>            {impianti.length !== 0 &&
        <Mappa distributori={impianti}/>}
        <ElencoDistributori distributori={impianti}/>
    </>
}