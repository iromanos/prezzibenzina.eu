'use client';

import {useCallback, useEffect, useState} from 'react';
import {FaGlobe, FaMapPin} from 'react-icons/fa6';
import {FaMapMarkerAlt} from "react-icons/fa";
import {getComune} from "@/functions/api.jsx";

export default function NotificationGeoFilters({onGeoFilterChange, disabled, initialGeoLevel, initialGeoCode}) {
    const [regioni, setRegioni] = useState([]);
    const [province, setProvince] = useState([]);
    const [comuni, setComuni] = useState([]);
    const [livelloGeo, setLivelloGeo] = useState(initialGeoLevel);
    const [selectedRegione, setSelectedRegione] = useState('');
    const [selectedProvincia, setSelectedProvincia] = useState('');
    const [selectedComune, setSelectedComune] = useState('');

    // Carica dati geografici all'avvio
    useEffect(() => {

        console.log(initialGeoLevel);

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

    //TODO: non inizializza con i valori predefiniti per il comune

    // Inizializza gli stati locali con i valori iniziali (per la modifica)
    useEffect(() => {

        console.log(initialGeoLevel);
        console.log(initialGeoCode);
        if (province.length === 0) return;

        if (initialGeoLevel) setLivelloGeo(initialGeoLevel);
        if (initialGeoCode) {
            // Se il livello è regionale o provinciale, dobbiamo pre-selezionare anche la regione/provincia
            if (initialGeoLevel === 'regione') {
                setSelectedRegione(initialGeoCode);
            } else if (initialGeoLevel === 'provincia') {
                // Trova la provincia per ottenere la regione
                const prov = province.find(p => p.id === initialGeoCode.toUpperCase());
                if (prov) {
                    setSelectedRegione(prov.regione);
                    setSelectedProvincia(initialGeoCode);
                }
            } else if (initialGeoLevel === 'comune') {
                getComune(initialGeoCode).then((data) => {
                    const prov = province.find(p => p.id === data.provincia_id);
                    setSelectedRegione(prov.regione);
                    setSelectedProvincia(prov.id.toLowerCase());
                    setSelectedComune(initialGeoCode);
                })
            }
        }
    }, [initialGeoLevel, initialGeoCode, province]); // Aggiunto 'province' come dipendenza

    // Funzione per emettere il filtro geografico al componente padre
    const emitGeoFilter = useCallback(() => {
        let geoFilter = {livello_geo: 'nazionale', codice_geo: 'IT'}; // Default

        if (livelloGeo === 'regione' && selectedRegione) {
            geoFilter = {livello_geo: 'regione', codice_geo: selectedRegione};
        } else if (livelloGeo === 'provincia' && selectedProvincia) {
            geoFilter = {livello_geo: 'provincia', codice_geo: selectedProvincia};
        } else if (livelloGeo === 'comune' && selectedComune) {
            geoFilter = {livello_geo: 'comune', codice_geo: selectedComune};
        } else if (livelloGeo === 'distributore') {
            geoFilter = {livello_geo: 'distributore', codice_geo: initialGeoCode};
        }

        onGeoFilterChange(geoFilter);
    }, [livelloGeo, selectedRegione, selectedProvincia, selectedComune, onGeoFilterChange]);


    useEffect(() => {
        if (!selectedProvincia) return;

        const params = new URLSearchParams({provincia: selectedProvincia});

        fetch(`/api/geo/comuni?${params}`).then(async (data) => {

            const dataComuni = await data.json();

            setComuni(dataComuni);
        });

    }, [selectedProvincia]);

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

    const handleComuneChange = (e) => {
        setSelectedComune(e.target.value);
    }

    return (
        <div className="mb-4">
            <h6 className="mb-3 d-flex align-items-center text-primary">
                <FaGlobe className="me-2"/> Area Geografica
            </h6>

            <div className="mb-3">
                <label htmlFor="livelloGeoNotif" className="form-label d-flex align-items-center">
                    <FaMapMarkerAlt className="me-2 text-muted"/> Livello Geografico
                </label>
                <select id="livelloGeoNotif" className="form-select"
                        value={livelloGeo} onChange={handleLivelloChange}
                        disabled={disabled || livelloGeo === 'distributore'}>
                    <option value="nazionale">Nazionale</option>
                    <option value="regione">Regionale</option>
                    <option value="provincia">Provinciale</option>
                    <option value="comune">Comunale</option>
                    {livelloGeo === 'distributore' && <option value="distributore">Distributore</option>}
                </select>
            </div>

            {(livelloGeo === 'regione' || livelloGeo === 'provincia' || livelloGeo === 'comune') && (
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

            {(livelloGeo === 'provincia' || livelloGeo === 'comune') && selectedRegione && (
                <div className="mb-3">
                    <label htmlFor="provinciaNotif" className="form-label d-flex align-items-center">
                        <FaMapPin className="me-2 text-muted"/> Provincia
                    </label>
                    <select id="provinciaNotif" className="form-select" value={selectedProvincia.toUpperCase()}
                            onChange={handleProvinciaChange} disabled={disabled}>
                        <option value="">Seleziona una provincia</option>
                        {province.filter(p => p.regione === selectedRegione).map(p => <option key={p.id}
                                                                                              value={p.id}>{p.name}</option>)}
                    </select>
                </div>
            )}

            {livelloGeo === 'comune' && selectedProvincia && (
                <div className={'mb-3'}>
                    <label className='form-label d-flex align-items-center'>
                        <FaMapPin className="me-2 text-muted"/> Comune
                    </label>
                    <select
                        onChange={handleComuneChange}
                        value={selectedComune}

                        id='comune' className={'form-select'} disabled={disabled}>
                        <option value="">Seleziona un comune</option>
                        {comuni.map(c => <option value={c.id} key={c.id}>{c.name}</option>)}
                    </select>
                </div>
            )}


            {/* TODO: Aggiungere selezione comune se livelloGeo === 'comune' */}
        </div>
    );
}