'use client';


import {GoogleReCaptcha, GoogleReCaptchaProvider} from "react-google-recaptcha-v3";
import Header from "@/components/Header.jsx";
import {BsArrowLeft, BsSend} from "react-icons/bs";
import {Disclaimer} from "@/components/Disclaimer.jsx";
import Link from 'next/link';
import React, {useRef, useState} from "react";
import Image from 'next/image';

export default function SegnalaClient({distributore}) {

    const URI_IMAGE = process.env.NEXT_PUBLIC_IMAGE_ENDPOINT;

    const [formData, setFormData] = useState({
        tipo_segnalazione: '',
        messaggio: '',
        email: '',
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [recaptchaToken, setRecaptchaToken] = useState('');
    const recaptchaRef = useRef(null);


    const handleChange = (e) => {
        setFormData({...formData, [e.target.name]: e.target.value});
    };

    const handleRecaptchaVerify = (token) => {
        setRecaptchaToken(token);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');
        const isLocal = process.env.NODE_ENV === 'development';

        if (!recaptchaToken && !isLocal) {
            setError('Verifica reCAPTCHA non completata. Riprova.');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/segnala', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    recaptchaToken,
                    impianto: {
                        id_impianto: distributore.id_impianto,
                        nome_impianto: distributore.nome_impianto,
                        indirizzo: distributore.indirizzo,
                        comune: distributore.comune,
                        link: distributore.link
                    }
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess(data.message || 'Messaggio inviato con successo!');
                setFormData({tipo_segnalazione: '', messaggio: '', email: ''}); // Reset
                setRecaptchaToken(''); // Resetta il token reCAPTCHA
                if (recaptchaRef.current) {
                    recaptchaRef.current.execute(); // Richiedi un nuovo token reCAPTCHA
                }
            } else {
                setError(data.error || 'Errore durante l\'invio del messaggio.');
            }
        } catch (err) {
            console.error('Errore di rete o del server:', err);
            setError('Impossibile connettersi al server. Riprova più tardi.');
        } finally {
            setLoading(false);
        }
    };


    return <GoogleReCaptchaProvider reCaptchaKey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}>
        <Header/>
        <main className="container-fluid py-5 bg-secondary-subtle">
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
                    {error && <div className="alert alert-danger">{error}</div>}
                    {success && <div className="alert alert-success">{success}</div>}

                    <div className="card shadow-sm border-0">
                        <div className="card-body p-4">
                            <h1 className="h3 fw-bold mb-3">Segnala dati inesatti</h1>
                            <p className="text-muted mb-4">
                                Aiutaci a mantenere aggiornata la nostra community. Descrivi cosa c'è che non va in
                                questo impianto.
                            </p>
                            <Disclaimer/>
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label htmlFor="tipo_segnalazione"
                                           className="form-label fw-bold small text-uppercase text-muted">Oggetto
                                        della segnalazione</label>
                                    <select
                                        value={formData.tipo_segnalazione}
                                        onChange={handleChange}
                                        name="tipo_segnalazione"
                                        className="form-select shadow-none" id="tipo_segnalazione"
                                    >
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

                                        onChange={handleChange}
                                        name="messaggio"
                                        
                                        className="form-control shadow-none"
                                        id="messaggio"
                                        rows="5"
                                        placeholder="Spiegaci brevemente l'errore..."
                                        value={formData.messaggio}
                                    ></textarea>
                                </div>

                                <div className="mb-4">
                                    <label htmlFor="email"
                                           className="form-label fw-bold small text-uppercase text-muted">La tua
                                        Email (opzionale)</label>
                                    <input
                                        onChange={handleChange}
                                        name="email"
                                        type="email"
                                        className="form-control shadow-none"
                                        id="email"
                                        placeholder="esempio@email.it"
                                    />
                                    <div className="form-text">Ti contatteremo solo se necessario per verificare i
                                        dati.
                                    </div>
                                </div>

                                <GoogleReCaptcha onVerify={handleRecaptchaVerify} action="contact_form"
                                                 ref={recaptchaRef}/>


                                <div className="d-grid">
                                    <button type="submit" className="btn btn-primary fw-bold py-2" disabled={loading}>
                                        {loading ? 'Invio in corso...' : <><BsSend className="me-2"/> Invia la
                                            segnalazione</>}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </main>

        <style jsx global>{`
            .grecaptcha-badge {
                left: 10px !important;
                right: auto !important;
            }
        `}</style>
    </GoogleReCaptchaProvider>

}