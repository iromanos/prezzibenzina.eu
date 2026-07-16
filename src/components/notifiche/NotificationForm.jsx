'use client';

import {useCallback, useState} from 'react';
import NotificationGeoFilters from './NotificationGeoFilters'; // Componente per i filtri geografici
import {FaBell, FaEuroSign, FaGasPump} from 'react-icons/fa'; // Icone

export default function NotificationForm({onSubscriptionCreated}) {
    const [fuelType, setFuelType] = useState('Benzina');
    const [geoFilters, setGeoFilters] = useState({livello_geo: 'nazionale', codice_geo: 'IT'});
    const [thresholdType, setThresholdType] = useState('cheapest_in_area');
    const [thresholdValue, setThresholdValue] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleGeoFilterChange = useCallback((newGeoFilters) => {
        setGeoFilters(newGeoFilters);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const token = localStorage.getItem('jwt_token');
        if (!token) {
            setError('Non autenticato. Effettua il login per creare notifiche.');
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

        try {
            const response = await fetch('/api/subscriptions/create', {
                method: 'POST',
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
                }),
            });

            const data = await response.json();

            if (response.ok) {
                alert('Notifica creata con successo!');
                if (onSubscriptionCreated) {
                    onSubscriptionCreated(); // Notifica il componente padre
                }
                // Resetta il form
                setFuelType('Benzina');
                setGeoFilters({livello_geo: 'nazionale', codice_geo: 'IT'});
                setThresholdType('cheapest_in_area');
                setThresholdValue('');
            } else {
                setError(data.error || 'Errore durante la creazione della notifica.');
            }
        } catch (err) {
            console.error('Errore di rete o del server:', err);
            setError('Impossibile connettersi al server. Riprova più tardi.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card mb-4">
            <div className="card-body">
                <h5 className="card-title d-flex align-items-center mb-3">
                    <FaBell className="me-2 text-primary"/> Crea Nuova Notifica
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
                            <option value="Benzina">Benzina</option>
                            <option value="Gasolio">Gasolio</option>
                            <option value="GPL">GPL</option>
                            <option value="Metano">Metano</option>
                        </select>
                    </div>

                    {/* Filtri Geografici */}
                    <NotificationGeoFilters onGeoFilterChange={handleGeoFilterChange} disabled={loading}/>

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

                    <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                        {loading ? (
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