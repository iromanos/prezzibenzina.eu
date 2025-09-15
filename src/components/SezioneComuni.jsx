'use client'
import MappaWrapper from "@/components/MappaWrapper";
import {getDistributoriRegione, getSeoRegione} from "@/functions/api";
import React, {useState} from "react";
import Link from 'next/link';

export default function SezioneComuni({comuni, provinciaSelezionata = '', selezionato}) {


    const [provincia, setProvincia] = useState(provinciaSelezionata);


    return <>
        <section className="mb-4">
            <h2 className="h5 mb-3">Città principali</h2>
            <div className="d-flex flex-wrap gap-2">
                <input type={'hidden'} name={'provincia'} readOnly={true} value={provincia} />
                {comuni.map((comune) => (
                    <React.Fragment key={comune.key}>
                    <input
                        onClick={() => {
                            setProvincia(comune.provincia.toLowerCase());
                        }}
                        id={'id_' + comune.key}
                        type={'radio'}
                        value={comune.key.toLowerCase()}
                        name={'comune'}
                        autoComplete={'off'}
                        className={`btn-check`}
                        defaultChecked={comune.key.toLowerCase() === selezionato}
                    />
                        <label className={"btn btn-sm btn-outline-secondary"}
                               htmlFor={'id_' + comune.key}>{comune.nome}</label>

                    </React.Fragment>
                ))}
            </div>
        </section></>;
}
