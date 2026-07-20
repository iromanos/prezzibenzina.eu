'use client';

import Link from 'next/link';
import Header from '@/components/Header';

export default function VerificationSuccessPage() {
    return (
        <>
            <Header/>
            <div className="container my-5">
                <div className="row justify-content-center">
                    <div className="col-md-6 col-lg-5">
                        <div className="card shadow-lg">
                            <div className="card-body p-4 text-center">
                                <h1 className="card-title text-center mb-4 text-success">Verifica Completata!</h1>
                                <p className="lead">Il tuo indirizzo email è stato verificato con successo.</p>
                                <p>Ora puoi accedere al tuo account e iniziare a gestire le tue notifiche sui prezzi dei
                                    carburanti.</p>
                                <Link href="/auth/login" className="btn btn-primary mt-3">Vai al Login</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}