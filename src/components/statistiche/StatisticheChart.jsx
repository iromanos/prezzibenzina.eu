// src/components/statistiche/StatisticheChart.jsx
'use client';

import {CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis} from 'recharts';

export default function StatisticheChart({data}) {
    if (!data || data.length === 0) {
        return <p>Nessun dato da visualizzare. Prova a modificare i filtri.</p>;
    }

    return (
        <ResponsiveContainer width="100%" height={400}>
            <LineChart
                data={data}
                margin={{
                    top: 5, right: 30, left: 20, bottom: 5,
                }}
            >
                <CartesianGrid strokeDasharray="3 3"/>
                <XAxis dataKey="data"/>
                <YAxis/>
                <Tooltip/>
                <Legend/>
                <Line type="monotone" dataKey="prezzo_medio" stroke="#8884d8" activeDot={{r: 8}} name="Prezzo Medio"/>
                <Line type="monotone" dataKey="prezzo_min" stroke="#82ca9d" name="Prezzo Minimo"/>
                <Line type="monotone" dataKey="prezzo_max" stroke="#ffc658" name="Prezzo Massimo"/>
            </LineChart>
        </ResponsiveContainer>
    );
}
