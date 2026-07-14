// src/app/api/auth/[...nextauth]/route.js

import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

export const authOptions = {
    // Rimosso l'adapter per sbloccare l'installazione.
    // La strategia JWT non richiede un adapter per funzionare.
    // adapter: MySQLAdapter(connection),

    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: {label: "Email", type: "text"},
                password: {label: "Password", type: "password"}
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                const db = await mysql.createConnection({
                    host: process.env.DB_HOST,
                    port: process.env.DB_PORT,
                    user: process.env.DB_USER,
                    password: process.env.DB_PASSWORD,
                    database: process.env.DB_DATABASE,
                });

                const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [credentials.email]);
                const user = rows[0];

                await db.end();

                if (!user) {
                    return null;
                }

                const isValid = await bcrypt.compare(credentials.password, user.password);

                if (isValid) {
                    return {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                    };
                } else {
                    return null;
                }
            }
        })
    ],
    session: {
        strategy: 'jwt',
    },
    callbacks: {
        async jwt({token, user}) {
            if (user) {
                token.id = user.id;
            }
            return token;
        },
        async session({session, token}) {
            if (session.user) {
                session.user.id = token.id;
            }
            return session;
        },
    },
    pages: {
        signIn: '/login',
    },
    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export {handler as GET, handler as POST};
