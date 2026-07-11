// src/components/statistiche/StatisticheGeoFilters.jsx
'use client';

import {useEffect, useState} from 'react';

export default function StatisticheGeoFilters({onGeoFilterChange}) {
    const [regioni, setRegioni] = useState([]);
    const [province, setProvince] = useState([]);
    const [livelloGeo, setLivelloGeo] = useState('nazionale');
    const [selectedRegione, setSelectedRegione] = useState('');
    const [selectedProvincia, setSelectedProvincia] = useState('');

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

    const handleLivelloChange = (e) => {
        const newLivello = e.target.value;
        setLivelloGeo(newLivello);
        setSelectedRegione('');
        setSelectedProvincia('');
        if (newLivello === 'nazionale') {
            onGeoFilterChange({livello_geo: 'nazionale', codice_geo: 'IT'});
        }
    };

    const handleRegioneChange = (e) => {
        const newRegione = e.target.value;
        setSelectedRegione(newRegione);
        setSelectedProvincia('');
        if (livelloGeo === 'regionale') {
            onGeoFilterChange({livello_geo: 'regionale', codice_geo: newRegione});
        }
    };

    const handleProvinciaChange = (e) => {
        const newProvincia = e.target.value;
        setSelectedProvincia(newProvincia);
        onGeoFilterChange({livello_geo: 'provinciale', codice_geo: newProvincia});
    };

    return (
        <>
            <div className="mb-3">
                <label htmlFor="livelloGeo" className="form-label">Livello Geografico</label>
                <select id="livelloGeo" className="form-select" value={livelloGeo} onChange={handleLivelloChange}>
                    <option value="nazionale">Nazionale</option>
                    <option value="regionale">Regionale</option>
                    <option value="provinciale">Provinciale</option>
                </select>
            </div>

            {livelloGeo === 'regionale' && (
                <div className="mb-3">
                    <label htmlFor="regione" className="form-label">Regione</label>
                    <select id="regione" className="form-select" value={selectedRegione} onChange={handleRegioneChange}>
                        <option value="">Seleziona una regione</option>
                        {regioni.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                </div>
            )}

            {livelloGeo === 'provinciale' && (
                <>
                    <div className="mb-3">
                        <label htmlFor="regione-prov" className="form-label">Regione</label>
                        <select id="regione-prov" className="form-select" value={selectedRegione}
                                onChange={handleRegioneChange}>
                            <option value="">Seleziona una regione</option>
                            {regioni.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                        </select>
                    </div>
                    {selectedRegione && (
                        <div className="mb-3">
                            <label htmlFor="provincia" className="form-label">Provincia</label>
                            <select id="provincia" className="form-select" value={selectedProvincia}
                                    onChange={handleProvinciaChange}>
                                <option value="">Seleziona una provincia</option>
                                {province.filter(p => p.regione === selectedRegione).map(p => <option key={p.id}
                                                                                                      value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                    )}
                </>
            )}
        </>
    );
}
