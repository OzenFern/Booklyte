# API Documentation

## Overview

Booklyte provides a RESTful API for managing books, libraries, and reviews.

## Base URL

```
http://localhost:3000
```

## Authentication

Currently, Booklyte uses session-based authentication. Configure your session secret in the `.env` file.

## Endpoints

### Books

- `GET /books` - List all books
- `GET /books/:id` - Get a specific book
- `POST /books` - Create a new book
- `PUT /books/:id` - Update a book
- `DELETE /books/:id` - Delete a book

### Library

- `GET /library` - View personal library
- `POST /library/books/:id` - Add book to library
- `DELETE /library/books/:id` - Remove book from library

### Reviews

- `GET /library/books/:id/reviews` - Get reviews for a book
- `POST /library/books/:id/reviews` - Add a review
- `PUT /library/books/:id/reviews/:reviewId` - Update a review
- `DELETE /library/books/:id/reviews/:reviewId` - Delete a review

## Data Models

### Book

```json
{
  "id": "string",
  "title": "string",
  "author": "string",
  "isbn": "string",
  "publishedDate": "date",
  "description": "string"
}
```

### Review

```json
{
  "id": "string",
  "bookId": "string",
  "rating": "number",
  "comment": "string",
  "createdAt": "date"
}
```

## Error Handling

All endpoints return standard HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `404` - Not Found
- `500` - Internal Server Error

Error responses follow this format:

```json
{
  "error": "Error message description"
}
```

---

*For detailed implementation, see the [Controllers documentation](Controllers.md)*
