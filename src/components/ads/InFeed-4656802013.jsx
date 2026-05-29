'use client'

import {useEffect} from "react";
import {AdSenseDev} from "./LoadAdSense";


export default function InFeed4656802013({className}) {

    useEffect(() => {
        try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (e) {
            console.error("AdSense error:", e);
        }
    }, []);

    return <>
        <ins className={`adsbygoogle ${className}`}
             style={{display: 'block'}}
             data-ad-format="fluid"
             data-ad-layout-key="-hf-g+17-6r+e5"
             data-ad-client="ca-pub-7775238513283854"
             data-ad-slot="4656802013">
            <AdSenseDev slotAdSense={"4656802013"}/>

        </ins>
    </>;

}