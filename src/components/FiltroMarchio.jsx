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


export function FiltroMarchio({marchi, selezionato, params}) {

    console.log(params);

    return (
        <section className="mb-4">
            <label className="form-label text-uppercase fw-bold">
                Filtra per marchio
            </label>
            <div className="d-flex flex-wrap column-gap-1 row-gap-2">
                {marchi.map((marchio) => {
                    // Controlla se questo specifico marchio è quello attualmente selezionato
                    const isChecked = (selezionato && selezionato.id === marchio.key) || (marchio.key === null && selezionato === undefined);

                    // Condizione per verificare se il logo esiste ed è valido (evita i placeholder vuoti)
                    const haLogoValido = marchio.key && marchio.key !== 'all' && marchio.key !== '';

                    const link = getRouteLink(params.regione, params.carburante, marchio.key, params.provincia, params.comune);

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
                                className={`align-items-center d-inline-flex me-1 border rounded px-1 py-1  ${isChecked ? 'bg-success-subtle border-success-subtle' : ''} `}
                                htmlFor={`brand${marchio.key}`}
                            ><div className="d-inline-flex align-items-center me-1"
                                  style={{height: 20}}>
                                {haLogoValido && (
                                        <Image
                                            className={'rounded-circle'}
                                            objectFit='contain'
                                            width={20}
                                            height={20}
                                            src={`${process.env.NEXT_PUBLIC_IMAGE_ENDPOINT}/impianto/logo/${marchio.key}/128`}
                                            alt={marchio.marchio}
                                        />

                                )}</div>
                                <a href={link.link}
                                   className={` ${isChecked ? 'text-dark' : 'text-secondary'} link-underline link-underline-opacity-0 `}>
                                <span className="small">{marchio.marchio}</span>

                                <span
                                    className={` small `}>
                                    ({marchio.impianti})
                                </span></a>
                            </label>
                        </span>
                    );
                })}
            </div>
        </section>
    );
}
