'use client';

import {useEffect, useState} from 'react';
import Header from "@/components/Header";
import StatisticheFilters from '@/components/statistiche/StatisticheFilters';
import StatisticheChart from '@/components/statistiche/StatisticheChart';
import StatisticheKPI from '@/components/statistiche/StatisticheKPI';
import Link from 'next/link';

export default function StatisticheClient({initialParams = null, introParagraph}) {
    const [filters, setFilters] = useState(null);
    const [chartData, setChartData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false); // Nuovo stato per la gestione degli errori

    // Sincronizza i filtri quando i parametri dell'URL cambiano (es. click su link rapidi)
    useEffect(() => {
        setFilters(initialParams && Object.keys(initialParams).length > 0 ? initialParams : { desc_carburante: 'benzina', livello_geo: 'nazionale', codice_geo: 'IT' });
    }, [initialParams]);
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
                    <h1 className="display-5 fw-bold">Statistiche dei prezzi dei carburanti</h1>
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
                <hr />
                <label className="form-label small fw-bold">Collegamenti Rapidi</label>
                <div className="d-flex mb-4 flex-wrap gap-2 align-items-center">
                    <Link
                        href={'/statistiche?desc_carburante=benzina&livello_geo=provinciale&codice_geo=mi'}>Milano</Link>
                    <Link
                        href={'/statistiche?desc_carburante=benzina&livello_geo=provinciale&codice_geo=rm'}>Roma</Link>
                    <Link
                        href={'/statistiche?desc_carburante=benzina&livello_geo=provinciale&codice_geo=bo'}>Bologna</Link>
                    <Link
                        href={'/statistiche?desc_carburante=benzina&livello_geo=provinciale&codice_geo=fi'}>Firenze</Link>
                    <Link
                        href={'/statistiche?desc_carburante=benzina&livello_geo=provinciale&codice_geo=to'}>Torino</Link>
                    <Link
                        href={'/statistiche?desc_carburante=benzina&livello_geo=provinciale&codice_geo=na'}>Napoli</Link>
                    <Link
                        href={'/statistiche?desc_carburante=benzina&livello_geo=provinciale&codice_geo=ba'}>Bari</Link>
                    <Link
                        href={'/statistiche?desc_carburante=benzina&livello_geo=provinciale&codice_geo=pa'}>Palermo</Link>
                    {/* Nuovo link aggiunto qui */}
                    <Link
                        href={'/prezzi-medi-regione'}
                        className="btn btn-sm btn-outline-primary" // Aggiunto stile per renderlo più visibile
                    >Prezzi Medi per Regione</Link>
                </div>

                <div className="row">
                    <div className="col-12 col-lg-3">
                        <StatisticheFilters onFilterChange={setFilters}
                                            isLoading={isLoading}
                                            filters={filters}/> {/* Passa i filtri correnti per sincronizzare l'UI */}
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
                                        <div
                                            className="ratio ratio-21x9"> {/* Aggiunto per mantenere l'aspetto del grafico */}
                                            <StatisticheChart data={chartData} showMax={true} showMin={true}/>
                                        </div>
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