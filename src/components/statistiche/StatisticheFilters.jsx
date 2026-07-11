// src/components/statistiche/StatisticheFilters.jsx
'use client';

import {useCallback, useEffect, useState} from 'react';
import StatisticheGeoFilters from './StatisticheGeoFilters';

export default function StatisticheFilters({onFilterChange}) {
    const [carburante, setCarburante] = useState('1'); // Default a Benzina (ID 1)
    const [geoFilters, setGeoFilters] = useState({livello_geo: 'nazionale', codice_geo: 'IT'});

    const handleGeoFilterChange = useCallback((newGeoFilters) => {
        setGeoFilters(newGeoFilters);
    }, []);

    const handleFilter = () => {
        if (onFilterChange) {
            onFilterChange({
                id_carburante: carburante,
                ...geoFilters,
            });
        }
    };

    // Esegui il primo caricamento
    useEffect(() => {
        handleFilter();
    }, []);

    return (
        <div className="card">
            <div className="card-body">
                <h5 className="card-title">Filtri</h5>
                <form>
                    <div className="mb-3">
                        <label htmlFor="carburante" className="form-label">Carburante</label>
                        <select
                            id="carburante"
                            className="form-select"
                            value={carburante}
                            onChange={(e) => setCarburante(e.target.value)}
                        >
                            <option value="1">Benzina</option>
                            <option value="2">Diesel</option>
                            <option value="3">GPL</option>
                            <option value="4">Metano</option>
                        </select>
                    </div>

                    <StatisticheGeoFilters onGeoFilterChange={handleGeoFilterChange}/>

                    <button
                        type="button"
                        className="btn btn-primary w-100"
                        onClick={handleFilter}
                    >
                        Applica Filtri
                    </button>
                </form>
            </div>
        </div>
    );
}
