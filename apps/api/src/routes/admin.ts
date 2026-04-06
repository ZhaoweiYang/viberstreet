import { Hono } from 'hono';
import type { Env, JWTPayload } from '../types';
import { requireAuth, requireRole } from '../middleware/auth';

type Variables = { user: JWTPayload };

export const adminRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();

adminRoutes.use('*', requireAuth);
adminRoutes.use('*', requireRole('admin'));

// Dashboard stats
adminRoutes.get('/stats', async (c) => {
  const totalProducts = await c.env.DB.prepare('SELECT COUNT(*) as count FROM products').first<{ count: number }>();
  const pendingReviews = await c.env.DB.prepare(
    "SELECT COUNT(*) as count FROM product_versions WHERE status = 'pending_review'"
  ).first<{ count: number }>();
  const totalUsers = await c.env.DB.prepare('SELECT COUNT(*) as count FROM users').first<{ count: number }>();
  const totalRevenue = await c.env.DB.prepare(
    'SELECT COALESCE(SUM(price), 0) as total FROM purchases'
  ).first<{ total: number }>();

  return c.json({
    success: true,
    data: {
      totalProducts: totalProducts?.count || 0,
      pendingReviews: pendingReviews?.count || 0,
      totalUsers: totalUsers?.count || 0,
      totalRevenue: totalRevenue?.total || 0,
    },
  });
});

// List all products (admin view)
adminRoutes.get('/products', async (c) => {
  const status = c.req.query('status');
  const page = parseInt(c.req.query('page') || '1');
  const limit = parseInt(c.req.query('limit') || '20');
  const offset = (page - 1) * limit;

  let where = '';
  const params: string[] = [];

  if (status) {
    where = 'WHERE p.status = ?';
    params.push(status);
  }

  const total = await c.env.DB.prepare(
    `SELECT COUNT(*) as count FROM products p ${where}`
  ).bind(...params).first<{ count: number }>();

  const products = await c.env.DB.prepare(`
    SELECT p.*, u.name as developer_name, u.email as developer_email,
           pv.version as current_version
    FROM products p
    JOIN users u ON p.developer_id = u.id
    LEFT JOIN product_versions pv ON p.current_version_id = pv.id
    ${where}
    ORDER BY p.updated_at DESC
    LIMIT ? OFFSET ?
  `).bind(...params, limit, offset).all();

  return c.json({
    success: true,
    data: products.results || [],
    pagination: { page, limit, total: total?.count || 0, totalPages: Math.ceil((total?.count || 0) / limit) },
  });
});

// List pending reviews
adminRoutes.get('/reviews', async (c) => {
  const status = c.req.query('status') || 'pending_review';
  const page = parseInt(c.req.query('page') || '1');
  const limit = parseInt(c.req.query('limit') || '20');
  const offset = (page - 1) * limit;

  const total = await c.env.DB.prepare(
    'SELECT COUNT(*) as count FROM product_versions WHERE status = ?'
  ).bind(status).first<{ count: number }>();

  const versions = await c.env.DB.prepare(`
    SELECT pv.*, p.name as product_name, p.slug as product_slug, p.category,
           u.name as developer_name, u.email as developer_email
    FROM product_versions pv
    JOIN products p ON pv.product_id = p.id
    JOIN users u ON p.developer_id = u.id
    WHERE pv.status = ?
    ORDER BY pv.created_at ASC
    LIMIT ? OFFSET ?
  `).bind(status, limit, offset).all();

  return c.json({
    success: true,
    data: versions.results || [],
    pagination: { page, limit, total: total?.count || 0, totalPages: Math.ceil((total?.count || 0) / limit) },
  });
});

// Get version detail for review
adminRoutes.get('/reviews/:versionId', async (c) => {
  const versionId = c.req.param('versionId');

  const version = await c.env.DB.prepare(`
    SELECT pv.*, p.name as product_name, p.slug as product_slug, p.category, p.price,
           p.description, p.avatar_url, u.name as developer_name, u.email as developer_email
    FROM product_versions pv
    JOIN products p ON pv.product_id = p.id
    JOIN users u ON p.developer_id = u.id
    WHERE pv.id = ?
  `).bind(versionId).first();

  if (!version) {
    return c.json({ success: false, error: 'Version not found' }, 404);
  }

  const screenshots = await c.env.DB.prepare(
    'SELECT * FROM product_screenshots WHERE product_version_id = ? ORDER BY sort_order'
  ).bind(versionId).all();

  return c.json({
    success: true,
    data: { ...version, screenshots: screenshots.results || [] },
  });
});

// Review a version (approve/reject/revoke)
adminRoutes.post('/reviews/:versionId', async (c) => {
  const admin = c.get('user');
  const versionId = c.req.param('versionId');
  const { status, review_note } = await c.req.json<{ status: string; review_note?: string }>();

  if (!['approved', 'rejected', 'revoked'].includes(status)) {
    return c.json({ success: false, error: 'Invalid status' }, 400);
  }

  const version = await c.env.DB.prepare(
    'SELECT * FROM product_versions WHERE id = ?'
  ).bind(versionId).first();

  if (!version) {
    return c.json({ success: false, error: 'Version not found' }, 404);
  }

  // Update version status
  await c.env.DB.prepare(
    "UPDATE product_versions SET status = ?, review_note = ?, reviewed_by = ?, reviewed_at = datetime('now') WHERE id = ?"
  ).bind(status, review_note || null, admin.sub, versionId).run();

  // If revoking a live version, also unpublish the product
  if (status === 'revoked') {
    const product = await c.env.DB.prepare(
      'SELECT * FROM products WHERE id = ? AND current_version_id = ?'
    ).bind(version.product_id, versionId).first();

    if (product) {
      // Try to fall back to previous approved version
      const prevApproved = await c.env.DB.prepare(
        "SELECT id FROM product_versions WHERE product_id = ? AND status = 'approved' AND id != ? ORDER BY created_at DESC LIMIT 1"
      ).bind(version.product_id, versionId).first();

      if (prevApproved) {
        await c.env.DB.prepare(
          "UPDATE products SET current_version_id = ?, updated_at = datetime('now') WHERE id = ?"
        ).bind(prevApproved.id, version.product_id).run();
      } else {
        await c.env.DB.prepare(
          "UPDATE products SET status = 'unpublished', current_version_id = NULL, updated_at = datetime('now') WHERE id = ?"
        ).bind(version.product_id).run();
      }
    }
  }

  return c.json({ success: true });
});

// List all users
adminRoutes.get('/users', async (c) => {
  const page = parseInt(c.req.query('page') || '1');
  const limit = parseInt(c.req.query('limit') || '20');
  const offset = (page - 1) * limit;

  const total = await c.env.DB.prepare('SELECT COUNT(*) as count FROM users').first<{ count: number }>();

  const users = await c.env.DB.prepare(`
    SELECT id, email, name, avatar_url, role, created_at
    FROM users
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `).bind(limit, offset).all();

  return c.json({
    success: true,
    data: users.results || [],
    pagination: { page, limit, total: total?.count || 0, totalPages: Math.ceil((total?.count || 0) / limit) },
  });
});

// Update user role
adminRoutes.patch('/users/:userId/role', async (c) => {
  const userId = c.req.param('userId');
  const { role } = await c.req.json<{ role: string }>();

  if (!['user', 'developer', 'admin'].includes(role)) {
    return c.json({ success: false, error: 'Invalid role' }, 400);
  }

  await c.env.DB.prepare(
    "UPDATE users SET role = ?, updated_at = datetime('now') WHERE id = ?"
  ).bind(role, userId).run();

  return c.json({ success: true });
});
