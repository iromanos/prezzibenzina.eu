// src/app/(default)/statistiche/page.jsx
'use client';

import {useCallback, useEffect, useState} from 'react';
import Header from "@/components/Header";
import StatisticheFilters from '@/components/statistiche/StatisticheFilters';
import StatisticheChart from '@/components/statistiche/StatisticheChart';
import StatisticheKPI from '@/components/statistiche/StatisticheKPI'; // Importa il nuovo componente KPI

export default function StatistichePage() {
    const [filters, setFilters] = useState(null);
    const [chartData, setChartData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const handleFilterChange = useCallback((newFilters) => {
        setFilters(newFilters);
    }, []);

    useEffect(() => {
        if (!filters) return;

        async function fetchData() {
            setIsLoading(true);
            const params = new URLSearchParams(filters);
            try {
                const response = await fetch(`/api/statistiche?${params.toString()}`);
                const data = await response.json();
                setChartData(data);
            } catch (error) {
                console.error("Errore nel caricamento dei dati per il grafico:", error);
                setChartData([]);
            } finally {
                setIsLoading(false);
            }
        }

        fetchData();
    }, [filters]);

    return (
        <>
            <Header/>
            <div className="container my-4">
                <div className="text-center mb-4">
                    <h1 className="display-5 fw-bold">Statistiche Prezzi Carburanti</h1>
                    <p className="lead">
                        Analizza l'andamento storico dei prezzi e scopri le tendenze del mercato.
                    </p>
                </div>

                <div className="row">
                    <div className="col-12 col-lg-3">
                        <StatisticheFilters onFilterChange={handleFilterChange}/>
                    </div>
                    <div className="col-12 col-lg-9">
                        {isLoading ? (
                            <p>Caricamento...</p>
                        ) : (
                            <>
                                <StatisticheKPI data={chartData}/> {/* Inserisce il componente KPI */}
                                <div className="card">
                                    <div className="card-body">
                                        <h5 className="card-title">Andamento Prezzi</h5>
                                        <StatisticheChart data={chartData}/>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}