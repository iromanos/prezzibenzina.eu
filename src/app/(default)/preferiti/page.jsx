'use client'
import Header from "@/components/Header";
import React, {useEffect, useState} from "react";
import {getPreferiti} from "@/functions/api";
import ElencoDistributori from "../../../components/ElencoDistributori";
import Mappa from "@/components/Mappa";
import {usePreferitiGlobal} from "@/context/PreferitiProvider";
import {FooterMobile} from "../../../components/FooterMobile";


export default function Page() {


    const [impianti, setImpianti] = useState([]);

    const {preferiti} = usePreferitiGlobal();


    useEffect(() => {
        if (preferiti.length === 0) {
            setImpianti([]);
            return;
        }
        getPreferiti(preferiti).then(value => {
            setImpianti(value.impianti);
        })
    }, [preferiti]);


    console.log(impianti);

    return <>
        <Header/>
        <main className="container py-3">
            <h1>Preferiti</h1>
            {impianti.length !== 0 &&
                <Mappa distributori={impianti}/>}
            <ElencoDistributori distributori={impianti}/>
            <FooterMobile/>
        </main>
    </>;
}
