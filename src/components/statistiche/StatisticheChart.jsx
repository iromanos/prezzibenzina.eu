// src/components/statistiche/StatisticheChart.jsx
'use client';

import {Area, AreaChart, CartesianGrid, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis} from 'recharts';

export default function StatisticheChart({data}) {
    if (!data || data.length === 0) {
        return <p>Nessun dato da visualizzare. Prova a modificare i filtri.</p>;
    }

    // Funzione per formattare la data sull'asse X (es. da YYYY-MM-DD a DD/MM)
    const formatXAxisTick = (tickItem) => {
        const date = new Date(tickItem);
        return date.toLocaleDateString('it-IT', {day: '2-digit', month: '2-digit'});
    };

    return (
        <ResponsiveContainer width="100%" height={400}>
            <AreaChart
                data={data}
                margin={{
                    top: 10, right: 30, left: 0, bottom: 0,
                }}
            >
                <CartesianGrid strokeDasharray="3 3" vertical={false}/> {/* Rimuove le linee verticali */}
                <XAxis dataKey="data" tickFormatter={formatXAxisTick}/> {/* Applica il formattatore */}
                <YAxis domain={['auto', 'auto']}/> {/* Adatta il dominio automaticamente */}
                <Tooltip
                    labelFormatter={(label) => new Date(label).toLocaleDateString('it-IT', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                    })}
                    formatter={(value, name, props) => [`${parseFloat(value).toFixed(3)} €`, name]}
                />
                <Legend/>
                <Area type="monotone" dataKey="prezzo_medio" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3}
                      name="Prezzo Medio"/>
                <Line dot={false} type="basis" dataKey="prezzo_min" stroke="#82ca9d" name="Prezzo Minimo"/>
                <Line dot={false} type="basis" dataKey="prezzo_max" stroke="#ffc658" name="Prezzo Massimo"/>
            </AreaChart>
        </ResponsiveContainer>
    );
}