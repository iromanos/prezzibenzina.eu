'use client';

import React, {useRef, useState} from 'react';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import Header from "@/components/Header";
import {GoogleReCaptcha, GoogleReCaptchaProvider} from 'react-google-recaptcha-v3';
import {Disclaimer} from "@/components/Disclaimer.jsx";

export default function ContattiPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: 'RICHIESTA INFORMAZIONI',
        message: '',
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

        if (!recaptchaToken) {
            setError('Verifica reCAPTCHA non completata. Riprova.');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({...formData, recaptchaToken}),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess(data.message || 'Messaggio inviato con successo!');
                setFormData({name: '', email: '', message: ''}); // Resetta il form
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

    return (
        <GoogleReCaptchaProvider reCaptchaKey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}>
            <Header/>
            <main className="container py-5">
                <h1 className="mb-4">Contatti</h1>
                <p className="text-muted mb-4">Ultimo aggiornamento: 17 luglio 2026</p>

                <section className="mb-5">
                    <p>
                        Se hai domande, segnalazioni sui prezzi, suggerimenti o richieste di collaborazione, puoi
                        contattare
                        il team di <strong>PrezziBenzina.eu</strong> attraverso il form sottostante.
                    </p>
                    <Disclaimer/>
                </section>

                <section className="mb-5">
                    <h2 className="h5 mb-3">Inviaci un messaggio</h2>
                    {error && <div className="alert alert-danger">{error}</div>}
                    {success && <div className="alert alert-success">{success}</div>}
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label htmlFor="name" className="form-label">Nome</label>
                            <input
                                type="text"
                                className="form-control"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                disabled={loading}
                            />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="email" className="form-label">Email</label>
                            <input
                                type="email"
                                className="form-control"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                disabled={loading}
                            />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="subject" className="form-label">Oggetto</label>
                            <input
                                type="text"
                                className="form-control"
                                id="subject"
                                name="subject"
                                value={formData.subject}
                                onChange={handleChange}
                                required
                                readOnly={true}
                                disabled={true}
                            />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="message" className="form-label">Messaggio</label>
                            <textarea
                                className="form-control"
                                id="message"
                                name="message"
                                rows="5"
                                value={formData.message}
                                onChange={handleChange}
                                required
                                disabled={loading}
                            ></textarea>
                        </div>
                        <GoogleReCaptcha onVerify={handleRecaptchaVerify} action="contact_form" ref={recaptchaRef}/>
                        <button type="submit" className="btn btn-primary mt-3" disabled={loading}>
                            {loading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status"
                                          aria-hidden="true"></span>
                                    Invio...
                                </>
                            ) : (
                                'Invia Messaggio'
                            )}
                        </button>
                    </form>
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
            <style jsx global>{`
                .grecaptcha-badge {
                    left: 10px !important;
                    right: auto !important;
                }
            `}</style>
        </GoogleReCaptchaProvider>
    );
}