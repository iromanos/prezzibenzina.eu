import React from 'react';
import Header from "@/components/Header";
import Link from 'next/link';
import {getImpianto} from "@/functions/api";
import SegnalaClient from "@/components/segnala/SegnalaClient.jsx";

/**
 * Genera i metadati della pagina, disabilitando l'indicizzazione.
 */
export async function generateMetadata({params}) {
    const query = await params;
    const distributore = await getImpianto({query});

    const title = distributore
        ? `Segnala errore: ${distributore.nome || 'Impianto'}`
        : "Impianto non trovato";

    return {
        title: `${title} | PrezziBenzina.eu`,
        description: "Modulo per la segnalazione di inesattezze nei dati dell'impianto.",
        // Impedisce a Google e altri motori di ricerca di indicizzare la pagina
        robots: {
            index: false,
            follow: false,
            nocache: true,
        },
    };
}

/**
 * Pagina per la segnalazione di dati inesatti di un impianto.
 * @param {Object} props
 * @param {Promise<{impianto: string}>} props.params
 */
export default async function PageSegnala({params}) {



    const query = await params;

    // console.log("IMPIANTO", query);

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