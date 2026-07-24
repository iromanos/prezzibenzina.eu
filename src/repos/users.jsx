import {connectToDatabase} from './mysql';

export async function getUserByEmail(email) {
    const connection = await connectToDatabase();

    const [rows] = await connection.execute('SELECT * FROM users WHERE email = ?', [email]);

    // await connection.end();
    
    if (rows.length > 0) {
        return rows[0];
    } else {
        return null;
    }
}

export async function createUser({email, name, googleId, avatar}) {
    const connection = await connectToDatabase();

    let user;

    // 1. Controlla se l'utente esiste già
    const existingUsers = await getUserByEmail(email);

    if (existingUsers !== null) {
        // 2. Se l'utente esiste, aggiorna il record
        const userId = existingUsers.id;
        await connection.execute(
            'UPDATE users SET name = ?, google_id = ?, avatar = ?, updated_at = NOW() WHERE id = ?',
            [name, googleId, avatar, userId]
        );
        // Recupera l'utente aggiornato
        const [updatedRows] = await connection.execute('SELECT * FROM users WHERE id = ?', [userId]);
        user = updatedRows[0];
    } else {
        // 3. Se l'utente non esiste, inserisci un nuovo record
        await connection.execute(
            'INSERT INTO users (email, name, google_id, avatar, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())',
            [email, name, googleId, avatar]
        );
        // Recupera l'utente appena creato
        const [newRows] = await connection.execute('SELECT * FROM users WHERE email = ?', [email]);
        user = newRows[0];
    }

    // await connection.end();

    return user;
}