import {DELETE, PUT} from './route';
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


describe('PUT /api/reviews/[review_id]', () => {
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

    it('should update a review and recalculate impianto ratings successfully', async () => {
        const mockRequest = {
            json: async () => ({
                user_id: 101,
                rating: 3,
                comment: 'Updated comment',
            }),
        };
        const mockParams = {params: {review_id: '123'}};

        // Mock existing review check
        mockQuery.mockResolvedValueOnce([[{id_impianto: 1, user_id: 101}]]);
        // Mock update review
        mockQuery.mockResolvedValueOnce([{}]);
        // Mock recalculate impianto ratings
        mockQuery.mockResolvedValueOnce([[]]);

        const response = await PUT(mockRequest, mockParams);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.message).toBe('Review updated successfully');

        expect(connectToDatabase).toHaveBeenCalledTimes(1);
        expect(mockBeginTransaction).toHaveBeenCalledTimes(1);
        expect(mockQuery).toHaveBeenCalledTimes(3);
        expect(mockQuery).toHaveBeenCalledWith(
            'SELECT id_impianto, user_id FROM reviews WHERE id = ?',
            ['123']
        );
        expect(mockQuery).toHaveBeenCalledWith(
            'UPDATE reviews SET rating = ?, comment = ?, updated_at = NOW() WHERE id = ?',
            [3, 'Updated comment', '123']
        );
        expect(mockQuery).toHaveBeenCalledWith(
            expect.stringContaining('UPDATE impianti'),
            [1, 1, 1]
        );
        expect(mockCommit).toHaveBeenCalledTimes(1);
        expect(mockEnd).toHaveBeenCalledTimes(1);
        expect(mockRollback).not.toHaveBeenCalled();
    });

    it('should return 400 if review_id parameter is missing', async () => {
        const mockRequest = {json: async () => ({user_id: 101, rating: 3})};
        const mockParams = {params: {}};

        const response = await PUT(mockRequest, mockParams);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.message).toBe('Missing review_id parameter');
        expect(connectToDatabase).not.toHaveBeenCalled();
    });

    it('should return 400 if user_id or rating is missing from body', async () => {
        const mockRequest = {json: async () => ({rating: 3})}; // user_id missing
        const mockParams = {params: {review_id: '123'}};

        const response = await PUT(mockRequest, mockParams);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.message).toBe('Missing required fields: user_id, rating');
        expect(connectToDatabase).not.toHaveBeenCalled();
    });

    it('should return 400 if rating is out of range', async () => {
        const mockRequest = {json: async () => ({user_id: 101, rating: 0})};
        const mockParams = {params: {review_id: '123'}};

        const response = await PUT(mockRequest, mockParams);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.message).toBe('Rating must be between 1 and 5');
        expect(connectToDatabase).not.toHaveBeenCalled();
    });

    it('should return 404 if review is not found', async () => {
        const mockRequest = {json: async () => ({user_id: 101, rating: 3})};
        const mockParams = {params: {review_id: '999'}};

        mockQuery.mockResolvedValueOnce([[]]); // No existing review

        const response = await PUT(mockRequest, mockParams);
        const data = await response.json();

        expect(response.status).toBe(404);
        expect(data.message).toBe('Review not found');
        expect(mockRollback).toHaveBeenCalledTimes(1);
        expect(mockEnd).toHaveBeenCalledTimes(1);
    });

    it('should return 403 if user is not the owner of the review', async () => {
        const mockRequest = {json: async () => ({user_id: 999, rating: 3})}; // Different user_id
        const mockParams = {params: {review_id: '123'}};

        mockQuery.mockResolvedValueOnce([[{id_impianto: 1, user_id: 101}]]); // Review owned by 101

        const response = await PUT(mockRequest, mockParams);
        const data = await response.json();

        expect(response.status).toBe(403);
        expect(data.message).toBe('Unauthorized: You can only update your own reviews');
        expect(mockRollback).toHaveBeenCalledTimes(1);
        expect(mockEnd).toHaveBeenCalledTimes(1);
    });

    it('should rollback and return 500 if a database error occurs during update', async () => {
        const mockRequest = {json: async () => ({user_id: 101, rating: 3})};
        const mockParams = {params: {review_id: '123'}};

        mockQuery.mockResolvedValueOnce([[{id_impianto: 1, user_id: 101}]]); // Existing review
        mockQuery.mockRejectedValueOnce(new Error('DB update error')); // Simulate DB error

        const response = await PUT(mockRequest, mockParams);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.message).toBe('Error updating review');
        expect(data.error).toBe('DB update error');
        expect(mockRollback).toHaveBeenCalledTimes(1);
        expect(mockCommit).not.toHaveBeenCalled();
        expect(mockEnd).toHaveBeenCalledTimes(1);
    });
});

describe('DELETE /api/reviews/[review_id]', () => {
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

    it('should delete a review and recalculate impianto ratings successfully', async () => {
        const mockRequest = {
            json: async () => ({
                user_id: 101,
            }),
        };
        const mockParams = {params: {review_id: '123'}};

        // Mock existing review check
        mockQuery.mockResolvedValueOnce([[{id_impianto: 1, user_id: 101}]]);
        // Mock delete review
        mockQuery.mockResolvedValueOnce([{}]);
        // Mock recalculate impianto ratings
        mockQuery.mockResolvedValueOnce([[]]);

        const response = await DELETE(mockRequest, mockParams);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.message).toBe('Review deleted successfully');

        expect(connectToDatabase).toHaveBeenCalledTimes(1);
        expect(mockBeginTransaction).toHaveBeenCalledTimes(1);
        expect(mockQuery).toHaveBeenCalledTimes(3);
        expect(mockQuery).toHaveBeenCalledWith(
            'SELECT id_impianto, user_id FROM reviews WHERE id = ?',
            ['123']
        );
        expect(mockQuery).toHaveBeenCalledWith(
            'DELETE FROM reviews WHERE id = ?',
            ['123']
        );
        expect(mockQuery).toHaveBeenCalledWith(
            expect.stringContaining('UPDATE impianti'),
            [1, 1, 1]
        );
        expect(mockCommit).toHaveBeenCalledTimes(1);
        expect(mockEnd).toHaveBeenCalledTimes(1);
        expect(mockRollback).not.toHaveBeenCalled();
    });

    it('should return 400 if review_id parameter is missing', async () => {
        const mockRequest = {json: async () => ({user_id: 101})};
        const mockParams = {params: {}};

        const response = await DELETE(mockRequest, mockParams);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.message).toBe('Missing review_id parameter');
        expect(connectToDatabase).not.toHaveBeenCalled();
    });

    it('should return 400 if user_id is missing from body', async () => {
        const mockRequest = {json: async () => ({})}; // user_id missing
        const mockParams = {params: {review_id: '123'}};

        const response = await DELETE(mockRequest, mockParams);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.message).toBe('Missing required field: user_id');
        expect(connectToDatabase).not.toHaveBeenCalled();
    });

    it('should return 404 if review is not found', async () => {
        const mockRequest = {json: async () => ({user_id: 101})};
        const mockParams = {params: {review_id: '999'}};

        mockQuery.mockResolvedValueOnce([[]]); // No existing review

        const response = await DELETE(mockRequest, mockParams);
        const data = await response.json();

        expect(response.status).toBe(404);
        expect(data.message).toBe('Review not found');
        expect(mockRollback).toHaveBeenCalledTimes(1);
        expect(mockEnd).toHaveBeenCalledTimes(1);
    });

    it('should return 403 if user is not the owner of the review', async () => {
        const mockRequest = {json: async () => ({user_id: 999})}; // Different user_id
        const mockParams = {params: {review_id: '123'}};

        mockQuery.mockResolvedValueOnce([[{id_impianto: 1, user_id: 101}]]); // Review owned by 101

        const response = await DELETE(mockRequest, mockParams);
        const data = await response.json();

        expect(response.status).toBe(403);
        expect(data.message).toBe('Unauthorized: You can only delete your own reviews');
        expect(mockRollback).toHaveBeenCalledTimes(1);
        expect(mockEnd).toHaveBeenCalledTimes(1);
    });

    it('should rollback and return 500 if a database error occurs during delete', async () => {
        const mockRequest = {json: async () => ({user_id: 101})};
        const mockParams = {params: {review_id: '123'}};

        mockQuery.mockResolvedValueOnce([[{id_impianto: 1, user_id: 101}]]); // Existing review
        mockQuery.mockRejectedValueOnce(new Error('DB delete error')); // Simulate DB error

        const response = await DELETE(mockRequest, mockParams);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.message).toBe('Error deleting review');
        expect(data.error).toBe('DB delete error');
        expect(mockRollback).toHaveBeenCalledTimes(1);
        expect(mockCommit).not.toHaveBeenCalled();
        expect(mockEnd).toHaveBeenCalledTimes(1);
    });
});
