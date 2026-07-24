import mysql from 'mysql2/promise';

const poolConfig = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0,
    enableKeepAlive: false,
};

export function createPool() {
    if (!global._mysqlPool) {
        console.log('⚠️ CREO UN NUOVO POOL MYSQL!');
        global._mysqlPool = mysql.createPool(poolConfig);
    }
    return global._mysqlPool;
}

/**
 * Returns the database pool.
 * In Next.js, we use a singleton to prevent multiple pools during HMR.
 * NOTE: Never call .end() on the returned object unless the app is shutting down.
 */
export async function connectToDatabase() {
    return createPool();
}
