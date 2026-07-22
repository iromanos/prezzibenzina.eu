import {POST} from './route';
import mysql from 'mysql2/promise';

const mockExecute = jest.fn();
jest.mock('mysql2/promise', () => {
    return {
        createPool: jest.fn(() => ({
            execute: mockExecute,
            commit: jest.fn(),
            rollback: jest.fn(),
            beginTransaction: jest.fn(),
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

describe('POST /api/reviews/[review_id]/report', () => {

    beforeEach(() => {
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should report a review successfully', async () => {
        const mockRequest = {
            json: async () => ({
                user_id: 200, // User reporting
            }),
        };
        const mockParams = {params: {review_id: '123'}};

        // Mock existing review check
        mockExecute.mockResolvedValueOnce([[{id: 123}]]);
        // Mock update review status
        mockExecute.mockResolvedValueOnce([{}]);

        const response = await POST(mockRequest, mockParams);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.message).toBe('Review 123 reported successfully');

        expect(mysql.createPool).toHaveBeenCalledTimes(1);
        expect(mockExecute).toHaveBeenCalledTimes(2);
        expect(mockExecute).toHaveBeenCalledWith(
            'SELECT id FROM reviews WHERE id = ?',
            ['123']
        );
        expect(mockExecute).toHaveBeenCalledWith(
            'UPDATE reviews SET status = ?, updated_at = NOW() WHERE id = ?',
            ['reported', '123']
        );
    });

    it('should return 400 if review_id parameter is missing', async () => {
        const mockRequest = {json: async () => ({user_id: 200})};
        const mockParams = {params: {}};

        const response = await POST(mockRequest, mockParams);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.message).toBe('Missing review_id parameter');
        expect(mysql.createPool).not.toHaveBeenCalled();
    });

    it('should return 400 if user_id of reporter is missing from body', async () => {
        const mockRequest = {json: async () => ({})}; // user_id missing
        const mockParams = {params: {review_id: '123'}};

        const response = await POST(mockRequest, mockParams);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.message).toBe('Missing required field: user_id of the reporter');
        expect(mysql.createPool).not.toHaveBeenCalled();
    });

    it('should return 404 if review is not found', async () => {
        const mockRequest = {json: async () => ({user_id: 200})};
        const mockParams = {params: {review_id: '999'}};

        mockExecute.mockResolvedValueOnce([[]]); // No existing review

        const response = await POST(mockRequest, mockParams);
        const data = await response.json();

        expect(response.status).toBe(404);
        expect(data.message).toBe('Review not found');
    });

    it('should rollback and return 500 if a database error occurs during update', async () => {
        const mockRequest = {json: async () => ({user_id: 200})};
        const mockParams = {params: {review_id: '123'}};

        mockExecute.mockResolvedValueOnce([[{id: 123}]]); // Existing review
        mockExecute.mockRejectedValueOnce(new Error('DB update error')); // Simulate DB error

        const response = await POST(mockRequest, mockParams);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.message).toBe('Error reporting review');
        expect(data.error).toBe('DB update error');
    });
});
