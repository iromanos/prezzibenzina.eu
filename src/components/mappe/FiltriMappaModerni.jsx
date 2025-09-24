'use client';

import {useState} from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import useCarburante from "@/hooks/useCarburante";
import {getElencoCarburanti} from "@/functions/api";

export default function FiltriMappaModerni({onChange}) {
    const [show, setShow] = useState(null);
    // const [carburante, setCarburante] = useState('');

    const {carburante, setCarburante} = useCarburante();


    const [marchio, setMarchio] = useState('');
    const [limite, setLimite] = useState(50);

    const handleApply = () => {
        onChange({carburante, marchio, limite});
        setShow(null);
    };

    const elencoCarburanti = getElencoCarburanti();

    return (
        <>
            {/* Pulsanti */}
            <div
                className="bg-white bg-opacity-50  position-absolute top-0 start-0 end-0 p-3 z-3 d-flex gap-2 flex-wrap rounded-bottom-3">
                <Button size="sm" variant="light" className={'border border-dark-subtle'}
                        onClick={() => setShow('carburante')}>
                    <strong>{carburante.toUpperCase()}</strong>
                </Button>
                <Button size="sm" variant="light" className={'border border-dark-subtle'}
                        onClick={() => setShow('marchio')}>
                    🏷️ {marchio}
                </Button>
                <Button size="sm" variant="light" className={'border border-dark-subtle'}
                        onClick={() => setShow('limite')}>
                    <strong>{limite}</strong>
                </Button>
            </div>

            {/* Modale carburante */}
            <Modal show={show === 'carburante'} onHide={() => setShow(null)} centered>
                <Modal.Header closeButton><Modal.Title>Seleziona carburante</Modal.Title></Modal.Header>
                <Modal.Body className={'d-flex gap-2'}>
                    {elencoCarburanti.map((c) => (
                        <Button
                            key={c.id}
                            variant={c.tipo === carburante ? 'primary' : 'outline-primary'}
                            className="mb-2"
                            onClick={() => {
                                setCarburante(c.tipo);
                                handleApply();
                            }}
                        >{c.icon} {c.tipo}</Button>
                    ))}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShow(null)}>Annulla</Button>
                </Modal.Footer>
            </Modal>

            {/* Modale marchio */}
            <Modal show={show === 'marchio'} onHide={() => setShow(null)} centered>
                <Modal.Header closeButton><Modal.Title>Seleziona marchio</Modal.Title></Modal.Header>
                <Modal.Body>
                    {['', 'Q8', 'Esso', 'Eni', 'IP', 'Tamoil', 'Beyfin'].map((m) => (
                        <Button
                            key={m || 'Tutti'}
                            variant={marchio === m ? 'primary' : 'outline-primary'}
                            className="w-100 mb-2"
                            onClick={() => setMarchio(m)}
                        >
                            {m || 'Tutti'}
                        </Button>
                    ))}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShow(null)}>Annulla</Button>
                    <Button variant="primary" onClick={handleApply}>Applica</Button>
                </Modal.Footer>
            </Modal>

            {/* Modale limite */}
            <Modal show={show === 'limite'} onHide={() => setShow(null)} centered>
                <Modal.Header closeButton><Modal.Title>Numero impianti</Modal.Title></Modal.Header>
                <Modal.Body>
                    <input
                        type="range"
                        className="form-range"
                        min={10}
                        max={200}
                        step={10}
                        value={limite}
                        onChange={(e) => setLimite(Number(e.target.value))}
                    />
                    <div className="text-center mt-2 fw-bold">{limite} impianti</div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShow(null)}>Annulla</Button>
                    <Button variant="primary" onClick={handleApply}>Applica</Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}
