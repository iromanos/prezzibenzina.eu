import {Autocomplete, TextField} from '@mui/material';
import {useEffect, useState} from 'react';
import {log} from "@/functions/helpers";

export default function NominatimAutocomplete({onSelect}) {
    const [inputValue, setInputValue] = useState('');
    const [options, setOptions] = useState([]);

    const API_KEY_ORS = '5b3ce3597851110001cf6248e3524e394e844dd28a2911efbac4a4ba';
    const URI_SUGGEST_ORS = 'https://api.openrouteservice.org/geocode/autocomplete?api_key=' + API_KEY_ORS + '&layers=address,locality&boundary.country=IT&text=';


    useEffect(() => {
        const controller = new AbortController();
        if (inputValue.length < 2) return;

        const request = URI_SUGGEST_ORS + encodeURIComponent(inputValue);
        log(request);
        fetch(request, {
            signal: controller.signal,
            headers: {'Accept-Language': 'it'}
        })
            .then(res => res.json())
            .then(data => {


                const options = data.features.map(f => ({
                    label: f.properties.label, // es. "Rho, MI, Italy"
                    name: f.properties.name,
                    lat: f.geometry.coordinates[1],
                    lon: f.geometry.coordinates[0],
                    regione: f.properties.macroregion,
                    provincia: f.properties.region,
                    comune: f.properties.localadmin,
                    tipo: f.properties.layer, // "locality" o "address"
                }));

                setOptions(options);
            });

        return () => controller.abort();
    }, [inputValue]);

    return (
        <Autocomplete
            freeSolo
            options={options}
            renderOption={(props, option) => (
                <li {...props} className="px-2 py-1 border-bottom">
                    <div className="fw-bold">{option.name}</div>
                    <div className="text-muted small">{option.label}</div>
                </li>
            )}
            onInputChange={(e, val) => setInputValue(val)}
            onChange={(e, val) => val && onSelect(val)}
            renderInput={(params) => (
                <TextField {...params} label="Indirizzo, città o CAP" variant="outlined"/>
            )}
        />
    );
}
