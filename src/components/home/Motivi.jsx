import CheckBoxIcon from "@mui/icons-material/CheckBox";
import React from "react";

export default function Motivi() {

    return <div className="container mb-4">
        <h2 className="text-center mb-4 fw-bold">Perché
            usarlo</h2>
        <div className="row justify-content-center">
            <div className="col-md-8">
                <ul className="list-group list-group-flush">
                    <li className="list-group-item bg-transparent"><CheckBoxIcon className={'text-success'}/> Risparmi
                        tempo e denaro
                    </li>
                    <li className="list-group-item bg-transparent"><CheckBoxIcon className={'text-success'}/> Eviti
                        sorprese alla pompa
                    </li>
                    <li className="list-group-item bg-transparent"><CheckBoxIcon className={'text-success'}/> Scopri
                        impianti serviti e self-service
                    </li>
                    <li className="list-group-item bg-transparent"><CheckBoxIcon className={'text-success'}/> Funziona
                        su smartphone, tablet e desktop
                    </li>
                </ul>
            </div>
        </div>
    </div>


}