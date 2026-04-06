import { Hono } from 'hono';
import type { Env, JWTPayload } from '../types';
import { verifyJWT } from '../utils/jwt';
import { generateId } from '../utils/id';
import { requireAuth } from '../middleware/auth';
import { sendEmail, docDeliveryEmailHtml } from '../utils/email';

type Variables = { user: JWTPayload };

export const productRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();

// List published products (public) - with category filter and search
productRoutes.get('/', async (c) => {
  const category = c.req.query('category');
  const search = c.req.query('search');
  const page = parseInt(c.req.query('page') || '1');
  const limit = parseInt(c.req.query('limit') || '20');
  const offset = (page - 1) * limit;

  let where = "WHERE p.status = 'published' AND p.current_version_id IS NOT NULL";
  const params: string[] = [];

  if (category) {
    where += ' AND p.category = ?';
    params.push(category);
  }

  if (search) {
    where += ' AND (p.name LIKE ? OR p.description LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  const countResult = await c.env.DB.prepare(
    `SELECT COUNT(*) as total FROM products p ${where}`
  ).bind(...params).first<{ total: number }>();

  const total = countResult?.total || 0;

  const products = await c.env.DB.prepare(`
    SELECT p.*, u.name as developer_name, u.avatar_url as developer_avatar,
           pv.version as current_version
    FROM products p
    JOIN users u ON p.developer_id = u.id
    LEFT JOIN product_versions pv ON p.current_version_id = pv.id
    ${where}
    ORDER BY p.download_count DESC, p.created_at DESC
    LIMIT ? OFFSET ?
  `).bind(...params, limit, offset).all();

  // Get screenshots for each product
  const productsWithScreenshots = await Promise.all(
    (products.results || []).map(async (p: Record<string, unknown>) => {
      const screenshots = await c.env.DB.prepare(
        'SELECT url FROM product_screenshots WHERE product_version_id = ? ORDER BY sort_order'
      ).bind(p.current_version_id).all();
      return {
        ...p,
        screenshot_urls: (screenshots.results || []).map((s: Record<string, unknown>) => s.url),
      };
    })
  );

  return c.json({
    success: true,
    data: productsWithScreenshots,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

// Get product by slug (public)
productRoutes.get('/:slug', async (c) => {
  const slug = c.req.param('slug');

  const product = await c.env.DB.prepare(`
    SELECT p.*, u.name as developer_name, u.avatar_url as developer_avatar,
           pv.version as current_version
    FROM products p
    JOIN users u ON p.developer_id = u.id
    LEFT JOIN product_versions pv ON p.current_version_id = pv.id
    WHERE p.slug = ? AND p.status = 'published'
  `).bind(slug).first();

  if (!product) {
    return c.json({ success: false, error: 'Product not found' }, 404);
  }

  // Get versions
  const versions = await c.env.DB.prepare(
    "SELECT id, version, changelog, status, created_at FROM product_versions WHERE product_id = ? AND status = 'approved' ORDER BY created_at DESC"
  ).bind(product.id).all();

  // Get screenshots of current version
  const screenshots = await c.env.DB.prepare(
    'SELECT * FROM product_screenshots WHERE product_version_id = ? ORDER BY sort_order'
  ).bind(product.current_version_id).all();

  return c.json({
    success: true,
    data: {
      ...product,
      versions: versions.results || [],
      screenshots: screenshots.results || [],
    },
  });
});

// Download product (requires auth)
productRoutes.post('/:slug/download', requireAuth, async (c) => {
  const user = c.get('user');
  const slug = c.req.param('slug');

  const product = await c.env.DB.prepare(`
    SELECT p.*, pv.doc_content, pv.version
    FROM products p
    JOIN product_versions pv ON p.current_version_id = pv.id
    WHERE p.slug = ? AND p.status = 'published'
  `).bind(slug).first();

  if (!product) {
    return c.json({ success: false, error: 'Product not found' }, 404);
  }

  // Check if paid product needs purchase
  if ((product.price as number) > 0) {
    const purchase = await c.env.DB.prepare(
      'SELECT id FROM purchases WHERE user_id = ? AND product_id = ?'
    ).bind(user.sub, product.id).first();

    if (!purchase) {
      return c.json({ success: false, error: 'Purchase required' }, 402);
    }
  }

  // Increment download count
  await c.env.DB.prepare(
    'UPDATE products SET download_count = download_count + 1 WHERE id = ?'
  ).bind(product.id).run();

  // Send doc to user's email
  const userRecord = await c.env.DB.prepare('SELECT email FROM users WHERE id = ?').bind(user.sub).first();
  if (userRecord?.email) {
    await sendEmail(
      c.env.RESEND_API_KEY,
      userRecord.email as string,
      `Your Viber Street Doc: ${product.name}`,
      docDeliveryEmailHtml(product.name as string, product.doc_content as string)
    );
  }

  return c.json({
    success: true,
    data: {
      name: product.name,
      version: product.version,
      doc_content: product.doc_content,
    },
  });
});

// Check purchase status
productRoutes.get('/:slug/purchase-status', requireAuth, async (c) => {
  const user = c.get('user');
  const slug = c.req.param('slug');

  const product = await c.env.DB.prepare(
    "SELECT id, price FROM products WHERE slug = ? AND status = 'published'"
  ).bind(slug).first();

  if (!product) {
    return c.json({ success: false, error: 'Product not found' }, 404);
  }

  if ((product.price as number) === 0) {
    return c.json({ success: true, data: { purchased: true, free: true } });
  }

  const purchase = await c.env.DB.prepare(
    'SELECT id FROM purchases WHERE user_id = ? AND product_id = ?'
  ).bind(user.sub, product.id).first();

  return c.json({
    success: true,
    data: { purchased: !!purchase, free: false },
  });
});

// Get categories with counts
productRoutes.get('/meta/categories', async (c) => {
  const categories = await c.env.DB.prepare(`
    SELECT category, COUNT(*) as count
    FROM products
    WHERE status = 'published' AND current_version_id IS NOT NULL
    GROUP BY category
    ORDER BY count DESC
  `).all();

  return c.json({ success: true, data: categories.results || [] });
});
