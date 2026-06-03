import {useEffect, useMemo, useState} from "react";
import {Layer, Marker, Source} from "react-map-gl/maplibre";
import * as turf from '@turf/turf';

export default function Cluster({clusters = [], onClusterClick, fadeOut}) {

    let globalMin = Infinity;
    let globalMax = -Infinity;

    clusters.forEach(c => {
        if (c) {
            globalMin = Math.min(globalMin, c.min);
            globalMax = Math.max(globalMax, c.max);
        }
    });

    const warningLimit = globalMin + (globalMax - globalMin) / 10;
    const errorLimit = globalMin + (globalMax - globalMin) / 1.5;

    // log(`min: ${globalMin}`);
    // log(`max: ${globalMax}`);
    // log(warningLimit);
    // log(errorLimit);


    // log(clusters[0]);

    return clusters.map((cluster, i) => {


        const isCluster = true; //cluster.properties.cluster;

        const media = cluster.min;


        if (media > warningLimit) {
            cluster.mediaColore = 1; // alto
        }

        if (media > errorLimit) {
            cluster.mediaColore = 2; // alto
        }

        return isCluster ?
            <MarkerCluster
                onClick={onClusterClick}
                fadeOut={fadeOut}
                key={i} cluster={cluster}
            />
            : null
    });
}

function MarkerCluster({cluster, fadeOut = false, onClick}) {

    const [lng, lat] = cluster.position;
    const isCluster = true; //cluster.properties.cluster;
    const count = cluster.count;
    const media = cluster.media?.toFixed(3);
    const mediaColore = cluster.mediaColore?.toFixed(3);

    const min = cluster.min?.toFixed(3);
    const max = cluster.max?.toFixed(3);

    const size = Math.min(560, (Math.log2(count) * 128) + 40);

    if (!isCluster) {
        // log(c.properties);
    }

    //const [exit, setExit] = useState(fadeOut);

    const [animate, setAnimate] = useState(fadeOut);


    useEffect(() => {
        if (animate === false && fadeOut === true) return;
        requestAnimationFrame(() => setAnimate(!fadeOut));
    }, [fadeOut]);

    function getClusterColor(avgPrice) {
        if (avgPrice > 0) return 'cluster-red';
        if (avgPrice > 1) return 'bg-danger-subtle';
        return 'cluster-green';
    }

    const color = getClusterColor(mediaColore);
    const textColor = useMemo(() => {
        return 'text-white';
    }, [mediaColore]);

    const borderColor = useMemo(() => {
        if (mediaColore > 0) return 'border-warning';
        return 'border-success';
    }, [mediaColore]);

    return <Marker longitude={lng} latitude={lat}>
        <div
            style={{
                width: size, height: size
            }}

            className={`
            d-flex
            justify-content-center
            align-items-center    
            rounded-circle
                             ${borderColor} ${textColor} ${color}
                            ${animate ? 'animate-in' : 'exit'}
                            `}
            onClick={() => {
                onClick?.(cluster);
            }}
        >

            <div
                style={{
                    width: 48,
                    height: 48
                }}
                className={'text-center text-white rounded-circle ' +
                    'd-flex flex-column align-items-center justify-content-center'}>
            <span>
                {min}€</span>
                <small>
                    ({count})</small>
            </div>
        </div>
    </Marker>;

}


export function HexagonLayer({distributori}) {

    // --- CONFIGURAZIONE LAYER ESAGONI ---
    const hexagonLayer = {
        id: 'gas-hexagons',
        type: 'fill',
        paint: {
            // Coloriamo l'esagono in base alla proprietà "avgPrice" calcolata da Turf
            'fill-color': [
                'case',
                ['==', ['get', 'avgPrice'], 0], 'rgba(0,0,0,0)', // Esagono vuoto = trasparente
                [
                    'interpolate', ['linear'], ['get', 'avgPrice'],
                    1.600, '#2e7559', // Verde scuro (Molto economico)
                    1.680, '#5cb85c', // Verde chiaro
                    1.730, '#f0ad4e', // Giallo/Arancione (Media)
                    1.790, '#d9534f'  // Rosso (Caro)
                ]
            ],
            // Opacità dell'esagono: solido da lontano, sfuma quando ci si avvicina per mostrare i pin sotto
            'fill-opacity': [
                'interpolate', ['linear'], ['zoom'],
                6, 0.75,
                11, 0.6,
                12.5, 0 // Sparisce completamente a zoom 12.5
            ],
            'fill-outline-color': 'rgba(255, 255, 255, 0.2)' // Un bordo sottilissimo per separare gli esagoni
        }
    };

// Layer di testo opzionale: mostra il prezzo medio al centro dell'esagono (solo da zoom medio)
    const hexagonTextLayer = {
        id: 'gas-hexagons-labels',
        type: 'symbol',
        layout: {
            'text-field': [
                'case',
                ['==', ['get', 'avgPrice'], 0], '',
                ['slice', ['to-string', ['get', 'avgPrice']], 0, 5]
            ],
            'text-size': 11,
            'text-allow-overlap': false
        },
        paint: {
            'text-color': '#ffffff',
            'text-opacity': [
                'interpolate', ['linear'], ['zoom'],
                8, 0,   // Invisibile da lontanissimo (troppo affollato)
                9.5, 1, // Visibile quando ci si avvicina un po'
                12, 0   // Sparisce insieme agli esagoni
            ]
        }
    };

    // Generiamo la griglia di esagoni in base ai punti
    const hexGridGeoJSON = useMemo(() => {

        const distributoriList = distributori;

        if (!distributoriList || distributoriList.length === 0) return null;

        // 1. Convertiamo i distributori in una FeatureCollection di punti Turf
        const points = turf.featureCollection(
            distributoriList
                .filter(d => parseFloat(d.properties.prezzo) > 1.40)
                .map(d => turf.point([parseFloat(d.geometry.coordinates[0]), parseFloat(d.geometry.coordinates[1])], {price: parseFloat(d.properties.prezzo)}))
        );

        // 2. Troviamo i confini (bounding box) dei tuoi dati per non calcolare l'esagono sul mare o all'estero
        const bbox = turf.bbox(points);

        // 3. Creiamo la griglia di esagoni.
        // "cellSide" è la dimensione del lato dell'esagono in chilometri.
        // 10km o 15km è perfetto per la vista Nord-Italia (zoom 6.5)
        const cellSide = 5;
        const options = {units: 'kilometers'};
        const hexGrid = turf.hexGrid(bbox, cellSide, options);

        // 4. Per ogni esagono nella griglia, cerchiamo i punti che cadono al suo interno e facciamo la media
        hexGrid.features.forEach(hexagon => {
            const pointsInHex = turf.pointsWithinPolygon(points, hexagon);

            if (pointsInHex.features.length > 0) {
                const prices = pointsInHex.features.map(f => f.properties.price);
                const sum = prices.reduce((a, b) => a + b, 0);
                const avg = sum / prices.length;

                hexagon.properties.avgPrice = avg;
                hexagon.properties.count = prices.length;
            } else {
                hexagon.properties.avgPrice = 0;
                hexagon.properties.count = 0;
            }
        });

        return hexGrid;
    }, [distributori]);

    if (!hexGridGeoJSON) return <div>Generazione mosaico prezzi...</div>;


    return <Source id="hex-grid-source" type="geojson" data={hexGridGeoJSON}>
        <Layer {...hexagonLayer} />
        <Layer {...hexagonTextLayer} />
    </Source>;
}

export function ClusterLayer({distributori}) {

    if (distributori === undefined) return;


    const validPrices = distributori
        .map(d => parseFloat(d.properties.prezzo))
        .filter(p => p > 1.40);

    const minPrice = Math.min(...validPrices);
    const maxPrice = Math.max(...validPrices);
    const avgPrice = validPrices.reduce((a, b) => a + b, 0) / validPrices.length;


    const greenPrice = minPrice + avgPrice / 2;

    const geojsonData = {
        type: "FeatureCollection",
        features: distributori.map(d => {
            const currentPrice = parseFloat(d.properties.prezzo);
            return {
                type: "Feature",
                geometry: {
                    type: "Point",
                    coordinates: d.geometry.coordinates // Attenzione: MapLibre vuole sempre [Longitudine, Latitudine]
                },
                properties: {
                    price: currentPrice, // Il valore usato nel layer per il calcolo del peso
                }
            }
        })
    };

    const clusterCircleLayer = {
        id: 'price-clusters-circles',
        type: 'circle',
        filter: ['has', 'point_count'], // Mostra questo layer solo se è un cluster
        paint: {
            // Il colore cambia in base alla media matematica del prezzo interno
            'circle-color': [
                'let', 'avgPrice', ['/', ['get', 'sumPrice'], ['get', 'count']],
                [
                    'step', ['var', 'avgPrice'],
                    '#198754', avgPrice, // VERDE se sotto 1.700
                    // '#f0ad4e', avgPrice, // GIALLO tra 1.700 e 1.760
                    '#dc3545'         // ROSSO se sopra 1.760
                ]
            ],
            // Dimensione del cerchio fissa o leggermente più grande se contiene molte stazioni
            'circle-radius': [
                'step', ['get', 'point_count'],
                25, 10,  // Raggio 25px se ha meno di 10 stazioni
                40, 50,  // Raggio 32px se ne ha tra 10 e 50
                48       // Raggio 40px se è un mega-cluster
            ],
            'circle-stroke-width': 2,
            'circle-stroke-color': '#ffffff',
            'circle-opacity': 0.8
        }
    };

    const clusterTextLayer = {
        id: 'price-clusters-labels',
        type: 'symbol',
        filter: ['has', 'point_count'],
        layout: {
            // Uniamo il prezzo medio e il numero di distributori
            'text-field': [
                'let', 'avgPrice', ['/', ['get', 'sumPrice'], ['get', 'count']],
                [
                    'concat',
                    ['slice', ['to-string', ['var', 'avgPrice']], 0, 5], // Il prezzo (es. "1.724")
                    '\n',                                               // Andiamo a capo per non allargare troppo il cerchio
                    '(', ['to-string', ['get', 'point_count']], ')'     // Il numero di pompe (es. "(12)")
                ]
            ],
            'text-size': 12,
            'text-line-height': 1.2,
            'text-allow-overlap': false
        },
        paint: {
            'text-color': '#ffffff'
        }
    };

    return <Source
        id="gas-stations"
        type="geojson"
        data={geojsonData}
        cluster={true}
        clusterMaxZoom={12} // Oltre lo zoom 12 il cluster si rompe nei pin singoli
        clusterRadius={60}  // Il raggio (in pixel) per cui i punti si fondono (aumentalo se vuoi bolle più grandi e isolate)
        clusterProperties={{
            // Calcoliamo la media del prezzo nel cluster: accumuliamo la somma e contiamo i punti
            sumPrice: ['+', ['get', 'price']],
            count: ['+', 1]
        }}
    >
        <Layer {...clusterCircleLayer} />
        <Layer {...clusterTextLayer} />

    </Source>;
}


export function HeatMapLayer({distributori}) {


    if (distributori === undefined) return;


    const validPrices = distributori
        .map(d => parseFloat(d.properties.prezzo))
        .filter(p => p > 1.40);

    const minPrice = Math.min(...validPrices);
    const maxPrice = Math.max(...validPrices);
    const avgPrice = validPrices.reduce((a, b) => a + b, 0) / validPrices.length;

    const geojsonData = {
        type: "FeatureCollection",
        features: distributori.map(d => {
            const currentPrice = parseFloat(d.properties.prezzo);
            return {
                type: "Feature",
                geometry: {
                    type: "Point",
                    coordinates: d.geometry.coordinates // Attenzione: MapLibre vuole sempre [Longitudine, Latitudine]
                },
                properties: {
                    price: parseFloat(currentPrice), // Il valore usato nel layer per il calcolo del peso
                }
            }
        })
    };

    const uniformGradientLayer = {
        id: 'gas-uniform-gradient',
        type: 'heatmap',
        paint: {
            // 1. Il peso è legato al prezzo: i punti economici non generano accumulo rosso
            'heatmap-weight': [
                'interpolate',
                ['linear'],
                ['get', 'price'],
                minPrice, 0.01,  // Prezzo basso: influenza minima sul calore (resta verde)
                avgPrice, 0.5,   // Prezzo medio
                maxPrice, 1.0    // Prezzo alto: spinge verso il rosso
            ],

            // 2. Intensità bassissima: questo impedisce ai punti vicini di sommarsi
            // e diventare rossi solo perché sono tanti. Mantiene il colore reale.
            'heatmap-intensity': [
                'interpolate',
                ['linear'],
                ['zoom'],
                5, 0.05,
                11, 0.2,
                13, 0.5
            ],

            // 3. Il gradiente cromatico dell'area uniforme
            // Noterai che non partiamo da trasparente (0), ma diamo un colore di base fin da subito
            // per fare in modo che tutta la zona coperta dai distributori sia "tinta" uniformemente.
            'heatmap-color': [
                'interpolate',
                ['linear'],
                ['heatmap-density'],
                0, 'rgba(0, 0, 0, 0)',            // Trasparente solo dove non c'è proprio nessun distributore
                0.1, 'rgba(46, 117, 89, 0.5)',    // VERDE uniforme per le zone economiche
                0.4, 'rgba(215, 230, 120, 0.5)',  // Lime/Giallo di transizione
                0.7, 'rgba(240, 173, 78, 0.5)',   // ARANCIONE
                0.95, 'rgba(217, 83, 79, 0.6)'    // ROSSO solo nei nuclei veramente cari
            ],

            // 4. Raggio ampio per connettere i cerchi in un'unica superficie
            // Usiamo valori alti in pixel così i cerchi si fondono cancellando i loro confini netti
            'heatmap-radius': [
                'interpolate',
                ['linear'],
                ['zoom'],
                5, 20,   // Vista macro
                9, 80,   // Vista regionale: i punti si fondono in macro-aree
                12, 140, // Vista città: i cerchi da 2km diventano un unico manto cittadino sfumato
                14, 80
            ],

            // Opacità globale del manto colorato
            'heatmap-opacity': [
                'interpolate',
                ['linear'],
                ['zoom'],
                12, 0.6,
                13.5, 0 // Si dissolve se l'utente zooma vicinissimo alle strade
            ]
        }
    };

    // 2. NUOVO LAYER: Mostra SOLO la scritta del prezzo medio sopra l'area
    const averagePriceLabelsLayer = {
        id: 'gas-area-labels',
        type: 'symbol',
        filter: ['has', 'point_count'], // Viene renderizzato solo dove si crea un'area/cluster
        layout: {
            // Calcoliamo la media (somma/conteggio) e tagliamo a 5 caratteri (es. "1.654")
            'text-field': [
                'let', 'avgPrice', ['/', ['get', 'sumPrice'], ['get', 'count']],
                ['slice', ['to-string', ['var', 'avgPrice']], 0, 5]
            ],
            // Font di sistema o caricati nel tuo stile maplibre
            // 'text-font': ['Open Sans Bold', 'Arial Black'],
            'text-size': [
                'interpolate', ['linear'], ['zoom'],
                6, 14,   // Più piccolo da lontano
                12, 18   // Più leggibile da vicino (es. vista Milano)
            ],
            'text-allow-overlap': false, // Evita che i testi si sovrappongano creando confusione
            'text-ignore-placement': false
        },
        paint: {
            'text-color': '#000000', // Un grigio scuro/antracite molto elegante e leggibile sul gradiente
            'text-halo-color': '#ffffff', // Un'ombreggiatura bianca intorno alle lettere per leggerlo anche sul rosso/verde
            'text-halo-width': 2
        }
    };

    return <><Source


        id="gas-stations-source"
        type="geojson"
        data={geojsonData}>
        <Layer {...uniformGradientLayer} />
    </Source>

        <Source
            id="gas-stations-price"
            type="geojson"
            data={geojsonData}
            cluster={true}
            clusterMaxZoom={13}
            clusterRadius={80}
            clusterProperties={{
                sumPrice: ['+', ['get', 'price']],
                count: ['+', 1]
            }}>
            <Layer {...averagePriceLabelsLayer} />

        </Source>

    </>;
}
