'use client'
import {useEffect} from "react";
import {AdSenseDev} from "@/components/ads/LoadAdSense";


export function Verticale7119992054() {

    useEffect(() => {
        try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (e) {
            console.error("AdSense error:", e);
        }
    }, []);

    return <>
        <ins className="adsbygoogle"
             style={{display: 'block'}}
             data-ad-client="ca-pub-7775238513283854"
             data-ad-slot="7119992054"
             data-ad-format="auto"
             data-full-width-responsive="true">
            <AdSenseDev slotAdSense={"7119992054"}/>
        </ins>
    </>;


}