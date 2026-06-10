import CheckBoxIcon from "@mui/icons-material/CheckBox";
import React from "react";

export default function Motivi() {

    return <div className="mb-4">
        <h2 className="mb-3 fw-bold h6 text-uppercase">Perché
            usarlo</h2>
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


}