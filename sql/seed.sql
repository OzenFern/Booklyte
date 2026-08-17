-- ============================================================
-- Booklyte Database Seed
-- ============================================================
--
-- This file populates the Booklyte database with development
-- and testing data.
--
-- The data is intentionally varied so that different parts of
-- the application can be tested:
--
--   - Books with and without reviews
--   - Multiple library statuses
--   - Multiple authors
--   - Different ratings
--   - Books that have not been reviewed yet
--
-- IMPORTANT:
-- This is DEVELOPMENT seed data.
-- It deletes existing records before inserting the seed data.
--
-- Run schema.sql before running this file.
-- ============================================================


BEGIN;


-- ============================================================
-- RESET EXISTING DATA
-- ============================================================
--
-- The tables are cleared in reverse dependency order so that
-- foreign-key constraints are not violated.
--
-- RESTART IDENTITY resets SERIAL sequences so that IDs begin
-- from 1 again.
--
-- CASCADE removes dependent records where necessary.
-- ============================================================

TRUNCATE TABLE
    reviews,
    library_books,
    book_authors,
    books,
    authors
    RESTART IDENTITY CASCADE;


-- ============================================================
-- AUTHORS
-- ============================================================
--
-- Stores authors independently from books.
--
-- A single author can be associated with multiple books.
-- The relationship between books and authors is handled by
-- the book_authors junction table.
--
-- openlibrary_id represents the corresponding author ID from
-- the Open Library API.
-- ============================================================

INSERT INTO authors (
    openlibrary_id,
    name
)
VALUES
    ('OL26320A', 'J.R.R. Tolkien'),
    ('OL2162283A', 'George Orwell'),
    ('OL4684122A', 'Frank Herbert'),
    ('OL27448A', 'Douglas Adams'),
    ('OL665887A', 'Jane Austen'),
    ('OL24012A', 'Paulo Coelho'),
    ('OL103395A', 'Robert C. Martin'),
    ('OL34184A', 'Fyodor Dostoevsky'),
    ('OL23919A', 'Agatha Christie'),
    ('OL7353617A', 'Andy Weir');


-- ============================================================
-- BOOKS
-- ============================================================
--
-- Stores the core metadata of each book.
--
-- The openlibrary_id uniquely identifies the corresponding
-- book in Open Library.
--
-- cover_url contains a URL to the book cover image.
-- ============================================================

INSERT INTO books (
    openlibrary_id,
    title,
    description,
    cover_url,
    published_date
)
VALUES

    (
        'OL27448W',
        'The Hobbit',
        'Bilbo Baggins, a quiet hobbit who prefers a comfortable life, is drawn into an unexpected adventure with a group of dwarves and the wizard Gandalf.',
        'https://covers.openlibrary.org/b/isbn/9780547928227-L.jpg',
        '1937-09-21'
    ),

    (
        'OL1168007W',
        '1984',
        'A dystopian novel following Winston Smith as he struggles against a totalitarian government that controls information, history, and even thought.',
        'https://covers.openlibrary.org/b/isbn/9780451524935-L.jpg',
        '1949-06-08'
    ),

    (
        'OL893415W',
        'Dune',
        'Paul Atreides and his family become involved in a struggle for control of Arrakis, a desert planet whose valuable spice drives the economy of the universe.',
        'https://covers.openlibrary.org/b/isbn/9780441172719-L.jpg',
        '1965-08-01'
    ),

    (
        'OL2722269W',
        'The Hitchhiker''s Guide to the Galaxy',
        'Arthur Dent discovers that Earth is about to be demolished to make way for a hyperspace bypass, beginning an absurd journey through space.',
        'https://covers.openlibrary.org/b/isbn/9780345391803-L.jpg',
        '1979-10-12'
    ),

    (
        'OL66554W',
        'Pride and Prejudice',
        'Elizabeth Bennet navigates family expectations, social conventions, and her complicated relationship with the wealthy and seemingly arrogant Mr. Darcy.',
        'https://covers.openlibrary.org/b/isbn/9780141439518-L.jpg',
        '1813-01-28'
    ),

    (
        'OL6454887W',
        'The Alchemist',
        'Santiago, a young shepherd, travels in pursuit of a recurring dream and discovers lessons about destiny, perseverance, and following one''s dreams.',
        'https://covers.openlibrary.org/b/isbn/9780062315007-L.jpg',
        '1988-01-01'
    ),

    (
        'OL2818602W',
        'Clean Code',
        'A practical guide to writing readable, maintainable, and professional software, covering principles, practices, and techniques for improving code quality.',
        'https://covers.openlibrary.org/b/isbn/9780132350884-L.jpg',
        '2008-08-01'
    ),

    (
        'OL66504W',
        'Crime and Punishment',
        'Raskolnikov, a poor former student in St. Petersburg, commits a murder and struggles with guilt, morality, and the psychological consequences of his actions.',
        'https://covers.openlibrary.org/b/isbn/9780140449136-L.jpg',
        '1866-01-01'
    ),

    (
        'OL2767057W',
        'And Then There Were None',
        'Ten strangers are invited to an isolated island where they gradually realize that they are being killed one by one according to the verses of a nursery rhyme.',
        'https://covers.openlibrary.org/b/isbn/9780062073488-L.jpg',
        '1939-11-06'
    ),

    (
        'OL17860739W',
        'The Martian',
        'After being stranded alone on Mars, astronaut Mark Watney must use his scientific knowledge and ingenuity to survive while NASA works to bring him home.',
        'https://covers.openlibrary.org/b/isbn/9780553418026-L.jpg',
        '2011-02-11'
    );


-- ============================================================
-- BOOK AUTHORS
-- ============================================================
--
-- Establishes the many-to-many relationship between books
-- and authors.
--
-- Example:
--
--     The Hobbit
--          |
--          | book_authors
--          |
--     J.R.R. Tolkien
--
-- The composite primary key prevents the same author from
-- being associated with the same book more than once.
-- ============================================================

INSERT INTO book_authors (
    book_id,
    author_id
)
VALUES
    -- The Hobbit
    (1, 1),

    -- 1984
    (2, 2),

    -- Dune
    (3, 3),

    -- The Hitchhiker's Guide to the Galaxy
    (4, 4),

    -- Pride and Prejudice
    (5, 5),

    -- The Alchemist
    (6, 6),

    -- Clean Code
    (7, 7),

    -- Crime and Punishment
    (8, 8),

    -- And Then There Were None
    (9, 9),

    -- The Martian
    (10, 10);


-- ============================================================
-- LIBRARY BOOKS
-- ============================================================
--
-- Represents the relationship between the user and a book.
--
-- The status describes the user's current reading state:
--
--     want_to_read
--     reading
--     completed
--     dropped
--
-- book_id is UNIQUE, meaning a book can only appear once in
-- the user's library.
-- ============================================================

INSERT INTO library_books (
    book_id,
    status
)
VALUES

    -- Completed books
    (1, 'completed'),       -- The Hobbit
    (2, 'completed'),       -- 1984
    (4, 'completed'),       -- The Hitchhiker's Guide
    (6, 'completed'),       -- The Alchemist
    (10, 'completed'),      -- The Martian

    -- Currently reading
    (3, 'reading'),         -- Dune
    (7, 'reading'),         -- Clean Code

    -- Want to read
    (5, 'want_to_read'),    -- Pride and Prejudice
    (9, 'want_to_read'),    -- And Then There Were None

    -- Dropped
    (8, 'dropped');         -- Crime and Punishment


-- ============================================================
-- REVIEWS
-- ============================================================
--
-- Stores the user's rating and written review for a book in
-- their library.
--
-- A library book can have at most one review because
-- library_book_id is UNIQUE.
--
-- Rating uses NUMERIC(2,1), allowing values such as:
--
--     0.0
--     2.5
--     4.0
--     4.5
--     5.0
--
-- Not every library book has a review. This is intentional and
-- allows the application to test both reviewed and unreviewed
-- books.
-- ============================================================

INSERT INTO reviews (
    library_book_id,
    rating,
    review_text
)
VALUES

    (
        1,
        4.5,
        'A fantastic introduction to Middle-earth. The adventure, characters, and world-building make this an incredibly enjoyable read.'
    ),

    (
        2,
        5.0,
        'Brilliant and unsettling. Its ideas about surveillance, propaganda, and control remain disturbingly relevant.'
    ),

    (
        3,
        4.5,
        'Dense but rewarding. The world-building is enormous, and the political and ecological themes make it much more than a typical science-fiction novel.'
    ),

    (
        4,
        4.0,
        'Absurd, hilarious, and wonderfully strange. Douglas Adams turns ridiculous situations into genuinely memorable comedy.'
    ),

    (
        6,
        3.5,
        'Simple and motivational. Some ideas feel repetitive, but the overall message about pursuing meaningful goals is enjoyable.'
    ),

    (
        7,
        4.5,
        'Extremely useful for anyone learning software development. Some principles require experience to fully appreciate, but the examples are valuable.'
    ),

    (
        10,
        5.0,
        'One of the most entertaining science-fiction survival stories I have read. The problem-solving and scientific reasoning make the story especially satisfying.'
    );


-- ============================================================
-- COMMIT
-- ============================================================
--
-- If all INSERT statements succeeded, permanently apply the
-- seed data to the database.
-- ============================================================

COMMIT;