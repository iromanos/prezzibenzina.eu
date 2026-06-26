'use client';

import {useState} from 'react';
import {useRouter} from "next/navigation";
import FmdGoodIcon from '@mui/icons-material/FmdGood';
import SearchIcon from "@mui/icons-material/Search";
import NominatimAutocomplete from "@/components/NominatimAutocomplete";
import {logDebug} from "@/functions/helpers";
import useCarburante from "@/hooks/useCarburante";
import {getElencoCarburanti, getNominatimReverse, getRouteByPosition} from "@/functions/api";
import {usePosizioneAttuale} from "@/hooks/usePosizioneAttuale";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";

export default function SearchForm() {

    const [modal, setModal] = useState(false);

    const [place, setPlace] = useState(null);
    const [location, setLocation] = useState('');

    const {carburante, setCarburante} = useCarburante();

    const router = useRouter();

    const posizioneAttuale = usePosizioneAttuale();

    const elencoCarburanti = getElencoCarburanti();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {

            const payload = place;
            payload['carburante'] = carburante.tipo;

            // console.log(payload);

            const res = await getRouteByPosition(payload);
            const data = await res.json();

            logDebug(data);
            router.push(data.route);

        } catch (err) {
            logDebug(err);
            window.location.href = `/mappa`;
        }
    };

    const handleGeolocalizza = () => {
        if (posizioneAttuale === null) return;
        getNominatimReverse(posizioneAttuale)
            .then((r) => {
                logDebug(r);
                    setLocation(r.display_name);
                    setPlace(r);
                }
            );
    };

    logDebug(carburante);

    const Dialog = () => {
        return <Modal show={modal} onHide={() => setModal(false)} centered>
            <Modal.Header closeButton><Modal.Title>Seleziona carburante</Modal.Title></Modal.Header>
            <Modal.Body className={'d-flex flex-wrap gap-2'}>
                {elencoCarburanti.map((c) => (
                    <Button
                        key={c.id}
                        size={'sm'}
                        variant={c.id === carburante.id ? 'primary' : 'outline-dark'}
                        className="mb-2 text-uppercase"
                        onClick={() => {
                            setModal(false);
                            setCarburante(c.tipo);
                        }}
                    >{c.icon} {c.tipo}</Button>
                ))}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={() => setModal(false)}>Annulla</Button>
            </Modal.Footer>
        </Modal>;
    }

    return (
        <>
            {modal && <Dialog/>}

            <form onSubmit={handleSubmit}>
                {carburante && <input type="hidden" name="carburante" value={carburante.tipo}/>}

                <div className="mb-3">

                    <div className="input-group rounded-start overflow-hidden">
                        <NominatimAutocomplete
                            color={'#FFFFFF'}
                            initialValue={location}
                            onSelect={(place) => {
                                logDebug('Selezionato:');
                                logDebug(place);
                                setPlace(place);
                            }}
                        />
                        <Button className={''} variant={'light'} type="submit"><SearchIcon/></Button>
                    </div>
                </div>

                <div className="text-center mb-4 d-flex gap-2 justify-content-center">
                    {carburante &&
                        <Button
                            onClick={() => setModal(true)}
                            className={'text-uppercase'} variant={'light'} size={'sm'}>
                            {carburante.icon} {carburante.tipo}</Button>}
                    <Button

                        disabled={posizioneAttuale === null}

                        onClick={handleGeolocalizza}
                        variant={"light"}
                        size={'sm'}
                        className={''}
                    ><FmdGoodIcon/> La mia posizione</Button>

                    {/*<button type="submit" className="btn btn-primary btn-sm"><SearchIcon/> Cerca</button>*/}
                </div>
            </form>

            <div className="mt-4 py-4">
                <label className="mb-3 h6">Suggerimenti rapidi:</label>
                <div className="d-flex flex-wrap gap-2 justify-content-center">
            {[
                {label: 'Benzina a Milano', query: '/lombardia/benzina/provincia/mi/milano'},
                {label: 'Diesel a Roma', query: '/lazio/diesel/provincia/rm/roma'},
                {label: 'GPL a Napoli', query: '/campania/gpl/provincia/na/napoli', indirizzo: 'Napoli'},
            ].map((s, i) => (
                <a
                    title={`${s.label}`}
                    key={i}
                    href={s.query}
                    className="btn btn-sm btn-primary"
                >
                    {s.label}
                </a>
            ))}
        </div>
    </div></>


);
}
