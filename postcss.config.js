module.exports = {
    plugins: [
        'postcss-flexbugs-fixes',
        [
            'postcss-preset-env',
            {
                autoprefixer: {
                    flexbox: 'no-2009',
                },
                stage: 3,
                features: {
                    'custom-properties': false,
                },
            },
        ],
        // Attiviamo PurgeCSS SOLO in produzione per non rallentare l'ambiente di sviluppo
        process.env.NODE_ENV === 'production'
            ? [
                '@fullhuman/postcss-purgecss',
                {
                    // Dice a PurgeCSS quali file scansionare per cercare le classi utilizzate
                    content: [
                        './components/**/*.{js,jsx}',
                        './app/**/*.{js,jsx}',
                        './src/**/*.{js,jsx}',
                    ],
                    // Lista di classi da NON toccare mai (es. tag base o classi dinamiche)
                    safelist: {
                        standard: ['html', 'body', 'ul', 'ol', 'li'],
                        // Riconosce i prefissi classici delle transizioni di Bootstrap o librerie esterne
                        greedy: [/fade/, /show/, /modal/, /dropdown/, /^maplibregl-/]
                    },
                    defaultExtractor: (content) => content.match(/[\w-/:]+(?<!:)/g) || [],
                },
            ]
            : false,
    ].filter(Boolean),
}