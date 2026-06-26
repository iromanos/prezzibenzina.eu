'use client'
import {useEffect, useState} from "react";
import {getPrezzoMedioByComune} from "../../functions/api";

export default function BoxComune({comune, fuel}) {

    const [record, setRecord] = useState(null);

    useEffect(() => {
        getPrezzoMedioByComune(comune, fuel).then(res => {
            // console.log("PREZZO MEDIO: ", res);
            setRecord(res);
        });
    }, [])

    return <div className="col-12 col-sm-6 col-md-3 col-lg-3">
        <div className="card h-100 border shadow-sm text-center bg-white card-hover"
             style={{transition: "transform 0.2s"}}>
            <div className="card-body d-flex flex-column justify-content-between p-3">
                <div className={'mb-1'}>
                    <span className="fw-bold mb-1 text-dark h5"><strong>{comune}</strong></span>
                    <small className="text-muted d-block">Aggiornato oggi</small>
                    <div className="display-6 text-success">{record?.medio.toFixed(3)}<small
                        className={'fs-5'}>€/L</small></div>
                </div>
                <div className="">
                    <span className="badge bg-success bg-opacity-10 text-success px-3 py-2 rounded-pill fw-semibold">Self Service</span>
                </div>
                <a href={record?.link} className="btn btn-outline-primary btn-sm mt-3 w-100 rounded-pill"
                >Vedi distributori</a>
            </div>
        </div>
    </div>;
}