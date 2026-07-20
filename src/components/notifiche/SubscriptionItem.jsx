'use client';

import {useState} from 'react';
import {useRouter} from 'next/navigation';
import {FaEdit, FaPauseCircle, FaPlayCircle, FaTrash} from 'react-icons/fa';
import BootstrapModal from '@/components/common/BootstrapModal';
import {useAuth} from "@/contexts/AuthContext.jsx";

export default function SubscriptionItem({subscription, onUpdate, onDelete}) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const {token} = useAuth();

    const [showModal, setShowModal] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [modalBody, setModalBody] = useState('');
    const [modalType, setModalType] = useState('info');
    const [modalOnConfirm, setModalOnConfirm] = useState(null);

    const handleEditClick = () => {
        router.push(`/notifiche/manage?id=${subscription.id}`);
    };

    const handleDeleteConfirm = () => {
        setModalTitle('Conferma Eliminazione');
        setModalBody(`Sei sicuro di voler eliminare la notifica per ${subscription.fuel_type} in ${subscription.geo_level} (${subscription.geo_code})?`);
        setModalType('danger');
        setModalOnConfirm(() => async () => {
            setShowModal(false);
            await executeDelete();
        });
        setShowModal(true);
    };

    const executeDelete = async () => {
        setLoading(true);

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
                setModalTitle('Successo');
                setModalBody('Notifica eliminata con successo.');
                setModalType('success');
                setShowModal(true);
                if (onDelete) {
                    onDelete(subscription.id);
                }
            } else {
                setModalTitle('Errore');
                setModalBody(data.error || 'Errore durante l\'eliminazione della notifica.');
                setModalType('danger');
                setShowModal(true);
            }
        } catch (err) {
            console.error('Errore di rete o del server:', err);
            setModalTitle('Errore di Connessione');
            setModalBody('Impossibile connettersi al server. Riprova più tardi.');
            setModalType('danger');
            setShowModal(true);
        } finally {
            setLoading(false);
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setModalOnConfirm(null);
    };

    const StatusIndicator = ({status}) => {
        if (status === 'active') {
            return (
                <span className="d-flex align-items-center text-success">
                    <FaPlayCircle className="me-1"/> Attiva
                </span>
            );
        }
        return (
            <span className="d-flex align-items-center text-muted">
                <FaPauseCircle className="me-1"/> In Pausa
            </span>
        );
    };

    return (
        <>
            <li className="list-group-item d-flex justify-content-between align-items-center">
                <div>
                    <h5 className="mb-1">
                        <strong>{subscription.fuel_type}</strong>
                    </h5>
                    <div className="mb-2">
                        <StatusIndicator status={subscription.status}/>
                    </div>
                    <p className="mb-1">
                        {subscription.geo_level}: <strong>{subscription.geo_code}</strong>
                    </p>
                    <small className="text-muted">
                        {subscription.threshold_type === 'below_price' && `Avvisa se il prezzo è sotto ${parseFloat(subscription.threshold_value).toFixed(3)} €/L`}
                        {subscription.threshold_type === 'cheapest_in_area' && `Avvisa per il più economico nell'area`}
                    </small>
                </div>
                <div className="d-flex flex-column flex-md-row gap-2">
                    <button className="btn btn-outline-primary btn-sm" onClick={handleEditClick} disabled={loading}>
                        <FaEdit/> <span className="d-none d-md-inline">Modifica</span>
                    </button>
                    <button className="btn btn-outline-danger btn-sm" onClick={handleDeleteConfirm} disabled={loading}>
                        <FaTrash/> <span className="d-none d-md-inline">Elimina</span>
                    </button>
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