'use client';

import {useRouter} from 'next/navigation';
import {FaBell, FaHeart, FaSignOutAlt, FaUser} from 'react-icons/fa';
import Link from 'next/link';
import {useAuth} from "@/contexts/AuthContext.jsx";

export default function ProfiloClient() {
    const router = useRouter();
    const {user, logout} = useAuth();

    const handleLogout = async () => {
        await logout();
    };

    if (!user) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{minHeight: '200px'}}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Disconnessione...</span>
                </div>
                <p className="ms-3 mb-0 h5">Disconnessione in corso...</p>
            </div>
        );
    }

    return (
        <div className="row justify-content-center">
            <div className="col-lg-8">
                <div className="card shadow-sm">
                    <div className="card-header bg-primary text-white d-flex align-items-center">
                        <FaUser className="me-2"/>
                        <h4 className="mb-0">Profilo Utente</h4>
                    </div>
                    <div className="card-body">
                        <div className="mb-4">
                            <h5>Dati Utente</h5>
                            <p><strong>Email:</strong> {user.email}</p>
                            {/* Aggiungi altri dati utente se disponibili */}
                        </div>

                        <h5>Accesso Rapido</h5>
                        <div className="list-group">
                            <Link href="/preferiti"
                                  className="list-group-item list-group-item-action d-flex align-items-center">
                                <FaHeart className="me-2 text-danger"/> I miei Preferiti
                            </Link>
                            <Link href="/notifiche"
                                  className="list-group-item list-group-item-action d-flex align-items-center">
                                <FaBell className="me-2 text-warning"/> Le mie Notifiche
                            </Link>
                        </div>
                    </div>
                    <div className="card-footer text-end">
                        <button onClick={handleLogout}
                                className="btn btn-outline-danger d-flex align-items-center ms-auto">
                            <FaSignOutAlt className="me-2"/> Logout
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}