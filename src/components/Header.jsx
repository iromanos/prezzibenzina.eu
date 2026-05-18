'use client';

import Link from 'next/link';
import {useEffect} from "react";
import SearchIcon from '@mui/icons-material/Search';
import DehazeIcon from '@mui/icons-material/Dehaze';
import CloseIcon from '@mui/icons-material/Close';

export default function Header() {

    useEffect(() => {
        import('bootstrap/dist/js/bootstrap.bundle.min');
    }, []);

    return (
        <header className="bg-white shadow-sm sticky-top">
            <div className={'container'}>
                <nav className="navbar navbar-expand-lg py-3 justify-content-between align-items-center">
                {/* Logo + Brand */}
                    <Link title={"Home"} href="/" className="d-flex align-items-center text-decoration-none">
                    <img width={110} height={40} src="/assets/logo-header.webp" alt="PrezziBenzina.eu"
                         className="me-2"/>
                </Link>

                {/* Desktop menu */}
                    <ul className="nav d-none d-lg-flex">
                        <li className="nav-item"><Link title={"Preferiti"} href="/preferiti"
                                                       className="nav-link text-dark">Preferiti</Link></li>
                        <li className="nav-item"><Link title={"Ricerca"} href="/ricerca"
                                                       className="nav-link text-dark">Ricerca</Link></li>
                        <li className="nav-item"><Link title={"Mappa"} href="/mappa"
                                                       className="nav-link text-dark">Mappa</Link></li>
                        <li className="nav-item"><Link title={"Contatti"} href="/contatti"
                                                       className="nav-link text-dark">Contatti</Link></li>
                </ul>

                {/* CTA desktop */}
                    <Link title={"Trova distributori"} href="/ricerca"
                          className="btn btn-primary d-none d-lg-inline-block">
                    <SearchIcon /> Trova distributori
                </Link>

                {/* Hamburger toggle for mobile */}
                <button
                    className="btn d-lg-none"
                    type="button"
                    data-bs-toggle="offcanvas"
                    data-bs-target="#mobileMenu"
                    aria-controls="mobileMenu"
                    aria-label="Apri menu"
                ><DehazeIcon/>

                </button>
            </nav>

            {/* Offcanvas menu */}
            <div
                className="offcanvas offcanvas-end bg-primary"
                tabIndex="-1"
                id="mobileMenu"
                aria-labelledby="mobileMenuLabel">

                <div className="container d-flex py-3">
                    <button type="button" className="btn ms-auto text-white" data-bs-dismiss="offcanvas"
                            aria-label="Chiudi"><CloseIcon/></button>
                </div>

                <div className="container">
                    <ul className="nav flex-column ">
                        <li className="nav-item"><Link title={"Preferiti"} href="/preferiti"
                                                       className="nav-link text-white">Preferiti</Link></li>
                        <li className="nav-item"><Link title={"Ricerca"} href="/ricerca"
                                                       className="nav-link text-white ">Ricerca</Link></li>
                        <li className="nav-item"><Link title={"Mappa"} href="/mappa"
                                                       className="nav-link text-white ">Mappa</Link></li>
                        <li className="nav-item"><Link title={"Contatti"} href="/contatti"
                                                       className="nav-link text-white ">Contatti</Link></li>
                        {/*<li className="nav-item mt-3"><Link title={"Trova distributori"} href="/ricerca"*/}
                        {/*                                    className="btn btn-primary w-100"><SearchIcon/> Trova*/}
                        {/*    distributori</Link></li>*/}
                    </ul>
                    <div className="text-center px-4">
                        <img src="/assets/logo-transparent.png" alt="Logo PrezziBenzina.eu"
                             className={'col-8'}
                             style={{maxWidth: '320px'}}/>
                    </div>
                </div>
            </div>
            </div>
        </header>
    );
}
