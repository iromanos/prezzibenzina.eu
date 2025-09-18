'use client';

import {createContext, useContext, useEffect, useState} from 'react';

export const defaultConsent = {
    technical: true, // sempre attivi
    preferences: false,
    analytics: false,
    marketing: false,
};

export const resetConsent = {
    technical: false, // sempre attivi
    preferences: false,
    analytics: false,
    marketing: false,
};

const CookieConsentContext = createContext(null);

export function CookieConsentProvider({children}) {
    const [consent, setConsent] = useState(resetConsent);
    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem('cookieConsent');
        if (stored) {
            setConsent(JSON.parse(stored));
        }
        setInitialized(true);
    }, []);

    const updateConsent = (newConsent) => {
        localStorage.setItem('cookieConsent', JSON.stringify(newConsent));
        setConsent(newConsent);
    };

    return (
        <CookieConsentContext.Provider value={{consent, updateConsent, initialized}}>
            {children}
        </CookieConsentContext.Provider>
    );
}

export const useCookieConsent = () => useContext(CookieConsentContext);
