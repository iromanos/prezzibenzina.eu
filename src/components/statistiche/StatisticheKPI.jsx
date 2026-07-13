// src/components/statistiche/StatisticheKPI.jsx
'use client';

import React from 'react';

export default function StatisticheKPI({data}) {
    if (!data || data.length === 0) {
        return (
            <div className="card mb-4">
                <div className="card-body">
                    <h5 className="card-title">Riepilogo Dati</h5>
                    <p>Nessun dato disponibile per il riepilogo.</p>
                </div>
            </div>
        );
    }

    // Calcola i KPI
    const prezzi = data.map(item => parseFloat(item.prezzo_medio));
    const prezzoMedioAttuale = prezzi[prezzi.length - 1];
    const prezzoMinPeriodo = Math.min(...prezzi);
    const prezzoMaxPeriodo = Math.max(...prezzi);

    // Calcolo variazione (es. ultima settimana o mese, se i dati lo permettono)
    // Per semplicità, calcoliamo la variazione rispetto al primo prezzo disponibile
    const prezzoInizialePeriodo = prezzi[0];
    const variazionePercentuale = ((prezzoMedioAttuale - prezzoInizialePeriodo) / prezzoInizialePeriodo) * 100;

    return (
        <div className="card mb-4">
            <div className="card-body">
                <h5 className="card-title">Riepilogo Dati</h5>
                <div className="row">
                    <div className="col-6 mb-3">
                        <div className="text-muted small">Prezzo Medio Attuale</div>
                        <div className="fw-bold fs-5">{prezzoMedioAttuale.toFixed(3)} €</div>
                    </div>
                    <div className="col-6 mb-3">
                        <div className="text-muted small">Variazione Periodo</div>
                        <div className={`fw-bold fs-5 ${variazionePercentuale >= 0 ? 'text-danger' : 'text-success'}`}>
                            {variazionePercentuale.toFixed(2)}%
                        </div>
                    </div>
                    <div className="col-6">
                        <div className="text-muted small">Prezzo Minimo Periodo</div>
                        <div className="fw-bold fs-5">{prezzoMinPeriodo.toFixed(3)} €</div>
                    </div>
                    <div className="col-6">
                        <div className="text-muted small">Prezzo Massimo Periodo</div>
                        <div className="fw-bold fs-5">{prezzoMaxPeriodo.toFixed(3)} €</div>
                    </div>
                </div>
            </div>
        </div>
    );
}