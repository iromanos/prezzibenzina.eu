'use client';

import {useCallback, useEffect, useState} from 'react';
import {FaGlobe, FaMapPin} from 'react-icons/fa6';
import {FaMapMarkerAlt} from "react-icons/fa"; // Icone

export default function NotificationGeoFilters({onGeoFilterChange, disabled, initialGeoLevel, initialGeoCode}) {
    const [regioni, setRegioni] = useState([]);
    const [province, setProvince] = useState([]);
    const [livelloGeo, setLivelloGeo] = useState(initialGeoLevel || 'nazionale');
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
                console.error("Errore nel caricamento dei dati geografici per notifiche:", error);
            }
        }

        fetchData();
    }, []);

    // Inizializza gli stati locali con i valori iniziali (per la modifica)
    useEffect(() => {
        if (initialGeoLevel) setLivelloGeo(initialGeoLevel);
        if (initialGeoCode) {
            // Se il livello è regionale o provinciale, dobbiamo pre-selezionare anche la regione/provincia
            if (initialGeoLevel === 'regionale') {
                setSelectedRegione(initialGeoCode);
            } else if (initialGeoLevel === 'provinciale' || initialGeoLevel === 'comune') {
                // Trova la provincia per ottenere la regione

                console.log('Province disponibili:', province);

                const prov = province.find(p => p.id === initialGeoCode);

                console.log('Provincia trovata per il codice iniziale:', prov);
                if (prov) {
                    setSelectedRegione(prov.regione);
                    setSelectedProvincia(initialGeoCode);
                }
            }
        }
    }, [initialGeoLevel, initialGeoCode, province]); // Aggiunto 'province' come dipendenza

    // Funzione per emettere il filtro geografico al componente padre
    const emitGeoFilter = useCallback(() => {
        let geoFilter = {livello_geo: 'nazionale', codice_geo: 'IT'}; // Default

        if (livelloGeo === 'regionale' && selectedRegione) {
            geoFilter = {livello_geo: 'regionale', codice_geo: selectedRegione};
        } else if (livelloGeo === 'provinciale' && selectedProvincia) {
            geoFilter = {livello_geo: 'provinciale', codice_geo: selectedProvincia};
        } else if (livelloGeo === 'comune' && selectedProvincia) { // Assumiamo che per comune si selezioni prima la provincia
            // Per il livello 'comune', avremmo bisogno di un endpoint API per i comuni di una provincia
            // Per ora, useremo la provincia come codice_geo se il comune non è implementato
            geoFilter = {livello_geo: 'provinciale', codice_geo: selectedProvincia};
            // TODO: Implementare selezione comune se necessario
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
        <div className="mb-4">
            <h6 className="mb-3 d-flex align-items-center text-primary">
                <FaGlobe className="me-2"/> Area Geografica
            </h6>

            <div className="mb-3">
                <label htmlFor="livelloGeoNotif" className="form-label d-flex align-items-center">
                    <FaMapMarkerAlt className="me-2 text-muted"/> Livello Geografico
                </label>
                <select id="livelloGeoNotif" className="form-select" value={livelloGeo} onChange={handleLivelloChange}
                        disabled={disabled}>
                    <option value="nazionale">Nazionale</option>
                    <option value="regionale">Regionale</option>
                    <option value="provinciale">Provinciale</option>
                    {/* <option value="comune">Comune</option> */} {/* Abilitare quando l'API per i comuni è pronta */}
                </select>
            </div>

            {(livelloGeo === 'regionale' || livelloGeo === 'provinciale' || livelloGeo === 'comune') && (
                <div className="mb-3">
                    <label htmlFor="regioneNotif" className="form-label d-flex align-items-center">
                        <FaMapPin className="me-2 text-muted"/> Regione
                    </label>
                    <select id="regioneNotif" className="form-select" value={selectedRegione}
                            onChange={handleRegioneChange} disabled={disabled}>
                        <option value="">Seleziona una regione</option>
                        {regioni.map(r => <option key={r.id} value={r.key}>{r.name}</option>)}
                    </select>
                </div>
            )}

            {(livelloGeo === 'provinciale' || livelloGeo === 'comune') && selectedRegione && (
                <div className="mb-3">
                    <label htmlFor="provinciaNotif" className="form-label d-flex align-items-center">
                        <FaMapPin className="me-2 text-muted"/> Provincia
                    </label>
                    <select id="provinciaNotif" className="form-select" value={selectedProvincia}
                            onChange={handleProvinciaChange} disabled={disabled}>
                        <option value="">Seleziona una provincia</option>
                        {province.filter(p => p.regione === selectedRegione).map(p => <option key={p.id}
                                                                                              value={p.id}>{p.name}</option>)}
                    </select>
                </div>
            )}

            {/* TODO: Aggiungere selezione comune se livelloGeo === 'comune' */}
        </div>
    );
}