import http from 'k6/http';
import {check, group, sleep} from 'k6';

// Test di performance della feature "Statistiche e Andamenti" (Fase 4, punto 2).
//
// Copre:
//   - GET /api/statistiche   (query su prezzi_storici, ~4.5M righe)
//   - GET /statistiche       (rendering pagina SSR)
//
// Esecuzione (default locale, build di produzione: `npm run build && npm start`):
//   k6 run test-statistiche.js
// Contro un altro ambiente:
//   BASE_URL=https://www.prezzibenzina.eu k6 run test-statistiche.js

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export const options = {
    stages: [
        {duration: '30s', target: 50},   // ramp-up a 50 utenti
        {duration: '1m', target: 50},    // regime a 50 utenti
        {duration: '15s', target: 0},    // ramp-down
    ],
    thresholds: {
        http_req_failed: ['rate<0.01'],                 // < 1% di errori
        'http_req_duration{scenario:api}': ['p(95)<250'], // API sotto i 250ms al p95
        'http_req_duration{scenario:page}': ['p(95)<800'], // pagina SSR sotto gli 800ms al p95
    },
};

// Combinazioni realmente presenti in prezzi_storici (campionate dal DB).
const API_QUERIES = [
    {livello_geo: 'nazionale', codice_geo: 'IT', desc_carburante: 'Benzina'},
    {livello_geo: 'nazionale', codice_geo: 'IT', desc_carburante: 'Gasolio'},
    {livello_geo: 'nazionale', codice_geo: 'IT', desc_carburante: 'GPL'},
    {livello_geo: 'nazionale', codice_geo: 'IT', desc_carburante: 'Metano'},
    {livello_geo: 'regionale', codice_geo: 'lombardia', desc_carburante: 'Benzina'},
    {livello_geo: 'regionale', codice_geo: 'campania', desc_carburante: 'Gasolio'},
    {livello_geo: 'regionale', codice_geo: 'lazio', desc_carburante: 'Benzina'},
    {livello_geo: 'provinciale', codice_geo: 'NA', desc_carburante: 'Gasolio'},
    {livello_geo: 'provinciale', codice_geo: 'BS', desc_carburante: 'Benzina'},
    {livello_geo: 'provinciale', codice_geo: 'TO', desc_carburante: 'Gasolio'},
];

// Intervalli di date variabili per stressare il range scan sull'indice.
const DATE_RANGES = [
    {startDate: '2026-04-14', endDate: '2026-07-13'}, // ultimi 90 giorni
    {startDate: '2025-07-13', endDate: '2026-07-13'}, // ultimo anno
    {startDate: '2016-01-14', endDate: '2026-07-13'}, // tutto lo storico
];

function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function buildApiUrl() {
    const q = pick(API_QUERIES);
    const d = pick(DATE_RANGES);
    const params = {...q, ...d};
    const qs = Object.keys(params)
        .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`)
        .join('&');
    return `${BASE_URL}/api/statistiche?${qs}`;
}

// eslint-disable-next-line import/no-anonymous-default-export
export default function () {
    group('api', function () {
        const res = http.get(buildApiUrl(), {tags: {scenario: 'api'}});
        check(res, {
            'api status 200': (r) => r.status === 200,
            'api restituisce un array': (r) => {
                try {
                    return Array.isArray(r.json());
                } catch {
                    return false;
                }
            },
        });
    });

    group('page', function () {
        const res = http.get(`${BASE_URL}/statistiche`, {tags: {scenario: 'page'}});
        check(res, {
            'page status 200': (r) => r.status === 200,
        });
    });

    sleep(1);
}
