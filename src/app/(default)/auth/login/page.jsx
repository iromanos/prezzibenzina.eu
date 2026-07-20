'use client';

import {useState} from 'react';
import {useRouter, useSearchParams} from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header'; // Assicurati che il tuo Header sia compatibile con questa pagina
import {useEffect} from "react";

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const errorParam = searchParams.get('error');
        if (errorParam === 'OAuthAccountNotLinked') {
            setError('Esiste già un account con questo indirizzo email. Accedi con il metodo che hai usato in origine.');
        }
    }, [searchParams]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({email, password}),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('jwt_token', data.token); // Salva il token
                router.push('/notifiche'); // Reindirizza alla pagina delle notifiche o alla dashboard
            } else {
                setError(data.error || 'Errore durante il login.');
            }
        } catch (err) {
            console.error('Errore di rete o del server:', err);
            setError('Impossibile connettersi al server. Riprova più tardi.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        const googleAuthUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
        
        // Assicurati che questo URL corrisponda a quello configurato nella Google Cloud Console
        const redirectUri = `${window.location.origin}/api/auth/google/callback`;

        const scope = [
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/userinfo.profile'
        ].join(' ');

        const params = new URLSearchParams({
            response_type: 'code',
            client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID, // Variabile d'ambiente pubblica
            redirect_uri: redirectUri,
            scope: scope,
        });
        window.location.href = `${googleAuthUrl}?${params.toString()}`;
    };

    return (
        <>
            <Header/>
            <div className="container my-5">
                <div className="row justify-content-center">
                    <div className="col-md-6 col-lg-5">
                        <div className="card shadow-lg">
                            <div className="card-body p-4">
                                <h1 className="card-title text-center mb-4">Accedi</h1>
                                {error && <div className="alert alert-danger">{error}</div>}
                                <form onSubmit={handleSubmit}>
                                    <div className="mb-3">
                                        <label htmlFor="email" className="form-label">Email</label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            id="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            disabled={loading}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="password" className="form-label">Password</label>
                                        <input
                                            type="password"
                                            className="form-control"
                                            id="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            disabled={loading}
                                        />
                                    </div>
                                    <button type="submit" className="btn btn-primary w-100 mb-3" disabled={loading}>
                                        {loading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status"
                                                      aria-hidden="true"></span>
                                                Accesso in corso...
                                            </>
                                        ) : (
                                            'Accedi'
                                        )}
                                    </button>
                                    <div className="d-grid mb-3">
                                        <button type="button" className="btn btn-outline-dark" onClick={handleGoogleLogin} disabled={loading}>
                                            {/* Potresti voler usare un'icona di Google qui */}
                                            <i className="bi bi-google me-2"></i> Accedi con Google
                                        </button>
                                    </div>
                                    <p className="text-center">
                                        Non hai un account? <Link href="/auth/register">Registrati</Link>
                                    </p>
                                    <p className="text-center">
                                        <Link href="/auth/forgot-password">Password dimenticata?</Link>
                                    </p>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}