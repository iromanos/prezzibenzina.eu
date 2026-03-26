'use client';

import {useEffect, useState} from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import useCarburante from "@/hooks/useCarburante";
import {getElencoCarburanti, getElencoStati, getMarchi} from "@/functions/api";
import "flag-icons/css/flag-icons.min.css";

import {URI_IMAGE} from "@/constants";
import useLimit from "@/hooks/useLimit";
import NominatimAutocomplete from "@/components/NominatimAutocomplete";
import {useModalHistory} from "@/hooks/useModalHistory";
import {useFilters} from "@/hooks/useFilters";
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import Display6977770298 from "@/components/ads/Display-6977770298";

export default function FiltriMappaModerni({onChange, onSearch, rightWidth = 0, initialFilters, onSelectStato}) {

    const [show, setShow] = useState(null);
    const [info, setInfo] = useState(false);
    const [modal, setModal] = useState(false);

    const [marchi, setMarchi] = useState([]);


    const {setFilters} = useFilters();

    const {carburante, setCarburante} = useCarburante(initialFilters.carburante);
    const [brand, setBrand] = useState(null);
    const {limit, setLimit} = useLimit();


    // log(initialFilters);

    const elencoCarburanti = getElencoCarburanti();

    useEffect(() => {
        if (info || show !== null) {
            setModal(true);
        }
    }, [show, info]);


    useModalHistory(modal, () => {
        setModal(false);
        setShow(null);
        setInfo(false);
    });

    useEffect(() => {
        getMarchi()
            .then((data) => {
                data.push({
                    id: '-',
                    nome: 'Tutti'
                });
                setMarchi(data);

                const qry = data.filter(m => m.id === initialFilters.brand);

                if (qry.length !== 0) {
                    setBrand(qry[0]);
                }

            });
    }, []);

    const elencoStati = getElencoStati();

    return (
        <>
            <div
                className="bg-transparent
                d-flex
                gap-3
                col-12 col-lg-9
                position-absolute
                start-0 top-0 p-3 z-3">

                <>
                    <div className={'col-lg-6'}>
                        <div className={'mb-2 col'}>
                            <NominatimAutocomplete
                                onSelect={(place) => {
                                    onSearch?.(place);
                                }}
                            />
                        </div>

                        <div className={'d-flex gap-2'}>
                            {carburante ?
                                <Button size="sm" variant="light" className={'border border-dark-subtle shadow-sm'}
                                        onClick={() => setShow('carburante')}><LocalGasStationIcon className={'me-1'}/>
                                    <strong>{carburante.toUpperCase()}</strong>
                                </Button> : null}
                            <Button size="sm" variant="light" className={'border border-dark-subtle shadow-sm'}
                                    onClick={() => setShow('limite')}>
                                <strong>{limit}</strong>
                            </Button>

                            {/*<Button size={'sm'} variant={'light'} className={'border border-dark-subtle shadow-sm d-none'}>*/}
                            {/*    <TuneIcon className={'me-1'}/>*/}
                            {/*    <strong>FILTRI</strong></Button>*/}

                            <div className={"d-flex gap-2 flex-wrap"}>
                                {elencoStati.map((c, i) => {
                                    return <Button
                                        key={i}
                                        size={"sm"}
                                        className={'border border-dark-subtle shadow-sm'}
                                        variant={'light'}
                                        onClick={() => {
                                            onSelectStato?.(c);
                                        }}> {c.icon}</Button>
                                })}
                            </div>

                        </div>
                    </div>

                    <div className={'d-none d-xl-block col-5'}>
                        <Display6977770298/>
                    </div>

                </>
            </div>

            <Modal show={info} onHide={() => setInfo(false)} centered>
                <Modal.Header closeButton><Modal.Title>Mappa Interattiva dei Prezzi Carburante in
                    Italia</Modal.Title></Modal.Header>
                <Modal.Body>
                    <p>
                        Consulta la <strong>mappa interattiva dei distributori di carburante in Italia</strong> per
                        trovare i <strong>prezzi aggiornati di benzina, diesel, GPL e metano</strong>.
                        Scopri i punti vendita più convenienti vicino a te e confronta le tariffe per risparmiare
                        sul rifornimento in ogni regione.
                    </p>
                    <p>Hai la possibilità di selezionare la destinazione del tuo viaggio e confrontare i distributori
                        lungo il percorso.</p>
                </Modal.Body>
            </Modal>

            <Modal show={show === 'carburante'} onHide={() => setShow(null)} centered>
                <Modal.Header closeButton><Modal.Title>Seleziona carburante</Modal.Title></Modal.Header>
                <Modal.Body className={'d-flex flex-wrap gap-2'}>
                    {elencoCarburanti.map((c) => (
                        <Button
                            key={c.id}
                            variant={c.tipo === carburante ? 'primary' : 'outline-primary'}
                            className="mb-2"
                            onClick={() => {
                                setCarburante(c.tipo);
                                setShow(null);
                                onChange({carburante: c.tipo});
                                setFilters({carburante: c.tipo});
                            }}
                        >{c.icon} {c.tipo}</Button>
                    ))}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShow(null)}>Annulla</Button>
                </Modal.Footer>
            </Modal>

            <Modal show={show === 'marchio'} onHide={() => setShow(null)} centered>
                <Modal.Header closeButton><Modal.Title>Seleziona marchio</Modal.Title></Modal.Header>
                <Modal.Body className={'d-flex flex-wrap gap-2'}>
                    {marchi.map((m) => (
                        <Button
                            key={m.id}
                            variant={brand?.id === m.id ? 'primary' : 'outline-primary'}
                            className="d-flex align-items-center gap-1"
                            onClick={() => {
                                if (m.id === '-') m = null;
                                setBrand(m);
                                onChange({brand: m});
                                setShow(null);
                                if (m === null) {
                                    setFilters({marchio: null});
                                } else setFilters({marchio: m.id});

                            }}
                        >
                            {m.logo &&
                                <img width={32} height={32} src={URI_IMAGE + m.logo} alt={m.nome}/>}
                            {m.nome}
                        </Button>
                    ))}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShow(null)}>Annulla</Button>
                </Modal.Footer>
            </Modal>

            <Modal show={show === 'limite'} onHide={() => setShow(null)} centered>
                <Modal.Header closeButton><Modal.Title>Numero impianti</Modal.Title></Modal.Header>
                <Modal.Body>
                    <input
                        type="range"
                        className="form-range"
                        min={5}
                        max={25}
                        step={5}
                        value={limit}
                        onChange={(e) => setLimit(Number(e.target.value))}
                    />
                    <div className="text-center mt-2 fw-bold">{limit} impianti</div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShow(null)}>Annulla</Button>
                    <Button variant="primary" onClick={() => {
                        onChange({limite: limit});
                        setShow(null);
                    }}>Applica</Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}
