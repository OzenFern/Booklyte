/**
 * Unit tests for the book repository.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import pool from '../../src/db/pool.js';
import {
    createBook,
    deleteBook,
    getAllBooks,
    getBookById,
    patchBook,
    putBook,
} from '../../src/repositories/bookRepository.js';

vi.mock('../../src/db/pool.js', () => ({
    default: {
        query: vi.fn(),
    },
}));

describe('bookRepository', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('getAllBooks fetches every book from the database', async () => {
        const books = [
            { id: 1, title: 'Dune' },
            { id: 2, title: 'Foundation' },
        ];
        pool.query.mockResolvedValue({ rows: books });

        await expect(getAllBooks()).resolves.toEqual(books);
        expect(pool.query).toHaveBeenCalledWith('SELECT * FROM books');
    });

    it('getBookById returns the matching book or null when absent', async () => {
        const expectedBook = { id: 42, title: 'The Hobbit' };
        pool.query.mockResolvedValue({ rows: [expectedBook] });

        await expect(getBookById(42)).resolves.toEqual(expectedBook);
        expect(pool.query).toHaveBeenCalledWith('SELECT * FROM books WHERE book_id = $1', [42]);

        pool.query.mockResolvedValue({ rows: [] });
        await expect(getBookById(99)).resolves.toBeNull();
    });

    it('createBook inserts a new record and returns it', async () => {
        const bookInput = {
            openlibrary_id: 'OL12345M',
            title: 'Pride and Prejudice',
            description: 'A witty romance',
            cover_url: 'https://example.com/cover.jpg',
            published_date: '1813-01-28',
        };
        const createdBook = { id: 8, ...bookInput };
        pool.query.mockResolvedValue({ rows: [createdBook] });

        await expect(createBook(bookInput)).resolves.toEqual(createdBook);
        expect(pool.query).toHaveBeenCalledWith(
            'INSERT INTO books (openlibrary_id, title,description,cover_url, published_date) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [
                'OL12345M',
                'Pride and Prejudice',
                'A witty romance',
                'https://example.com/cover.jpg',
                '1813-01-28',
            ],
        );
    });

    it('putBook fully updates the selected book and returns the updated row', async () => {
        const bookInput = {
            openlibrary_id: 'OL54321M',
            title: 'Jane Eyre',
            description: 'A Gothic novel',
            cover_url: 'https://example.com/jane.jpg',
            published_date: '1847-10-16',
        };
        const updatedBook = { id: 5, ...bookInput };
        pool.query.mockResolvedValue({ rows: [updatedBook] });

        await expect(putBook(5, bookInput)).resolves.toEqual(updatedBook);
        expect(pool.query).toHaveBeenCalledWith(
            'UPDATE books SET openlibrary_id = $1, title = $2, description = $3, cover_url = $4, published_date = $5 WHERE book_id = $6 RETURNING *',
            [
                'OL54321M',
                'Jane Eyre',
                'A Gothic novel',
                'https://example.com/jane.jpg',
                '1847-10-16',
                5,
            ],
        );
    });

    it('patchBook updates only the supplied fields and returns the changed record', async () => {
        const bookInput = { title: 'The Left Hand of Darkness', published_date: '1969-01-01' };
        const patchedBook = {
            id: 12,
            title: 'The Left Hand of Darkness',
            published_date: '1969-01-01',
        };
        pool.query.mockResolvedValue({ rows: [patchedBook] });

        await expect(patchBook(12, bookInput)).resolves.toEqual(patchedBook);
        expect(pool.query).toHaveBeenCalledWith(
            'UPDATE books SET title = $1, published_date = $2 WHERE book_id = $3 RETURNING *',
            ['The Left Hand of Darkness', '1969-01-01', 12],
        );
    });

    it('deleteBook removes a book and returns the deleted row', async () => {
        const deletedBook = { id: 3, title: 'The Silent Patient' };
        pool.query.mockResolvedValue({ rows: [deletedBook] });

        await expect(deleteBook(3)).resolves.toEqual(deletedBook);
        expect(pool.query).toHaveBeenCalledWith(
            'DELETE FROM books WHERE book_id = $1 RETURNING *',
            [3],
        );
    });
});
