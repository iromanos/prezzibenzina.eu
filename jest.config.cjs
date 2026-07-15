// jest.config.cjs
// File di configurazione Jest per un progetto Next.js.
// Questa configurazione è impostata per transpilare correttamente i moduli ES e JSX
// nei tuoi file di test usando babel-jest, e per gestire gli alias dei percorsi.
module.exports = {
    // Usa 'node' come ambiente di test per i test delle API backend.
    testEnvironment: 'node',

    // File che vengono eseguiti una volta prima di tutte le suite di test.
    // Usato qui per caricare le variabili d'ambiente per i test.
    setupFiles: ['<rootDir>/jest.setup.cjs'],

    // Mappatori dei nomi dei moduli per gestire gli alias dei percorsi (es. '@/' a 'src/').
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
    },

    // Configura come Jest trasforma i file sorgente.
    // Questa regola dice a Jest di usare 'babel-jest' per tutti i file .js, .jsx, .ts, .tsx.
    // Punta esplicitamente al file babel.config.cjs per la configurazione di Babel.
    transform: {
        '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', {configFile: './babel.config.cjs'}],
    },

    // Pattern per i file che Jest NON dovrebbe trasformare.
    // Per impostazione predefinita, i node_modules vengono ignorati.
    // Se hai pacchetti ES module in node_modules che necessitano di transpilazione,
    // potresti doverlo modificare (es. `node_modules/(?!(some-es-module-package-you-need-to-transpile)/)`).
    // Per ora, il comportamento predefinito di ignorare node_modules è solitamente sufficiente.
    transformIgnorePatterns: [
        '/node_modules/', // Ignora tutti i file in node_modules per impostazione predefinita
        // Se hai specifici node_modules che devono essere transpilati (es. usano moduli ES e non sono pre-transpilati)
        // potresti aver bisogno di qualcosa come:
        // '/node_modules/(?!(some-es-module-package-name)/)',
    ],

    // Optional: Se vuoi raccogliere la copertura del codice
    // collectCoverage: true,
    // collectCoverageFrom: ['src/**/*.{js,jsx,ts,tsx}', '!src/**/*.d.ts'],
};