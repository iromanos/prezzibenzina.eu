'use client'
import Header from "@/components/Header";
import React, {useEffect, useState} from "react";
import {getPreferiti} from "@/functions/api";
import ElencoDistributori from "../../../components/ElencoDistributori";
import Mappa from "@/components/Mappa";
import {usePreferitiGlobal} from "@/context/PreferitiProvider";
import {FooterMobile} from "@/components/FooterMobile";
import {getCanonicalUrl} from "@/functions/server";
import {headers} from "next/headers";


export async function generateMetadata() {

    const canonicalUrl = getCanonicalUrl(await headers()) + '/preferiti';

    return {
        title: 'Preferiti | PrezziBenzina.eu',
        description:
            'I miei distributori preferiti',
        alternates: {
            canonical: canonicalUrl,
            languages: {
                'it': canonicalUrl,
                'x-default': canonicalUrl,
            },

        },
        robots: 'index, follow',
    };
}


export default function Page() {


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


    console.log("IMPIANTI PREFERITI", impianti);

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
