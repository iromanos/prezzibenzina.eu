'use client';

import React, {useEffect, useState} from 'react';
import {Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis} from 'recharts';

// Mappatura dei codici regione (slug) ai nomi completi (duplicato per il client component, idealmente verrebbe da un file condiviso)
const REGION_NAMES_MAP = {
    'abruzzo': 'Abruzzo',
    'basilicata': 'Basilicata',
    'calabria': 'Calabria',
    'campania': 'Campania',
    'emilia-romagna': 'Emilia-Romagna',
    'friuli-venezia-giulia': 'Friuli-Venezia Giulia',
    'lazio': 'Lazio',
    'liguria': 'Liguria',
    'lombardia': 'Lombardia',
    'marche': 'Marche',
    'molise': 'Molise',
    'piemonte': 'Piemonte',
    'puglia': 'Puglia',
    'sardegna': 'Sardegna',
    'sicilia': 'Sicilia',
    'toscana': 'Toscana',
    'trentino-alto-adige': 'Trentino-Alto Adige',
    'umbria': 'Umbria',
    'valle-daosta': 'Valle d\'Aosta',
    'veneto': 'Veneto',
};

const FUEL_TYPES_AVAILABLE = ['Benzina', 'Diesel', 'GPL', 'Metano'];

export default function RegionFuelBarChart({prezziAggregati}) {
    const [selectedFuel, setSelectedFuel] = useState(FUEL_TYPES_AVAILABLE[0]);
    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        if (prezziAggregati && prezziAggregati.length > 0) {
            const dataForChart = prezziAggregati
                .map(regionData => {
                    const regionName = REGION_NAMES_MAP[regionData.codice_geo] || regionData.codice_geo;
                    const fuelPrice = regionData.carburanti[selectedFuel];
                    return {
                        name: regionName,
                        price: fuelPrice ? fuelPrice.prezzo_medio : null,
                    };
                })
                .filter(item => item.price !== null) // Filtra le regioni senza dati per il carburante selezionato
                .sort((a, b) => a.name.localeCompare(b.name, 'it', {sensitivity: 'base'})); // Ordina alfabeticamente per nome regione

            setChartData(dataForChart);
        } else {
            setChartData([]);
        }
    }, [prezziAggregati, selectedFuel]);

    const handleFuelChange = (event) => {
        setSelectedFuel(event.target.value);
    };

    const CustomTooltip = ({active, payload, label}) => {
        if (active && payload && payload.length) {
            return (
                <div className="custom-tooltip bg-white p-2 border rounded shadow-sm">
                    <p className="label fw-bold">{label}</p>
                    <p className="intro">{`${selectedFuel}: ${payload[0].value ? payload[0].value.toFixed(3) : 'N/D'} €/L`}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="card mb-4">
            <div className="card-body">
                <h5 className="card-title">Confronto Prezzi Medi per Carburante tra Regioni</h5>
                <div className="mb-3">
                    <label htmlFor="selectFuelForChart" className="form-label">Seleziona Carburante:</label>
                    <select
                        id="selectFuelForChart"
                        className="form-select"
                        value={selectedFuel}
                        onChange={handleFuelChange}
                    >
                        {FUEL_TYPES_AVAILABLE.map(fuelType => (
                            <option key={fuelType} value={fuelType}>{fuelType}</option>
                        ))}
                    </select>
                </div>

                {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart
                            data={chartData}
                            margin={{
                                top: 5,
                                right: 30,
                                left: 20,
                                bottom: 5,
                            }}
                        >
                            <CartesianGrid strokeDasharray="3 3"/>
                            <XAxis dataKey="name" angle={-45} textAnchor="end" height={120} interval={0}/>
                            <YAxis domain={['auto', 'auto']}/>
                            <Tooltip content={<CustomTooltip/>}/>
                            <Bar dataKey="price" fill="#007bff"/>
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <p className="text-center text-muted">Nessun dato disponibile per il carburante selezionato.</p>
                )}
            </div>
        </div>
    );
}