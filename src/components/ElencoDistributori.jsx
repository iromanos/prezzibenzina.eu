import React from "react";

export default function ElencoDistributori({distributori}){
    return                 <section className={'mb-4'}>
        <h2 className="h5 mb-3">Elenco distributori</h2>
        {distributori.length === 0 ? (
            <p className="text-muted">Nessun distributore trovato nella regione.</p>
        ) : (
            <ul className="list-group">
                {distributori.map((d) => (
                    <li key={d.id_impianto}
                        className="list-group-item d-flex justify-content-between align-items-center">
                        <div>
                            <strong>{d.bandiera}</strong> — {d.nome_impianto}
                            <div className="text-muted small">
                                {d.indirizzo}, {d.comune} ({d.provincia})
                            </div>
                        </div>
                        <span className="badge bg-success">{d.prezzo.toFixed(3)} €/L</span>
                    </li>
                ))}
            </ul>
        )}
    </section>;

}