'use client';

import React, {useCallback, useEffect, useState} from 'react';
import {useAuth} from '@/contexts/AuthContext';
import {FaEuroSign, FaGasPump, FaMapMarkerAlt, FaPlusCircle} from 'react-icons/fa'; // Importa icone

export default function CreateSubscriptionForm({onSubscriptionCreated}) {
    const {token, isAuthenticated} = useAuth();
    const [fuelType, setFuelType] = useState('Benzina');
    const [geoLevel, setGeoLevel] = useState('nazionale');
    const [selectedRegion, setSelectedRegion] = useState('');
    const [selectedProvince, setSelectedProvince] = useState('');
    const [selectedComune, setSelectedComune] = useState('');
    const [thresholdType, setThresholdType] = useState('cheapest_in_area');
    const [thresholdValue, setThresholdValue] = useState('');

    const [regioni, setRegioni] = useState([]);
    const [province, setProvince] = useState([]);
    const [comuni, setComuni] = useState([]);

    const [loadingGeo, setLoadingGeo] = useState(true);
    const [loadingSubmit, setLoadingSubmit] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    // Carica dati geografici all'avvio
    useEffect(() => {
        async function fetchData() {
            setLoadingGeo(true);
            try {
                const [regioniRes, provinceRes] = await Promise.all([
                    fetch('/api/geo/regioni'),
                    fetch('/api/geo/province')
                ]);
                const regioniData = await regioniRes.json();
                const provinceData = await provinceRes.json();
                setRegioni(regioniData);
                setProvince(provinceData);
            } catch (err) {
                console.error("Errore nel caricamento dati geografici:", err);
                setError("Impossibile caricare i dati geografici.");
            } finally {
                setLoadingGeo(false);
            }
        }

        fetchData();
    }, []);

    // Carica comuni quando cambia la provincia selezionata
    useEffect(() => {
        if (geoLevel === 'comune' && selectedProvince) {
            async function fetchComuni() {
                try {
                    const comuniRes = await fetch(`/api/geo/comuni?provincia=${selectedProvince}`);
                    const comuniData = await comuniRes.json();
                    setComuni(comuniData);
                } catch (err) {
                    console.error("Errore nel caricamento dei comuni:", err);
                    setError("Impossibile caricare i comuni.");
                }
            }

            fetchComuni();
        } else {
            setComuni([]);
        }
    }, [geoLevel, selectedProvince]);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        if (!isAuthenticated || !token) {
            setError("Devi essere autenticato per creare una notifica.");
            return;
        }

        setLoadingSubmit(true);
        setError(null);
        setSuccess(false);

        let geoCode = '';
        if (geoLevel === 'nazionale') geoCode = 'IT';
        else if (geoLevel === 'regionale') geoCode = selectedRegion;
        else if (geoLevel === 'provinciale') geoCode = selectedProvince;
        else if (geoLevel === 'comune') geoCode = selectedComune;

        if (!geoCode) {
            setError("Seleziona un'area geografica valida.");
            setLoadingSubmit(false);
            return;
        }

        const payload = {
            fuel_type: fuelType,
            geo_level: geoLevel,
            geo_code: geoCode,
            threshold_type: thresholdType,
            threshold_value: thresholdType === 'below_price' ? parseFloat(thresholdValue) : null,
        };

        try {
            const response = await fetch('/api/subscriptions/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Errore durante la creazione della sottoscrizione.');
            }

            setSuccess(true);
            // Resetta il form o aggiorna l'elenco delle sottoscrizioni
            setFuelType('Benzina');
            setGeoLevel('nazionale');
            setSelectedRegion('');
            setSelectedProvince('');
            setSelectedComune('');
            setThresholdType('cheapest_in_area');
            setThresholdValue('');
            if (onSubscriptionCreated) {
                onSubscriptionCreated(); // Notifica il componente padre
            }

        } catch (err) {
            setError(err.message);
        } finally {
            setLoadingSubmit(false);
        }
    }, [isAuthenticated, token, fuelType, geoLevel, selectedRegion, selectedProvince, selectedComune, thresholdType, thresholdValue, onSubscriptionCreated]);

    return (
        <div className="card">
            <div className="card-body">
                <h5 className="card-title d-flex align-items-center mb-3">
                    <FaPlusCircle className="me-2 text-primary"/> Crea Nuova Notifica
                </h5>
                <form onSubmit={handleSubmit}>
                    {error && <div className="alert alert-danger">{error}</div>}
                    {success && <div className="alert alert-success">Notifica creata con successo!</div>}

                    {/* Tipo Carburante */}
                    <div className="mb-3">
                        <label htmlFor="fuelType" className="form-label d-flex align-items-center">
                            <FaGasPump className="me-2 text-muted"/> Tipo Carburante
                        </label>
                        <select
                            id="fuelType"
                            className="form-select"
                            value={fuelType}
                            onChange={(e) => setFuelType(e.target.value)}
                            disabled={loadingSubmit}
                        >
                            <option value="Benzina">Benzina</option>
                            <option value="Gasolio">Gasolio</option>
                            <option value="GPL">GPL</option>
                            <option value="Metano">Metano</option>
                        </select>
                    </div>

                    {/* Livello Geografico */}
                    <div className="mb-3">
                        <label className="form-label d-flex align-items-center">
                            <FaMapMarkerAlt className="me-2 text-muted"/> Area Geografica
                        </label>
                        <div>
                            <div className="form-check form-check-inline">
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    name="geoLevelOptions"
                                    id="geoNazionale"
                                    value="nazionale"
                                    checked={geoLevel === 'nazionale'}
                                    onChange={() => {
                                        setGeoLevel('nazionale');
                                        setSelectedRegion('');
                                        setSelectedProvince('');
                                        setSelectedComune('');
                                    }}
                                    disabled={loadingSubmit}
                                />
                                <label className="form-check-label" htmlFor="geoNazionale">Nazionale</label>
                            </div>
                            <div className="form-check form-check-inline">
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    name="geoLevelOptions"
                                    id="geoRegionale"
                                    value="regionale"
                                    checked={geoLevel === 'regionale'}
                                    onChange={() => {
                                        setGeoLevel('regionale');
                                        setSelectedProvince('');
                                        setSelectedComune('');
                                    }}
                                    disabled={loadingSubmit}
                                />
                                <label className="form-check-label" htmlFor="geoRegionale">Regionale</label>
                            </div>
                            <div className="form-check form-check-inline">
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    name="geoLevelOptions"
                                    id="geoProvinciale"
                                    value="provinciale"
                                    checked={geoLevel === 'provinciale'}
                                    onChange={() => {
                                        setGeoLevel('provinciale');
                                        setSelectedComune('');
                                    }}
                                    disabled={loadingSubmit}
                                />
                                <label className="form-check-label" htmlFor="geoProvinciale">Provinciale</label>
                            </div>
                            <div className="form-check form-check-inline">
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    name="geoLevelOptions"
                                    id="geoComune"
                                    value="comune"
                                    checked={geoLevel === 'comune'}
                                    onChange={() => setGeoLevel('comune')}
                                    disabled={loadingSubmit}
                                />
                                <label className="form-check-label" htmlFor="geoComune">Comune</label>
                            </div>
                        </div>
                    </div>

                    {/* Dropdown Regione */}
                    {(geoLevel === 'regionale' || geoLevel === 'provinciale' || geoLevel === 'comune') && (
                        <div className="mb-3">
                            <label htmlFor="selectedRegion" className="form-label">Regione</label>
                            <select
                                id="selectedRegion"
                                className="form-select"
                                value={selectedRegion}
                                onChange={(e) => setSelectedRegion(e.target.value)}
                                disabled={loadingSubmit || loadingGeo}
                            >
                                <option value="">Seleziona una Regione</option>
                                {regioni.map(r => <option key={r.id} value={r.key}>{r.name}</option>)}
                            </select>
                        </div>
                    )}

                    {/* Dropdown Provincia */}
                    {(geoLevel === 'provinciale' || geoLevel === 'comune') && selectedRegion && (
                        <div className="mb-3">
                            <label htmlFor="selectedProvince" className="form-label">Provincia</label>
                            <select
                                id="selectedProvince"
                                className="form-select"
                                value={selectedProvince}
                                onChange={(e) => setSelectedProvince(e.target.value)}
                                disabled={loadingSubmit || loadingGeo}
                            >
                                <option value="">Seleziona una Provincia</option>
                                {province.filter(p => p.regione === selectedRegion).map(p => <option key={p.id}
                                                                                                     value={p.key}>{p.name}</option>)}
                            </select>
                        </div>
                    )}

                    {/* Dropdown Comune */}
                    {geoLevel === 'comune' && selectedProvince && (
                        <div className="mb-3">
                            <label htmlFor="selectedComune" className="form-label">Comune</label>
                            <select
                                id="selectedComune"
                                className="form-select"
                                value={selectedComune}
                                onChange={(e) => setSelectedComune(e.target.value)}
                                disabled={loadingSubmit || loadingGeo}
                            >
                                <option value="">Seleziona un Comune</option>
                                {comuni.map(c => <option key={c.id} value={c.key}>{c.name}</option>)}
                            </select>
                        </div>
                    )}

                    {/* Tipo Soglia */}
                    <div className="mb-3">
                        <label className="form-label d-flex align-items-center">
                            <FaEuroSign className="me-2 text-muted"/> Condizione di Notifica
                        </label>
                        <div>
                            <div className="form-check form-check-inline">
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    name="thresholdTypeOptions"
                                    id="thresholdCheapest"
                                    value="cheapest_in_area"
                                    checked={thresholdType === 'cheapest_in_area'}
                                    onChange={() => setThresholdType('cheapest_in_area')}
                                    disabled={loadingSubmit}
                                />
                                <label className="form-check-label" htmlFor="thresholdCheapest">Più economico
                                    nell'area</label>
                            </div>
                            <div className="form-check form-check-inline">
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    name="thresholdTypeOptions"
                                    id="thresholdBelowPrice"
                                    value="below_price"
                                    checked={thresholdType === 'below_price'}
                                    onChange={() => setThresholdType('below_price')}
                                    disabled={loadingSubmit}
                                />
                                <label className="form-check-label" htmlFor="thresholdBelowPrice">Prezzo sotto</label>
                            </div>
                        </div>
                    </div>

                    {/* Valore Soglia (condizionale) */}
                    {thresholdType === 'below_price' && (
                        <div className="mb-3">
                            <label htmlFor="thresholdValue" className="form-label">Valore Soglia (€/L)</label>
                            <input
                                type="number"
                                id="thresholdValue"
                                className="form-control"
                                value={thresholdValue}
                                onChange={(e) => setThresholdValue(e.target.value)}
                                step="0.001"
                                min="0"
                                disabled={loadingSubmit}
                                required={thresholdType === 'below_price'}
                            />
                        </div>
                    )}

                    <button type="submit" className="btn btn-primary w-100" disabled={loadingSubmit || loadingGeo}>
                        {loadingSubmit ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status"
                                      aria-hidden="true"></span>
                                Creazione...
                            </>
                        ) : (
                            'Crea Notifica'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}