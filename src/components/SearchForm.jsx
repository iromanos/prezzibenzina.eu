'use client';

import {useEffect, useState} from 'react';
import {useRouter} from "next/navigation";
import FmdGoodIcon from '@mui/icons-material/FmdGood';
import SearchIcon from "@mui/icons-material/Search";
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import EvStationIcon from '@mui/icons-material/EvStation';
import PropaneIcon from '@mui/icons-material/Propane';
import BubbleChartIcon from '@mui/icons-material/BubbleChart';
import NominatimAutocomplete from "@/components/NominatimAutocomplete";
import {log} from "@/functions/helpers";
import useCarburante from "@/hooks/useCarburante";
import {getNominatimReverse, getRouteByPosition} from "@/functions/api";
import {usePosizioneAttuale} from "@/hooks/usePosizioneAttuale";
import Button from "react-bootstrap/Button";

export default function SearchForm() {

    const [place, setPlace] = useState(null);
    const [location, setLocation] = useState('');

    const {carburante, setCarburante} = useCarburante();

    const router = useRouter();

    const posizioneAttuale = usePosizioneAttuale();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {

            const payload = place;
            payload['carburante'] = carburante;

            const res = await getRouteByPosition(payload);
            const data = await res.json();

            log(data);
            router.push(data.route);

        } catch (err) {
            log(err);
            window.location.href = `/mappa`;
        }
    };

    const handleGeolocalizza = () => {
        if (posizioneAttuale === null) return;
        const lat = posizioneAttuale.lat;
        const lon = posizioneAttuale.lon;
        window.location.href = `/mappa?lat=${lat}&lng=${lon}`;
    };

    useEffect(() => {

        if (posizioneAttuale === null) return;
        log(posizioneAttuale);


        getNominatimReverse(posizioneAttuale)
            .then((r) => {
                    log(r);
                    setLocation(r.display_name);
                    setPlace(r);
                }
            );

    }, [posizioneAttuale]);

    log(carburante);

    return (
        <><form onSubmit={handleSubmit}>
            <input type="hidden" name="carburante" value={carburante} />

            <div className="mb-3">
                <label className="form-label h6">Tipo di Carburante</label>
                <div className="d-flex flex-wrap gap-2">
                    {[
                        {tipo: 'benzina', icon: <LocalGasStationIcon/>},
                        {tipo: 'diesel', icon: <EvStationIcon/>},
                        {tipo: 'gpl', icon: <PropaneIcon/>},
                        {tipo: 'metano', icon: <BubbleChartIcon/>},
                    ].map(({ tipo, icon }) => (
                        <button
                            key={tipo}
                            type="button"
                            className={`btn ${carburante === tipo ? 'btn-primary' : 'btn-light'}`}
                            onClick={() => setCarburante(tipo)}
                        >
                            {icon} {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                        </button>
                    ))}
                </div>

            </div>

            <div className="mb-3">
                <NominatimAutocomplete
                    initialValue={location}
                    onSelect={(place) => {
                        log('Selezionato:');
                        log(place);
                        setPlace(place);
                    }}
                />
            </div>

            <div className="text-center mb-4">

                <Button

                    disabled={posizioneAttuale === null}

                    onClick={handleGeolocalizza}
                    variant={"light"}
                    className={'me-2'}
                ><FmdGoodIcon/> Usa la mia posizione</Button>

                <button type="submit" className="btn btn-primary"><SearchIcon /> Cerca</button>
            </div>
        </form>

    <div className="mt-4">
        <h6 className="mb-3">Suggerimenti rapidi:</h6>
        <div className="d-flex flex-wrap gap-2">
            {[
                {label: 'Benzina a Milano', query: '/lombardia/benzina/provincia/mi/milano'},
                {label: 'Diesel a Roma', query: '/lazio/diesel/provincia/rm/roma'},
                {label: 'GPL a Napoli', query: '/campania/gpl/provincia/na/napoli', indirizzo: 'Napoli'},
            ].map((s, i) => (
                <a
                    key={i}
                    href={s.query}
                    className="btn btn-outline-secondary btn-sm"
                >
                    {s.label}
                </a>
            ))}
        </div>
    </div></>


);
}
