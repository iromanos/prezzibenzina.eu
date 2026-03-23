// app/_components/Analytics.jsx
'use client';

import Script from 'next/script';
import {useCookieConsent} from './CookieConsentContext';

export default function Analytics({trackId}) {
    const {consent} = useCookieConsent();

    const allowTracking =
        consent?.analytics === true || consent?.marketing === true;

    // const trackId = "G-Q603H5VH66";

    if (process.env.NODE_ENV === 'development') return null;

    // console.log("Analytics: Consent status", JSON.stringify(consent));

    if (!allowTracking) return null;

    // console.log("Analytics: Tracking enabled with ID", trackId);

    return (
        <>
            <Script
                src={`https://www.googletagmanager.com/gtag/js?id=${trackId}`}
                strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
                {`
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${trackId}', {
                    page_path: window.location.pathname,
                    anonymize_ip: true
                  });
                `}
            </Script>
        </>
    );
}
