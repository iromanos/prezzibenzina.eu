'use client';

import {useState} from 'react';
import {useRouter} from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({email}),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess(data.message || 'Se l\'email è registrata, riceverai un link per il reset della password.');
            } else {
                setError(data.error || 'Errore durante la richiesta di reset password.');
            }
        } catch (err) {
            console.error('Errore di rete o del server:', err);
            setError('Impossibile connettersi al server. Riprova più tardi.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Header/>
            <div className="container my-5">
                <div className="row justify-content-center">
                    <div className="col-md-6 col-lg-5">
                        <div className="card shadow-lg">
                            <div className="card-body p-4">
                                <h1 className="card-title text-center mb-4">Password Dimenticata?</h1>
                                {error && <div className="alert alert-danger">{error}</div>}
                                {success && <div className="alert alert-success">{success}</div>}
                                <p className="text-center text-muted mb-4">Inserisci la tua email e ti invieremo un link
                                    per resettare la password.</p>
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
                                    <button type="submit" className="btn btn-primary w-100 mb-3" disabled={loading}>
                                        {loading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status"
                                                      aria-hidden="true"></span>
                                                Invio link...
                                            </>
                                        ) : (
                                            'Invia Link Reset Password'
                                        )}
                                    </button>
                                    <p className="text-center">
                                        <Link href="/auth/login">Torna al Login</Link>
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