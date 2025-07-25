# AnonymousPC Backend - AI Coding Instructions

## Architecture Overview

This is a Node.js/Express REST API for an e-commerce platform selling PC components and pre-built gaming/workstation builds. The app uses a PostgreSQL database with SSL and is deployed on Vercel.

### Core Domain Entities
- **Products**: Individual PC components (CPU, GPU, RAM, etc.)
- **Builds**: Pre-configured computer builds with multiple components
- **Users**: Customer accounts with profiles, addresses, and orders
- **Orders**: Purchase transactions with detailed line items
- **Admins**: Administrative users with product/build management privileges

## Project Structure Pattern

```
├── controllers/     # Business logic classes with static methods
├── models/database/ # Raw SQL query functions (no ORM)
├── routes/         # Express route definitions
└── utils/          # Configuration, database pool, auth helpers
```

### Key Architectural Decisions

**Database Layer**: Direct PostgreSQL queries via `pg` pool - no ORM. All database functions are in `models/database/` and take `res` parameter for error handling.

**Authentication**: Dual JWT token system (access + refresh) with HTTP-only cookies. Google OAuth integration via Passport.js.

**Transaction Handling**: Manual SQL transactions with `BEGIN/COMMIT/ROLLBACK` for multi-table operations (see `createUser.js`, `createOrderUser.js`).

## Development Patterns

### Controller Pattern
```javascript
export class products {
    static async createProduct(req, res) {
        // Handles both single product and bulk array insertion
        const productos = Array.isArray(req.body) ? req.body : [req.body];
        // Efficient bulk insert with parameterized queries
    }
}
```

### Database Function Pattern
```javascript
export async function createUser(user, pass, email, res) {
    try {
        await pool.query('BEGIN');
        // Multiple related inserts
        await pool.query('COMMIT');
    } catch (error) {
        await pool.query('ROLLBACK');
        res.status(500).json({ error: "message" });
    }
}
```

### Route Authorization
- `/api/*` - Public/user routes with `verify.verifyToken` middleware
- `/adm/*` - Admin routes with `verify.verifyTokenAdmin` middleware
- `/auth/*` - Google OAuth flow

## Critical Development Workflows

### Environment Setup
Required `.env` variables:
```
POSTGRES_HOST, POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DATABASE
SECRET_KEY, SECRET_REFRESH_KEY
GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL
ALLOWED_ORIGIN1, ALLOWED_ORIGIN2, etc.
```

### Database Schema (Inferred)
```sql
-- Core tables: users, user_profiles, addresses, products, builds
-- Junction tables: builds_comp, wishlist, order_detail
-- Transaction tables: orders, order_info
-- Admin table: admins
```

### Development Commands
```bash
npm run dev    # nodemon with auto-reload
npm start      # production start
```

## Integration Points

### External Services
- **PostgreSQL**: SSL-required cloud database (likely Railway/Neon)
- **Google OAuth**: Social login integration
- **Vercel**: Serverless deployment platform

### Cross-Component Communication
- Controllers import database functions directly
- Shared `pool` from `utils/database.js` across all DB operations
- JWT tokens carry user context between requests
- Cookie-based session management for web clients

## Data Handling Conventions

### Bulk Operations
The `createProduct` function exemplifies the bulk-insert pattern - always check for arrays and handle efficiently with single parameterized queries.

### Error Responses
Consistent error format: `res.status(XXX).json({ error: "message" })`

### Transaction Safety
Multi-table operations always wrap in transactions. Database functions handle their own error responses.

### Authentication Context
Verified routes receive user data via `req.user` from JWT middleware. Admin routes use separate token verification.

## Deployment Considerations

- **Vercel**: Uses `vercel.json` for serverless function routing
- **Database**: SSL-enabled PostgreSQL with connection pooling
- **CORS**: Multiple allowed origins for different deployment environments
- **Security**: HTTP-only cookies, secure flags, environment-based secrets

## Common Debugging

Check database connectivity via root endpoint (`/`) which tests the connection pool.
Authentication issues often relate to cookie settings (`sameSite`, `secure` flags).
Transaction rollbacks log to console - check for incomplete operations.
