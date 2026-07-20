'use client';

import {useEffect, useState} from 'react';
import {FaEuroSign, FaGasPump, FaMapMarkerAlt, FaPlus} from 'react-icons/fa'; // Icone per i campi
import {FaGlobe, FaMapPin} from 'react-icons/fa6'; // Altre icone

export default function SubscriptionForm({
                                             onSubmit,
                                             initialData = {},
                                             isLoading = false,
                                             error = null,
                                             success = null
                                         }) {
    const [fuelType, setFuelType] = useState(initialData.fuel_type || 'Benzina');
    const [geoLevel, setGeoLevel] = useState(initialData.geo_level || 'nazionale');
    const [geoCode, setGeoCode] = useState(initialData.geo_code || 'IT');
    const [thresholdType, setThresholdType] = useState(initialData.threshold_type || 'cheapest_in_area');
    const [thresholdValue, setThresholdValue] = useState(initialData.threshold_value || '');

    const [regioni, setRegioni] = useState([]);
    const [province, setProvince] = useState([]);
    const [selectedRegione, setSelectedRegione] = useState(''); // Usato per filtrare le province

    const [formError, setFormError] = useState(error);
    const [formSuccess, setFormSuccess] = useState(success);

    // Carica dati geografici all'avvio
    useEffect(() => {
        async function fetchData() {
            try {
                const [regioniRes, provinceRes] = await Promise.all([
                    fetch('/api/geo/regioni'),
                    fetch('/api/geo/province')
                ]);
                const regioniData = await regioniRes.json();
                const provinceData = await provinceRes.json();
                setRegioni(regioniData);
                setProvince(provinceData);

                // Pre-seleziona regione/provincia se initialData è presente
                if (initialData.geo_level === 'regionale' && initialData.geo_code) {
                    setSelectedRegione(initialData.geo_code);
                } else if (initialData.geo_level === 'provinciale' && initialData.geo_code) {
                    // Trova la regione della provincia pre-selezionata
                    const prov = provinceData.find(p => p.key === initialData.geo_code);
                    if (prov) {
                        setSelectedRegione(prov.regione);
                    }
                    setGeoCode(initialData.geo_code); // Imposta il geoCode iniziale per la provincia
                }
            } catch (err) {
                console.error("Errore nel caricamento dei dati geografici:", err);
                setFormError("Errore nel caricamento dei dati geografici.");
            }
        }

        fetchData();
    }, [initialData]);

    // Aggiorna geoCode quando cambiano livelloGeo o selectedRegione/Provincia
    useEffect(() => {
        if (geoLevel === 'nazionale') {
            setGeoCode('IT');
        } else if (geoLevel === 'regionale') {
            setGeoCode(selectedRegione);
        } else if (geoLevel === 'provinciale') {
            setGeoCode(selectedProvincia);
        }
    }, [geoLevel, selectedRegione, selectedProvincia]);

    // Resetta messaggi di feedback quando i dati iniziali cambiano
    useEffect(() => {
        setFormError(error);
        setFormSuccess(success);
    }, [error, success]);


    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError(null);
        setFormSuccess(null);

        if (!fuelType || !geoLevel || !geoCode || (thresholdType === 'below_price' && !thresholdValue)) {
            setFormError("Per favore, compila tutti i campi obbligatori.");
            return;
        }

        const data = {
            fuel_type: fuelType,
            geo_level: geoLevel,
            geo_code: geoCode,
            threshold_type: thresholdType,
            threshold_value: thresholdType === 'below_price' ? parseFloat(thresholdValue) : null,
        };

        onSubmit(data);
    };

    return (
        <div className="card mb-4">
            <div className="card-body">
                <h5 className="card-title mb-4 d-flex align-items-center">
                    <FaPlus className="me-2 text-primary"/> Crea Nuova Notifica
                </h5>
                {formError && <div className="alert alert-danger">{formError}</div>}
                {formSuccess && <div className="alert alert-success">{formSuccess}</div>}

                <form onSubmit={handleSubmit}>
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
                            disabled={isLoading}
                            required
                        >
                            <option value="Benzina">Benzina</option>
                            <option value="Gasolio">Gasolio</option>
                            <option value="GPL">GPL</option>
                            <option value="Metano">Metano</option>
                        </select>
                    </div>

                    {/* Livello Geografico */}
                    <div className="mb-3">
                        <label htmlFor="geoLevel" className="form-label d-flex align-items-center">
                            <FaGlobe className="me-2 text-muted"/> Livello Geografico
                        </label>
                        <select
                            id="geoLevel"
                            className="form-select"
                            value={geoLevel}
                            onChange={(e) => {
                                setGeoLevel(e.target.value);
                                setSelectedRegione('');
                                setGeoCode(''); // Resetta geoCode quando cambia il livello
                            }}
                            disabled={isLoading}
                            required
                        >
                            <option value="nazionale">Nazionale</option>
                            <option value="regionale">Regionale</option>
                            <option value="provinciale">Provinciale</option>
                            {/* <option value="comune">Comune</option> */} {/* Implementare in futuro se necessario */}
                        </select>
                    </div>

                    {/* Selezione Regione */}
                    {geoLevel === 'regionale' && (
                        <div className="mb-3">
                            <label htmlFor="selectedRegione" className="form-label d-flex align-items-center">
                                <FaMapMarkerAlt className="me-2 text-muted"/> Regione
                            </label>
                            <select
                                id="selectedRegione"
                                className="form-select"
                                value={selectedRegione}
                                onChange={(e) => setSelectedRegione(e.target.value)}
                                disabled={isLoading}
                                required
                            >
                                <option value="">Seleziona una regione</option>
                                {regioni.map(r => (
                                    <option key={r.id} value={r.key}>{r.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Selezione Provincia */}
                    {geoLevel === 'provinciale' && (
                        <>
                            <div className="mb-3">
                                <label htmlFor="selectedRegioneProv" className="form-label d-flex align-items-center">
                                    <FaMapMarkerAlt className="me-2 text-muted"/> Regione (per Provincia)
                                </label>
                                <select
                                    id="selectedRegioneProv"
                                    className="form-select"
                                    value={selectedRegione}
                                    onChange={(e) => {
                                        setSelectedRegione(e.target.value);
                                        setGeoCode(''); // Resetta geoCode quando cambia la regione per provincia
                                        setThresholdValue(''); // Resetta provincia selezionata
                                    }}
                                    disabled={isLoading}
                                    required
                                >
                                    <option value="">Seleziona una regione</option>
                                    {regioni.map(r => (
                                        <option key={r.id} value={r.key}>{r.name}</option>
                                    ))}
                                </select>
                            </div>
                            {selectedRegione && (
                                <div className="mb-3">
                                    <label htmlFor="selectedProvincia" className="form-label d-flex align-items-center">
                                        <FaMapPin className="me-2 text-muted"/> Provincia
                                    </label>
                                    <select
                                        id="selectedProvincia"
                                        className="form-select"
                                        value={selectedProvincia}
                                        onChange={(e) => setThresholdValue(e.target.value)} // Imposta la provincia selezionata
                                        disabled={isLoading}
                                        required
                                    >
                                        <option value="">Seleziona una provincia</option>
                                        {province.filter(p => p.regione === selectedRegione).map(p => (
                                            <option key={p.id} value={p.key}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </>
                    )}

                    {/* Tipo di Soglia */}
                    <div className="mb-3">
                        <label className="form-label d-flex align-items-center">
                            <FaEuroSign className="me-2 text-muted"/> Tipo di Soglia
                        </label>
                        <div>
                            <div className="form-check form-check-inline">
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    name="thresholdType"
                                    id="cheapestInArea"
                                    value="cheapest_in_area"
                                    checked={thresholdType === 'cheapest_in_area'}
                                    onChange={(e) => setThresholdType(e.target.value)}
                                    disabled={isLoading}
                                />
                                <label className="form-check-label" htmlFor="cheapestInArea">Più economico
                                    nell'area</label>
                            </div>
                            <div className="form-check form-check-inline">
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    name="thresholdType"
                                    id="belowPrice"
                                    value="below_price"
                                    checked={thresholdType === 'below_price'}
                                    onChange={(e) => setThresholdType(e.target.value)}
                                    disabled={isLoading}
                                />
                                <label className="form-check-label" htmlFor="belowPrice">Prezzo sotto X €</label>
                            </div>
                        </div>
                    </div>

                    {/* Valore Soglia (visibile solo se below_price è selezionato) */}
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
                                disabled={isLoading}
                                required
                            />
                        </div>
                    )}

                    <button type="submit" className="btn btn-primary w-100" disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status"
                                      aria-hidden="true"></span>
                                Salvataggio...
                            </>
                        ) : (
                            'Salva Notifica'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}