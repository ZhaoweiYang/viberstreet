-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  password_hash TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK(role IN ('user', 'developer', 'admin')),
  google_id TEXT,
  UNIQUE(email, role),
  email_verified INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  developer_id TEXT NOT NULL REFERENCES users(id),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  description TEXT NOT NULL,
  platform TEXT NOT NULL CHECK(platform IN ('web','ios','android','macos','windows')),
  product_type TEXT NOT NULL CHECK(product_type IN ('browser','vpn','input-method','finance','office','erp','web3-wallet','email-client')),
  price INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft', 'published', 'unpublished')),
  current_version_id TEXT,
  download_count INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Product versions table
CREATE TABLE IF NOT EXISTS product_versions (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES products(id),
  version TEXT NOT NULL,
  changelog TEXT NOT NULL DEFAULT '',
  doc_content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft', 'pending_review', 'approved', 'rejected', 'revoked')),
  review_note TEXT,
  reviewed_by TEXT REFERENCES users(id),
  reviewed_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(product_id, version)
);

-- Product screenshots table
CREATE TABLE IF NOT EXISTS product_screenshots (
  id TEXT PRIMARY KEY,
  product_version_id TEXT NOT NULL REFERENCES product_versions(id),
  url TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

-- Purchases table
CREATE TABLE IF NOT EXISTS purchases (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  product_id TEXT NOT NULL REFERENCES products(id),
  version_id TEXT NOT NULL REFERENCES product_versions(id),
  price INTEGER NOT NULL,
  stripe_payment_id TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Email verification codes
CREATE TABLE IF NOT EXISTS verification_codes (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('login', 'register')),
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_products_developer ON products(developer_id);
CREATE INDEX IF NOT EXISTS idx_products_platform ON products(platform);
CREATE INDEX IF NOT EXISTS idx_products_product_type ON products(product_type);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_versions_product ON product_versions(product_id);
CREATE INDEX IF NOT EXISTS idx_versions_status ON product_versions(status);
CREATE INDEX IF NOT EXISTS idx_screenshots_version ON product_screenshots(product_version_id);
CREATE INDEX IF NOT EXISTS idx_purchases_user ON purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_product ON purchases(product_id);
