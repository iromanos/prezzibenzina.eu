'use client'

import {useEffect} from "react";
import {AdSenseDev} from "./LoadAdSense";


export default function Display5745053645() {

    useEffect(() => {
        try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (e) {
            console.error("AdSense error:", e);
        }
    }, []);

    return <>
        <ins className="adsbygoogle mb-3 w-100"
             style={{display: 'block'}}
             data-ad-client="ca-pub-7775238513283854"
             data-ad-slot="5745053645"
             data-ad-format="auto"
             data-full-width-responsive="true"
        >
            <AdSenseDev slotAdSense={"5745053645"}/>

        </ins>
    </>;
}