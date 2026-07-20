'use client';

import {useEffect, useState} from 'react';
import {useRouter, useSearchParams} from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';

export default function ResetPasswordPage() {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [token, setToken] = useState(null);
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const urlToken = searchParams.get('token');
        if (urlToken) {
            setToken(urlToken);
        } else {
            setError('Token di reset password mancante.');
        }
    }, [searchParams]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        if (newPassword !== confirmPassword) {
            setError('Le password non corrispondono.');
            setLoading(false);
            return;
        }

        if (newPassword.length < 6) {
            setError('La password deve contenere almeno 6 caratteri.');
            setLoading(false);
            return;
        }

        if (!token) {
            setError('Token di reset password non valido o mancante.');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({token, newPassword}),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess(data.message || 'Password resettata con successo! Ora puoi accedere con la nuova password.');
                // Reindirizza al login dopo un breve ritardo
                setTimeout(() => {
                    router.push('/auth/login');
                }, 3000);
            } else {
                setError(data.error || 'Errore durante il reset della password.');
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
                                <h1 className="card-title text-center mb-4">Reset Password</h1>
                                {error && <div className="alert alert-danger">{error}</div>}
                                {success && <div className="alert alert-success">{success}</div>}
                                {token && !success && !error && (
                                    <p className="text-center text-muted mb-4">Inserisci la tua nuova password.</p>
                                )}
                                {token && !success && (
                                    <form onSubmit={handleSubmit}>
                                        <div className="mb-3">
                                            <label htmlFor="newPassword" className="form-label">Nuova Password</label>
                                            <input
                                                type="password"
                                                className="form-control"
                                                id="newPassword"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                required
                                                minLength="6"
                                                disabled={loading}
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="confirmPassword" className="form-label">Conferma Nuova
                                                Password</label>
                                            <input
                                                type="password"
                                                className="form-control"
                                                id="confirmPassword"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                required
                                                minLength="6"
                                                disabled={loading}
                                            />
                                        </div>
                                        <button type="submit" className="btn btn-primary w-100 mb-3" disabled={loading}>
                                            {loading ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2"
                                                          role="status" aria-hidden="true"></span>
                                                    Reset in corso...
                                                </>
                                            ) : (
                                                'Resetta Password'
                                            )}
                                        </button>
                                    </form>
                                )}
                                <p className="text-center">
                                    <Link href="/auth/login">Torna al Login</Link>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}