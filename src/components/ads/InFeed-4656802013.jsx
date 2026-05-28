'use client'

import {useEffect} from "react";


export default function InFeed4656802013({className}) {

    if (process.env.NODE_ENV === 'development') return <div
        className={`bg-success-subtle p-3 rounded ${className}`}>InFeed4656802013</div>;

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
             data-ad-slot="4656802013"></ins>
    </>;

}