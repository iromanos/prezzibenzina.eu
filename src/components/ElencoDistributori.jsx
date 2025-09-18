import React from "react";
import ImpiantoCard from "@/components/impianti/ImpiantoCard";

export default function ElencoDistributori({distributori}){
    return                 <section className={'mb-4'}>
        <h2 className="h5 mb-3">Elenco distributori</h2>
        {distributori.length === 0 ? (
            <p className="text-muted">Nessun distributore trovato nella regione.</p>
        ) : (
            <ul className="list-group">
                {distributori.map((d) => (
                    <ImpiantoCard key={d.id_impianto} impianto={d}/>
                ))}
            </ul>
        )}
    </section>;

}