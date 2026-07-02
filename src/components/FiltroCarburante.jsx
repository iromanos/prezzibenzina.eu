'use client'
import React, {useState} from 'react';
import {getRouteLink} from "@/functions/helpers";
import Button from "react-bootstrap/esm/Button";
import useCarburante from "@/hooks/useCarburante";
import Modal from "react-bootstrap/esm/Modal";
import {getElencoCarburanti} from "@/functions/api";


export function LinkCarburantiLine() {

}


export function LinkCarburanti({params, carburanti, onCarburanteChange = null, showTitle = true, size = 'sm'}) {

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
                                // console.log(link);
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
        <section
            // className="mb-4 border p-2 rounded"
        >
            {showTitle && <label className="">Carburante</label>}
            {carburante &&
            <Button
                onClick={() => setModal(true)}
                className={'text-uppercase'} variant={'primary'} size={size}>
                {carburante.icon} {carburante.tipo}</Button>}</section>
    </>;
}


export default function FiltroCarburante({selezionato, params}) {


    const carburanti = getElencoCarburanti();

    // console.log(params);

    return <section className="mb-4">
        <label className="form-label text-uppercase fw-bold">Carburante</label>
        <div className="d-flex">
            {carburanti.map((tipo) => {

                const isChecked = tipo.tipo === selezionato;

                const link = getRouteLink(params.regione, tipo.tipo, params.marchio?.id, params.provincia, params.comune);

                return (

                    <span key={tipo.id}>
                    <input
                        name={'carburante'}
                        type={'radio'}
                        value={tipo}
                        id={'id_' + tipo}
                        autoComplete={'off'}
                        className={`btn-check`}
                        defaultChecked={tipo === selezionato}
                    />
                    <label
                        className={`align-items-center d-inline-flex me-1 border rounded px-1 py-1  ${isChecked ? 'bg-success-subtle border-success-subtle' : ''} `}
                        htmlFor={'id_' + tipo}>
                        <a href={link.link}
                           className={` ${isChecked ? 'text-dark' : 'text-secondary'} link-underline link-underline-opacity-0 small`}>
                        {tipo.icon} {tipo.tipo}
                        </a>
                    </label>

                </span>

                )
            })}
        </div>
    </section>;

}