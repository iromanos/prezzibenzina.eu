'use client'

import {useEffect} from "react";
import {AdSenseDev} from "./LoadAdSense";


export default function Display6977770298() {


    // if (process.env.NODE_ENV === 'development') return <div
    //     className={'bg-success-subtle p-4 rounded mb-3'}>Display6977770298</div>;

    useEffect(() => {
        console.log("CHECK ADSENSE");
        try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (e) {
            console.error("AdSense error:", e);
        }
    }, []);

    return <>
        <ins className="adsbygoogle"
             style={{display: 'inline-block', height: '82px', width: '100%'}}
             data-ad-client="ca-pub-7775238513283854"
             data-ad-slot="6977770298"
        ><AdSenseDev style={{
            height: '82px'
        }} slotAdSense={"6977770298"}/></ins>
    </>;
}