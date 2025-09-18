'use client'

import {useCookieConsent} from './CookieConsentContext';

export default function CookieLink() {

    const {updateConsent} = useCookieConsent();


    return <a title={"Modifica preferenze cookie"} href="#" onClick={() => updateConsent({})}
              className="link-secondary">
        Modifica preferenze cookie
    </a>;
}