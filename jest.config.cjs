// jest.config.js
module.exports = {
    testEnvironment: 'node',
    setupFiles: ['<rootDir>/jest.setup.cjs'], // Per le variabili d'ambiente
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1', // Per risolvere gli alias del percorso
    },
};