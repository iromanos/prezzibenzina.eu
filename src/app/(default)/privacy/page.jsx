// app/lombardia/benzina/privacy/page.jsx

import React from 'react';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CookieIcon from '@mui/icons-material/Cookie';
import MapIcon from '@mui/icons-material/Map';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import SecurityIcon from '@mui/icons-material/Security';
import EmailIcon from '@mui/icons-material/Email';
import Header from "@/components/Header";
import {headers} from "next/headers";
import {getCanonicalUrl} from "@/functions/server";


export async function generateMetadata() {

    const canonicalUrl = getCanonicalUrl(headers());


    return {
        title: 'Informativa sulla Privacy | PrezziBenzina.eu',
        description:
            'Scopri come PrezziBenzina.eu protegge la tua privacy nella visualizzazione dei prezzi carburante in Lombardia. Informazioni su cookie, dati raccolti e finalità.',
        alternates: {
            canonical: canonicalUrl,
            languages: {
                'it': canonicalUrl,
                'x-default': canonicalUrl,
            },

        },
        robots: 'index, follow',
    };
}


export default async function Page() {
    return (
        <>
            <Header/>
            <main className="container py-5">
                <h1 className="display-5 mb-4">Informativa sulla Privacy</h1>
                <p className="text-muted mb-4">Ultimo aggiornamento: 18 settembre 2025</p>

                <section className="mb-5">
                    <p>
                        Questa pagina è parte del servizio offerto da <strong>PrezziBenzina.eu</strong>, dedicato alla
                        visualizzazione dei prezzi dei carburanti in Lombardia. La tua privacy è importante per noi.
                    </p>
                </section>

                <section className="mb-5">
                    <h2 className="h5 d-flex align-items-center mb-3">
                        <LocationOnIcon className="me-2" fontSize="small"/> Dati Raccolti
                    </h2>
                    <ul className="list-unstyled ms-3">
                        <li>• Dati tecnici: IP, tipo di dispositivo, browser, sistema operativo</li>
                        <li>• Geolocalizzazione (se autorizzata)</li>
                        <li>• Preferenze di navigazione e interazioni con la mappa</li>
                    </ul>
                </section>

                <section className="mb-5">
                    <h2 className="h5 d-flex align-items-center mb-3">
                        <CookieIcon className="me-2" fontSize="small"/> Cookie e Tecnologie
                    </h2>
                    <p>
                        Utilizziamo cookie per analisi del traffico, personalizzazione dei contenuti e annunci
                        pubblicitari.
                        Puoi gestire le preferenze tramite il banner o le impostazioni del browser.
                    </p>
                </section>

                <section className="mb-5">
                    <h2 className="h5 d-flex align-items-center mb-3">
                        <MapIcon className="me-2" fontSize="small"/> Dati dei Distributori
                    </h2>
                    <p>
                        I dati sui prezzi provengono da fonti pubbliche e contributi degli utenti. Non raccogliamo dati
                        personali dai gestori.
                    </p>
                </section>

                <section className="mb-5">
                    <h2 className="h5 d-flex align-items-center mb-3">
                        <TrackChangesIcon className="me-2" fontSize="small"/> Finalità del Trattamento
                    </h2>
                    <ul className="list-unstyled ms-3">
                        <li>• Ottimizzazione dell’esperienza utente</li>
                        <li>• Personalizzazione dei contenuti e annunci</li>
                        <li>• Analisi statistiche e SEO</li>
                    </ul>
                </section>

                <section className="mb-5">
                    <h2 className="h5 d-flex align-items-center mb-3">
                        <SecurityIcon className="me-2" fontSize="small"/> Sicurezza
                    </h2>
                    <p>
                        Adottiamo misure tecniche e organizzative per proteggere i tuoi dati da accessi non autorizzati,
                        perdita o divulgazione.
                    </p>
                </section>

                <section>
                    <h2 className="h5 d-flex align-items-center mb-3">
                        <EmailIcon className="me-2" fontSize="small"/> Contatti
                    </h2>
                    <p>
                        Per domande o richieste relative alla privacy, scrivici a:{' '}
                        <a href="mailto:privacy@prezzibenzina.eu" className="link-primary">
                            privacy@prezzibenzina.eu
                        </a>
                    </p>
                </section>
            </main>
        </>
    );
}
