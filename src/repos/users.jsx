import {connectToDatabase} from './mysql.jsx';

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

export async function createUser({email, name, googleId, avatar}) {
    const connection = await connectToDatabase();

    // Inseriamo il nuovo utente nel database
    await connection.execute(
        'INSERT INTO users (email, name, google_id, avatar, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())',
        [email, name, googleId, avatar]
    );

    // Recuperiamo l'utente appena creato per restituirne i dati completi
    const [rows] = await connection.execute('SELECT * FROM users WHERE email = ?', [email]);

    await connection.end();

    return rows[0];
}
