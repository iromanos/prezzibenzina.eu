'use client';

import {useCallback, useEffect, useState} from 'react';
import Header from "@/components/Header";
import StatisticheFilters from '@/components/statistiche/StatisticheFilters';
import StatisticheChart from '@/components/statistiche/StatisticheChart';
import StatisticheKPI from '@/components/statistiche/StatisticheKPI'; // Importa il nuovo componente KPI

export default function StatisticheClient({initialParams = {}, introParagraph}) {
    const [filters, setFilters] = useState(null);
    const [chartData, setChartData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false); // Nuovo stato per la gestione degli errori

    const handleFilterChange = useCallback((newFilters) => {
        setFilters(newFilters);
    }, []);

    useEffect(() => {
        if (!filters) return;

        async function fetchData() {
            setIsLoading(true);
            setHasError(false); // Resetta lo stato di errore ad ogni nuova richiesta
            const params = new URLSearchParams(filters);
            try {
                const response = await fetch(`/api/statistiche?${params.toString()}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setChartData(data);
            } catch (error) {
                console.error("Errore nel caricamento dei dati per il grafico:", error);
                setChartData([]);
                setHasError(true); // Imposta lo stato di errore
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

                {/* Paragrafo introduttivo per i contenuti descrittivi */}
                <div className="mb-4">
                    <p>
                        {introParagraph}
                    </p>
                    <p>
                        Questi dati ti aiuteranno a comprendere meglio le fluttuazioni del mercato e a prendere
                        decisioni più informate per risparmiare sul rifornimento.
                    </p>
                </div>

                <div className="row">
                    <div className="col-12 col-lg-3">
                        <StatisticheFilters onFilterChange={handleFilterChange}
                                            isLoading={isLoading}
                                            initialFilters={initialParams}/> {/* Passa isLoading e i parametri iniziali dall'URL */}
                    </div>
                    <div className="col-12 col-lg-9">
                        {isLoading ? (
                            <div className="d-flex justify-content-center align-items-center" style={{height: '300px'}}>
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Caricamento...</span>
                                </div>
                            </div>
                        ) : hasError ? (
                            <div className="alert alert-danger" role="alert">
                                Si è verificato un errore durante il caricamento dei dati. Riprova più tardi.
                            </div>
                        ) : (
                            <>
                                <StatisticheKPI data={chartData}/>
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
