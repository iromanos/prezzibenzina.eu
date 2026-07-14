// src/components/statistiche/StatisticheGeoFilters.jsx
'use client';

import {useCallback, useEffect, useState} from 'react';
import {FaGlobe, FaMapPin} from 'react-icons/fa6';
import {FaMapMarkerAlt} from "react-icons/fa"; // Importa le icone

export default function StatisticheGeoFilters({onGeoFilterChange}) {
    const [regioni, setRegioni] = useState([]);
    const [province, setProvince] = useState([]);
    const [livelloGeo, setLivelloGeo] = useState('nazionale');
    const [selectedRegione, setSelectedRegione] = useState('');
    const [selectedProvincia, setSelectedProvincia] = useState('');

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

    // Funzione per emettere il filtro geografico al componente padre
    const emitGeoFilter = useCallback(() => {
        let geoFilter = {livello_geo: 'nazionale', codice_geo: 'IT'}; // Default

        if (livelloGeo === 'regionale' && selectedRegione) {
            geoFilter = {livello_geo: 'regionale', codice_geo: selectedRegione};
        } else if (livelloGeo === 'provinciale' && selectedProvincia) {
            geoFilter = {livello_geo: 'provinciale', codice_geo: selectedProvincia};
        } else if (livelloGeo === 'provinciale' && selectedRegione && !selectedProvincia) {
            // Se è selezionato il livello provinciale ma solo la regione, non inviare un filtro incompleto
            // o potremmo decidere di inviare il filtro regionale come fallback
            geoFilter = {livello_geo: 'regionale', codice_geo: selectedRegione};
        }

        onGeoFilterChange(geoFilter);
    }, [livelloGeo, selectedRegione, selectedProvincia, onGeoFilterChange]);

    // Emetti il filtro ogni volta che i parametri geografici cambiano
    useEffect(() => {
        emitGeoFilter();
    }, [emitGeoFilter]);


    const handleLivelloChange = (e) => {
        const newLivello = e.target.value;
        setLivelloGeo(newLivello);
        setSelectedRegione('');
        setSelectedProvincia('');
    };

    const handleRegioneChange = (e) => {
        const newRegione = e.target.value;
        setSelectedRegione(newRegione);
        setSelectedProvincia('');
    };

    const handleProvinciaChange = (e) => {
        const newProvincia = e.target.value;
        setSelectedProvincia(newProvincia);
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
                <select id="livelloGeo" className="form-select" value={livelloGeo} onChange={handleLivelloChange}>
                    <option value="nazionale">Nazionale</option>
                    <option value="regionale">Regionale</option>
                    <option value="provinciale">Provinciale</option>
                </select>
            </div>

            {livelloGeo === 'regionale' && (
                <div className="mb-3">
                    <label htmlFor="regione" className="form-label d-flex align-items-center">
                        <FaMapPin className="me-2 text-muted"/> Regione
                    </label>
                    <select id="regione" className="form-select" value={selectedRegione} onChange={handleRegioneChange}>
                        <option value="">Seleziona una regione</option>
                        {regioni.map(r => <option key={r.id} value={r.key}>{r.name}</option>)}
                    </select>
                </div>
            )}

            {livelloGeo === 'provinciale' && (
                <>
                    <div className="mb-3">
                        <label htmlFor="regione-prov" className="form-label d-flex align-items-center">
                            <FaMapPin className="me-2 text-muted"/> Regione
                        </label>
                        <select id="regione-prov" className="form-select" value={selectedRegione}
                                onChange={handleRegioneChange}>
                            <option value="">Seleziona una regione</option>
                            {regioni.map(r => <option key={r.id} value={r.key}>{r.name}</option>)}
                        </select>
                    </div>
                    {selectedRegione && (
                        <div className="mb-3">
                            <label htmlFor="provincia" className="form-label d-flex align-items-center">
                                <FaMapPin className="me-2 text-muted"/> Provincia
                            </label>
                            <select id="provincia" className="form-select" value={selectedProvincia}
                                    onChange={handleProvinciaChange}>
                                <option value="">Seleziona una provincia</option>
                                {province.filter(p => p.regione === selectedRegione).map(p => <option key={p.id}
                                                                                                      value={p.key}>{p.name}</option>)}
                            </select>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}