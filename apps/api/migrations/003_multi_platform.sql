-- Migration: Support multiple platforms per product
-- 1. Add platforms JSON array column (replaces single platform)
ALTER TABLE products ADD COLUMN platforms TEXT NOT NULL DEFAULT '["web"]';

-- 2. Create per-platform version docs table
CREATE TABLE IF NOT EXISTS product_version_docs (
  id TEXT PRIMARY KEY,
  version_id TEXT NOT NULL REFERENCES product_versions(id),
  platform TEXT NOT NULL,
  doc_content TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(version_id, platform)
);

-- 3. Create per-platform screenshots table
CREATE TABLE IF NOT EXISTS product_platform_screenshots (
  id TEXT PRIMARY KEY,
  version_doc_id TEXT NOT NULL REFERENCES product_version_docs(id),
  url TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

-- Copy existing data: migrate single platform to platforms array
UPDATE products SET platforms = '["' || COALESCE(platform, 'web') || '"]' WHERE platforms = '["web"]' AND platform != 'web';

-- Migrate existing version doc_content to product_version_docs
-- This needs to be done programmatically for existing data

CREATE INDEX IF NOT EXISTS idx_version_docs_version ON product_version_docs(version_id);
CREATE INDEX IF NOT EXISTS idx_version_docs_platform ON product_version_docs(version_id, platform);
CREATE INDEX IF NOT EXISTS idx_platform_screenshots ON product_platform_screenshots(version_doc_id);
