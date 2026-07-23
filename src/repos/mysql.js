import mysql from 'mysql2/promise';

export async function connectToDatabase() {
    return createPool();
    /*
    return mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
    });*/
}

export function createPool() {

    if (!global._mysqlPool) {

        global._mysqlPool = mysql.createPool({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE,
            waitForConnections: true,
            connectionLimit: 50,
            queueLimit: 0
        });
    }

    return global._mysqlPool;

}
