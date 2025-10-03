import {Autocomplete, TextField} from '@mui/material';
import {useEffect, useState} from 'react';
import {log} from "@/functions/helpers";

import LocationCityIcon from '@mui/icons-material/LocationCity';
import PlaceIcon from '@mui/icons-material/Place';
import MarkunreadMailboxIcon from '@mui/icons-material/MarkunreadMailbox';
import MapsHomeWorkIcon from '@mui/icons-material/MapsHomeWork';
import PublicIcon from '@mui/icons-material/Public';

function getIcon(tipo) {
    switch (tipo) {
        case 'locality':
        case 'city':
        case 'town':
        case 'village':
            return <LocationCityIcon fontSize="small"/>;
        case 'address':
        case 'road':
        case 'street':
            return <PlaceIcon fontSize="small"/>;
        case 'postcode':
            return <MarkunreadMailboxIcon fontSize="small"/>;
        case 'suburb':
        case 'neighbourhood':
            return <MapsHomeWorkIcon fontSize="small"/>;
        default:
            return <PublicIcon fontSize="small"/>;
    }
}

export default function NominatimAutocomplete({onSelect, initialValue}) {
    const [inputValue, setInputValue] = useState('');
    const [options, setOptions] = useState([]);

    const NOMINATIM_ENDPOINT = 'https://nominatim.openstreetmap.org/search.php?dedupe=1&limit=5&format=jsonv2&countrycodes=it&q=';

    useEffect(() => {

        const timeout = setTimeout(() => {

            const controller = new AbortController();
            if (inputValue.length < 2) return;

            const request = NOMINATIM_ENDPOINT + encodeURIComponent(inputValue);
            log(request);
            fetch(request, {
                signal: controller.signal,
                headers: {'Accept-Language': 'it'}
            })
                .then(res => res.json())
                .then(data => {

                    log(data);

                    const options = data.map((item, index) => ({
                        id: index,
                        name: item.address?.road || item.name || item.display_name,
                        label: item.display_name,
                        type: item.addresstype,
                        lat: item.lat,
                        lon: item.lon,
                    }));
                    setOptions(options);
                });

            return () => controller.abort();
        }, 300);

        return () => clearTimeout(timeout);

    }, [inputValue]);

    log(options);


    return (
        <Autocomplete
            value={initialValue}
            className={'bg-white rounded'}
            freeSolo
            options={options}
            filterOptions={(opts) => opts}
            renderOption={(props, option) => {
                const {key, ...rest} = props;
                return (
                    <li key={option.id} {...rest} className="px-3 py-2 border-bottom" style={{cursor: 'pointer'}}>
                        <div className="d-flex align-items-start gap-2">
                            {getIcon(option.tipo || option.type)}
                            <div className="d-flex flex-column">
                                <span className="fw-bold">{option.name}</span>
                                <span className="text-muted small">{option.label}</span>
                            </div>
                        </div>
                    </li>
                );
            }}
            onInputChange={(e, val) => setInputValue(val)}
            onChange={(e, val) => {
                log(val);
                return val && onSelect(val);
            }}
            renderInput={(params) => (
                <TextField

                    value={initialValue}

                    {...params} label="Indirizzo, città o CAP" variant="outlined"/>
            )}
        />
    );
}
