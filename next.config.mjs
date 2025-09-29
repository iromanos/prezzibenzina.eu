/** @type {import('next').NextConfig} */
const nextConfig = {

    sassOptions: {
        quietDeps: true, // silenzia warning da dipendenze
    },

    async redirects() {
        return [
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
