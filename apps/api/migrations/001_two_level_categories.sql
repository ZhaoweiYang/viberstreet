-- Migration: Replace single 'category' with two-level 'platform' + 'product_type'
ALTER TABLE products ADD COLUMN platform TEXT NOT NULL DEFAULT 'web' CHECK(platform IN ('web','ios','android','macos','windows'));
ALTER TABLE products ADD COLUMN product_type TEXT NOT NULL DEFAULT 'browser' CHECK(product_type IN ('browser','vpn','input-method','finance','office','erp','web3-wallet','email-client'));
-- Note: SQLite does not support DROP COLUMN in older versions.
-- The old 'category' column can remain but is no longer used.

CREATE INDEX IF NOT EXISTS idx_products_platform ON products(platform);
CREATE INDEX IF NOT EXISTS idx_products_product_type ON products(product_type);
