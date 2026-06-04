import {useEffect, useMemo, useState} from "react";
import {Layer, Marker, Source} from "react-map-gl/maplibre";

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

export function HeatMapLayer({distributori, map}) {


    if (distributori === undefined) return;

    if (map === null) return;

    // Crea un piccolo rettangolo bianco con bordi arrotondati da usare come sfondo
    const createBoxImage = (map) => {
        const canvas = document.createElement('canvas');
        canvas.width = 120;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');

        // Disegna il rettangolo arrotondato
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#adb5bd';
        ctx.lineWidth = 1.5;

        // Semplice disegno di un rettangolo con bordi arrotondati
        ctx.beginPath();
        ctx.roundRect(2, 2, 116, 60, 8);
        ctx.fill();
        ctx.stroke();

        // Aggiungi l'immagine allo stile della mappa
        if (!map.hasImage('box-sfondo')) {
            map.addImage('box-sfondo', ctx.getImageData(0, 0, 120, 64));
        }
    };

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


    const boxLayer = {
        id: 'layer-prezzi-box',
        type: 'symbol',
        filter: ['has', 'point_count'],
        // source: 'tuo-source-dati',
        layout: {
            // 1. Configura l'icona di sfondo
            'icon-image': 'box-sfondo',
            'icon-size': 0.7, // Ridimensionala a piacimento
            'icon-allow-overlap': false,

            // 2. Configura il testo che andrà SOPRA l'icona
            'text-field': [
                'let',
                // 1. Definiamo la variabile 'avgPrice'
                'avgPrice', [
                    'number-format',
                    ['/', ['get', 'sumPrice'], ['get', 'count']],
                    {'min-fraction-digits': 3, 'max-fraction-digits': 3} // Arrotonda a 3 decimali (es. 1.660)
                ],

                // 2. Argomento finale del 'let': qui formatti il testo usando la variabile appena creata
                [
                    'format',
                    ['concat', ['var', 'avgPrice'], ' €/L'], // <--- Usiamo ['var', 'avgPrice'] invece di sumPrice
                    {'font-scale': 1.1, 'text-font': ['literal', ['Open Sans Bold']]},

                    '\n', {}, // Salto riga

                    // Usiamo 'count' (visto che lo hai usato sopra per fare la media, è più coerente)
                    ['concat', ['to-string', ['get', 'count']], ' dist.'],
                    {'font-scale': 0.8}
                ]
            ],
            'text-font': ['Open Sans Regular'],
            'text-size': 12,
            'text-justify': 'center',
            'text-anchor': 'center', // Centra il testo perfettamente sull'icona
            'text-allow-overlap': false
        },
        paint: {
            'text-color': '#222222'
        }
    };

    createBoxImage(map);

    return <>
        <Source
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
            clusterRadius={160}
            clusterProperties={{
                sumPrice: ['+', ['get', 'price']],
                count: ['+', 1]
            }}>
            <Layer {...boxLayer} />

        </Source>

    </>;
}
