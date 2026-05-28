'use client';
import {useEffect, useState} from 'react';
import Script from 'next/script';

export default function LoadAdSense() {
    const [loadAds, setLoadAds] = useState(false);

    useEffect(() => {
        const handleInteraction = () => {
            setLoadAds(true);
            window.removeEventListener('scroll', handleInteraction);
            window.removeEventListener('pointerdown', handleInteraction);
        };

        window.addEventListener('scroll', handleInteraction, {passive: true});
        window.addEventListener('pointerdown', handleInteraction, {passive: true});

        return () => {
            window.removeEventListener('scroll', handleInteraction);
            window.removeEventListener('pointerdown', handleInteraction);
        };
    }, []);

    if (!loadAds) return null;

    return (
        <Script

            onReady={() => {
                window.dataLayer = window.dataLayer || [];
                window.gtag = function () {
                    window.dataLayer.push(arguments);
                    console.log(arguments);
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