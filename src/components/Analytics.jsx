// app/_components/Analytics.jsx
'use client';

import Script from 'next/script';
import {useCookieConsent} from './CookieConsentContext';

export default function Analytics({trackId}) {
    const {consent} = useCookieConsent();

    const allowTracking =
        consent?.analytics === true || consent?.marketing === true;
    if (!allowTracking && process.env.NODE_ENV === 'development') return <>

        <div className={'bg-danger text-center text-white ' +
            'position-fixed m-4 start-0 bottom-0 z-3 p-3 rounded-2'}>
            GA4 ID: {trackId} - Tracking is disabled by cookie consent.
        </div>
    </>


    if (!allowTracking) return null;

    if (process.env.NODE_ENV === 'development') {
        return <></>;
        return <>
            <div className={'opacity-25  bg-success text-center text-white ' +
                'position-fixed m-4 start-0 bottom-0 z-3 p-3 rounded-2'}>
                GA4 ID: {trackId} - Tracking is disabled in development mode.
            </div>
        </>;
    }


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
