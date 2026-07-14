// src/components/statistiche/StatisticheFilters.jsx
'use client';

import {useCallback, useEffect, useState} from 'react';
import StatisticheGeoFilters from './StatisticheGeoFilters';
import {FaGasPump} from 'react-icons/fa6';
import {FaCalendarAlt} from "react-icons/fa"; // Importa le icone

export default function StatisticheFilters({onFilterChange, isLoading}) { // Riceve isLoading
    const [carburante, setCarburante] = useState('Benzina');
    const [geoFilters, setGeoFilters] = useState({livello_geo: 'nazionale', codice_geo: 'IT'});

    // Calcola la data di oggi e 90 giorni fa per i valori predefiniti
    const getInitialDates = () => {
        const today = new Date();
        const ninetyDaysAgo = new Date(today);
        ninetyDaysAgo.setDate(today.getDate() - 90);
        return {
            startDate: ninetyDaysAgo.toISOString().split('T')[0],
            endDate: today.toISOString().split('T')[0],
        };
    };

    const initialDates = getInitialDates();
    const [startDate, setStartDate] = useState(initialDates.startDate);
    const [endDate, setEndDate] = useState(initialDates.endDate);


    const handleGeoFilterChange = useCallback((newGeoFilters) => {
        setGeoFilters(newGeoFilters);
    }, []);

    const handleFilter = () => {
        if (onFilterChange) {
            onFilterChange({
                desc_carburante: carburante,
                ...geoFilters,
                startDate,
                endDate,
            });
        }
    };

    // Esegui il primo caricamento e ogni volta che le date iniziali cambiano (anche se non dovrebbero)
    useEffect(() => {
        handleFilter();
    }, [carburante, geoFilters, startDate, endDate]); // Dipendenze per rieseguire il filtro quando cambiano


    return (
        <div className="card">
            <div className="card-body">
                <h5 className="card-title mb-4">Filtri Statistiche</h5>
                <form>
                    {/* Sezione Carburante */}
                    <div className="mb-4"> {/* Rimosso p-3 border rounded bg-light */}
                        <h6 className="mb-3 d-flex align-items-center text-primary">
                            <FaGasPump className="me-2"/> Tipo Carburante
                        </h6>
                        <div className="mb-3">
                            <label htmlFor="carburante" className="form-label visually-hidden">Carburante</label>
                            <select
                                id="carburante"
                                className="form-select"
                                value={carburante}
                                onChange={(e) => setCarburante(e.target.value)}
                                disabled={isLoading}
                            >
                                <option value="Benzina">Benzina</option>
                                <option value="Gasolio">Gasolio</option>
                                <option value="GPL">GPL</option>
                                <option value="Metano">Metano</option>
                            </select>
                        </div>
                    </div>

                    {/* Sezione Filtri Geografici */}
                    <StatisticheGeoFilters onGeoFilterChange={handleGeoFilterChange}/>

                    {/* Sezione Intervallo di Date */}
                    <div className="mb-4"> {/* Rimosso p-3 border rounded bg-light */}
                        <h6 className="mb-3 d-flex align-items-center text-primary">
                            <FaCalendarAlt className="me-2"/> Intervallo Date
                        </h6>
                        <div className="mb-3">
                            <label htmlFor="startDate" className="form-label">Data Inizio</label>
                            <input
                                type="date"
                                id="startDate"
                                className="form-control"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="endDate" className="form-label">Data Fine</label>
                            <input
                                type="date"
                                id="endDate"
                                className="form-control"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    <button
                        type="button"
                        className="btn btn-primary w-100 py-2"
                        onClick={handleFilter}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status"
                                      aria-hidden="true"></span>
                                Caricamento...
                            </>
                        ) : (
                            'Applica Filtri'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}