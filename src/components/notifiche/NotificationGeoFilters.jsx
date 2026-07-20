'use client';

import {useEffect, useState} from 'react';
import {FaBuilding, FaCity, FaGlobeEurope, FaMap} from 'react-icons/fa';

export default function NotificationGeoFilters({geoFilters, onGeoFilterChange, disabled}) {
    const [regioni, setRegioni] = useState([]);
    const [province, setProvince] = useState([]);
    const [comuni, setComuni] = useState([]);

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

    useEffect(() => {
        if (geoFilters.livello_geo !== 'comune' || !geoFilters.provincia) {
            setComuni([]);
            return;
        }
        fetch(`/api/geo/comuni?provincia=${geoFilters.provincia}`)
            .then(res => res.json())
            .then(setComuni);
    }, [geoFilters.livello_geo, geoFilters.provincia]);

    const handleLevelChange = (newLevel) => {
        if (disabled || geoFilters.livello_geo === 'distributore') return;
        onGeoFilterChange({
            livello_geo: newLevel,
            regione: '',
            provincia: '',
            codice_geo: newLevel === 'nazionale' ? 'IT' : '',
        });
    };

    const handleRegionChange = (e) => {
        const newRegion = e.target.value;
        onGeoFilterChange({...geoFilters, regione: newRegion, provincia: '', codice_geo: newRegion});
    };

    const handleProvinceChange = (e) => {
        const newProvince = e.target.value;
        onGeoFilterChange({...geoFilters, provincia: newProvince, codice_geo: newProvince});
    };

    const handleComuneChange = (e) => {
        const newComune = e.target.value;
        onGeoFilterChange({...geoFilters, codice_geo: newComune});
    };

    const geoLevels = [
        {key: 'nazionale', label: 'Nazionale', icon: <FaGlobeEurope/>},
        {key: 'regione', label: 'Regione', icon: <FaMap/>},
        {key: 'provincia', label: 'Provincia', icon: <FaBuilding/>},
        {key: 'comune', label: 'Comune', icon: <FaCity/>},
    ];

    return (
        <div>
            <h5 className="card-title d-flex align-items-center"><FaGlobeEurope className="me-2 text-muted"/> Area
                Geografica</h5>
            <p className="text-muted">Seleziona il livello geografico per cui desideri ricevere le notifiche.</p>

            <ul className="nav nav-pills nav-fill mb-3">
                {geoLevels.map(level => (
                    <li className="nav-item" key={level.key}>
                        <button
                            type="button"
                            className={`nav-link ${geoFilters.livello_geo === level.key ? 'active' : ''}`}
                            onClick={() => handleLevelChange(level.key)}
                            disabled={disabled || geoFilters.livello_geo === 'distributore'}
                        >
                            <div className="d-flex align-items-center justify-content-center">
                                {level.icon}
                                <span className="ms-2">{level.label}</span>
                            </div>
                        </button>
                    </li>
                ))}
            </ul>

            {geoFilters.livello_geo === 'distributore' && (
                <div className="alert alert-info">
                    La notifica è legata a un distributore specifico e non può essere modificata.
                </div>
            )}

            <div className="mt-3">
                <div className="row g-2">
                    {(geoFilters.livello_geo === 'regione' || geoFilters.livello_geo === 'provincia' || geoFilters.livello_geo === 'comune') && (
                        <div className="col-md">
                            <label htmlFor="regioneNotif" className="form-label">Regione</label>
                            <select id="regioneNotif" className="form-select" value={geoFilters.regione || ''}
                                    onChange={handleRegionChange} disabled={disabled}>
                                <option value="">Seleziona una regione</option>
                                {regioni.map(r => <option key={r.id} value={r.key}>{r.name}</option>)}
                            </select>
                        </div>
                    )}

                    {(geoFilters.livello_geo === 'provincia' || geoFilters.livello_geo === 'comune') && geoFilters.regione && (
                        <div className="col-md">
                            <label htmlFor="provinciaNotif" className="form-label">Provincia</label>
                            <select id="provinciaNotif" className="form-select" value={geoFilters.provincia || ''}
                                    onChange={handleProvinceChange} disabled={disabled}>
                                <option value="">Seleziona una provincia</option>
                                {province.filter(p => p.regione === geoFilters.regione).map(p => <option key={p.id}
                                                                                                         value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                    )}

                    {geoFilters.livello_geo === 'comune' && geoFilters.provincia && (
                        <div className="col-md">
                            <label htmlFor='selectComune' className='form-label'>Comune</label>
                            <select id='selectComune' className={'form-select'} value={geoFilters.codice_geo}
                                    onChange={handleComuneChange} disabled={disabled || !geoFilters.provincia}>
                                <option value="">Seleziona un comune</option>
                                {comuni.map(c => <option value={c.id} key={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
