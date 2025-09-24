'use client';

import {useState} from 'react';

export default function FiltriMappa({onChange}) {
    const [carburante, setCarburante] = useState('');
    const [marchio, setMarchio] = useState('');
    const [limite, setLimite] = useState(50);

    const handleChange = () => {
        onChange({carburante, marchio, limite});
    };

    return (
        <div className="position-absolute top-0 end-0 p-2 z-3 bg-white bg-opacity-75 rounded shadow-sm w-100 w-md-auto">
            <div className="d-flex flex-column gap-2">
                <select
                    className="form-select form-select-sm"
                    value={carburante}
                    onChange={(e) => {
                        setCarburante(e.target.value);
                        handleChange();
                    }}
                >
                    <option value="">Tutti i carburanti</option>
                    <option value="benzina">Benzina</option>
                    <option value="diesel">Diesel</option>
                    <option value="GPL">GPL</option>
                    <option value="metano">Metano</option>
                </select>

                <select
                    className="form-select form-select-sm"
                    value={marchio}
                    onChange={(e) => {
                        setMarchio(e.target.value);
                        handleChange();
                    }}
                >
                    <option value="">Tutti i marchi</option>
                    <option value="Q8">Q8</option>
                    <option value="Esso">Esso</option>
                    <option value="Eni">Eni</option>
                    <option value="IP">IP</option>
                </select>

                <input
                    type="number"
                    className="form-control form-control-sm"
                    min={10}
                    max={200}
                    step={10}
                    value={limite}
                    onChange={(e) => {
                        setLimite(Number(e.target.value));
                        handleChange();
                    }}
                    placeholder="Numero impianti"
                />
            </div>
        </div>
    );
}
