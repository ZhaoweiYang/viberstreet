import { Hono } from 'hono';
import type { Env, JWTPayload } from '../types';
import { requireAuth, requireRole } from '../middleware/auth';
import { generateId, slugify } from '../utils/id';

type Variables = { user: JWTPayload };

export const devRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();

// All developer routes require auth + developer role
devRoutes.use('*', requireAuth);
devRoutes.use('*', requireRole('developer', 'admin'));

// List developer's products
devRoutes.get('/products', async (c) => {
  const user = c.get('user');

  const products = await c.env.DB.prepare(`
    SELECT p.*, pv.version as current_version, pv.status as version_status
    FROM products p
    LEFT JOIN product_versions pv ON p.current_version_id = pv.id
    WHERE p.developer_id = ?
    ORDER BY p.updated_at DESC
  `).bind(user.sub).all();

  return c.json({ success: true, data: products.results || [] });
});

// Create a new product
devRoutes.post('/products', async (c) => {
  const user = c.get('user');
  const body = await c.req.json();
  const { name, description, platform, product_type, price = 0, version, changelog = '', doc_content } = body;

  if (!name || !description || !platform || !product_type || !doc_content || !version) {
    return c.json({ success: false, error: 'Missing required fields: name, description, platform, product_type, version, doc_content' }, 400);
  }

  const productId = generateId();
  const versionId = generateId();
  let slug = slugify(name);

  // Ensure unique slug
  const existing = await c.env.DB.prepare('SELECT id FROM products WHERE slug = ?').bind(slug).first();
  if (existing) {
    slug = `${slug}-${productId.slice(0, 6)}`;
  }

  // Create product
  await c.env.DB.prepare(`
    INSERT INTO products (id, developer_id, name, slug, description, platform, product_type, price, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'draft')
  `).bind(productId, user.sub, name, slug, description, platform, product_type, price).run();

  // Create first version
  await c.env.DB.prepare(`
    INSERT INTO product_versions (id, product_id, version, changelog, doc_content, status)
    VALUES (?, ?, ?, ?, ?, 'pending_review')
  `).bind(versionId, productId, version, changelog, doc_content).run();

  return c.json({
    success: true,
    data: { id: productId, slug, version_id: versionId },
  }, 201);
});

// Get single product detail (developer view)
devRoutes.get('/products/:id', async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');

  const product = await c.env.DB.prepare(
    'SELECT * FROM products WHERE id = ? AND developer_id = ?'
  ).bind(id, user.sub).first();

  if (!product) {
    return c.json({ success: false, error: 'Product not found' }, 404);
  }

  const versions = await c.env.DB.prepare(
    'SELECT * FROM product_versions WHERE product_id = ? ORDER BY created_at DESC'
  ).bind(id).all();

  // Get screenshots per version
  const versionsWithScreenshots = await Promise.all(
    (versions.results || []).map(async (v: Record<string, unknown>) => {
      const screenshots = await c.env.DB.prepare(
        'SELECT * FROM product_screenshots WHERE product_version_id = ? ORDER BY sort_order'
      ).bind(v.id).all();
      return { ...v, screenshots: screenshots.results || [] };
    })
  );

  return c.json({
    success: true,
    data: { ...product, versions: versionsWithScreenshots },
  });
});

// Update product metadata
devRoutes.put('/products/:id', async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');
  const body = await c.req.json();

  const product = await c.env.DB.prepare(
    'SELECT * FROM products WHERE id = ? AND developer_id = ?'
  ).bind(id, user.sub).first();

  if (!product) {
    return c.json({ success: false, error: 'Product not found' }, 404);
  }

  const updates: string[] = [];
  const values: unknown[] = [];

  for (const field of ['name', 'description', 'platform', 'product_type', 'price', 'avatar_url']) {
    if (body[field] !== undefined) {
      updates.push(`${field} = ?`);
      values.push(body[field]);
    }
  }

  if (updates.length > 0) {
    updates.push("updated_at = datetime('now')");
    values.push(id, user.sub);
    await c.env.DB.prepare(
      `UPDATE products SET ${updates.join(', ')} WHERE id = ? AND developer_id = ?`
    ).bind(...values).run();
  }

  return c.json({ success: true });
});

// Submit a new version
devRoutes.post('/products/:id/versions', async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');
  const { version, changelog = '', doc_content } = await c.req.json();

  if (!version || !doc_content) {
    return c.json({ success: false, error: 'Missing required fields: version, doc_content' }, 400);
  }

  const product = await c.env.DB.prepare(
    'SELECT * FROM products WHERE id = ? AND developer_id = ?'
  ).bind(id, user.sub).first();

  if (!product) {
    return c.json({ success: false, error: 'Product not found' }, 404);
  }

  // Check duplicate version
  const existing = await c.env.DB.prepare(
    'SELECT id FROM product_versions WHERE product_id = ? AND version = ?'
  ).bind(id, version).first();

  if (existing) {
    return c.json({ success: false, error: 'Version already exists' }, 409);
  }

  const versionId = generateId();
  await c.env.DB.prepare(`
    INSERT INTO product_versions (id, product_id, version, changelog, doc_content, status)
    VALUES (?, ?, ?, ?, ?, 'pending_review')
  `).bind(versionId, id, version, changelog, doc_content).run();

  return c.json({ success: true, data: { id: versionId } }, 201);
});

// Publish product (requires at least one approved version)
devRoutes.post('/products/:id/publish', async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');

  const product = await c.env.DB.prepare(
    'SELECT * FROM products WHERE id = ? AND developer_id = ?'
  ).bind(id, user.sub).first();

  if (!product) {
    return c.json({ success: false, error: 'Product not found' }, 404);
  }

  // Find latest approved version
  const latestApproved = await c.env.DB.prepare(
    "SELECT id FROM product_versions WHERE product_id = ? AND status = 'approved' ORDER BY created_at DESC LIMIT 1"
  ).bind(id).first();

  if (!latestApproved) {
    return c.json({ success: false, error: 'No approved version available' }, 400);
  }

  await c.env.DB.prepare(
    "UPDATE products SET status = 'published', current_version_id = ?, updated_at = datetime('now') WHERE id = ?"
  ).bind(latestApproved.id, id).run();

  return c.json({ success: true });
});

// Unpublish product
devRoutes.post('/products/:id/unpublish', async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');

  const product = await c.env.DB.prepare(
    "SELECT * FROM products WHERE id = ? AND developer_id = ? AND status = 'published'"
  ).bind(id, user.sub).first();

  if (!product) {
    return c.json({ success: false, error: 'Product not found or not published' }, 404);
  }

  await c.env.DB.prepare(
    "UPDATE products SET status = 'unpublished', updated_at = datetime('now') WHERE id = ?"
  ).bind(id).run();

  return c.json({ success: true });
});

// Add screenshots to a version
devRoutes.post('/products/:id/versions/:versionId/screenshots', async (c) => {
  const user = c.get('user');
  const productId = c.req.param('id');
  const versionId = c.req.param('versionId');

  // Verify ownership
  const product = await c.env.DB.prepare(
    'SELECT id FROM products WHERE id = ? AND developer_id = ?'
  ).bind(productId, user.sub).first();
  if (!product) {
    return c.json({ success: false, error: 'Product not found' }, 404);
  }

  const { urls } = await c.req.json<{ urls: string[] }>();
  if (!urls?.length) {
    return c.json({ success: false, error: 'No URLs provided' }, 400);
  }

  for (let i = 0; i < urls.length; i++) {
    const id = generateId();
    await c.env.DB.prepare(
      'INSERT INTO product_screenshots (id, product_version_id, url, sort_order) VALUES (?, ?, ?, ?)'
    ).bind(id, versionId, urls[i], i).run();
  }

  return c.json({ success: true });
});

// Developer dashboard stats
devRoutes.get('/stats', async (c) => {
  const user = c.get('user');

  const products = await c.env.DB.prepare(
    'SELECT COUNT(*) as count FROM products WHERE developer_id = ?'
  ).bind(user.sub).first<{ count: number }>();

  const published = await c.env.DB.prepare(
    "SELECT COUNT(*) as count FROM products WHERE developer_id = ? AND status = 'published'"
  ).bind(user.sub).first<{ count: number }>();

  const downloads = await c.env.DB.prepare(
    'SELECT COALESCE(SUM(download_count), 0) as total FROM products WHERE developer_id = ?'
  ).bind(user.sub).first<{ total: number }>();

  const revenue = await c.env.DB.prepare(`
    SELECT COALESCE(SUM(pur.price), 0) as total
    FROM purchases pur
    JOIN products p ON pur.product_id = p.id
    WHERE p.developer_id = ?
  `).bind(user.sub).first<{ total: number }>();

  return c.json({
    success: true,
    data: {
      totalProducts: products?.count || 0,
      publishedProducts: published?.count || 0,
      totalDownloads: downloads?.total || 0,
      totalRevenue: revenue?.total || 0,
    },
  });
});
