# Booklyte

A lightweight book tracking application built with Node.js, Express, and PostgreSQL. Booklyte helps you manage your personal library, track reading progress, and discover new books through integration with the Open Library API.

## Features

- **Book Discovery**: Search and import books from the Open Library API
- **Personal Library**: Manage your personal book collection with custom statuses
- **Reading Progress**: Track books with statuses (Want to Read, Reading, Completed, Dropped)
- **Reviews & Ratings**: Add personal reviews and ratings to your library entries
- **Modern UI**: Clean, responsive interface built with EJS and HTMX
- **Session Management**: Secure session-based authentication
- **Comprehensive Documentation**: Auto-generated API documentation from JSDoc comments

## Tech Stack

### Backend

- **Node.js** - JavaScript runtime
- **Express** - Web application framework
- **PostgreSQL** - Relational database
- **EJS** - Template engine for server-side rendering
- **HTMX** - Dynamic frontend interactions

### Security & Performance

- **Helmet** - Security headers
- **Compression** - Response compression
- **Express Session** - Session management
- **Connect Flash** - Flash messages

### Development Tools

- **Vitest** - Testing framework
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **JSDoc** - Documentation generation

## Installation

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/OzenFern/Booklyte.git
   cd Booklyte
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and configure the following variables:

   ```env
   # Server
   APP_PORT=3000

   # Database
   DB_USER=your_database_user
   DB_HOST=localhost
   DB_NAME=booklyte
   DB_PASSWORD=your_database_password
   DB_PORT=5432

   # Session
   SESSION_SECRET=your_session_secret_here
   ```

4. **Set up the database**

   ```bash
   # Create the database
   createdb booklyte

   # Run the schema
   psql -U your_user -d booklyte -f sql/schema.sql

   # (Optional) Run seed data
   psql -U your_user -d booklyte -f sql/seed.sql
   ```

5. **Start the development server**

   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:3000`

## Usage

### Running the Application

- **Development mode** (with hot reload):

  ```bash
  npm run dev
  ```

- **Production mode**:
  ```bash
  npm start
  ```

### Testing

- **Run tests in watch mode**:

  ```bash
  npm test
  ```

- **Run tests once**:
  ```bash
  npm run test:run
  ```

### Code Quality

- **Lint code**:

  ```bash
  npm run lint
  ```

- **Fix linting issues**:

  ```bash
  npm run lint:fix
  ```

- **Format code**:

  ```bash
  npm run format
  ```

- **Check formatting**:
  ```bash
  npm run format:check
  ```

### Documentation

- **Generate HTML documentation**:

  ```bash
  npm run docs
  ```

- **Generate wiki documentation**:
  ```bash
  npm run docs:wiki
  ```

## Project Structure

```
Booklyte/
├── src/
│   ├── controllers/       # Request handlers
│   │   ├── bookController.js
│   │   ├── libraryController.js
│   │   ├── pageController.js
│   │   └── reviewController.js
│   ├── services/          # Business logic
│   │   ├── bookService.js
│   │   ├── libraryService.js
│   │   └── reviewService.js
│   ├── repositories/      # Database access layer
│   │   ├── authorRepository.js
│   │   ├── bookRepository.js
│   │   ├── libraryRepository.js
│   │   └── reviewRepository.js
│   ├── routes/           # Route definitions
│   │   ├── bookRoutes.js
│   │   ├── libraryRoutes.js
│   │   ├── pageRoutes.js
│   │   ├── reviewsRoutes.js
│   │   └── index.js
│   ├── middlewares/      # Express middleware
│   │   ├── cache.js
│   │   ├── errorHandler.js
│   │   ├── notFound.js
│   │   └── index.js
│   ├── integrations/     # External API integrations
│   │   └── openLibrary/
│   │       ├── openLibraryClient.js
│   │       └── openLibraryService.js
│   ├── utils/            # Utility functions
│   │   ├── errorHandler.js
│   │   └── validationHandler.js
│   ├── config/           # Configuration files
│   │   └── env.js
│   ├── db/               # Database connection
│   │   └── pool.js
│   ├── views/            # EJS templates
│   │   ├── books/
│   │   ├── library/
│   │   ├── pages/
│   │   ├── errors/
│   │   └── partials/
│   ├── app.js            # Express app configuration
│   └── server.js         # Server entry point
├── public/               # Static assets
│   ├── css/
│   │   ├── base/
│   │   ├── components/
│   │   ├── layout/
│   │   └── pages/
│   └── js/
│       ├── main.js
│       └── modules/
├── scripts/              # Utility scripts
│   └── sync-wiki.js
├── sql/                  # Database files
│   ├── schema.sql
│   └── seed.sql
├── tests/                # Test files
├── docs/                 # Generated JSDoc HTML documentation
└── .github/              # GitHub workflows
    └── workflows/
        └── documentation.yml
```

## Database Schema

The application uses PostgreSQL with the following main tables:

- **books** - Book metadata from Open Library
- **authors** - Author information
- **book_authors** - Many-to-many relationship between books and authors
- **library_books** - User's personal library entries with reading status
- **reviews** - User reviews and ratings for library entries

### Reading Status Types

- `want_to_read` - Books you plan to read
- `reading` - Books currently being read
- `completed` - Books you've finished
- `dropped` - Books you've stopped reading

## API Routes

### Pages

- `GET /` - Home page
- `GET /books` - Book browsing page
- `GET /library` - Personal library page

### Books

- `GET /books/search` - Search books from Open Library API
- `GET /books/:id` - View book details
- `POST /books` - Add new book manually

### Library

- `GET /library` - View personal library
- `GET /library/new` - Add book to library form
- `POST /library` - Add book to library
- `GET /library/:id` - View library entry details
- `GET /library/:id/edit` - Edit library entry
- `POST /library/:id` - Update library entry status
- `DELETE /library/:id` - Remove book from library

### Reviews

- `GET /library/books/:id/reviews` - View reviews for a library entry
- `POST /library/books/:id/reviews` - Add or update review

## Documentation

Comprehensive documentation is available in multiple formats:

- **[HTML Documentation](https://OzenFern.github.io/Booklyte/docs/)** - Detailed API documentation generated from JSDoc comments
- **[GitHub Wiki](https://github.com/OzenFern/Booklyte/wiki)** - Project documentation, API reference, and guides
- **[Documentation Guide](DOCUMENTATION.md)** - How to use and contribute to the documentation system

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests and linting (`npm test && npm run lint`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Code Style

- Follow ESLint configuration
- Use Prettier for code formatting
- Add JSDoc comments for functions and modules
- Write tests for new features

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Open Library API](https://openlibrary.org/) for providing book data
- Built with modern web technologies and best practices

## Support

For issues, questions, or contributions, please visit:

- [GitHub Issues](https://github.com/OzenFern/Booklyte/issues)
- [GitHub Discussions](https://github.com/OzenFern/Booklyte/discussions)

---

**Booklyte** - A lightweight book tracker for light reading.
