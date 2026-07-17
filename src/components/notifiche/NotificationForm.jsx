'use client';

import {useCallback, useEffect, useState} from 'react';
import NotificationGeoFilters from './NotificationGeoFilters'; // Componente per i filtri geografici
import {FaBell, FaEuroSign, FaGasPump} from 'react-icons/fa'; // Icone
import BootstrapModal from '@/components/common/BootstrapModal'; // Importa il componente Modal
import { useAuth } from '@/contexts/AuthContext';

export default function NotificationForm({initialSubscription, subscriptionId, prefillData, onSubscriptionCreated}) {
    const [fuelType, setFuelType] = useState('Benzina');
    const [geoFilters, setGeoFilters] = useState({livello_geo: 'nazionale', codice_geo: 'IT'});
    const [thresholdType, setThresholdType] = useState('cheapest_in_area');
    const [thresholdValue, setThresholdValue] = useState('');
    const [status, setStatus] = useState('active'); // Aggiunto stato per la modifica
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);


    const {token} = useAuth(); // Ottieni il token dal contesto di autenticazione   
    // Stati per il modal
    const [showModal, setShowModal] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [modalBody, setModalBody] = useState('');
    const [modalType, setModalType] = useState('info');


    // Popola il form se initialSubscription o prefillData sono presenti
    useEffect(() => {


        if (initialSubscription) {
            // Modalità modifica: popola con i dati della sottoscrizione esistente
            setFuelType(initialSubscription.fuel_type);
            setGeoFilters({
                livello_geo: initialSubscription.geo_level,
                codice_geo: initialSubscription.geo_code
            });
            setThresholdType(initialSubscription.threshold_type);
            setThresholdValue(initialSubscription.threshold_value || '');
            setStatus(initialSubscription.status);
        } else if (prefillData) {
            console.log("prefillData", prefillData );
            // Modalità creazione con pre-riempimento
            if (prefillData.fuel_type) {
                setFuelType(prefillData.fuel_type);
            }
            if (prefillData.geo_level && prefillData.geo_code) {
                setGeoFilters({
                    livello_geo: prefillData.geo_level,
                    codice_geo: prefillData.geo_code
                });
            }
        }
    }, [initialSubscription, prefillData]);

    const handleGeoFilterChange = useCallback((newGeoFilters) => {
        setGeoFilters(newGeoFilters);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(''); // Pulisce l'errore del form

        if (!token) {
            setError('Non autenticato. Effettua il login per creare/modificare notifiche.');
            setLoading(false);
            return;
        }

        // Validazione aggiuntiva per threshold_value
        if (thresholdType === 'below_price') {
            const value = parseFloat(thresholdValue);
            if (isNaN(value) || value <= 0) {
                setError('Il valore della soglia deve essere un numero positivo.');
                setLoading(false);
                return;
            }
        }

        const method = subscriptionId ? 'PUT' : 'POST';
        const url = subscriptionId ? `/api/subscriptions/${subscriptionId}` : '/api/subscriptions/create';

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    fuel_type: fuelType,
                    geo_level: geoFilters.livello_geo,
                    geo_code: geoFilters.codice_geo,
                    threshold_type: thresholdType,
                    threshold_value: thresholdType === 'below_price' ? parseFloat(thresholdValue) : null,
                    status: status, // Invia lo stato anche per la creazione, di default 'active'
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setModalTitle('Successo!');
                setModalBody(`Notifica ${subscriptionId ? 'aggiornata' : 'creata'} con successo!`);
                setModalType('success');
                setShowModal(true);
            } else {
                setModalTitle('Errore!');
                setModalBody(data.error || `Errore durante la ${subscriptionId ? 'modifica' : 'creazione'} della notifica.`);
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
        // Se la notifica è stata creata/modificata con successo, reindirizza
        if (modalType === 'success' && onSubscriptionCreated) {
            onSubscriptionCreated();// dovrebbe già reindirizzare o aggiornare la lista
        }
    };

    return (
        <>
            <div className="card mb-4">
                <div className="card-body">
                    <h5 className="card-title d-flex align-items-center mb-3">
                        <FaBell
                            className="me-2 text-primary"/> {subscriptionId ? 'Modifica Notifica' : 'Crea Nuova Notifica'}
                    </h5>
                    {error && <div className="alert alert-danger">{error}</div>}
                    <form onSubmit={handleSubmit}>
                        {/* Tipo Carburante */}
                        <div className="mb-3">
                            <label htmlFor="fuelType" className="form-label d-flex align-items-center">
                                <FaGasPump className="me-2 text-muted"/> Carburante
                            </label>
                            <select
                                id="fuelType"
                                className="form-select"
                                value={fuelType}
                                onChange={(e) => setFuelType(e.target.value)}
                                required
                                disabled={loading}
                            >
                                <option value="benzina">Benzina</option>
                                <option value="diesel">Diesel</option>
                                <option value="gpl">GPL</option>
                                <option value="metano">Metano</option>
                            </select>
                        </div>

                        {/* Filtri Geografici */}
                        <NotificationGeoFilters
                            onGeoFilterChange={handleGeoFilterChange}
                            disabled={loading}
                            initialGeoLevel={geoFilters.livello_geo}
                            initialGeoCode={geoFilters.codice_geo}
                        />

                        {/* Tipo di Soglia */}
                        <div className="mb-3">
                            <label className="form-label d-flex align-items-center">
                                <FaEuroSign className="me-2 text-muted"/> Condizione di Notifica
                            </label>
                            <div className="form-check">
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    name="thresholdType"
                                    id="cheapestInArea"
                                    value="cheapest_in_area"
                                    checked={thresholdType === 'cheapest_in_area'}
                                    onChange={() => setThresholdType('cheapest_in_area')}
                                    disabled={loading}
                                />
                                <label className="form-check-label" htmlFor="cheapestInArea">
                                    Il prezzo diventa il più basso nell'area selezionata
                                </label>
                            </div>
                            <div className="form-check">
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    name="thresholdType"
                                    id="belowPrice"
                                    value="below_price"
                                    checked={thresholdType === 'below_price'}
                                    onChange={() => setThresholdType('below_price')}
                                    disabled={loading}
                                />
                                <label className="form-check-label" htmlFor="belowPrice">
                                    Il prezzo scende sotto un valore specifico
                                </label>
                            </div>
                        </div>

                        {/* Valore Soglia (visibile solo se thresholdType è 'below_price') */}
                        {thresholdType === 'below_price' && (
                            <div className="mb-3">
                                <label htmlFor="thresholdValue" className="form-label">Valore Soglia (€/L)</label>
                                <input
                                    type="number"
                                    step="0.001"
                                    className="form-control"
                                    id="thresholdValue"
                                    value={thresholdValue}
                                    onChange={(e) => setThresholdValue(e.target.value)}
                                    required={thresholdType === 'below_price'}
                                    disabled={loading}
                                />
                            </div>
                        )}

                        {/* Stato della notifica (visibile solo in modifica) */}
                        {subscriptionId && (
                            <div className="mb-3">
                                <label htmlFor="status" className="form-label">Stato Notifica</label>
                                <select
                                    id="status"
                                    className="form-select"
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    disabled={loading}
                                >
                                    <option value="active">Attiva</option>
                                    <option value="paused">In Pausa</option>
                                    {/* <option value="deleted">Eliminata</option> - L'eliminazione è un'azione separata */}
                                </select>
                            </div>
                        )}

                        <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                            {loading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status"
                                          aria-hidden="true"></span>
                                    {subscriptionId ? 'Salvataggio...' : 'Creazione...'}
                                </>
                            ) : (
                                subscriptionId ? 'Salva Modifiche' : 'Crea Notifica'
                            )}
                        </button>
                    </form>
                </div>
            </div>

            <BootstrapModal
                show={showModal}
                handleClose={handleCloseModal}
                title={modalTitle}
                body={modalBody}
                type={modalType}
            />
        </>
    );
}
