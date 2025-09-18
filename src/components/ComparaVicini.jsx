'use client'

import React, {useEffect, useState} from 'react';
import {getImpiantiByDistance} from "@/functions/api";
import Mappa from "@/components/Mappa";
import ImpiantoRow from "@/components/impianti/ImpiantoRow";

export default function ComparaVicini({carburante}) {

    const URI_IMAGE = process.env.NEXT_PUBLIC_API_ENDPOINT;


    const [open, setOpen] = useState(false);
    const [baseId, setBaseId] = useState(null);
    const [vicini, setVicini] = useState([]);

    useEffect(() => {
        const handleCompare = async e => {
            const {lat, lng, radius, id} = e.detail;
            setBaseId(id);
            setOpen(true);

            const res = await getImpiantiByDistance(lat, lng, radius, carburante, 'price');

            const data = await res.json();
            setVicini(data);
        };

        window.addEventListener('compare:open', handleCompare);
        return () => window.removeEventListener('compare:open', handleCompare);
    }, []);

    if (!open) return null;

    return (
        <div className="modal show d-block bg-dark bg-opacity-50" tabIndex="-1">
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Confronta distributori vicini</h5>
                        <button className="btn-close" onClick={() => setOpen(false)}/>
                    </div>
                    <div className="modal-body">
                        {vicini.length === 0 ? (
                            <p>Nessun impianto trovato entro il raggio selezionato.</p>
                        ) : (
                            <div className={'row'}>
                                <div className={'col-lg-6'}>
                                    <Mappa distributori={vicini} title={false}/>
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
                    </div>
                </div>
            </div>
        </div>
    );
}
