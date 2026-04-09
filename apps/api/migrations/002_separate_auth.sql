-- Migration: Allow same email across different roles
-- SQLite doesn't support DROP CONSTRAINT, so we recreate the index
-- The old UNIQUE constraint on email alone needs to be replaced with UNIQUE(email, role)
-- For existing databases, we just drop the old unique index and create a new composite one

DROP INDEX IF EXISTS sqlite_autoindex_users_1;
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_role ON users(email, role);
