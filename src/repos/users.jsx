export async function getUserByEmail(email) {
    const connection = await connectToDatabase();

    const [rows] = await connection.execute('SELECT * FROM users WHERE email = ?', [email]);

    await connection.end();
    
    if (rows.length > 0) {
        return rows[0];
    } else {
        return null;
    }
}


