import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { authRoutes } from './routes/auth';
import { productRoutes } from './routes/products';
import { devRoutes } from './routes/developer';
import { adminRoutes } from './routes/admin';
import { uploadRoutes } from './routes/upload';
import { purchaseRoutes } from './routes/purchases';
import type { Env } from './types';

const app = new Hono<{ Bindings: Env }>();

// CORS - allow all subdomains
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: false,
}));

// Health check
app.get('/', (c) => c.json({ status: 'ok', service: 'viberstreet-api' }));

// Routes
app.route('/auth', authRoutes);
app.route('/products', productRoutes);
app.route('/developer', devRoutes);
app.route('/admin', adminRoutes);
app.route('/upload', uploadRoutes);
app.route('/purchases', purchaseRoutes);

// 404
app.notFound((c) => c.json({ success: false, error: 'Not found' }, 404));

// Error handler
app.onError((err, c) => {
  console.error('Unhandled error:', err);
  return c.json({ success: false, error: 'Internal server error' }, 500);
});

export default app;
