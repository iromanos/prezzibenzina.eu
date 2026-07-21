// src/components/statistiche/StatisticheFilters.jsx
'use client';

import {useCallback, useEffect, useState} from 'react';
import StatisticheGeoFilters from './StatisticheGeoFilters';
import {FaGasPump} from 'react-icons/fa6';
import {FaCalendarAlt} from "react-icons/fa"; // Importa le icone

export default function StatisticheFilters({onFilterChange, isLoading, filters}) {
    if (!filters) {
        return null; // o un loader
    }

    const handleGeoFilterChange = useCallback((newGeoFilters) => {
        onFilterChange({...filters, ...newGeoFilters});
    }, [filters, onFilterChange]);

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
                                value={filters.desc_carburante}
                                onChange={(e) => onFilterChange({...filters, desc_carburante: e.target.value})}
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
                    <StatisticheGeoFilters onGeoFilterChange={handleGeoFilterChange}
                                           isLoading={isLoading}
                                           geoFilters={filters}/>

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
                                value={filters.startDate || ''}
                                onChange={(e) => onFilterChange({...filters, startDate: e.target.value})}
                                disabled={isLoading}
                            />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="endDate" className="form-label">Data Fine</label>
                            <input
                                type="date"
                                id="endDate"
                                className="form-control"
                                value={filters.endDate || ''}
                                onChange={(e) => onFilterChange({...filters, endDate: e.target.value})}
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    <button
                        type="button"
                        className="btn btn-primary w-100 py-2"
                        onClick={() => onFilterChange({...filters})} // Riesegue la fetch con i filtri attuali
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