import React from 'react';
import Header from "@/components/Header";
import Link from 'next/link';
import {getImpianto} from "@/functions/api";
import SegnalaClient from "@/components/segnala/SegnalaClient.jsx";

/**
 * Pagina per la segnalazione di dati inesatti di un impianto.
 * @param {Object} props
 * @param {Promise<{impianto: string}>} props.params
 */
export default async function PageSegnala({params}) {



    const query = await params;

    console.log("IMPIANTO", query);

    // Recuperiamo i dati dell'impianto per il riepilogo
    const distributore = await getImpianto({query});

    if (!distributore) {
        return (
            <>
                <Header/>
                <main className="container py-5 text-center">
                    <p>Impianto non trovato.</p>
                    <Link href="/" className="btn btn-primary">Torna alla home</Link>
                </main>
            </>
        );
    }

    return (
        <><SegnalaClient distributore={distributore}/>
        </>
    );
}