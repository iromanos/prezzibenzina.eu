import {NextResponse} from 'next/server';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export async function POST(request) {
    try {
        const {email, password} = await request.json();

        if (!email || !password) {
            return NextResponse.json({error: 'Email e password sono obbligatori.'}, {status: 400});
        }

        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE,
        });

        // Cerca l'utente per email
        const [users] = await connection.execute(
            'SELECT id, email, password FROM users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            connection.end();
            return NextResponse.json({error: 'Credenziali non valide.'}, {status: 401});
        }

        const user = users[0];

        // Confronta la password fornita con l'hash nel database
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            connection.end();
            return NextResponse.json({error: 'Credenziali non valide.'}, {status: 401});
        }

        // Genera un JWT
        const token = jwt.sign(
            {userId: user.id, email: user.email},
            process.env.JWT_SECRET,
            {expiresIn: '1h'} // Il token scade dopo 1 ora
        );

        connection.end();

        return NextResponse.json({message: 'Login avvenuto con successo.', token}, {status: 200});

    } catch (error) {
        console.error('Errore durante il login:', error);
        return NextResponse.json({error: 'Errore interno del server.'}, {status: 500});
    }
}
