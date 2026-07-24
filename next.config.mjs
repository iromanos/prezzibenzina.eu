/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    productionBrowserSourceMaps: true,
    logging: {
        fetches: {
            fullUrl: true,
        },
    },
    devIndicators: false,
    experimental: {
        optimizeCss: true, // Abilita l'inlining del CSS critico
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'lh3.googleusercontent.com',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'http',
                hostname: 'localhost',
                port: '8080',
                pathname: '/pb/impianto/**',
            },
            // Configurazione per il server Locale (IP 127.0.0.1)
            {
                protocol: 'http',
                hostname: '127.0.0.1',
                port: '8080',
                pathname: '/pb/impianto/**',
            },
            // Configurazione per l'ambiente di Produzione (Wefuel)
            {
                protocol: 'https',
                hostname: 'www.wefuel.it',
                port: '', // lascia vuoto per le porte standard http/https
                pathname: '/pb/impianto/**',
            },
            {
                protocol: 'https',
                hostname: 'www.wefuel.it',
                pathname: '/**',
            }
        ],
    },
    sassOptions: {
        quietDeps: true, // silenzia warning da dipendenze
    },
    reactStrictMode: false,
    async redirects() {
        return [
            {
                source: '/lombardia/:carburante/provincia/mi/milano',
                destination: '/lombardia/milano/prezzo-:carburante',
                permanent: true,
            },
            {
                source: '/lombardia/:carburante/provincia/mi/milano/marchio/:marchio',
                destination: '/lombardia/milano/prezzo-:carburante-:marchio',
                permanent: true,
            },
            {
                source: '/:segment*/gasolio/:rest*',
                destination: '/:segment*/diesel/:rest*',
                permanent: true,
            },
            {
                source: '/risultati',
                destination: '/mappa',
                permanent: true,
            },
        ];
    },
};

export default nextConfig;
