import { Hono } from 'hono';
import type { Env, JWTPayload } from '../types';
import { requireAuth } from '../middleware/auth';
import { generateId } from '../utils/id';

type Variables = { user: JWTPayload };

export const uploadRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();

uploadRoutes.use('*', requireAuth);

// Upload file to R2 (images, avatars)
uploadRoutes.post('/image', async (c) => {
  const formData = await c.req.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    return c.json({ success: false, error: 'No file provided' }, 400);
  }

  // Validate file type
  if (!file.type.startsWith('image/')) {
    return c.json({ success: false, error: 'Only images are allowed' }, 400);
  }

  // Max 5MB
  if (file.size > 5 * 1024 * 1024) {
    return c.json({ success: false, error: 'File too large (max 5MB)' }, 400);
  }

  const ext = file.name.split('.').pop() || 'png';
  const key = `uploads/${generateId()}.${ext}`;

  await c.env.R2.put(key, await file.arrayBuffer(), {
    httpMetadata: { contentType: file.type },
  });

  // Return the public URL (assumes R2 custom domain or public bucket)
  const url = `https://assets.viberstreet.com/${key}`;

  return c.json({ success: true, data: { url, key } });
});
