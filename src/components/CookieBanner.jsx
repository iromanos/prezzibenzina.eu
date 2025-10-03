'use client';

import React, {useState} from 'react';
import {defaultConsent, useCookieConsent} from './CookieConsentContext';
import CookieIcon from '@mui/icons-material/Cookie';
import {log} from "@/functions/helpers";

export default function CookieBanner() {
    const {consent, updateConsent, initialized} = useCookieConsent();
    const [expanded, setExpanded] = useState(false);

    log(initialized);
    log(consent);

    if (!initialized || consent.preferences || consent.analytics || consent.marketing || consent.technical) return null;


    const handleAcceptAll = () => {
        updateConsent({
            technical: true,
            preferences: true,
            analytics: true,
            marketing: true,
        });
    };

    const handleRejectAll = () => {
        updateConsent(defaultConsent);
    };


    const handleSave = (e) => {
        e.preventDefault();
        const form = e.target;
        updateConsent({
            technical: true,
            preferences: form.preferences.checked,
            analytics: form.analytics.checked,
            marketing: form.marketing.checked,
        });
    };

    return (
        <div className="position-fixed bottom-0 start-0 end-0 bg-light border-top shadow p-3 z-index-fixed">
            <div className="container ">
                <div className="mb-2 text-center">
                    <span className={'d-block'}><CookieIcon className="me-2 text-warning" fontSize="small"/>
                        <strong>Usiamo i cookie</strong> per migliorare l’esperienza utente.</span>
                    <a href="/cookie" className="link-primary">Scopri di più</a>.
                </div>

                {!expanded ? (
                    <div className="d-flex gap-2 justify-content-center">
                        <button className="btn btn-primary btn-sm" onClick={handleAcceptAll}>
                            Accetta tutti
                        </button>
                        <button className="btn btn-outline-primary btn-sm" onClick={handleRejectAll}>
                            Rifiuta tutti
                        </button>
                        <button className="btn btn-outline-secondary btn-sm" onClick={() => setExpanded(true)}>
                            Personalizza
                        </button>
                    </div>
                ) : (
                    <form className={'mx-auto col-6 p-2 rounded border'} onSubmit={handleSave}>
                        <div className="form-check">
                            <input className="form-check-input" type="checkbox" id="preferences" name="preferences"/>
                            <label className="form-check-label" htmlFor="preferences">
                                Cookie di preferenza
                            </label>
                        </div>
                        <div className="form-check">
                            <input className="form-check-input" type="checkbox" id="analytics" name="analytics"/>
                            <label className="form-check-label" htmlFor="analytics">
                                Cookie statistici
                            </label>
                        </div>
                        <div className="form-check mb-2">
                            <input className="form-check-input" type="checkbox" id="marketing" name="marketing"/>
                            <label className="form-check-label" htmlFor="marketing">
                                Cookie di marketing
                            </label>
                        </div>
                        <div className="d-flex gap-2 justify-content-center">
                            <button type="submit" className="btn btn-success btn-sm">
                                Salva preferenze
                            </button>
                            <button type="button" className="btn btn-outline-secondary btn-sm"
                                    onClick={() => setExpanded(false)}>
                                Annulla
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
