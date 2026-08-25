-- =======================================================================
-- This file contains the SQL schema for the database.
-- It defines the structure of the tables and their relationships.
-- =======================================================================

-- books table --
CREATE TABLE books (
                       book_id SERIAL PRIMARY KEY,
                       openlibrary_id VARCHAR(50) UNIQUE NOT NULL,
                       title TEXT NOT NULL,
                       description TEXT,
                       cover_url TEXT,
                       published_date DATE,
                       created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                       updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- authors table --
CREATE TABLE authors (
                         author_id SERIAL PRIMARY KEY,
                         openlibrary_id VARCHAR(50) UNIQUE,
                         name TEXT NOT NULL,
                         created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- book_authors table --
CREATE TABLE book_authors (
    -- ON DELETE CASCADE ensures that if a book or author is deleted, the corresponding entries in this table are also removed
                              book_id INT NOT NULL REFERENCES books(book_id) ON DELETE CASCADE,
                              author_id INT NOT NULL REFERENCES authors(author_id) ON DELETE CASCADE,
                              PRIMARY KEY (book_id, author_id)
);

-- library_books table --
CREATE TABLE library_books (
                               library_book_id SERIAL PRIMARY KEY,
                               book_id INT UNIQUE NOT NULL REFERENCES books(book_id) ON DELETE CASCADE,
                               status VARCHAR(30) CHECK ( status IN ('want_to_read', 'reading', 'completed', 'dropped') )
);

-- reviews table --
CREATE TABLE reviews (
                         review_id SERIAL PRIMARY KEY,
                         library_book_id INT UNIQUE NOT NULL
                             REFERENCES library_books(library_book_id) ON DELETE CASCADE,
                         rating NUMERIC(2,1) CHECK (rating BETWEEN 0 AND 5),
                         review_text TEXT,
                         created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                         updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);