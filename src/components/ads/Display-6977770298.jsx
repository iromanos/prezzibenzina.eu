'use client'

import {useEffect} from "react";
import {AdSenseDev} from "./LoadAdSense";


export default function Display6977770298({className = '', height = 96}) {

    useEffect(() => {
        try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (e) {
        }
    }, []);

    return <div className={className + ' w-100'} style={{height: `${height}px`}}>
        <ins className={'adsbygoogle '}
             style={{display: 'inline-block', height: `${height}px`, width: '100%'}}
             data-ad-client="ca-pub-7775238513283854"
             data-ad-slot="6977770298"
        ><AdSenseDev slotAdSense={"6977770298"}/></ins>
    </div>;
}