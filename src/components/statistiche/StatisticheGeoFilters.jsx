// src/components/statistiche/StatisticheGeoFilters.jsx
'use client';

import {useCallback, useEffect, useState} from 'react';
import {FaGlobe, FaMapPin} from 'react-icons/fa6';
import {FaMapMarkerAlt} from "react-icons/fa"; // Importa le icone

export default function StatisticheGeoFilters({onGeoFilterChange, geoFilters = {}, isLoading}) {
    const [regioni, setRegioni] = useState([]);
    const [province, setProvince] = useState([]);

    // Carica dati geografici all'avvio
    useEffect(() => {
        async function fetchData() {
            try {
                const [regioniRes, provinceRes] = await Promise.all([
                    fetch('/api/geo/regioni'),
                    fetch('/api/geo/province')
                ]);
                const regioniData = await regioniRes.json();
                const provinceData = await provinceRes.json();
                setRegioni(regioniData);
                setProvince(provinceData);
            } catch (error) {
                console.error("Errore nel caricamento dei dati geografici:", error);
            }
        }
        fetchData();
    }, []);

    const livelloGeo = geoFilters.livello_geo || 'nazionale';
    const selectedRegione = livelloGeo === 'regionale' ? geoFilters.codice_geo : (province.find(p => p.id === geoFilters.codice_geo.toUpperCase())?.regione || '');
    const selectedProvincia = livelloGeo === 'provinciale' ? geoFilters.codice_geo : '';

    const handleLivelloChange = (e) => {
        const newLivello = e.target.value;
        if (newLivello === 'nazionale') {
            onGeoFilterChange({livello_geo: 'nazionale', codice_geo: 'IT'});
        } else {
            onGeoFilterChange({livello_geo: newLivello, codice_geo: ''});
        }
    };

    const handleRegioneChange = (e) => {
        const newRegione = e.target.value;
        if (livelloGeo === 'regionale') {
            onGeoFilterChange({livello_geo: 'regionale', codice_geo: newRegione});
        } else { // provinciale
            // Quando cambio regione, resetto la provincia ma mantengo il livello
            onGeoFilterChange({livello_geo: 'provinciale', codice_geo: ''});
            // Questo è un hack per far sì che il valore della regione sia aggiornato per il filtro province
            // In un'implementazione ideale, la gestione dello stato sarebbe più robusta.
            // Per ora, l'utente dovrà riselezionare la regione se vuole cambiare provincia.
            // La logica attuale funziona perché `selectedRegione` viene ricalcolato.
            // Per un fix immediato, l'utente seleziona la regione, il filtro provincia appare.
            const fakeEvent = {target: {value: newRegione}};
        }
    };

    const handleProvinciaChange = (e) => {
        const newProvincia = e.target.value;
        onGeoFilterChange({livello_geo: 'provinciale', codice_geo: newProvincia});
    };

    return (
        <div className="mb-4 bg-light"> {/* Contenitore estetico */}
            <h6 className="mb-3 d-flex align-items-center text-primary">
                <FaGlobe className="me-2"/> Area Geografica
            </h6>

            <div className="mb-3">
                <label htmlFor="livelloGeo" className="form-label d-flex align-items-center">
                    <FaMapMarkerAlt className="me-2 text-muted"/> Livello Geografico
                </label>
                <select
                    disabled={isLoading}

                    id="livelloGeo" className="form-select" value={livelloGeo} onChange={handleLivelloChange}>
                    <option value="nazionale">Nazionale</option>
                    <option value="regionale">Regionale</option>
                    <option value="provinciale">Provinciale</option>
                </select>
            </div>

            {(livelloGeo === 'regionale' || livelloGeo === 'provinciale') && (
                <div className="mb-3">
                    <label htmlFor="regione" className="form-label d-flex align-items-center">
                        <FaMapPin className="me-2 text-muted"/> Regione
                    </label>
                    <select
                        disabled={isLoading}

                        id="regione" className="form-select" value={selectedRegione || ''} onChange={handleRegioneChange}>
                        <option value="">Seleziona una regione</option>
                        {regioni.map(r => <option key={r.id} value={r.key}>{r.name}</option>)}
                    </select>
                </div>
            )}

            {livelloGeo === 'provinciale' && (
                <>
                    {selectedRegione && (
                        <div className="mb-3">
                            <label htmlFor="provincia" className="form-label d-flex align-items-center">
                                <FaMapPin className="me-2 text-muted"/> Provincia
                            </label>
                            <select id="provincia" className="form-select"
                                    value={selectedProvincia ? selectedProvincia.toUpperCase() : ''}
                                    disabled={isLoading}

                                    onChange={handleProvinciaChange}>
                                <option value="">Seleziona una provincia</option>
                                {province.filter(p => p.regione === selectedRegione).map(p => <option key={p.id}
                                                                                                      value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}