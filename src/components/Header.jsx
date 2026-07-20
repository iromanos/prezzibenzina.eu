'use client';

import Link from 'next/link';
import {useEffect} from "react";
import DehazeIcon from '@mui/icons-material/Dehaze';
import CloseIcon from '@mui/icons-material/Close';
import Button from "react-bootstrap/Button";
import Image from "next/image";
import {useRouter} from "next/navigation";
import {useAuth} from '@/contexts/AuthContext';
import {FaUser} from 'react-icons/fa';

export default function Header() {
    const router = useRouter();
    const { isAuthenticated, logout, user } = useAuth();

    useEffect(() => {
        import('bootstrap/dist/js/bootstrap.bundle.min');
    }, []);

    const handleNavigation = (href) => {
        router.push(href);
    };

    const handleLogout = () => {
        logout();
    };

    const getInitials = (email) => {
        if (!email) return <FaUser/>;
        return email[0].toUpperCase();
    };

    const Avatar = () => {
        if (user?.avatar) {
            return (
                <Image
                    src={user.avatar}
                    alt="Avatar"
                    width={40}
                    height={40}
                    className="rounded-circle border border-2"
                />
            );
        }
        return (
            <div
                className="rounded-circle bg-light d-flex align-items-center justify-content-center"
                style={{width: '40px', height: '40px', fontWeight: 'bold'}}
            >
                {getInitials(user?.email)}
            </div>
        );
    };

    return (
        <header className="bg-primary sticky-top">
            <div className={'container'}>
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
                        <li className="nav-item"><Link title={"Ricerca"} href="/ricerca"
                                                       className="btn btn-primary">Ricerca</Link></li>
                        <li className="nav-item"><Link title={"Mappa"} href="/mappa"
                                                       className="btn btn-primary">Mappa</Link></li>
                        <li className="nav-item"><Link title={"Statistiche"} href="/statistiche"
                                                       className="btn btn-primary">Statistiche</Link></li>
                        <li className="nav-item"><Link title={"Contatti"} href="/contatti"
                                                       className="btn btn-primary">Contatti</Link></li>
                        {isAuthenticated && (
                            <>
                                <li className="nav-item"><Link title={"Preferiti"} href="/preferiti"
                                                               className="btn btn-primary">Preferiti</Link></li>
                            <li className="nav-item"><Link title={"Le mie Notifiche"} href="/notifiche"
                                                           className="btn btn-primary">Notifiche</Link></li>
                            </>
                        )}
                    </ul>

                    {/* CTA desktop / Login-Logout button */}
                    {isAuthenticated && user ? (
                        <div className="dropdown d-none d-lg-inline-block">
                            <button
                                className="btn p-0 border-0 dropdown-toggle text-white"
                                type="button"
                                id="userMenuButton"
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                            >
                                <Avatar/>
                            </button>
                            <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userMenuButton">
                                <li><Link className="dropdown-item" href="/profilo">Profilo</Link></li>
                                <li>
                                    <hr className="dropdown-divider"/>
                                </li>
                                <li>
                                    <button className="dropdown-item" onClick={handleLogout}>Logout</button>
                                </li>
                            </ul>
                        </div>
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
            </div>

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
                    <ul className="nav flex-column">
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
                        {isAuthenticated && (
                            <li className="nav-item">
                                <Button
                                    variant={'link'}
                                    data-bs-dismiss="offcanvas"
                                    onClick={() => handleNavigation("/profilo")}
                                    title={"Profilo"}
                                    className="nav-link text-white"
                                >Profilo</Button>
                            </li>
                        )}
                        {isAuthenticated && (
                            <>
                                <li className="nav-item"><Button
                                    variant={'link'}
                                    data-bs-dismiss="offcanvas"
                                    onClick={() => handleNavigation("/preferiti")}
                                    title={"Preferiti"}
                                    className="nav-link text-white">Preferiti</Button></li>

                                <li className="nav-item"><Button
                                    variant={'link'}
                                    data-bs-dismiss="offcanvas"
                                    onClick={() => handleNavigation("/notifiche")}
                                    title={"Notifiche"}
                                    className="nav-link text-white">Notifiche</Button></li>

                            </>)}
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
                    <div className="text-center mt-4">
                        <Image width={200} height={73} style={{width: '200px', height: 'auto'}}
                               src="/assets/svg/logo-header.svg" alt="Logo PrezziBenzina.eu"
                        />
                    </div>
                </div>
            </div>
        </header>
    );
}