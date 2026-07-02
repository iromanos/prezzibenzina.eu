'use client'
import React, {useEffect, useState} from "react";
import ImpiantoCard from "@/components/impianti/ImpiantoCard";
import InFeed4656802013 from "@/components/ads/InFeed-4656802013";
import {usePreferitiGlobal} from "@/context/PreferitiProvider";
import ImpiantoCardMobile from "@/components/impianti/ImpiantoCardMobile";

export default function ElencoDistributori({distributori}){

    const [elenco, setElenco] = useState(distributori);

    useEffect(() => {
        // 1. Definiamo la funzione callback che leggerà i dati
        const gestisciCambio = (event) => {
            const datiRicevuti = event.detail;
            setElenco(datiRicevuti);
        };

        // 2. Ci registriamo sull'evento globale del browser
        window.addEventListener('mappa-aggiornata', gestisciCambio);

        // 3. CLEANUP: Rimuoviamo l'ascoltatore quando il componente sparisce
        return () => {
            window.removeEventListener('mappa-aggiornata', gestisciCambio);
        };
    }, []); //


    const {ModalComponent, ModalResult} = usePreferitiGlobal();

    return <section className={'mb-4'}>
        <h2 className="h6 mb-3 text-uppercase">Elenco distributori più economici</h2>
        {elenco.length === 0 ? (
            <p className="text-muted">Nessun distributore trovato nella regione.</p>
        ) : (
            <><p className="text-muted">Sono presenti {elenco.length} distributori</p>
            <ul className="list-group">
                {elenco.map((d, index) => {
                    return (
                        <div
                            className={index === 0 ? 'bg-success-subtle rounded overflow-hidden' : null}
                            key={index}>
                            {index === 0 &&
                                <p className={'m-0 text-center bg-success text-white text-uppercase small fw-bold'}>Il
                                    più conveniente</p>}
                            <ImpiantoCardMobile
                                key={d.properties.id_impianto} impianto={d.properties}/>
                            {(index + 1) % 3 === 0 &&
                                <InFeed4656802013 className={'my-3'}/>}
                        </div>
                    );
                })}
            </ul>
            </>
        )}
        {ModalComponent}
        {ModalResult}
    </section>;

}

export function ElencoDistributoriSvizzera({distributori}) {


    const {ModalComponent, ModalResult} = usePreferitiGlobal();


    return <section className={'mb-4'}>
        <h2 className="h6 mb-3 text-uppercase">Elenco distributori</h2>
        {distributori.length === 0 ? (
            <p className="text-muted">Nessun distributore trovato nella regione.</p>
        ) : (
            <><p className="text-muted">Sono presenti {distributori.length} distributori</p>
                <ul className="list-group">
                    {distributori.map((d, index) => {
                        return (
                            <div key={index}><ImpiantoCard
                                key={d.id_impianto} impianto={d}/>
                                {(index + 1) % 3 === 0 &&
                                    <InFeed4656802013 className={'mb-3'}/>}
                            </div>
                        );
                    })}
                </ul>
            </>
        )}
        {ModalComponent}
        {ModalResult}
    </section>;

}