import {POST} from './route';
import mysql from 'mysql2/promise';

const mockCommit = jest.fn();
const mockExecute = jest.fn();
const mockBeginTransaction = jest.fn();
const mockRollback = jest.fn();
jest.mock('mysql2/promise', () => {
    return {
        createPool: jest.fn(() => ({
            execute: mockExecute,
            commit: mockCommit,
            rollback: mockRollback,
            beginTransaction: mockBeginTransaction,
        }))
    };
});

jest.mock('next/server', () => ({
    NextResponse: {
        json: jest.fn((body, options) => ({
            status: options?.status || 200,
            json: async () => body, // Simula il comportamento della Web API Response
        })),
    },
}));


describe('POST /api/reviews', () => {

    beforeEach(() => {
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should create a new review and update impianto ratings successfully', async () => {
        const mockRequest = {
            json: async () => ({
                id_impianto: 1,
                user_id: 101,
                rating: 4,
                comment: 'Great service!',
            }),
        };

        mockExecute
            .mockResolvedValueOnce([{insertId: 123}]) // For INSERT INTO reviews
            .mockResolvedValueOnce([[]]); // For UPDATE impianti (result doesn't matter much here)

        const response = await POST(mockRequest);
        const data = await response.json();

        expect(response.status).toBe(201);
        expect(data.message).toBe('Review created successfully');
        expect(data.reviewId).toBe(123);

        expect(mysql.createPool).toHaveBeenCalledTimes(1);
        expect(mockBeginTransaction).toHaveBeenCalledTimes(1);
        expect(mockExecute).toHaveBeenCalledTimes(2);
        expect(mockExecute).toHaveBeenCalledWith(
            'INSERT INTO reviews (id_impianto, user_id, rating, comment) VALUES (?, ?, ?, ?)',
            [1, 101, 4, 'Great service!']
        );
        expect(mockExecute).toHaveBeenCalledWith(
            expect.stringContaining('UPDATE impianti'),
            [1, 1, 1]
        );
        expect(mockCommit).toHaveBeenCalledTimes(1);
        expect(mockRollback).not.toHaveBeenCalled();
    });

    it('should return 400 if required fields are missing', async () => {
        const mockRequest = {
            json: async () => ({
                id_impianto: 1,
                user_id: 101,
                // rating is missing
            }),
        };

        const response = await POST(mockRequest);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.message).toBe('Missing required fields: id_impianto, user_id, rating');
        expect(mysql.createPool).not.toHaveBeenCalled();
    });

    it('should return 400 if rating is out of range', async () => {
        const mockRequest = {
            json: async () => ({
                id_impianto: 1,
                user_id: 101,
                rating: 6, // invalid rating
                comment: 'Too high',
            }),
        };

        const response = await POST(mockRequest);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.message).toBe('Rating must be between 1 and 5');
        expect(mysql.createPool).not.toHaveBeenCalled();
    });

    it('should rollback and return 500 if a database error occurs during insert', async () => {
        const mockRequest = {
            json: async () => ({
                id_impianto: 1,
                user_id: 101,
                rating: 3,
                comment: 'Okay',
            }),
        };

        mockExecute.mockRejectedValueOnce(new Error('DB insert error')); // Simulate DB error

        const response = await POST(mockRequest);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.message).toBe('Error creating review');
        expect(data.error).toBe('DB insert error');

        expect(mysql.createPool).toHaveBeenCalledTimes(1);
        expect(mockBeginTransaction).toHaveBeenCalledTimes(1);
        expect(mockExecute).toHaveBeenCalledTimes(1); // Only the first query failed
        expect(mockRollback).toHaveBeenCalledTimes(1);
        expect(mockCommit).not.toHaveBeenCalled();
    });

    it('should rollback and return 500 if a database error occurs during update', async () => {
        const mockRequest = {
            json: async () => ({
                id_impianto: 1,
                user_id: 101,
                rating: 3,
                comment: 'Okay',
            }),
        };

        mockExecute
            .mockResolvedValueOnce([{insertId: 123}]) // Insert succeeds
            .mockRejectedValueOnce(new Error('DB update error')); // Update fails

        const response = await POST(mockRequest);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.message).toBe('Error creating review');
        expect(data.error).toBe('DB update error');

        expect(mysql.createPool).toHaveBeenCalledTimes(1);
        expect(mockBeginTransaction).toHaveBeenCalledTimes(1);
        expect(mockExecute).toHaveBeenCalledTimes(2);
        expect(mockRollback).toHaveBeenCalledTimes(1);
        expect(mockCommit).not.toHaveBeenCalled();
    });
});
