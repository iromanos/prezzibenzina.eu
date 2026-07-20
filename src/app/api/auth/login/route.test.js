// src/app/api/auth/login/route.test.js
import {POST} from './route';
import {NextResponse} from 'next/server';

import mysql from 'mysql2/promise';
import {compare as mockBcryptCompare, hash as mockBcryptHash} from 'bcrypt';

import {sign as mockJwtSign} from '../__mocks__/jsonwebtoken';

const mockEnd = jest.fn(() => Promise.resolve());
const mockExecute = jest.fn();
jest.mock('mysql2/promise', () => {
    return {
        createConnection: jest.fn(() => Promise.resolve({
            execute: mockExecute,
            end: mockEnd,
        })),
    };
});

jest.mock('bcrypt');

jest.mock('next/server', () => ({
    NextResponse: {
        json: jest.fn((body, options) => ({body, options})),
    },
}));

describe('POST /api/auth/login', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockBcryptCompare.mockResolvedValue(true); // Password matches by default
        mockJwtSign.mockReturnValue('mocked_jwt_token');
        mockBcryptHash.mockResolvedValue('hashed_password');
        mysql.createConnection.mockClear();
        mockExecute.mockClear();
        NextResponse.json.mockClear();
    });

    it('should log in a user successfully and return a token', async () => {
        mockExecute.mockResolvedValueOnce([[{id: 1, email: 'test@example.com', password: 'hashed_password'}]]);

        const mockRequest = {
            json: () => Promise.resolve({email: 'test@example.com', password: 'password123'}),
        };

        await POST(mockRequest);

        expect(mysql.createConnection).toHaveBeenCalledTimes(1);
        expect(mockExecute).toHaveBeenCalledWith('SELECT id, email, password FROM users WHERE email = ?', ['test@example.com']);
        expect(mockBcryptCompare).toHaveBeenCalledWith('password123', 'hashed_password');
        expect(mockJwtSign).toHaveBeenCalledWith({
            userId: 1,
            email: 'test@example.com'
        }, process.env.JWT_SECRET, {expiresIn: '1h'});
        expect(NextResponse.json).toHaveBeenCalledWith({
            message: 'Login avvenuto con successo.',
            token: 'mocked_jwt_token'
        }, {status: 200});
    });

    it('should return 400 if email is missing', async () => {
        const mockRequest = {
            json: () => Promise.resolve({password: 'password123'}),
        };

        await POST(mockRequest);

        expect(NextResponse.json).toHaveBeenCalledWith({error: 'Email e password sono obbligatori.'}, {status: 400});
        expect(mysql.createConnection).not.toHaveBeenCalled();
    });

    it('should return 400 if password is missing', async () => {
        const mockRequest = {
            json: () => Promise.resolve({email: 'test@example.com'}),
        };

        await POST(mockRequest);

        expect(NextResponse.json).toHaveBeenCalledWith({error: 'Email e password sono obbligatori.'}, {status: 400});
        expect(mysql.createConnection).not.toHaveBeenCalled();
    });

    it('should return 401 if user not found', async () => {
        mockExecute.mockResolvedValueOnce([[]]); // No user found

        const mockRequest = {
            json: () => Promise.resolve({email: 'nonexistent@example.com', password: 'password123'}),
        };

        await POST(mockRequest);

        expect(mockExecute).toHaveBeenCalledWith('SELECT id, email, password FROM users WHERE email = ?', ['nonexistent@example.com']);
        expect(NextResponse.json).toHaveBeenCalledWith({error: 'Credenziali non valide.'}, {status: 401});
        expect(mockBcryptCompare).not.toHaveBeenCalled();
        expect(mockJwtSign).not.toHaveBeenCalled();
    });

    it('should return 401 if password does not match', async () => {
        mockExecute.mockResolvedValueOnce([[{id: 1, email: 'test@example.com', password: 'hashed_password'}]]);
        mockBcryptCompare.mockResolvedValue(false); // Password does not match

        const mockRequest = {
            json: () => Promise.resolve({email: 'test@example.com', password: 'wrongpassword'}),
        };

        await POST(mockRequest);

        expect(mockBcryptCompare).toHaveBeenCalledWith('wrongpassword', 'hashed_password');
        expect(NextResponse.json).toHaveBeenCalledWith({error: 'Credenziali non valide.'}, {status: 401});
        expect(mockJwtSign).not.toHaveBeenCalled();
    });

    it('should return 500 for database errors', async () => {
        mockExecute.mockRejectedValueOnce(new Error('DB connection failed'));

        const mockRequest = {
            json: () => Promise.resolve({email: 'test@example.com', password: 'password123'}),
        };

        await POST(mockRequest);

        expect(NextResponse.json).toHaveBeenCalledWith({error: 'Errore interno del server.'}, {status: 500});
    });
});