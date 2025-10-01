'use client'

import React, {useEffect, useState} from 'react';
import {getImpiantiByDistance} from "@/functions/api";
import Mappa from "@/components/Mappa";
import ImpiantoRow from "@/components/impianti/ImpiantoRow";
import {log} from "@/functions/helpers";
import Modal from "react-bootstrap/Modal";
import {useModalHistory} from "@/hooks/useModalHistory";

export default function ComparaVicini({carburante}) {

    const [open, setOpen] = useState(false);
    const [baseId, setBaseId] = useState(null);
    const [vicini, setVicini] = useState([]);


    useModalHistory(open, () => setOpen(false));

    log("ComparaVicini: " + carburante);

    useEffect(() => {

        if (carburante == null) return;
        if (carburante === "") return;
        const handleCompare = async e => {
            const {lat, lng, radius, id} = e.detail;
            setBaseId(id);
            setOpen(true);

            const res = await getImpiantiByDistance(lat, lng, radius, carburante, 'price', 5);

            const data = await res.json();
            setVicini(data);
        };

        window.addEventListener('compare:open', handleCompare);
        return () => window.removeEventListener('compare:open', handleCompare);
    }, []);

    return (

        <Modal show={open} onHide={() => setOpen(false)} centered scrollable={true} size={"lg"}>
            <Modal.Header closeButton><Modal.Title>Confronta distributori vicini</Modal.Title></Modal.Header>
            <Modal.Body>
                {vicini.length === 0 ? (
                    <p>Nessun impianto trovato entro il raggio selezionato.</p>
                ) : (
                    <div className={'row'}>
                        <div className={'col-lg-6'}>
                            <Mappa distributori={vicini} title={false} height={'40vh'}/>
                        </div>
                        <div className={"col-lg-6"}>
                            <ul className="list-group">
                                {vicini
                                    .sort((a, b) => a.prezzo - b.prezzo)
                                    .map(s => <ImpiantoRow key={s.id_impianto} d={s}/>)}
                            </ul>
                        </div>
                    </div>
                )}

            </Modal.Body>
        </Modal>
    );
}
