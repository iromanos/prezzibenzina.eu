'use client';

import {useCallback, useEffect, useState} from 'react';
import NotificationGeoFilters from './NotificationGeoFilters';
import {FaEuroSign, FaGasPump} from 'react-icons/fa';
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

                setFuelType(dataToLoad.fuel_type || 'benzina');
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
                    newGeoFilters.provincia = geo_code.toUpperCase();
                } else if (geo_level === 'regione' && geo_code) {
                    newGeoFilters.regione = geo_code;
                }

                // console.log(dataToLoad);
                // console.log(newGeoFilters);

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

    return (
        <>
            <form onSubmit={handleSubmit} className="p-lg-2">

                {error && <div className="alert alert-danger">{error}</div>}

                {/* Sezione Carburante */}
                <div className="card mb-4 shadow-sm">
                    <div className="card-body">
                        <h5 className="card-title d-flex align-items-center"><FaGasPump className="me-2 text-muted"/>
                            Carburante</h5>
                        <div className="mb-3">
                            <label htmlFor="fuelType" className="form-label">Scegli il tipo di carburante</label>
                            <select id="fuelType" className="form-select form-select-lg" value={fuelType}
                                    onChange={(e) => setFuelType(e.target.value)} required disabled={loading}>
                                <option value="benzina">Benzina</option>
                                <option value="diesel">Diesel</option>
                                <option value="gpl">GPL</option>
                                <option value="metano">Metano</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Sezione Area Geografica */}
                <div className="card mb-4 shadow-sm">
                    <div className="card-body">
                        <NotificationGeoFilters
                            onGeoFilterChange={handleGeoFilterChange}
                            geoFilters={geoFilters}
                            disabled={loading}
                        />
                        {impianto && <div className={'card mt-3 shadow-sm'}><ImpiantoCardMobile cardClient={false}
                                                                                                impianto={impianto}/>
                        </div>}
                    </div>
                </div>

                {/* Sezione Condizione di Notifica */}
                <div className="card mb-4 shadow-sm">
                    <div className="card-body">
                        <h5 className="card-title d-flex align-items-center"><FaEuroSign className="me-2 text-muted"/>
                            Condizione di Notifica</h5>
                        <div className="d-grid gap-2">
                            <input type="radio" className="btn-check" name="thresholdType" id="cheapestInArea"
                                   value="cheapest_in_area" checked={thresholdType === 'cheapest_in_area'}
                                   onChange={() => setThresholdType('cheapest_in_area')} disabled={loading}/>
                            <label className="btn btn-outline-primary" htmlFor="cheapestInArea">
                                Avvisami quando è il più economico
                                <small className="d-block text-muted">Ricevi una notifica se il prezzo diventa il più
                                    basso nell'area scelta.</small>
                            </label>

                            <input type="radio" className="btn-check" name="thresholdType" id="belowPrice"
                                   value="below_price" checked={thresholdType === 'below_price'}
                                   onChange={() => setThresholdType('below_price')} disabled={loading}/>
                            <label className="btn btn-outline-primary" htmlFor="belowPrice">
                                Avvisami sotto una soglia
                                <small className="d-block text-muted">Imposta un prezzo e ricevi una notifica quando
                                    scende al di sotto.</small>
                            </label>
                        </div>

                        {thresholdType === 'below_price' && (
                            <div className="mt-3">
                                <label htmlFor="thresholdValue" className="form-label">Valore Soglia (€/L)</label>
                                <input type="number" step="0.001" className="form-control form-control-lg"
                                       id="thresholdValue" value={thresholdValue}
                                       onChange={(e) => setThresholdValue(e.target.value)}
                                       required={thresholdType === 'below_price'} disabled={loading}
                                       placeholder="Es. 1.750"/>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sezione Stato Notifica (solo in modifica) */}
                {subscriptionId && (
                    <div className="card mb-4 shadow-sm">
                        <div className="card-body">
                            <div className="form-check form-switch">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    role="switch"
                                    id="notificationStatus"
                                    checked={status === 'active'}
                                    onChange={(e) => setStatus(e.target.checked ? 'active' : 'paused')}
                                    disabled={loading}
                                />
                                <label className="form-check-label" htmlFor="notificationStatus">
                                    {status === 'active' ? 'Notifica Attiva' : 'Notifica in Pausa'}
                                </label>
                            </div>
                            <div className="form-text mt-2">
                                Puoi disattivare temporaneamente la notifica senza cancellarla.
                            </div>
                        </div>
                    </div>
                )}


                <div className="d-grid">
                    <button type="submit" className="btn btn-primary btn-lg" disabled={loading || isInitializing}>
                        {loading ? 'Salvataggio...' : (subscriptionId ? 'Salva Modifiche' : 'Crea Notifica')}
                    </button>
                </div>
            </form>

            <BootstrapModal show={showModal} handleClose={handleCloseModal} title={modalTitle} body={modalBody}
                            type={modalType}/>
        </>
    );
}
