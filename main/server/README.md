# Gruhaved Organic Food And Agro Products Showcase — Backend Server

Express.js API server with PostgreSQL, JWT authentication, Stripe payments, and security hardening.

## Quick Start

### 1. Prerequisites
- Node.js 18+
- PostgreSQL 14+

### 2. Setup

```bash
cd server
npm install
cp .env.example .env
# Edit .env with your actual values
```

### 3. Database

Create a PostgreSQL database and run the schema:

```bash
psql -U postgres -c "CREATE DATABASE Gruhaved Organic Food And Agro Products;"
psql -U postgres -d Gruhaved Organic Food And Agro Products -f schema.sql
```

### 4. Environment Variables

| Variable | Description |
|---|---|
| `PORT` | Server port (default: 5000) |
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret key for JWT signing (min 32 chars) |
| `JWT_EXPIRES_IN` | Token expiry (e.g. `7d`) |
| `STRIPE_SECRET_KEY` | Stripe secret key from dashboard |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `CLIENT_ORIGIN` | Frontend origin for CORS |

### 5. Run

```bash
# Development
npm run dev

# Production
npm start
```

## API Endpoints

### Auth (`/api/auth`)
| Method | Path | Description |
|---|---|---|
| POST | `/signup` | Register a new user |
| POST | `/signin` | Sign in (rate-limited) |
| GET | `/me` | Get current user (requires JWT) |

### Cart (`/api/cart`) — All require JWT
| Method | Path | Description |
|---|---|---|
| GET | `/` | Get cart items |
| POST | `/` | Add/update item |
| PUT | `/:productId` | Update quantity |
| DELETE | `/:productId` | Remove item |
| DELETE | `/` | Clear cart |

### Wishlist (`/api/wishlist`) — All require JWT
| Method | Path | Description |
|---|---|---|
| GET | `/` | Get wishlist product IDs |
| POST | `/toggle` | Toggle a product in wishlist |
| POST | `/sync` | Sync local wishlist to server |

### Checkout (`/api/checkout`)
| Method | Path | Description |
|---|---|---|
| POST | `/create-payment-intent` | Create Stripe PaymentIntent (requires JWT) |
| POST | `/webhook` | Stripe webhook handler |

## Security Features
- **bcryptjs** (cost factor 12) for password hashing
- **JWT** for stateless authentication
- **Rate limiting** on all routes (100/15min) and login (10/15min)
- **Helmet** for HTTP security headers (HSTS, CSP, etc.)
- **express-validator** for input sanitization and validation
- **Constant-time comparison** to prevent timing attacks
- **No raw card data** — all payments via Stripe PaymentIntents
- **CORS** restricted to configured client origin
