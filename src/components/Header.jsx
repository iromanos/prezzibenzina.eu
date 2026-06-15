'use client';

import Link from 'next/link';
import {useEffect} from "react";
import SearchIcon from '@mui/icons-material/Search';
import DehazeIcon from '@mui/icons-material/Dehaze';
import CloseIcon from '@mui/icons-material/Close';
import Button from "react-bootstrap/Button";
import Image from "next/image";
import {useRouter} from "next/navigation";

export default function Header() {

    useEffect(() => {
        import('bootstrap/dist/js/bootstrap.bundle.min');
    }, []);

    const router = useRouter();

    const handleNavigation = (href) => {
        router.push(href);
    };

    return (
        <header className="bg-primary sticky-top">
            <div className={'container '}>
                <nav className="navbar navbar-expand-lg py-3 justify-content-between align-items-center">
                    <Link title={"Home"} href="/" className="text-decoration-none">
                        <Image
                            width={1024}
                            height={374}
                            style={{
                                width: 'auto',
                                height: '48px'
                            }} src="/assets/svg/logo-header.svg" alt="PrezziBenzina.eu"
                         className="me-2"/>
                </Link>

                {/* Desktop menu */}
                    <ul className="nav d-none d-lg-flex">
                        <li className="nav-item"><Link title={"Preferiti"} href="/preferiti"
                                                       className="btn btn-primary">Preferiti</Link></li>
                        <li className="nav-item"><Link title={"Ricerca"} href="/ricerca"
                                                       className="btn btn-primary">Ricerca</Link></li>
                        <li className="nav-item"><Link title={"Mappa"} href="/mappa"
                                                       className="btn btn-primary">Mappa</Link></li>
                        <li className="nav-item"><Link title={"Contatti"} href="/contatti"
                                                       className="btn btn-primary">Contatti</Link></li>
                </ul>

                {/* CTA desktop */}
                    <Link title={"Trova distributori"} href="/ricerca"
                          className="btn btn-primary d-none d-lg-inline-block">
                    <SearchIcon /> Trova distributori
                </Link>

                {/* Hamburger toggle for mobile */}
                    <Button
                    className="btn d-lg-none"
                    type="button"
                    data-bs-toggle="offcanvas"
                    data-bs-target="#mobileMenu"
                    aria-controls="mobileMenu"
                    aria-label="Apri menu"
                ><DehazeIcon/>

                    </Button>
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
                        <li className="nav-item"><Button
                            variant={'link'}
                            data-bs-dismiss="offcanvas"
                            onClick={() => handleNavigation("/preferiti")}
                            title={"Preferiti"}
                            className="nav-link text-white">Preferiti</Button></li>
                        <li className="nav-item"><Button

                            variant={'link'}
                            data-bs-dismiss="offcanvas"
                            onClick={() => handleNavigation("/ricerca")}


                            title={"Ricerca"}
                            className="nav-link text-white ">Ricerca</Button></li>
                        <li className="nav-item">
                            <Button title={"Mappa"}
                                    variant={'link'}
                                    data-bs-dismiss="offcanvas"
                                    onClick={() => handleNavigation("/mappa")}
                                    className="nav-link text-white ">Mappa</Button></li>

                        <li className="nav-item"><Button
                            variant={'link'}
                            data-bs-dismiss="offcanvas"
                            onClick={() => handleNavigation("/contatti")}
                            title={"Contatti"}
                            className="nav-link text-white ">Contatti</Button></li>
                    </ul>
                    <div className="text-center">
                        <Image width={320} height={320} src="/assets/logo-transparent.png" alt="Logo PrezziBenzina.eu"
                        />
                    </div>
                </div>
            </div>
            </div>
        </header>
    );
}
