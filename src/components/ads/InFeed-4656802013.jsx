'use client'

import {useEffect} from "react";


export default function InFeed4656802013() {

    if (process.env.NODE_ENV === 'development') return <div
        className={'bg-success-subtle rounded p-3 mb-3'}>InFeed4656802013</div>;

    useEffect(() => {
        try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (e) {
            console.error("AdSense error:", e);
        }
    }, []);

    return <div className={"col mb-3"}>

        <ins className={"adsbygoogle"}
             style={{display: 'block'}}
             data-ad-format="fluid"
             data-ad-layout-key="-hf-g+17-6r+e5"
             data-ad-client="ca-pub-7775238513283854"
             data-ad-slot="4656802013"></ins>
    </div>;

}