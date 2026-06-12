'use client';

import React, {useEffect, useState} from 'react';
import {defaultConsent, useCookieConsent} from './CookieConsentContext';
import CookieIcon from '@mui/icons-material/Cookie';
import {logDebug} from "@/functions/helpers";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import useMobile from "@/hooks/useMobile";
import useInteraction from "@/hooks/useInteraction";

export default function CookieBanner({forMobile = false}) {
    const {consent, updateConsent, initialized} = useCookieConsent();
    const [expanded, setExpanded] = useState(false);

    const {isMobile} = useMobile();

    const [show, setShow] = useState(false);

    logDebug(initialized);
    logDebug(consent);

    const {active} = useInteraction();

    const updateGoogleConsent = (status) => {
        if (typeof window.gtag !== 'undefined') {
            window.gtag('consent', 'update', {
                'ad_storage': status,
                'ad_user_data': status,
                'ad_personalization': status,
                'analytics_storage': status
            });
        }
    };

    useEffect(() => {
        if (active === false) return;
        if (!initialized) return;
        if (consent.technical === false) {
            setShow(true);
        }
        if (consent.marketing) {
            updateGoogleConsent('granted');
        }
        if (consent.marketing === false) {
            updateGoogleConsent('denied');
        }

    }, [active, consent, initialized]);

    if (!initialized) return null;

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
        setShow(false);
        setExpanded(false);
    };

    if (show === false && forMobile === false && isMobile === false) {
        return <Button
            onClick={() => {
                setShow(true);
            }}
            style={{
                width: 56,
                height: 56
            }}
            className={'border rounded-circle shadow ' +
                'd-flex align-items-center justify-content-center ' +
                'position-fixed m-4 z-50 end-0 bottom-0'}
            size={'lg'}
            variant={'primary'}

        ><CookieIcon/></Button>;
    }

    if (show === false && forMobile === true && isMobile === true) {
        return <Button
            onClick={() => {
                setShow(true);
            }}

            variant={'light'}
            className={'ms-auto'}
        ><CookieIcon className={'text-primary'}/></Button>;
    }

    if (forMobile !== isMobile) return <></>;

    return <Modal
        size={'lg'} centered show={show}>
        <Modal.Header>
            <Modal.Title>
                <CookieIcon className="me-3 text-warning"/>Gestione dei cookies
            </Modal.Title>
        </Modal.Header>
        <form onSubmit={handleSave}>
            <Modal.Body>
                {expanded ? <CookieForm consent={consent}/> :
                    <><p>
                        <strong>Usiamo i cookie</strong> per migliorare l’esperienza utente.</p>
                        <a href="/cookie" className="link-primary">Scopri di più</a></>
                }
            </Modal.Body>
            <Modal.Footer>

                {expanded ? <>
                        <button type="submit" className="btn btn-success btn-sm">
                            Salva preferenze
                        </button>
                        <button type="button" className="btn btn-outline-secondary btn-sm"
                                onClick={() => {
                                    setExpanded(false);
                                }}>
                            Annulla
                        </button>
                    </> :

                    <><Button
                        variant={'primary'}
                        size={'sm'}
                        onClick={() => {
                            handleAcceptAll();
                            setShow(false);
                        }}>
                        Accetta tutti
                    </Button>
                        <Button
                            size={'sm'}
                            variant={'outline-primary'}
                            onClick={() => setExpanded(true)}>
                            Personalizza
                        </Button>
                        <Button
                            variant={'outline-secondary'}
                            size={'sm'}
                            onClick={() => {
                                handleRejectAll();
                                setShow(false);
                            }}>
                            Rifiuta tutti
                        </Button></>}
            </Modal.Footer></form>
    </Modal>;
}

function CookieForm({consent}) {
    return <>
        <div className="form-check">
            <input className="form-check-input" type="checkbox" id="preferences" name="preferences"
                   defaultChecked={consent.preferences}/>
            <label className="form-check-label" htmlFor="preferences">
                Cookie di preferenza
            </label>
        </div>
        <div className="form-check">
            <input className="form-check-input" type="checkbox" id="analytics" name="analytics"
                   defaultChecked={consent.analytics}/>
            <label className="form-check-label" htmlFor="analytics">
                Cookie statistici
            </label>
        </div>
        <div className="form-check mb-2">
            <input className="form-check-input" type="checkbox" id="marketing" name="marketing"
                   defaultChecked={consent.marketing}/>
            <label className="form-check-label" htmlFor="marketing">
                Cookie di marketing
            </label>
        </div>
    </>;
}