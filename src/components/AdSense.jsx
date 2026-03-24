'use client';

import {useCookieConsent} from './CookieConsentContext';

const adClient = 'ca-pub-7775238513283854'; // ← Inserisci il tuo ID AdSense

export default function AdSense() {
    const {consent} = useCookieConsent();

    if (process.env.NODE_ENV === 'development') return null;

    const allowAds = consent?.marketing === true;


    console.log(consent);

    if (!allowAds) return null;

    return (
        <>
        </>
    );
}
