'use client';

import React, {useEffect, useMemo, useState} from 'react';
import {CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis} from 'recharts';

export default function StoricoPrezzi({impiantoId}) {
    const [rawData, setRawData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [periodo, setPeriodo] = useState('6m'); // Periodo di default: 3 mesi

    // 1. Scarichiamo tutti i dati (es. ultimi 6 mesi) all'inizio
    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/pb/impianto/grafico?impianto_id=${impiantoId}&valore=6`)

            .then((res) => res.json())
            .then((resData) => {
                // Convertiamo i prezzi in float se arrivano come stringhe da PHP
                const parsedData = resData.map(item => ({
                    ...item,
                    prezzo_self_benzina: item.prezzo_self_benzina ? parseFloat(item.prezzo_self_benzina) : null,
                    prezzo_self_diesel: item.prezzo_self_diesel ? parseFloat(item.prezzo_self_diesel) : null,
                    prezzo_gpl: item.prezzo_gpl ? parseFloat(item.prezzo_gpl) : null,
                    prezzo_metano: item.prezzo_metano ? parseFloat(item.prezzo_metano) : null,
                    // Manteniamo l'oggetto Date reale per poter fare i confronti matematici dopo
                    dateObj: new Date(item.data)
                }));
                setRawData(parsedData);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Errore nel caricamento dello storico", err);
                setLoading(false);
            });
    }, [impiantoId]);

    // 2. Filtriamo i dati in tempo reale in base al periodo selezionato usando useMemo
    const dataFiltrata = useMemo(() => {
        if (rawData.length === 0) return [];

        const oggi = new Date();
        let dataLimite = new Date();

        // Calcoliamo il punto di partenza indietro nel tempo
        if (periodo === '7d') {
            dataLimite.setDate(oggi.getDate() - 7);
        } else if (periodo === '1m') {
            dataLimite.setMonth(oggi.getMonth() - 1);
        } else if (periodo === '3m') {
            dataLimite.setMonth(oggi.getMonth() - 3);
        } else if (periodo === '6m') {
            dataLimite.setMonth(oggi.getMonth() - 6);
        }

        // Filtriamo i record e formattiamo la stringa per l'asse X
        return rawData
            .filter(item => item.dateObj >= dataLimite)
            .map(item => ({
                ...item,
                dataFormattata: item.dateObj.toLocaleDateString('it-IT', {
                    day: '2-digit',
                    month: periodo === '7d' ? '2-digit' : 'short' // Mese intero o corto a seconda del dettaglio
                })
            }));
    }, [rawData, periodo]);

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{height: '350px'}}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Caricamento...</span>
                </div>
            </div>
        );
    }

    if (rawData.length === 0) {
        return <div className="text-muted text-center py-5">Nessun dato storico disponibile per questo impianto.</div>;
    }

    return (

        <div className="card shadow-sm mb-4">
            <div className="card-body">

                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h2 className="h6 card-title text-secondary mb-0 fw-normal">
                        Andamento Storico Prezzi
                    </h2>
                    <span className="badge bg-light text-dark border">Aggiornato oggi</span>
                </div>

        <div>
            {/* SELETTORE DI PERIODO (In stile Bootstrap Button Group) */}
            <div className="d-flex justify-content-end mb-3">
                <div className="btn-group btn-group-sm" role="group" aria-label="Seleziona periodo">
                    <button
                        type="button"
                        className={`btn ${periodo === '7d' ? 'btn-primary' : 'btn-outline-secondary'}`}
                        onClick={() => setPeriodo('7d')}
                    >
                        1 Settimana
                    </button>
                    <button
                        type="button"
                        className={`btn ${periodo === '1m' ? 'btn-primary' : 'btn-outline-secondary'}`}
                        onClick={() => setPeriodo('1m')}
                    >
                        1 Mese
                    </button>
                    <button
                        type="button"
                        className={`btn ${periodo === '3m' ? 'btn-primary' : 'btn-outline-secondary'}`}
                        onClick={() => setPeriodo('3m')}
                    >
                        3 Mesi
                    </button>
                    <button
                        type="button"
                        className={`btn ${periodo === '6m' ? 'btn-primary' : 'btn-outline-secondary'}`}
                        onClick={() => setPeriodo('6m')}
                    >
                        6 Mesi
                    </button>
                </div>
            </div>

            {/* IL GRAFICO */}
            <div className="w-100" style={{height: '320px'}}>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dataFiltrata} margin={{top: 10, right: 10, left: -20, bottom: 0}}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef"/>
                        <XAxis dataKey="dataFormattata" stroke="#6c757d" style={{fontSize: '11px'}}/>
                        <YAxis
                            domain={['dataMin - 0.05', 'dataMax + 0.05']} // Ridotto il margine per zoomare meglio sui periodi brevi
                            stroke="#6c757d"
                            style={{fontSize: '12px'}}
                            tickFormatter={(value) => `€${value.toFixed(2)}`}
                        />
                        <Tooltip
                            formatter={(value) => [`€ ${value.toFixed(3)}`]}
                            contentStyle={{backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #dee2e6'}}
                        />
                        <Legend iconType="circle" wrapperStyle={{paddingTop: '10px', fontSize: '13px'}}/>

                        {rawData[0]?.prezzo_self_benzina && (
                            <Line name="Benzina Self" type="monotone" dataKey="prezzo_self_benzina" stroke="#198754"
                                  strokeWidth={3} dot={periodo === '7d'} activeDot={{r: 6}}/>
                        )}
                        {rawData[0]?.prezzo_self_diesel && (
                            <Line name="Diesel Self" type="monotone" dataKey="prezzo_self_diesel" stroke="#212529"
                                  strokeWidth={3} dot={periodo === '7d'} activeDot={{r: 6}}/>
                        )}
                        {rawData[0]?.prezzo_gpl && (
                            <Line name="GPL" type="monotone" dataKey="prezzo_gpl" stroke="#0dcaf0" strokeWidth={2}
                                  dot={periodo === '7d'}/>
                        )}
                        {rawData[0]?.prezzo_metano && (
                            <Line name="Metano" type="monotone" dataKey="prezzo_metano" stroke="#fd7e14" strokeWidth={2}
                                  dot={periodo === '7d'}/>
                        )}
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
            </div>
        </div>
    );
}