'use client';
import {useEffect, useState} from 'react';
import Script from 'next/script';
import useInteraction from "@/hooks/useInteraction";

export default function LoadAdSense() {
    const [loadAds, setLoadAds] = useState(false);

    const events = [
        'scroll', 'mousemove', 'touchstart'
    ];

    useEffect(() => {
        const handleInteraction = () => {
            setLoadAds(true);
            events.forEach(event => window.removeEventListener(event, handleInteraction));
        };

        events.forEach(event => window.addEventListener(event, handleInteraction, {passive: true}));

        return () => {
            events.forEach(event => window.removeEventListener(event, handleInteraction));
        };

    }, []);

    if (!loadAds) return null;

    if (process.env.NODE_ENV === 'development') {

        window.dataLayer = [];
        window.gtag = function () {
            window.dataLayer.push(arguments);
            // console.log(arguments);
        };

        window.gtag('consent', 'default', {
            'ad_storage': 'denied',
            'ad_user_data': 'denied',
            'ad_personalization': 'denied',
            'analytics_storage': 'denied'
        });

        return <></>;
    }


    return (
        <Script
            onReady={() => {
                window.dataLayer = window.dataLayer || [];
                window.gtag = function () {
                    window.dataLayer.push(arguments);
                    // console.log(arguments);
                };

                window.gtag('consent', 'default', {
                    'ad_storage': 'denied',
                    'ad_user_data': 'denied',
                    'ad_personalization': 'denied',
                    'analytics_storage': 'denied'
                });
            }}

            strategy="afterInteractive"
            src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7775238513283854"
            crossOrigin="anonymous"/>
    );
}

export function AdSenseDev({slotAdSense, style}) {

    if (process.env.NODE_ENV !== 'development') return <></>;

    const {active} = useInteraction();

    let ads = <span></span>;
    if (active) {
        ads = <span>Slot {slotAdSense}</span>;
    }

    return <div style={style}
                className={'align-items-center d-flex justify-content-center bg-light-subtle h-100'}>{ads}</div>;
}