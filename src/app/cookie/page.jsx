// app/lombardia/benzina/cookie/page.jsx

import React from 'react';
import CookieIcon from '@mui/icons-material/Cookie';
import SettingsIcon from '@mui/icons-material/Settings';
import BarChartIcon from '@mui/icons-material/BarChart';
import AdsClickIcon from '@mui/icons-material/AdsClick';
import EmailIcon from '@mui/icons-material/Email';
import Header from "@/components/Header";
import CookieLink from "@/components/CookieLink";

export const metadata = {
    title: 'Informativa sui Cookie | PrezziBenzina.eu',
    description:
        'Scopri come PrezziBenzina.eu utilizza i cookie per migliorare l’esperienza utente, analizzare il traffico e personalizzare gli annunci.',
    robots: 'index, follow',
};

export default async function Page() {
    return (
        <>
            <Header/>
            <main className="container py-5">
                <h1 className="mb-4">Informativa sui Cookie</h1>
                <p className="text-muted mb-4">Ultimo aggiornamento: 18 settembre 2025</p>

                <section className="mb-5">
                    <p>
                        Questa pagina descrive l’uso dei cookie da parte di <strong>PrezziBenzina.eu</strong> nella
                        sezione
                        dedicata ai prezzi del carburante in Lombardia. I cookie ci aiutano a offrirti un servizio
                        migliore,
                        più veloce e personalizzato.
                    </p>
                </section>

                <section className="mb-5">
                    <h2 className="h5 d-flex align-items-center mb-3">
                        <CookieIcon className="me-2" fontSize="small"/> Cosa sono i Cookie?
                    </h2>
                    <p>
                        I cookie sono piccoli file di testo che i siti web salvano sul tuo dispositivo per memorizzare
                        informazioni utili alla navigazione, come preferenze, sessioni e dati statistici.
                    </p>
                </section>

                <section className="mb-5">
                    <h2 className="h5 d-flex align-items-center mb-3">
                        <SettingsIcon className="me-2" fontSize="small"/> Tipologie di Cookie Utilizzati
                    </h2>
                    <ul className="list-unstyled ms-3">
                        <li>• Cookie tecnici: necessari per il funzionamento del sito</li>
                        <li>• Cookie di preferenza: memorizzano impostazioni e scelte dell’utente</li>
                        <li>• Cookie statistici: raccolgono dati anonimi sull’uso del sito</li>
                        <li>• Cookie di marketing: utilizzati per mostrare annunci personalizzati</li>
                    </ul>
                </section>

                <section className="mb-5">
                    <h2 className="h5 d-flex align-items-center mb-3">
                        <BarChartIcon className="me-2" fontSize="small"/> Cookie di Terze Parti
                    </h2>
                    <p>
                        Utilizziamo servizi esterni come Google Analytics e Google AdSense che possono impostare cookie
                        propri per analisi e pubblicità. Questi cookie sono gestiti direttamente dai rispettivi
                        provider.
                    </p>
                </section>

                <section className="mb-5">
                    <h2 className="h5 d-flex align-items-center mb-3">
                        <AdsClickIcon className="me-2" fontSize="small"/> Gestione del Consenso
                    </h2>
                    <p>
                        Puoi accettare o rifiutare l’uso dei cookie tramite il banner iniziale o modificare le
                        preferenze
                        nel tuo browser. La disattivazione di alcuni cookie potrebbe influire sull’esperienza utente.
                    </p>
                </section>

                <section>
                    <h2 className="h5 d-flex align-items-center mb-3">
                        <EmailIcon className="me-2" fontSize="small"/> Contatti
                    </h2>
                    <p>
                        Per domande o richieste relative ai cookie, scrivici a:{' '}
                        <a href="mailto:privacy@prezzibenzina.eu" className="link-primary">
                            privacy@prezzibenzina.eu
                        </a>
                    </p>
                </section>

                <CookieLink/>
            </main>
        </>
    );
}
