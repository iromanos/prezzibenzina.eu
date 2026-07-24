import {connectToDatabase} from "@/repos/mysql";


export async function getRegioni() {
    const connection = await connectToDatabase();

    const [rows] = await connection.execute('SELECT * FROM regioni order by name');

    return rows;
}

export async function getProvincieByRegion(region) {
    const connection = await connectToDatabase();

    const [rows] = await connection.execute('SELECT * FROM provincie where regione = ? order by description', [region]);

    return rows;
}

