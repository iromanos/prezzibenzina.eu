import {POST} from './route';
import {connectToDatabase} from '@/repos/mysql';

// Mock the database connection
jest.mock('@/repos/mysql', () => ({
    connectToDatabase: jest.fn(),
}));

jest.mock('next/server', () => ({
    NextResponse: {
        json: jest.fn((body, options) => ({body, options})),
    },
}));

describe('POST /api/reviews/[review_id]/report', () => {
    let mockConnection;
    let mockQuery;
    let mockBeginTransaction;
    let mockCommit;
    let mockRollback;
    let mockEnd;

    beforeEach(() => {
        mockQuery = jest.fn();
        mockBeginTransaction = jest.fn();
        mockCommit = jest.fn();
        mockRollback = jest.fn();
        mockEnd = jest.fn();

        mockConnection = {
            query: mockQuery,
            beginTransaction: mockBeginTransaction,
            commit: mockCommit,
            rollback: mockRollback,
            end: mockEnd,
        };

        connectToDatabase.mockResolvedValue(mockConnection);
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
        mockQuery.mockResolvedValueOnce([[{id: 123}]]);
        // Mock update review status
        mockQuery.mockResolvedValueOnce([{}]);

        const response = await POST(mockRequest, mockParams);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.message).toBe('Review 123 reported successfully');

        expect(connectToDatabase).toHaveBeenCalledTimes(1);
        expect(mockBeginTransaction).toHaveBeenCalledTimes(1);
        expect(mockQuery).toHaveBeenCalledTimes(2);
        expect(mockQuery).toHaveBeenCalledWith(
            'SELECT id FROM reviews WHERE id = ?',
            ['123']
        );
        expect(mockQuery).toHaveBeenCalledWith(
            'UPDATE reviews SET status = ?, updated_at = NOW() WHERE id = ?',
            ['reported', '123']
        );
        expect(mockCommit).toHaveBeenCalledTimes(1);
        expect(mockEnd).toHaveBeenCalledTimes(1);
        expect(mockRollback).not.toHaveBeenCalled();
    });

    it('should return 400 if review_id parameter is missing', async () => {
        const mockRequest = {json: async () => ({user_id: 200})};
        const mockParams = {params: {}};

        const response = await POST(mockRequest, mockParams);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.message).toBe('Missing review_id parameter');
        expect(connectToDatabase).not.toHaveBeenCalled();
    });

    it('should return 400 if user_id of reporter is missing from body', async () => {
        const mockRequest = {json: async () => ({})}; // user_id missing
        const mockParams = {params: {review_id: '123'}};

        const response = await POST(mockRequest, mockParams);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.message).toBe('Missing required field: user_id of the reporter');
        expect(connectToDatabase).not.toHaveBeenCalled();
    });

    it('should return 404 if review is not found', async () => {
        const mockRequest = {json: async () => ({user_id: 200})};
        const mockParams = {params: {review_id: '999'}};

        mockQuery.mockResolvedValueOnce([[]]); // No existing review

        const response = await POST(mockRequest, mockParams);
        const data = await response.json();

        expect(response.status).toBe(404);
        expect(data.message).toBe('Review not found');
        expect(mockRollback).toHaveBeenCalledTimes(1);
        expect(mockEnd).toHaveBeenCalledTimes(1);
    });

    it('should rollback and return 500 if a database error occurs during update', async () => {
        const mockRequest = {json: async () => ({user_id: 200})};
        const mockParams = {params: {review_id: '123'}};

        mockQuery.mockResolvedValueOnce([[{id: 123}]]); // Existing review
        mockQuery.mockRejectedValueOnce(new Error('DB update error')); // Simulate DB error

        const response = await POST(mockRequest, mockParams);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.message).toBe('Error reporting review');
        expect(data.error).toBe('DB update error');
        expect(mockRollback).toHaveBeenCalledTimes(1);
        expect(mockCommit).not.toHaveBeenCalled();
        expect(mockEnd).toHaveBeenCalledTimes(1);
    });
});
