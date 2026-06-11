'use client'
import React, {useState} from 'react';
import {getRouteLink} from "@/functions/helpers";
import Button from "react-bootstrap/esm/Button";
import useCarburante from "@/hooks/useCarburante";
import Modal from "react-bootstrap/esm/Modal";
import {getElencoCarburanti} from "@/functions/api";

export function LinkCarburanti({params, carburanti, onCarburanteChange = null}) {

    const {carburante, setCarburante} = useCarburante();

    const [modal, setModal] = useState(false);

    const elencoCarburanti = getElencoCarburanti();

    return <>
        {modal &&

            <Modal show={modal} onHide={() => setModal(false)} centered>
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

                                if (onCarburanteChange !== null) {
                                    onCarburanteChange(c.tipo);
                                    return;
                                }

                                const link = getRouteLink(params.regione, c.tipo, params.marchio, params.provincia, params.comune);
                                console.log(link);
                                window.location = link.link;
                            }}
                        >{c.icon} {c.tipo}</Button>
                    ))}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setModal(false)}>Annulla</Button>
                </Modal.Footer>
            </Modal>

        }
        <section className="mb-4 border p-2 rounded">
            <h2 className="h6 mb-3 text-uppercase">Carburante</h2>
            {carburante &&
            <Button
                onClick={() => setModal(true)}
                className={'text-uppercase'} variant={'primary'} size={'sm'}>
                {carburante.icon} {carburante.tipo}</Button>}</section>
    </>;
}


export default function FiltroCarburante({regione, carburanti, selezionato}){
    return                 <section className="mb-4">
        <h2 className="h6 mb-3 text-uppercase">Carburante</h2>
        <div className="btn-group" role="group">
            {carburanti.map((tipo) => (

                <React.Fragment key={tipo}>
                    <input
                        name={'carburante'}
                        type={'radio'}
                        value={tipo}
                        id={'id_' + tipo}
                        autoComplete={'off'}
                        className={`btn-check`}
                        defaultChecked={tipo === selezionato}
                    />
                    <label className={"btn btn-sm btn-outline-primary"}
                           htmlFor={'id_' + tipo}>{tipo}</label>

                </React.Fragment>

            ))}
        </div>
    </section>;

}