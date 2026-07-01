'use client'
import React, {useEffect, useState} from 'react';
import {getRouteLink} from "@/functions/helpers";
import Image from "next/image";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/esm/Modal";


export function LinkMarchio({marchi, params}){

    const [modal, setModal] = useState(false);

    if (params.marchio === undefined) params.marchio = 'Tutti';

    const [marchioSelezionato, setMarchioSelezionato] = useState(marchi[0]);

    useEffect(() => {
        const qry = marchi.filter(m => m.key === params.marchio);
        if (qry.length !== 0) {
            setMarchioSelezionato(qry[0]);
        }
    }, []);

    return <>
        {modal &&

            <Modal show={modal} onHide={() => setModal(false)} centered>
                <Modal.Header closeButton><Modal.Title>Seleziona il marchio</Modal.Title></Modal.Header>
                <Modal.Body className={'d-flex flex-wrap gap-2'}>
                {marchi.map((marchio) => {

                    const link = getRouteLink(params.regione, params.carburante, marchio.marchio, params.provincia, params.comune);
                    return <Button
                        size={'sm'}
                        variant={params.marchio === marchio.key ? 'primary' : 'outline-primary'}
                        title={link.title}
                        onClick={() => {
                            setModal(false);
                            window.location = link.link;
                        }}
                        key={marchio.marchio}>

                        {marchio.key !== '' && <Image
                            className={'me-2'}
                            width={24} height={24}
                            src={process.env.NEXT_PUBLIC_IMAGE_ENDPOINT + `/impianto/logo/${marchio.key}/128`}
                            alt={marchio.marchio}/>}{marchio.marchio}</Button>



                })}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setModal(false)}>Annulla</Button>
                </Modal.Footer>
            </Modal>}

        <section className="">
            {/*<span className="h6 text-uppercase">Marchio</span>*/}

                <Button onClick={() => {
                    setModal(true);
                }} size={'sm'} variant={'primary'} className={'text-uppercase'}>
                    {marchioSelezionato.key !== '' && <Image
                        className={'me-2'}
                        width={24} height={24}
                        src={process.env.NEXT_PUBLIC_IMAGE_ENDPOINT + `/impianto/logo/${marchioSelezionato.key}/128`}
                        alt={marchioSelezionato.marchio}/>}
                    {marchioSelezionato.marchio}</Button>


        </section>
    </>;

}


export function FiltroMarchio({marchi, selezionato, onCambiaMarchio}) {

    //if (selezionato === null || selezionato === undefined) selezionato = '';

    return (
        <section className="mb-4">
            <label className="form-label small text-uppercase mb-3">
                Filtra per marchio
            </label>
            <div className="d-flex flex-wrap gap-2">
                {marchi.map((marchio) => {
                    // Controlla se questo specifico marchio è quello attualmente selezionato
                    const isChecked = (selezionato && selezionato.id === marchio.key) || (marchio.key === null && selezionato === undefined);

                    // Condizione per verificare se il logo esiste ed è valido (evita i placeholder vuoti)
                    const haLogoValido = marchio.key && marchio.key !== 'all' && marchio.key !== '';

                    return (
                        <span key={marchio.key}>
                            <input
                                type="radio"
                                className="btn-check"
                                name="brandFilter"
                                id={`brand${marchio.key}`}
                                autoComplete="off"
                                checked={isChecked}
                                onChange={() => onCambiaMarchio && onCambiaMarchio(marchio.key)}
                            />
                            <label
                                className="btn btn-outline-primary rounded-pill px-3 py-2 d-inline-flex align-items-center"
                                htmlFor={`brand${marchio.key}`}
                            >
                                {/* Mostra l'immagine SOLO se c'è un logo valido */}
                                {haLogoValido && (
                                    <div className="me-2 d-inline-flex align-items-center"
                                         style={{width: 20, height: 20}}>
                                        <Image
                                            objectFit='contain'
                                            width={20}
                                            height={20}
                                            src={`${process.env.NEXT_PUBLIC_IMAGE_ENDPOINT}/impianto/logo/${marchio.key}/128`}
                                            alt={marchio.marchio}
                                        />
                                    </div>
                                )}

                                {/* Rimosso text-dark per permettere a Bootstrap di convertire il testo in bianco quando attivo */}
                                <span className="me-2 fw-medium">{marchio.marchio}</span>

                                {/* Badge fluido: cambia sfondo quando il bottone è selezionato */}
                                <span
                                    className={`badge border ${isChecked ? 'bg-white text-primary' : 'bg-light text-dark'}`}>
                                    {marchio.impianti}
                                </span>
                            </label>
                        </span>
                    );
                })}
            </div>
        </section>
    );
}
