import { Hono } from 'hono';
import type { Env, JWTPayload } from '../types';
import { requireAuth } from '../middleware/auth';
import { generateId } from '../utils/id';

type Variables = { user: JWTPayload };

export const purchaseRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();

// Stripe webhook - NO auth required (called by Stripe)
purchaseRoutes.post('/webhook/stripe', async (c) => {
  const body = await c.req.text();
  // TODO: verify Stripe signature using c.env.STRIPE_WEBHOOK_SECRET

  const event = JSON.parse(body);

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { user_id, product_id, version_id } = session.metadata;

    const purchaseId = generateId();
    await c.env.DB.prepare(
      'INSERT INTO purchases (id, user_id, product_id, version_id, price, stripe_payment_id) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(purchaseId, user_id, product_id, version_id, session.amount_total, session.payment_intent).run();
  }

  return c.json({ received: true });
});

// All other purchase routes require auth
purchaseRoutes.use('*', requireAuth);

// Create Stripe checkout session
purchaseRoutes.post('/create-checkout', async (c) => {
  const user = c.get('user');
  const { product_id } = await c.req.json<{ product_id: string }>();

  const product = await c.env.DB.prepare(
    "SELECT * FROM products WHERE id = ? AND status = 'published'"
  ).bind(product_id).first();

  if (!product) {
    return c.json({ success: false, error: 'Product not found' }, 404);
  }

  if ((product.price as number) === 0) {
    return c.json({ success: false, error: 'Product is free' }, 400);
  }

  // Check existing purchase
  const existing = await c.env.DB.prepare(
    'SELECT id FROM purchases WHERE user_id = ? AND product_id = ?'
  ).bind(user.sub, product_id).first();

  if (existing) {
    return c.json({ success: false, error: 'Already purchased' }, 400);
  }

  // Create Stripe Checkout session
  const stripeRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${c.env.STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      'mode': 'payment',
      'success_url': `https://viberstreet.com/product/${product.slug}?purchased=1`,
      'cancel_url': `https://viberstreet.com/product/${product.slug}`,
      'line_items[0][price_data][currency]': 'usd',
      'line_items[0][price_data][product_data][name]': product.name as string,
      'line_items[0][price_data][unit_amount]': String(product.price),
      'line_items[0][quantity]': '1',
      'metadata[user_id]': user.sub,
      'metadata[product_id]': product_id,
      'metadata[version_id]': product.current_version_id as string,
      'customer_email': user.email,
    }),
  });

  if (!stripeRes.ok) {
    const err = await stripeRes.text();
    return c.json({ success: false, error: `Stripe error: ${err}` }, 500);
  }

  const session = await stripeRes.json() as { id: string; url: string };

  return c.json({ success: true, data: { checkout_url: session.url } });
});

// List user's purchases
purchaseRoutes.get('/my-purchases', async (c) => {
  const user = c.get('user');

  const purchases = await c.env.DB.prepare(`
    SELECT pur.*, p.name as product_name, p.slug as product_slug,
           p.avatar_url as product_avatar, p.description, p.platform, p.product_type,
           u.name as developer_name, pv.version
    FROM purchases pur
    JOIN products p ON pur.product_id = p.id
    JOIN users u ON p.developer_id = u.id
    JOIN product_versions pv ON pur.version_id = pv.id
    WHERE pur.user_id = ?
    ORDER BY pur.created_at DESC
  `).bind(user.sub).all();

  return c.json({ success: true, data: purchases.results || [] });
});
