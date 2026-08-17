import { afterEach, describe, expect, it, vi } from 'vitest';
import * as bookRepository from '../../src/repositories/bookRepository.js';
import * as bookService from '../../src/services/bookService.js';
import { handleServiceError } from '../../src/utils/errorHandler.js';

const mocks = vi.hoisted(() => ({
    getAllBooks: vi.fn(),
    getBookById: vi.fn(),
    createBook: vi.fn(),
    putBook: vi.fn(),
    patchBook: vi.fn(),
    deleteBook: vi.fn(),
    handleServiceError: vi.fn((error, message) => ({
        success: false,
        message,
        error: error instanceof Error ? error.message : 'Unknown error',
    })),
}));

vi.mock('../../src/repositories/bookRepository.js', () => ({
    getAllBooks: mocks.getAllBooks,
    getBookById: mocks.getBookById,
    createBook: mocks.createBook,
    putBook: mocks.putBook,
    patchBook: mocks.patchBook,
    deleteBook: mocks.deleteBook,
}));

vi.mock('../../src/utils/errorHandler.js', () => ({
    handleServiceError: mocks.handleServiceError,
}));

describe('bookService error handling', () => {
    afterEach(() => {
        vi.clearAllMocks();
    });

    it('getAllBooks returns an error response when the repository fails', async () => {
        const error = new Error('DB down');
        bookRepository.getAllBooks.mockRejectedValue(error);

        const result = await bookService.getAllBooks();

        expect(handleServiceError).toHaveBeenCalledWith(error, 'Failed to fetch books.');
        expect(result).toEqual({
            success: false,
            message: 'Failed to fetch books.',
            error: 'DB down',
        });
    });

    it('getBookById returns an error response when the repository fails', async () => {
        const error = new Error('Lookup failed');
        bookRepository.getBookById.mockRejectedValue(error);

        const result = await bookService.getBookById(42);

        expect(handleServiceError).toHaveBeenCalledWith(error, 'Failed to fetch book with id 42.');
        expect(result).toEqual({
            success: false,
            message: 'Failed to fetch book with id 42.',
            error: 'Lookup failed',
        });
    });

    it('createBook returns an error response when the repository fails', async () => {
        const error = new Error('Insert failed');
        bookRepository.createBook.mockRejectedValue(error);

        const result = await bookService.createBook({ title: 'Test book' });

        expect(handleServiceError).toHaveBeenCalledWith(error, 'Failed to create book.');
        expect(result).toEqual({
            success: false,
            message: 'Failed to create book.',
            error: 'Insert failed',
        });
    });

    it('putBook returns an error response when the repository fails', async () => {
        const error = new Error('Update failed');
        bookRepository.putBook.mockRejectedValue(error);

        const result = await bookService.putBook(7, { title: 'Updated title' });

        expect(handleServiceError).toHaveBeenCalledWith(error, 'Failed to update book with id 7.');
        expect(result).toEqual({
            success: false,
            message: 'Failed to update book with id 7.',
            error: 'Update failed',
        });
    });

    it('patchBook returns an error response when the repository fails', async () => {
        const error = new Error('Patch failed');
        bookRepository.patchBook.mockRejectedValue(error);

        const result = await bookService.patchBook(9, { title: 'Patched title' });

        expect(handleServiceError).toHaveBeenCalledWith(error, 'Failed to patch book with id 9.');
        expect(result).toEqual({
            success: false,
            message: 'Failed to patch book with id 9.',
            error: 'Patch failed',
        });
    });

    it('deleteBook returns an error response when the repository fails', async () => {
        const error = new Error('Delete failed');
        bookRepository.deleteBook.mockRejectedValue(error);

        const result = await bookService.deleteBook(11);

        expect(handleServiceError).toHaveBeenCalledWith(error, 'Failed to delete book with id 11.');
        expect(result).toEqual({
            success: false,
            message: 'Failed to delete book with id 11.',
            error: 'Delete failed',
        });
    });
});
