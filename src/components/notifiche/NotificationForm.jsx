'use client';

import {useCallback, useEffect, useState} from 'react';
import NotificationGeoFilters from './NotificationGeoFilters';
import {FaBell, FaEuroSign, FaGasPump} from 'react-icons/fa';
import BootstrapModal from '@/components/common/BootstrapModal';
import {useAuth} from '@/contexts/AuthContext';
import {getComune, getImpianto} from "@/functions/api.jsx";
import ImpiantoCardMobile from "@/components/impianti/ImpiantoCardMobile.jsx";

const INITIAL_GEO_FILTERS = {
    livello_geo: 'nazionale',
    codice_geo: 'IT',
    regione: '',
    provincia: '',
};

export default function NotificationForm({initialSubscription, subscriptionId, prefillData, onSubscriptionCreated}) {
    const [fuelType, setFuelType] = useState('Benzina');
    const [geoFilters, setGeoFilters] = useState(INITIAL_GEO_FILTERS);
    const [thresholdType, setThresholdType] = useState('cheapest_in_area');
    const [thresholdValue, setThresholdValue] = useState('');
    const [status, setStatus] = useState('active');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isInitializing, setIsInitializing] = useState(true);
    const [impianto, setImpianto] = useState(null);
    const {token} = useAuth();
    const [showModal, setShowModal] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [modalBody, setModalBody] = useState('');
    const [modalType, setModalType] = useState('info');

    useEffect(() => {
        const initializeForm = async () => {
            setIsInitializing(true);
            try {
                const dataToLoad = initialSubscription || prefillData;
                if (!dataToLoad) {
                    setGeoFilters(INITIAL_GEO_FILTERS);
                    return;
                }

                setFuelType(dataToLoad.fuel_type || 'Benzina');
                setStatus(dataToLoad.status || 'active');
                setThresholdType(dataToLoad.threshold_type || 'cheapest_in_area');
                setThresholdValue(dataToLoad.threshold_value || '');

                const {geo_level, geo_code} = dataToLoad;
                let newGeoFilters = {...INITIAL_GEO_FILTERS, livello_geo: geo_level, codice_geo: geo_code};

                if (geo_level === 'comune' && geo_code) {
                    const comune = await getComune(geo_code);
                    if (comune) {
                        const provinceRes = await fetch('/api/geo/province');
                        const provinceData = await provinceRes.json();
                        const prov = provinceData.find(p => p.id === comune.provincia_id);
                        newGeoFilters.provincia = comune.provincia_id;
                        if (prov) newGeoFilters.regione = prov.regione;
                    }
                } else if (geo_level === 'provincia' && geo_code) {
                    const provinceRes = await fetch('/api/geo/province');
                    const provinceData = await provinceRes.json();
                    const prov = provinceData.find(p => p.id.toUpperCase() === geo_code.toUpperCase());
                    if (prov) newGeoFilters.regione = prov.regione;
                    newGeoFilters.provincia = geo_code;
                } else if (geo_level === 'regione' && geo_code) {
                    newGeoFilters.regione = geo_code;
                }

                setGeoFilters(newGeoFilters);
            } finally {
                setIsInitializing(false);
            }
        };
        initializeForm();
    }, [initialSubscription, prefillData]);

    useEffect(() => {
        if (geoFilters.livello_geo === 'distributore') {
            getImpianto({query: {impianto: geoFilters.codice_geo}}).then(setImpianto);
        } else {
            setImpianto(null);
        }
    }, [geoFilters]);

    const handleGeoFilterChange = useCallback((newGeoFilters) => {
        setGeoFilters(newGeoFilters);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

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
                method,
                headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`},
                body: JSON.stringify({
                    fuel_type: fuelType,
                    geo_level: geoFilters.livello_geo,
                    geo_code: geoFilters.codice_geo,
                    threshold_type: thresholdType,
                    threshold_value: thresholdType === 'below_price' ? parseFloat(thresholdValue) : null,
                    status,
                }),
            });
            const data = await response.json();
            if (response.ok) {
                setModalTitle('Successo!');
                setModalBody(`Notifica ${subscriptionId ? 'aggiornata' : 'creata'} con successo!`);
                setModalType('success');
            } else {
                setModalTitle('Errore!');
                setModalBody(data.error || 'Errore sconosciuto.');
            }
        } catch (err) {
            setModalTitle('Errore di Connessione!');
            setModalBody('Impossibile connettersi al server.');
            setModalType('danger');
        } finally {
            setShowModal(true);
            setLoading(false);
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        if (modalType === 'success' && onSubscriptionCreated) {
            onSubscriptionCreated();
        }
    };

    if (isInitializing) {
        // return <div data-testid="loading-indicator">Caricamento...</div>;
    }

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
                        <div className="mb-3">
                            <label htmlFor="fuelType" className="form-label d-flex align-items-center">
                                <FaGasPump className="me-2 text-muted"/> Carburante
                            </label>
                            <select id="fuelType" className="form-select" value={fuelType}
                                    onChange={(e) => setFuelType(e.target.value)} required disabled={loading}>
                                <option value="Benzina">Benzina</option>
                                <option value="Diesel">Diesel</option>
                                <option value="GPL">GPL</option>
                                <option value="Metano">Metano</option>
                            </select>
                        </div>

                        <NotificationGeoFilters
                            onGeoFilterChange={handleGeoFilterChange}
                            geoFilters={geoFilters}
                            disabled={loading}
                        />

                        {impianto && <div className={'card mb-4 shadow'}><ImpiantoCardMobile cardClient={false}
                                                                                             impianto={impianto}/>
                        </div>}

                        <div className="mb-3">
                            <label className="form-label d-flex align-items-center">
                                <FaEuroSign className="me-2 text-muted"/> Condizione di Notifica
                            </label>
                            <div className="form-check">
                                <input className="form-check-input" type="radio" name="thresholdType"
                                       id="cheapestInArea" value="cheapest_in_area"
                                       checked={thresholdType === 'cheapest_in_area'}
                                       onChange={() => setThresholdType('cheapest_in_area')} disabled={loading}/>
                                <label className="form-check-label" htmlFor="cheapestInArea">Il prezzo diventa il più
                                    basso nell'area selezionata</label>
                            </div>
                            <div className="form-check">
                                <input className="form-check-input" type="radio" name="thresholdType" id="belowPrice"
                                       value="below_price" checked={thresholdType === 'below_price'}
                                       onChange={() => setThresholdType('below_price')} disabled={loading}/>
                                <label className="form-check-label" htmlFor="belowPrice">Il prezzo scende sotto un
                                    valore specifico</label>
                            </div>
                        </div>

                        {thresholdType === 'below_price' && (
                            <div className="mb-3">
                                <label htmlFor="thresholdValue" className="form-label">Valore Soglia (€/L)</label>
                                <input type="number" step="0.001" className="form-control" id="thresholdValue"
                                       value={thresholdValue} onChange={(e) => setThresholdValue(e.target.value)}
                                       required={thresholdType === 'below_price'} disabled={loading}/>
                            </div>
                        )}

                        {subscriptionId && (
                            <div className="mb-3">
                                <label htmlFor="status" className="form-label">Stato Notifica</label>
                                <select id="status" className="form-select" value={status}
                                        onChange={(e) => setStatus(e.target.value)} disabled={loading}>
                                    <option value="active">Attiva</option>
                                    <option value="paused">In Pausa</option>
                                </select>
                            </div>
                        )}

                        <button type="submit" className="btn btn-primary w-100" disabled={loading || isInitializing}>
                            {loading ? 'Salvataggio...' : (subscriptionId ? 'Salva Modifiche' : 'Crea Notifica')}
                        </button>
                    </form>
                </div>
            </div>

            <BootstrapModal show={showModal} handleClose={handleCloseModal} title={modalTitle} body={modalBody}
                            type={modalType}/>
        </>
    );
}
