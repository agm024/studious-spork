-- Drop tables if they exist (for clean setup)
DROP TABLE IF EXISTS cart_items CASCADE;
DROP TABLE IF EXISTS wishlist_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users table
CREATE TABLE users (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  email      VARCHAR(255) NOT NULL UNIQUE,
  password   VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ  DEFAULT NOW()
);

-- Cart items table
CREATE TABLE cart_items (
  id         SERIAL PRIMARY KEY,
  user_id    INT          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id INT          NOT NULL,
  quantity   INT          NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMPTZ  DEFAULT NOW(),
  UNIQUE (user_id, product_id)
);

-- Wishlist items table
CREATE TABLE wishlist_items (
  id         SERIAL PRIMARY KEY,
  user_id    INT          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id INT          NOT NULL,
  created_at TIMESTAMPTZ  DEFAULT NOW(),
  UNIQUE (user_id, product_id)
);

-- Orders table (payment_ref is nullable — NULL when no payment provider is configured;
-- populated with the provider's reference ID when payment is integrated)
CREATE TABLE orders (
  id           SERIAL PRIMARY KEY,
  user_id      INT          REFERENCES users(id) ON DELETE SET NULL,
  payment_ref  VARCHAR(255),
  amount       INT          NOT NULL,
  currency     VARCHAR(10)  NOT NULL DEFAULT 'usd',
  status       VARCHAR(50)  NOT NULL DEFAULT 'pending',
  items        JSONB        NOT NULL DEFAULT '[]',
  created_at   TIMESTAMPTZ  DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_cart_user    ON cart_items(user_id);
CREATE INDEX idx_wishlist_user ON wishlist_items(user_id);
CREATE INDEX idx_orders_user   ON orders(user_id);
