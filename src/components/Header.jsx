'use client';

import Link from 'next/link';
import {useEffect, useState} from "react";
import DehazeIcon from '@mui/icons-material/Dehaze';
import CloseIcon from '@mui/icons-material/Close';
import Button from "react-bootstrap/Button";
import Image from "next/image";
import {useRouter} from "next/navigation";
import { useAuth } from '@/contexts/AuthContext';

export default function Header() {
    //const [isLoggedIn, setIsLoggedIn] = useState(false);
    const router = useRouter();

    const { isAuthenticated, logout, user } = useAuth();

    useEffect(() => {
        import('bootstrap/dist/js/bootstrap.bundle.min');
        // Controlla lo stato di login all'avvio del componente
        // const token = localStorage.getItem('jwt_token');
        // setIsLoggedIn(!!token); // true se il token esiste, false altrimenti
    }, []);

    const handleNavigation = (href) => {
        router.push(href);
    };

    const handleLogout = () => {
        logout();
    };

    // console.log("User in Header:", user); // Logga l'oggetto user per il debug

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
                        {isAuthenticated &&( <li className="nav-item"><Link title={"Preferiti"} href="/preferiti"
                                                       className="btn btn-primary">Preferiti</Link></li>)}
                        <li className="nav-item"><Link title={"Ricerca"} href="/ricerca"
                                                       className="btn btn-primary">Ricerca</Link></li>
                        <li className="nav-item"><Link title={"Mappa"} href="/mappa"
                                                       className="btn btn-primary">Mappa</Link></li>
                        <li className="nav-item"><Link title={"Statistiche"} href="/statistiche"
                                                       className="btn btn-primary">Statistiche</Link></li>
                        <li className="nav-item"><Link title={"Contatti"} href="/contatti"
                                                       className="btn btn-primary">Contatti</Link></li>
                        {isAuthenticated && (
                            <li className="nav-item"><Link title={"Le mie Notifiche"} href="/notifiche"
                                                           className="btn btn-primary">Notifiche</Link></li>
                        )}
                </ul>

                    {/* CTA desktop / Login-Logout button */}
                    {isAuthenticated ? (
                        <Button onClick={handleLogout} className="btn btn-primary d-none d-lg-inline-block">
                            Logout
                        </Button>
                    ) : (
                        <Link title={"Accedi"} href="/auth/login"
                              className="btn btn-primary d-none d-lg-inline-block">
                            Accedi
                        </Link>
                    )}

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

                        {isAuthenticated && (
                        <li className="nav-item"><Button
                            variant={'link'}
                            data-bs-dismiss="offcanvas"
                            onClick={() => handleNavigation("/preferiti")}
                            title={"Preferiti"}
                            className="nav-link text-white">Preferiti</Button></li>)}
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
                            onClick={() => handleNavigation("/statistiche")}
                            title={"Statistiche"}
                            className="nav-link text-white ">Statistiche</Button></li>
                        <li className="nav-item"><Button
                            variant={'link'}
                            data-bs-dismiss="offcanvas"
                            onClick={() => handleNavigation("/contatti")}
                            title={"Contatti"}
                            className="nav-link text-white ">Contatti</Button></li>
                        {isAuthenticated ? (
                            <li className="nav-item"><Button
                                variant={'link'}
                                data-bs-dismiss="offcanvas"
                                onClick={handleLogout}
                                title={"Logout"}
                                className="nav-link text-white ">Logout</Button></li>
                        ) : (
                            <li className="nav-item"><Button
                                variant={'link'}
                                data-bs-dismiss="offcanvas"
                                onClick={() => handleNavigation("/auth/login")}
                                title={"Accedi"}
                                className="nav-link text-white ">Accedi</Button></li>
                        )}
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