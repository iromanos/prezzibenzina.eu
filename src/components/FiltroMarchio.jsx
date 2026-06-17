'use client'
import React, {useEffect, useState} from 'react';
import {getRouteLink, logDebug} from "@/functions/helpers";
import Image from "next/image";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/esm/Modal";


export function LinkMarchio({marchi, params}){


    logDebug(params);

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


export default function FiltroMarchio({marchi, selezionato}) {

    if (selezionato === null || selezionato === undefined) selezionato = '';

    marchi.unshift( { marchio:  'Tutti', key: ''});
    logDebug(marchi);
    logDebug(selezionato);
    return (
        <section className="mb-4">
            <h2 className="h5 mb-3">Filtra per marchio</h2>
            <div className="btn-group flex-wrap" role="group">
                {marchi.map((marchio) => <React.Fragment key={marchio.key}
                    ><input
                        name={'marchio'}
                        type={'radio'}
                        value={marchio.key}
                        id={'id_' + marchio.key}
                        autoComplete={'off'}
                        className={`btn-check`}
                        defaultChecked={marchio.key.toLowerCase() === selezionato}
                    />
                    <label className={"btn btn-sm btn-outline-primary"}
                           htmlFor={'id_' + marchio.key}>{marchio.marchio}</label></React.Fragment>
                )}
            </div>
        </section>
    );
}
