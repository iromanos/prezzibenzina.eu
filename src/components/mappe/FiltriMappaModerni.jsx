'use client';

import {useEffect, useState} from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import useCarburante from "@/hooks/useCarburante";
import {getElencoCarburanti, getMarchi} from "@/functions/api";

import {URI_IMAGE} from "@/constants";

export default function FiltriMappaModerni({onChange}) {
    const [show, setShow] = useState(null);

    const [marchi, setMarchi] = useState([]);


    const {carburante, setCarburante} = useCarburante();
    const [brand, setBrand] = useState(null);
    const [limite, setLimite] = useState(10);



    const elencoCarburanti = getElencoCarburanti();

    useEffect(() => {
        getMarchi()
            .then((data) => {
                data.push({
                    id: '-',
                    nome: 'Tutti'
                });
                setMarchi(data);
            });
    }, []);

    return (
        <>
            <div
                className="bg-transparent position-absolute top-0 start-0 end-0 p-3 z-3 d-flex gap-2 flex-wrap rounded-bottom-3">
                {carburante ?
                    <Button size="sm" variant="light" className={'border border-dark-subtle shadow-sm'}
                        onClick={() => setShow('carburante')}>
                    <strong>{carburante.toUpperCase()}</strong>
                    </Button> : null}
                <Button size="sm" variant="light"
                        className={'border border-dark-subtle shadow-sm d-flex align-items-center gap-1'}
                        onClick={() => setShow('marchio')}>
                    {brand?.id != null
                        ? <><img alt={brand?.nome} width={16} height={16} src={URI_IMAGE + brand?.logo}/>
                            <strong>{brand?.nome}</strong></>
                        : <span className={'text-muted'}>Marchio</span>}
                </Button>
                <Button size="sm" variant="light" className={'border border-dark-subtle shadow-sm'}
                        onClick={() => setShow('limite')}>
                    <strong>{limite}</strong>
                </Button>
            </div>

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
                        value={limite}
                        onChange={(e) => setLimite(Number(e.target.value))}
                    />
                    <div className="text-center mt-2 fw-bold">{limite} impianti</div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShow(null)}>Annulla</Button>
                    <Button variant="primary" onClick={() => {
                        onChange({limite: limite});
                        setShow(null);
                    }}>Applica</Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}
