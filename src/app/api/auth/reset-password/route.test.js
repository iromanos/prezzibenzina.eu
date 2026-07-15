// src/app/api/auth/reset-password/route.test.js
import {POST} from './route';
import {NextResponse} from 'next/server';

import mysql from 'mysql2/promise';
import {hash as mockBcryptHash} from 'bcrypt';

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

describe('POST /api/auth/reset-password', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mysql.createConnection.mockClear();
        mockExecute.mockClear();
        NextResponse.json.mockClear();
        mockBcryptHash.mockResolvedValue('new_hashed_password');
        jest.spyOn(global.Date, 'now').mockReturnValue(1678886400000); // Mock current time
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should reset password successfully', async () => {
        mockExecute.mockResolvedValueOnce([[{id: 1}]]); // User found with valid token
        mockExecute.mockResolvedValueOnce([{affectedRows: 1}]); // Password updated

        const mockRequest = {
            json: () => Promise.resolve({token: 'valid_token', newPassword: 'newpassword123'}),
        };

        await POST(mockRequest);

        expect(mysql.createConnection).toHaveBeenCalledTimes(1);
        expect(mockExecute).toHaveBeenCalledWith(
            'SELECT id FROM users WHERE reset_password_token = ? AND reset_password_expires > NOW()',
            ['valid_token']
        );
        expect(mockBcryptHash).toHaveBeenCalledWith('newpassword123', 10);
        expect(mockExecute).toHaveBeenCalledWith(
            'UPDATE users SET password_hash = ?, reset_password_token = NULL, reset_password_expires = NULL WHERE id = ?',
            ['new_hashed_password', 1]
        );
        expect(NextResponse.json).toHaveBeenCalledWith({message: 'Password resettata con successo.'}, {status: 200});
    });

    it('should return 400 if token is missing', async () => {
        const mockRequest = {
            json: () => Promise.resolve({newPassword: 'newpassword123'}),
        };

        await POST(mockRequest);

        expect(NextResponse.json).toHaveBeenCalledWith({error: 'Token e nuova password sono obbligatori.'}, {status: 400});
        expect(mysql.createConnection).not.toHaveBeenCalled();
    });

    it('should return 400 if newPassword is missing', async () => {
        const mockRequest = {
            json: () => Promise.resolve({token: 'valid_token'}),
        };

        await POST(mockRequest);

        expect(NextResponse.json).toHaveBeenCalledWith({error: 'Token e nuova password sono obbligatori.'}, {status: 400});
        expect(mysql.createConnection).not.toHaveBeenCalled();
    });

    it('should return 400 if new password is too short', async () => {
        const mockRequest = {
            json: () => Promise.resolve({token: 'valid_token', newPassword: 'short'}),
        };

        await POST(mockRequest);

        expect(NextResponse.json).toHaveBeenCalledWith({error: 'La nuova password deve contenere almeno 6 caratteri.'}, {status: 400});
        expect(mysql.createConnection).not.toHaveBeenCalled();
    });

    it('should return 400 if token is invalid or expired', async () => {
        mockExecute.mockResolvedValueOnce([[]]); // No user found with token

        const mockRequest = {
            json: () => Promise.resolve({token: 'invalid_token', newPassword: 'newpassword123'}),
        };

        await POST(mockRequest);

        expect(mockExecute).toHaveBeenCalledWith(
            'SELECT id FROM users WHERE reset_password_token = ? AND reset_password_expires > NOW()',
            ['invalid_token']
        );
        expect(NextResponse.json).toHaveBeenCalledWith({error: 'Token di reset non valido o scaduto.'}, {status: 400});
        expect(mockBcryptHash).not.toHaveBeenCalled();
    });

    it('should return 500 for database errors', async () => {
        mockExecute.mockRejectedValueOnce(new Error('DB connection failed'));

        const mockRequest = {
            json: () => Promise.resolve({token: 'valid_token', newPassword: 'newpassword123'}),
        };

        await POST(mockRequest);

        expect(NextResponse.json).toHaveBeenCalledWith({error: 'Errore interno del server.'}, {status: 500});
    });
});