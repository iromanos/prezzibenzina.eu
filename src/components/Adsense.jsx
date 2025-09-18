'use client';

import Script from 'next/script';
import {useCookieConsent} from './CookieConsentContext';

const adClient = 'ca-pub-7775238513283854'; // ← Inserisci il tuo ID AdSense

export default function Adsense() {
    const {consent} = useCookieConsent();

    if (process.env.NODE_ENV === 'development') return null;

    const allowAds = consent?.marketing === true;

    if (!allowAds) return null;

    return (
        <>
            <Script
                id="adsense-script"
                strategy="afterInteractive"
                async
                src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adClient}`}
                crossOrigin="anonymous"
            />
        </>
    );
}
