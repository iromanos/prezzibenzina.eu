// babel.config.cjs
// Configurazione Babel specifica per Jest.
// Assicura che Jest possa comprendere la sintassi moderna di JavaScript (ES Modules, JSX)
// utilizzata nei tuoi file di test.
module.exports = {
    presets: [
        // Transpila il JavaScript moderno in una versione compatibile con l'ambiente Node.js
        // in cui Jest viene eseguito.
        ['@babel/preset-env', {targets: {node: 'current'}}],
        // Transpila la sintassi JSX di React. 'automatic' è il runtime standard per React 17+.
        ['@babel/preset-react', {runtime: 'automatic'}],
    ],
    // Se utilizzi funzionalità sperimentali o plugin specifici di Next.js
    // che non sono coperti da questi preset, potresti doverli aggiungere qui.
    // Per la maggior parte dei casi, questa configurazione è sufficiente per i test.
};