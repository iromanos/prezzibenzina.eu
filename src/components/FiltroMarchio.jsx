import Link from "next/link";
import React from 'react';

export default function FiltroMarchio({regione, marchi, selezionato, carburante}) {
    return (
        <section className="mb-4">
            <h2 className="h5 mb-3">Filtra per marchio</h2>
            <div className="btn-group flex-wrap" role="group">
                {marchi.map((marchio) => <React.Fragment key={marchio}
                    ><input
                        name={'marchio'}
                        type={'radio'}
                        value={marchio}
                        id={'id_' + marchio}
                        autoComplete={'off'}
                        className={`btn-check`}
                        defaultChecked={marchio.toLowerCase() === selezionato}
                    />
                    <label className={"btn btn-sm btn-outline-primary"}
                           htmlFor={'id_' + marchio}>{marchio}</label></React.Fragment>
                )}
            </div>
        </section>
    );
}
