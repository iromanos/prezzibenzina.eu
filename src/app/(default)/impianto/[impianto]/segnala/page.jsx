import React from 'react';
import Header from "@/components/Header";
import Link from 'next/link';
import {BsArrowLeft, BsSend} from 'react-icons/bs';
import Image from 'next/image';
import {getImpianto} from "@/functions/api"; // Assumendo che esista questa funzione


/**
 * Pagina per la segnalazione di dati inesatti di un impianto.
 * @param {Object} props
 * @param {Promise<{impianto: string}>} props.params
 */
export default async function PageSegnala({params}) {

    const URI_IMAGE = process.env.NEXT_PUBLIC_IMAGE_ENDPOINT;


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
        <>
            <Header/>
            <main className="container py-5">
                <div className="row justify-content-center">
                    <div className="col-md-8 col-lg-6">

                        {/* Navigazione di ritorno */}
                        <div className="mb-4">
                            <Link href={`/impianto/${distributore.link}`}
                                  className="btn btn-link p-0 text-decoration-none small text-secondary">
                                <BsArrowLeft className="me-1"/> Torna alla scheda impianto
                            </Link>
                        </div>

                        {/* Riepilogo Impianto */}
                        <div className="card mb-4 bg-light border-0 shadow-sm">
                            <div className="card-body d-flex align-items-center">
                                {distributore.image && (
                                    <div className="me-3">
                                        <Image
                                            unoptimized
                                            src={URI_IMAGE + distributore.image}
                                            alt={distributore.bandiera}
                                            width={50}
                                            height={50}
                                            className="object-fit-contain"
                                        />
                                    </div>
                                )}
                                <div>
                                    <h2 className="h6 fw-bold mb-1">{distributore.bandiera}</h2>
                                    <p className="small mb-0 text-secondary">
                                        <span className="fw-bold text-dark">{distributore.nome_impianto}</span><br/>
                                        {distributore.indirizzo} - {distributore.comune} ({distributore.provincia})
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="card shadow-sm border-0">
                            <div className="card-body p-4">
                                <h1 className="h3 fw-bold mb-3">Segnala dati inesatti</h1>
                                <p className="text-muted mb-4">
                                    Aiutaci a mantenere aggiornata la nostra community. Descrivi cosa c'è che non va in
                                    questo impianto.
                                </p>

                                <form>
                                    <div className="mb-3">
                                        <label htmlFor="tipo_segnalazione"
                                               className="form-label fw-bold small text-uppercase text-muted">Oggetto
                                            della segnalazione</label>
                                        <select className="form-select shadow-none" id="tipo_segnalazione" required
                                                defaultValue="">
                                            <option value="" disabled>Seleziona una categoria...</option>
                                            <option value="prezzo">Prezzo non corrispondente</option>
                                            <option value="posizione">Posizione sulla mappa errata</option>
                                            <option value="servizi">Servizi non disponibili o errati</option>
                                            <option value="chiuso">Impianto chiuso permanentemente</option>
                                            <option value="altro">Altro (specificare nel messaggio)</option>
                                        </select>
                                    </div>

                                    <div className="mb-3">
                                        <label htmlFor="messaggio"
                                               className="form-label fw-bold small text-uppercase text-muted">Dettagli</label>
                                        <textarea
                                            className="form-control shadow-none"
                                            id="messaggio"
                                            rows="5"
                                            placeholder="Spiegaci brevemente l'errore..."
                                            required
                                        ></textarea>
                                    </div>

                                    <div className="mb-4">
                                        <label htmlFor="email"
                                               className="form-label fw-bold small text-uppercase text-muted">La tua
                                            Email (opzionale)</label>
                                        <input
                                            type="email"
                                            className="form-control shadow-none"
                                            id="email"
                                            placeholder="esempio@email.it"
                                        />
                                        <div className="form-text">Ti contatteremo solo se necessario per verificare i
                                            dati.
                                        </div>
                                    </div>

                                    <div className="d-grid">
                                        <button type="submit" className="btn btn-primary fw-bold py-2">
                                            <BsSend className="me-2"/> Invia la segnalazione
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}