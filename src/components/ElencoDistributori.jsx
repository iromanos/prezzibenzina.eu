'use client'
import React from "react";
import ImpiantoCard from "@/components/impianti/ImpiantoCard";
import InFeed4656802013 from "@/components/ads/InFeed-4656802013";
import {usePreferitiGlobal} from "@/context/PreferitiProvider";

export default function ElencoDistributori({distributori}){


    const {ModalComponent, ModalResult} = usePreferitiGlobal();


    return <section className={'mb-4'}>
        <h2 className="h5 mb-3">Elenco distributori</h2>
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
                                <InFeed4656802013/>}
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