import http from 'k6/http';
import {check, sleep} from 'k6';

// 1. CONFIGURAZIONE DEL CARICO (Ramping)
export const options = {
    stages: [
        {duration: '1m', target: 200},  // Sale da 0 a 200 utenti contemporanei in 1 minuto
        // { duration: '3m', target: 500 },  // Rimane stabile a 500 utenti per 3 minuti
        // { duration: '1m', target: 0 },    // Scende a 0 (Ramp-down)
    ],
    thresholds: {
        // Il test fallisce se più dell'1% delle richieste NON restituisce 200 OK
        http_req_failed: ['rate<0.01'],
        // Il 95% delle pagine sane deve rispondere in meno di 250ms (visto che caricano il DB)
        http_req_duration: ['p(95)<250'],
    },
};

// 2. SOLO URL SANI (Tutti devono rispondere 200 OK)
const URLS = [
    'https://www.prezzibenzina.eu/contatti',
    // 'https://www.prezzibenzina.eu/lombardia/benzina/provincia/mi/milano',
    // 'https://www.prezzibenzina.eu/lazio/diesel/provincia/rm/roma',
    // 'https://www.prezzibenzina.eu/toscana/benzina/provincia/fi/firenze',
    // Incolla qui altri URL "buoni" dei tuoi capoluoghi
];

// eslint-disable-next-line import/no-anonymous-default-export
export default function () {
    // Sceglie un URL sano a caso ad ogni iterazione
    const urlCasuale = URLS[Math.floor(Math.random() * URLS.length)];

    const res = http.get(urlCasuale);

    // Il test validerà ESCLUSIVAMENTE l'esito 200
    check(res, {
        'status è 200': (r) => r.status === 200,
    });

    // Simula la pausa di un utente reale prima di cambiare pagina
    sleep(1);
}