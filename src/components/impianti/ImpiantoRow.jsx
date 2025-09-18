import React from "react";


export default function ImpiantoRow({d}) {
    const URI_IMAGE = process.env.NEXT_PUBLIC_API_ENDPOINT;

    return <li key={d.id_impianto}
               className="list-group-item d-flex justify-content-between align-items-center">
        <div>
            <img src={URI_IMAGE + d.image} alt={d.bandiera} width={24} height={24}/> - {d.nome_impianto}<br/>
            <span className={'text-muted small'}>{d.indirizzo}, {d.comune} ({d.provincia})</span>
        </div>
        <span className="badge bg-success">{d.prezzo.toFixed(3)} €/L</span>
    </li>;


}