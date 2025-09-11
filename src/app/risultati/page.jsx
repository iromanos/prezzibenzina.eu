'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

export default function Risultati() {
    const mapContainer = useRef(null);
    const searchParams = useSearchParams();
    const lat = parseFloat(searchParams.get('lat')) || 45.4642;
    const lon = parseFloat(searchParams.get('lon')) || 9.19;

    const [impianti] = useState([
        { id: 1, nome: 'Q8 Milano', lat: 45.465, lon: 9.185, tipo: 'Diesel', prezzo: '1.85€' },
        { id: 2, nome: 'Eni Porta Romana', lat: 45.450, lon: 9.205, tipo: 'Benzina', prezzo: '1.89€' }
    ]);

    useEffect(() => {
        const map = new maplibregl.Map({
            container: mapContainer.current,
            style: 'https://demotiles.maplibre.org/style.json',
            center: [lon, lat],
            zoom: 13
        });

        impianti.forEach(imp => {
            new maplibregl.Marker()
                .setLngLat([imp.lon, imp.lat])
                .setPopup(new maplibregl.Popup().setText(`${imp.nome} - ${imp.prezzo}`))
                .addTo(map);
        });

        return () => map.remove();
    }, [lat, lon, impianti]);

    return (
        <div className="container-fluid bg-light">
            <header className="text-center py-4">
                <h1 className="text-primary">Risultati Ricerca Impianti</h1>
                <p className="lead">Visualizza i distributori sulla mappa e confronta i prezzi</p>
            </header>

            <div className="container mb-3">
                <div className="row">
                    <div className="col-md-4 mb-4">
                        <h5>Elenco Impianti</h5>
                        <ul className="list-group">
                            {impianti.map(imp => (
                                <li key={imp.id} className="list-group-item">
                                    <h6 className="mb-1">{imp.nome}</h6>
                                    <p className="mb-0">Tipo: {imp.tipo} | Prezzo: {imp.prezzo}</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="col-md-8 mb-4">
                        <div ref={mapContainer} className="border rounded" style={{ height: '500px' }} />
                    </div>
                </div>

                <section className="mt-5">
                    <h2 className="h4">Distributori Vicini con Prezzi Aggiornati</h2>
                    <p>
                        Ogni distributore mostra il tipo di carburante disponibile e il prezzo aggiornato, così puoi <strong>fare il pieno al miglior costo</strong>.
                    </p>
                    <p>
                        Che tu stia cercando <em>benzina economica</em>, <em>diesel premium</em> o una colonnina elettrica, qui trovi tutto ciò che ti serve per <strong>guidare risparmiando</strong>.
                    </p>
                </section>
            </div>
        </div>
    );
}
