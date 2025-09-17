'use client';

import Link from 'next/link';
import {useEffect} from "react";
import SearchIcon from '@mui/icons-material/Search';

export default function Header() {

    useEffect(() => {
        import('bootstrap/dist/js/bootstrap.bundle.min');
    }, []);

    return (
        <header className="bg-white shadow-sm sticky-top">
            <div className={'container'}>
                <nav className="navbar navbar-expand-lg py-3 justify-content-between align-items-center">
                {/* Logo + Brand */}
                <Link href="/" className="d-flex align-items-center text-decoration-none">
                    <img width={110} height={40} src="/assets/logo-header.webp" alt="PrezziBenzina.eu"
                         className="me-2"/>
                </Link>

                {/* Desktop menu */}
                    <ul className="nav d-none d-lg-flex">
                    <li className="nav-item"><Link href="/ricerca" className="nav-link text-dark">Ricerca</Link></li>
                    <li className="nav-item"><Link href="/risultati" className="nav-link text-dark">Mappa</Link></li>
                    <li className="nav-item"><Link href="/contatti" className="nav-link text-dark">Contatti</Link></li>
                </ul>

                {/* CTA desktop */}
                    <Link href="/ricerca" className="btn btn-primary d-none d-lg-inline-block">
                    <SearchIcon /> Trova distributori
                </Link>

                {/* Hamburger toggle for mobile */}
                <button
                    className="navbar-toggler border-0"
                    type="button"
                    data-bs-toggle="offcanvas"
                    data-bs-target="#mobileMenu"
                    aria-controls="mobileMenu"
                    aria-label="Apri menu"
                >
                    <span className="navbar-toggler-icon"></span>
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
                        <li className="nav-item mt-3"><Link href="/ricerca"
                                                            className="btn btn-primary w-100"><SearchIcon/> Trova
                            distributori</Link></li>
                    </ul>
                </div>
            </div>
            </div>
        </header>
    );
}
