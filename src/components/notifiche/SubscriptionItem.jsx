'use client';

import {useState} from 'react';
import {useRouter} from 'next/navigation';
import {FaEdit, FaTrash} from 'react-icons/fa';
import BootstrapModal from '@/components/common/BootstrapModal';
import {useAuth} from "@/contexts/AuthContext.jsx"; // Importa il componente Modal

export default function SubscriptionItem({subscription, onUpdate, onDelete}) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(''); // Errore specifico per l'item
    const router = useRouter();
    const {token} = useAuth();

    // Stati per il modal
    const [showModal, setShowModal] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [modalBody, setModalBody] = useState('');
    const [modalType, setModalType] = useState('info');
    const [modalOnConfirm, setModalOnConfirm] = useState(null); // Funzione da eseguire alla conferma

    const handleEditClick = () => {
        router.push(`/notifiche/manage?id=${subscription.id}`);
    };

    const handleDeleteConfirm = () => {
        setModalTitle('Conferma Eliminazione');
        setModalBody(`Sei sicuro di voler eliminare la notifica per ${subscription.fuel_type} in ${subscription.geo_level} (${subscription.geo_code})?`);
        setModalType('danger');
        setModalOnConfirm(() => async () => {
            setShowModal(false); // Chiudi il modal prima di procedere
            await executeDelete();
        });
        setShowModal(true);
    };

    const executeDelete = async () => {
        setLoading(true);
        setError('');

        // const token = localStorage.getItem('jwt_token');
        if (!token) {
            setModalTitle('Errore di Autenticazione');
            setModalBody('Non autenticato. Effettua il login.');
            setModalType('danger');
            setShowModal(true);
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`/api/subscriptions/${subscription.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (response.ok) {
                setModalTitle('Successo!');
                setModalBody('Notifica eliminata con successo!');
                setModalType('success');
                setShowModal(true);
                if (onDelete) {
                    onDelete(subscription.id);
                }
            } else {
                setModalTitle('Errore!');
                setModalBody(data.error || 'Errore durante l\'eliminazione della notifica.');
                setModalType('danger');
                setShowModal(true);
            }
        } catch (err) {
            console.error('Errore di rete o del server:', err);
            setModalTitle('Errore di Connessione!');
            setModalBody('Impossibile connettersi al server. Riprova più tardi.');
            setModalType('danger');
            setShowModal(true);
        } finally {
            setLoading(false);
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setModalOnConfirm(null); // Resetta la funzione di conferma
    };

    return (
        <>
            <li className="list-group-item mb-3 p-3 shadow-sm rounded">
                {error && <div className="alert alert-danger mb-3">{error}</div>}
                <div className="d-flex justify-content-between align-items-center">
                    <div>
                        <strong>{subscription.fuel_type}</strong> in {subscription.geo_level} ({subscription.geo_code})
                        {subscription.threshold_type === 'below_price' && ` sotto ${parseFloat(subscription.threshold_value).toFixed(3)} €/L`}
                        {subscription.threshold_type === 'cheapest_in_area' && ` (più economico nell'area)`}
                        <span
                            className={`badge bg-${subscription.status === 'active' ? 'success' : 'secondary'} ms-2`}>{subscription.status}</span>
                    </div>
                    <div>
                        <button className="btn btn-sm btn-outline-primary me-2" onClick={handleEditClick}
                                disabled={loading}>
                            <FaEdit/> Modifica
                        </button>
                        <button className="btn btn-sm btn-outline-danger" onClick={handleDeleteConfirm}
                                disabled={loading}>
                            <FaTrash/> Elimina
                        </button>
                    </div>
                </div>
            </li>

            <BootstrapModal
                show={showModal}
                handleClose={handleCloseModal}
                title={modalTitle}
                body={modalBody}
                type={modalType}
                confirmButtonText={modalOnConfirm ? 'Conferma' : null}
                onConfirm={modalOnConfirm}
            />
        </>
    );
}