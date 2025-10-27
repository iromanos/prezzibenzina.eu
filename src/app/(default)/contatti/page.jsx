import React from 'react';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import Header from "@/components/Header";
import {getCanonicalUrl} from "@/functions/server";
import {headers} from "next/headers";

export async function generateMetadata() {

    const canonicalUrl = getCanonicalUrl(headers());


    return {
        title: 'Contatti e assistenza | PrezziBenzina.eu ',
        description:
            'Hai bisogno di assistenza o vuoi inviarci un feedback? Scopri come contattare il team di PrezziBenzina.eu ' +
            'per supporto, segnalazioni o collaborazioni.',
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
                <h1 className="mb-4">Contatti</h1>
                <p className="text-muted mb-4">Ultimo aggiornamento: 18 settembre 2025</p>

                <section className="mb-5">
                    <p>
                        Se hai domande, segnalazioni sui prezzi, suggerimenti o richieste di collaborazione, puoi
                        contattare
                        il team di <strong>PrezziBenzina.eu</strong> attraverso i seguenti canali.
                    </p>
                </section>

                <section className="mb-4">
                    <h2 className="h5 d-flex align-items-center mb-3">
                        <EmailIcon className="me-2 text-primary" fontSize="small"/> Email
                    </h2>
                    <p>
                        Per richieste generiche o supporto tecnico:{' '}
                        <a href="mailto:support@prezzibenzina.eu" className="link-primary">
                            support@prezzibenzina.eu
                        </a>
                    </p>
                    <p>
                        Per questioni legate alla privacy:{' '}
                        <a href="mailto:privacy@prezzibenzina.eu" className="link-primary">
                            privacy@prezzibenzina.eu
                        </a>
                    </p>
                </section>

                <section className="mb-4">
                    <h2 className="h5 d-flex align-items-center mb-3">
                        <PhoneIcon className="me-2 text-success" fontSize="small"/> Telefono
                    </h2>
                    <p>
                        Al momento non offriamo assistenza telefonica diretta. Ti invitiamo a contattarci via email per
                        una
                        risposta rapida e dettagliata.
                    </p>
                </section>

                <section className="mb-4">
                    <h2 className="h5 d-flex align-items-center mb-3">
                        <SupportAgentIcon className="me-2 text-warning" fontSize="small"/> Assistenza e Segnalazioni
                    </h2>
                    <p>
                        Puoi segnalare errori nei prezzi o problemi con la mappa direttamente dalla pagina del
                        distributore,
                        oppure scrivendoci via email. Ogni contributo è prezioso per migliorare il servizio.
                    </p>
                </section>

                <section>
                    <h2 className="h5 d-flex align-items-center mb-3">
                        <LocationOnIcon className="me-2 text-danger" fontSize="small"/> Sede Operativa
                    </h2>
                    <p>
                        Milano, Lombardia – Italia
                        <br/>
                        (Servizio online, senza accesso al pubblico)
                    </p>
                </section>
            </main>
        </>
    );
}
