'use client'

import React, {useEffect, useState} from 'react';
import {getImpiantiByDistance} from "@/functions/api";
import ImpiantoRow from "@/components/impianti/ImpiantoRow";
import Modal from "react-bootstrap/Modal";
import {useModalHistory} from "@/hooks/useModalHistory";
import MappaRisultati from "@/components/mappe/MappaRisultati";

export default function ComparaVicini({carburante}) {

    const [open, setOpen] = useState(false);
    // const [baseId, setBaseId] = useState(null);
    const [vicini, setVicini] = useState([]);

    const [lat, setLat] = useState(null);
    const [lng, setLng] = useState(null);


    useModalHistory(open, () => setOpen(false));

    // log("ComparaVicini: " + carburante);

    useEffect(() => {

        if (carburante == null) return;
        if (carburante === "") return;
        const handleCompare = async e => {
            const {lat, lng, radius, id} = e.detail;
            // setBaseId(id);
            setLat(lat);
            setLng(lng)
            setOpen(true);

            const res = await getImpiantiByDistance(lat, lng, 1000, carburante, 'price', 5);

            const data = await res.json();
            setVicini(data);
        };

        window.addEventListener('compare:open', handleCompare);
        return () => window.removeEventListener('compare:open', handleCompare);
    }, []);

    return (

        <Modal show={open} onHide={() => {
            setOpen(false);
            setVicini([]);
        }} centered scrollable={true} size={"lg"}>
            <Modal.Header closeButton><Modal.Title>Confronta distributori vicini</Modal.Title></Modal.Header>
            <Modal.Body>
                {vicini.length === 0 ? (
                    <p>Nessun impianto trovato entro il raggio selezionato.</p>
                ) : (
                    <div className={'row'}>
                        <div
                            style={{
                                height: '50vh'
                            }}

                            className={'col-lg-6'}>
                            {open &&
                                <MappaRisultati
                                    distributoriIniziali={vicini}
                                    isReadOnly={true}
                                    showFilter={false}
                                    initialFilters={{}}
                                    posizione={{
                                        latitude: lat,
                                        longitude: lng,
                                        zoom: 12,
                                    }}
                                />}
                        </div>
                        <div className={"col-lg-6"}>
                            <ul className="list-group">
                                {vicini
                                    .sort((a, b) => {
                                        return a.properties.prezzo - b.properties.prezzo;
                                    })
                                    .map(s => <ImpiantoRow key={s.properties.id_impianto} d={s.properties}/>)}
                            </ul>
                        </div>
                    </div>
                )}

            </Modal.Body>
        </Modal>
    );
}
