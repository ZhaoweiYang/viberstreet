import { createMiddleware } from 'hono/factory';
import type { Env, JWTPayload } from '../types';
import { verifyJWT } from '../utils/jwt';

type Variables = {
  user: JWTPayload;
};

export const requireAuth = createMiddleware<{ Bindings: Env; Variables: Variables }>(async (c, next) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ success: false, error: 'Authentication required' }, 401);
  }

  const token = authHeader.slice(7);
  const payload = await verifyJWT(token, c.env.JWT_SECRET);
  if (!payload) {
    return c.json({ success: false, error: 'Invalid or expired token' }, 401);
  }

  c.set('user', payload);
  await next();
});

export const requireRole = (...roles: string[]) =>
  createMiddleware<{ Bindings: Env; Variables: Variables }>(async (c, next) => {
    const user = c.get('user');
    if (!user || !roles.includes(user.role)) {
      return c.json({ success: false, error: 'Insufficient permissions' }, 403);
    }
    await next();
  });
