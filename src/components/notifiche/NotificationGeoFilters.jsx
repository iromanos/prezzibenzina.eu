'use client';

import {useEffect, useState} from 'react';
import {FaGlobe, FaMapMarkerAlt, FaMapPin} from 'react-icons/fa';

// This component is now simpler. It receives the current state from the parent
// and calls back with the full, updated geo-filter object.
export default function NotificationGeoFilters({
                                                   geoFilters,
                                                   onGeoFilterChange,
                                                   disabled,
                                               }) {
    const [regioni, setRegioni] = useState([]);
    const [province, setProvince] = useState([]);
    const [comuni, setComuni] = useState([]);

    // Fetch geo data on mount
    useEffect(() => {
        async function fetchData() {
            try {
                const [regioniRes, provinceRes] = await Promise.all([
                    fetch('/api/geo/regioni'),
                    fetch('/api/geo/province'),
                ]);
                setRegioni(await regioniRes.json());
                setProvince(await provinceRes.json());
            } catch (error) {
                console.error("Errore nel caricamento dei dati geografici:", error);
            }
        }
        fetchData();
    }, []);

    // Fetch comuni when the province changes
    useEffect(() => {
        if (geoFilters.livello_geo !== 'comune' || !geoFilters.provincia) {
            setComuni([]);
            return;
        }
        fetch(`/api/geo/comuni?provincia=${geoFilters.provincia}`)
            .then(res => res.json())
            .then(setComuni);
    }, [geoFilters.livello_geo, geoFilters.provincia]);

    const handleLevelChange = (e) => {
        const newLevel = e.target.value;
        // Reset state when level changes
        onGeoFilterChange({
            livello_geo: newLevel,
            regione: '',
            provincia: '',
            codice_geo: newLevel === 'nazionale' ? 'IT' : '',
        });
    };

    const handleRegionChange = (e) => {
        const newRegion = e.target.value;
        onGeoFilterChange({
            ...geoFilters,
            regione: newRegion,
            provincia: '',
            codice_geo: newRegion, // Update geo_code to the region
        });
    };

    const handleProvinceChange = (e) => {
        const newProvince = e.target.value;
        onGeoFilterChange({
            ...geoFilters,
            provincia: newProvince,
            codice_geo: newProvince, // Update geo_code to the province
        });
    };

    const handleComuneChange = (e) => {
        const newComune = e.target.value;
        onGeoFilterChange({
            ...geoFilters,
            codice_geo: newComune, // Update geo_code to the comune
        });
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
                <select
                    id="livelloGeoNotif"
                    className="form-select"
                    value={geoFilters.livello_geo}
                    onChange={handleLevelChange}
                    disabled={disabled || geoFilters.livello_geo === 'distributore'}
                >
                    <option value="nazionale">Nazionale</option>
                    <option value="regione">Regionale</option>
                    <option value="provincia">Provinciale</option>
                    <option value="comune">Comunale</option>
                    {geoFilters.livello_geo === 'distributore' && <option value="distributore">Distributore</option>}
                </select>
            </div>

            {(geoFilters.livello_geo === 'regione' || geoFilters.livello_geo === 'provincia' || geoFilters.livello_geo === 'comune') && (
                <div className="mb-3">
                    <label htmlFor="regioneNotif" className="form-label d-flex align-items-center">
                        <FaMapPin className="me-2 text-muted"/> Regione
                    </label>
                    <select id="regioneNotif" className="form-select" value={geoFilters.regione || ''}
                            onChange={handleRegionChange} disabled={disabled}>
                        <option value="">Seleziona una regione</option>
                        {regioni.map(r => <option key={r.id} value={r.key}>{r.name}</option>)}
                    </select>
                </div>
            )}

            {(geoFilters.livello_geo === 'provincia' || geoFilters.livello_geo === 'comune') && geoFilters.regione && (
                <div className="mb-3">
                    <label htmlFor="provinciaNotif" className="form-label d-flex align-items-center">
                        <FaMapPin className="me-2 text-muted"/> Provincia
                    </label>
                    <select id="provinciaNotif" className="form-select" value={geoFilters.provincia || ''}
                            onChange={handleProvinceChange} disabled={disabled}>
                        <option value="">Seleziona una provincia</option>
                        {province.filter(p => p.regione === geoFilters.regione).map(p => <option key={p.id}
                                                                                                 value={p.id}>{p.name}</option>)}
                    </select>
                </div>
            )}

            {geoFilters.livello_geo === 'comune' && geoFilters.provincia && (
                <div className={'mb-3'}>
                    <label htmlFor='selectComune' className='form-label d-flex align-items-center'>
                        <FaMapPin className="me-2 text-muted"/> Comune
                    </label>
                    <select id='selectComune' className={'form-select'} value={geoFilters.codice_geo}
                            onChange={handleComuneChange} disabled={disabled}>
                        <option value="">Seleziona un comune</option>
                        {comuni.map(c => <option value={c.id} key={c.id}>{c.name}</option>)}
                    </select>
                </div>
            )}
        </div>
    );
}
