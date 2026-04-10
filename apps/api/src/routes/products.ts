import { Hono } from 'hono';
import type { Env, JWTPayload } from '../types';
import { verifyJWT } from '../utils/jwt';
import { generateId } from '../utils/id';
import { requireAuth } from '../middleware/auth';
import { sendEmail, docDeliveryEmailHtml } from '../utils/email';

type Variables = { user: JWTPayload };

export const productRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();

// List published products (public) - with platform + product_type filter and search
productRoutes.get('/', async (c) => {
  const platform = c.req.query('platform');
  const productType = c.req.query('product_type');
  const search = c.req.query('search');
  const page = parseInt(c.req.query('page') || '1');
  const limit = parseInt(c.req.query('limit') || '20');
  const offset = (page - 1) * limit;

  let where = "WHERE p.status = 'published' AND p.current_version_id IS NOT NULL";
  const params: string[] = [];

  if (platform) {
    where += ' AND p.platform = ?';
    params.push(platform);
  }

  if (productType) {
    where += ' AND p.product_type = ?';
    params.push(productType);
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

  // Get per-platform docs for current version
  const platformDocs = await c.env.DB.prepare(
    'SELECT * FROM product_version_docs WHERE version_id = ? ORDER BY platform'
  ).bind(product.current_version_id).all();

  // Get per-platform screenshots
  const docsWithScreenshots = await Promise.all(
    (platformDocs.results || []).map(async (d: Record<string, unknown>) => {
      const pScreenshots = await c.env.DB.prepare(
        'SELECT * FROM product_platform_screenshots WHERE version_doc_id = ? ORDER BY sort_order'
      ).bind(d.id).all();
      return { ...d, screenshots: pScreenshots.results || [] };
    })
  );

  // Parse platforms
  let platformsList: string[] = [];
  try {
    platformsList = JSON.parse(product.platforms as string || '[]');
  } catch {
    platformsList = [product.platform as string || 'web'];
  }

  return c.json({
    success: true,
    data: {
      ...product,
      platforms_list: platformsList,
      versions: versions.results || [],
      screenshots: screenshots.results || [],
      platform_docs: docsWithScreenshots,
    },
  });
});

// Download product (requires auth, optional platform param)
productRoutes.post('/:slug/download', requireAuth, async (c) => {
  const user = c.get('user');
  const slug = c.req.param('slug');
  const body = await c.req.json().catch(() => ({})) as { platform?: string };
  const requestedPlatform = body.platform;

  const product = await c.env.DB.prepare(`
    SELECT p.*, pv.doc_content, pv.version, pv.id as version_id
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

  // Try to get platform-specific doc
  let docContent = product.doc_content as string;
  let downloadPlatform = requestedPlatform || '';

  if (requestedPlatform && product.version_id) {
    const platformDoc = await c.env.DB.prepare(
      'SELECT doc_content FROM product_version_docs WHERE version_id = ? AND platform = ?'
    ).bind(product.version_id, requestedPlatform).first();
    if (platformDoc) {
      docContent = platformDoc.doc_content as string;
      downloadPlatform = requestedPlatform;
    }
  }

  // Increment download count
  await c.env.DB.prepare(
    'UPDATE products SET download_count = download_count + 1 WHERE id = ?'
  ).bind(product.id).run();

  // Send doc to user's email
  const userRecord = await c.env.DB.prepare('SELECT email FROM users WHERE id = ?').bind(user.sub).first();
  if (userRecord?.email) {
    sendEmail(
      c.env.RESEND_API_KEY,
      userRecord.email as string,
      `Your Viber Street Doc: ${product.name}`,
      docDeliveryEmailHtml(product.name as string, docContent)
    );
  }

  return c.json({
    success: true,
    data: {
      name: product.name,
      version: product.version,
      platform: downloadPlatform,
      doc_content: docContent,
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

// Get platform counts
productRoutes.get('/meta/platforms', async (c) => {
  const platforms = await c.env.DB.prepare(`
    SELECT platform, COUNT(*) as count
    FROM products
    WHERE status = 'published' AND current_version_id IS NOT NULL
    GROUP BY platform
    ORDER BY count DESC
  `).all();

  return c.json({ success: true, data: platforms.results || [] });
});

// Get product type counts (optionally filtered by platform)
productRoutes.get('/meta/product-types', async (c) => {
  const platform = c.req.query('platform');
  let sql = `
    SELECT product_type, COUNT(*) as count
    FROM products
    WHERE status = 'published' AND current_version_id IS NOT NULL
  `;
  const params: string[] = [];

  if (platform) {
    sql += ' AND platform = ?';
    params.push(platform);
  }

  sql += ' GROUP BY product_type ORDER BY count DESC';

  const types = await c.env.DB.prepare(sql).bind(...params).all();
  return c.json({ success: true, data: types.results || [] });
});
