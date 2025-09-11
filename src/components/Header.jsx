'use client';

import Link from 'next/link';
import {useEffect} from "react";

// import 'bootstrap/dist/js/bootstrap.bundle.min';

export default function Header() {

    useEffect(() => {
        import('bootstrap/dist/js/bootstrap.bundle.min');
    }, []);

    return (
        <header className="bg-white shadow-sm sticky-top">
            <nav className="container d-flex align-items-center justify-content-between py-3">
                {/* Logo + Brand */}
                <Link href="/" className="d-flex align-items-center text-decoration-none">
                    <img src="/assets/logo-blu-transparent.png" alt="PrezziBenzina.eu" style={{ height: '40px' }} className="me-2" />
                    <span className="fw-bold text-dark">PrezziBenzina.eu</span>
                </Link>

                {/* Desktop menu */}
                <ul className="nav d-none d-md-flex">
                    <li className="nav-item"><Link href="/ricerca" className="nav-link text-dark">Ricerca</Link></li>
                    <li className="nav-item"><Link href="/risultati" className="nav-link text-dark">Mappa</Link></li>
                    <li className="nav-item"><Link href="/contatti" className="nav-link text-dark">Contatti</Link></li>
                </ul>

                {/* CTA desktop */}
                <Link href="/ricerca" className="btn btn-primary d-none d-md-inline-block">
                    🔎 Trova distributori
                </Link>

                {/* Hamburger toggle for mobile */}
                <button
                    className="btn d-md-none"
                    type="button"
                    data-bs-toggle="offcanvas"
                    data-bs-target="#mobileMenu"
                    aria-controls="mobileMenu"
                    aria-label="Apri menu"
                >
                    ☰
                </button>
            </nav>

            {/* Offcanvas menu */}
            <div
                className="offcanvas offcanvas-end"
                tabIndex="-1"
                id="mobileMenu"
                aria-labelledby="mobileMenuLabel"
            >
                <div className="offcanvas-header">
                    <h5 className="offcanvas-title" id="mobileMenuLabel">Menu</h5>
                    <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Chiudi"></button>
                </div>
                <div className="offcanvas-body">
                    <ul className="nav flex-column">
                        <li className="nav-item"><Link href="/ricerca" className="nav-link text-dark">Ricerca</Link></li>
                        <li className="nav-item"><Link href="/risultati" className="nav-link text-dark">Mappa</Link></li>
                        <li className="nav-item"><Link href="/contatti" className="nav-link text-dark">Contatti</Link></li>
                        <li className="nav-item mt-3"><Link href="/ricerca" className="btn btn-primary w-100">🔎 Trova distributori</Link></li>
                    </ul>
                </div>
            </div>
        </header>
    );
}
