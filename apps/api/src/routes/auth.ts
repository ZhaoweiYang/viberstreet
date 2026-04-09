import { Hono } from 'hono';
import type { Env, JWTPayload } from '../types';
import { signJWT, verifyJWT } from '../utils/jwt';
import { generateId } from '../utils/id';
import { sendEmail, verificationEmailHtml } from '../utils/email';

type Variables = { user: JWTPayload };

export const authRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();

// Send verification code to email
authRoutes.post('/send-code', async (c) => {
  const { email, type = 'login', portal = 'user' } = await c.req.json<{
    email: string;
    type?: string;
    portal?: string; // 'user' | 'developer' | 'admin'
  }>();

  if (!email || !email.includes('@')) {
    return c.json({ success: false, error: 'Valid email required' }, 400);
  }

  // Admin portal: no registration allowed, must be existing admin
  if (portal === 'admin') {
    const existing = await c.env.DB.prepare(
      "SELECT id FROM users WHERE email = ? AND role = 'admin'"
    ).bind(email).first();
    if (!existing) {
      return c.json({ success: false, error: 'Admin account not found' }, 403);
    }
  }

  // Generate 6-digit code
  const code = String(Math.floor(100000 + Math.random() * 900000));
  const id = generateId();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  // Delete old codes for this email
  await c.env.DB.prepare('DELETE FROM verification_codes WHERE email = ?').bind(email).run();

  // Save code
  await c.env.DB.prepare(
    'INSERT INTO verification_codes (id, email, code, type, expires_at) VALUES (?, ?, ?, ?, ?)'
  ).bind(id, email, code, type, expiresAt).run();

  // Send email
  await sendEmail(
    c.env.RESEND_API_KEY,
    email,
    'Your Viber Street Verification Code',
    verificationEmailHtml(code)
  );

  return c.json({ success: true });
});

// Verify code and login/register
authRoutes.post('/verify-code', async (c) => {
  const { email, code, name, portal = 'user' } = await c.req.json<{
    email: string;
    code: string;
    name?: string;
    portal?: string; // 'user' | 'developer' | 'admin'
  }>();

  // Verify code
  const record = await c.env.DB.prepare(
    'SELECT * FROM verification_codes WHERE email = ? AND code = ? AND expires_at > datetime(\'now\')'
  ).bind(email, code).first();

  if (!record) {
    return c.json({ success: false, error: 'Invalid or expired code' }, 400);
  }

  // Delete used code
  await c.env.DB.prepare('DELETE FROM verification_codes WHERE email = ?').bind(email).run();

  // Determine the role based on portal
  const portalRole = portal === 'developer' ? 'developer' : portal === 'admin' ? 'admin' : 'user';

  // Find existing user with matching email AND role
  let user = await c.env.DB.prepare(
    'SELECT * FROM users WHERE email = ? AND role = ?'
  ).bind(email, portalRole).first();

  if (portal === 'admin') {
    // Admin: must already exist, no registration
    if (!user) {
      return c.json({ success: false, error: 'Admin account not found' }, 403);
    }
    await c.env.DB.prepare('UPDATE users SET email_verified = 1 WHERE id = ?').bind(user.id).run();
  } else if (!user) {
    // User or Developer: auto-register with the correct role
    const id = generateId();
    await c.env.DB.prepare(
      'INSERT INTO users (id, email, name, role, email_verified) VALUES (?, ?, ?, ?, 1)'
    ).bind(id, email, name || email.split('@')[0], portalRole).run();
    user = await c.env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(id).first();
  } else {
    await c.env.DB.prepare('UPDATE users SET email_verified = 1 WHERE id = ?').bind(user.id).run();
  }

  const token = await signJWT(
    { sub: user!.id as string, email: user!.email as string, role: user!.role as string },
    c.env.JWT_SECRET
  );

  return c.json({
    success: true,
    data: {
      token,
      user: {
        id: user!.id,
        email: user!.email,
        name: user!.name,
        avatar_url: user!.avatar_url,
        role: user!.role,
      },
    },
  });
});

// Google OAuth callback
authRoutes.post('/google', async (c) => {
  const { credential, portal = 'user' } = await c.req.json<{ credential: string; portal?: string }>();

  if (portal === 'admin') {
    return c.json({ success: false, error: 'Admin accounts cannot use Google login' }, 403);
  }

  // Verify Google token
  const googleRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
  if (!googleRes.ok) {
    return c.json({ success: false, error: 'Invalid Google credential' }, 400);
  }

  const googleUser = await googleRes.json() as { sub: string; email: string; name: string; picture: string };
  const portalRole = portal === 'developer' ? 'developer' : 'user';

  // Find existing user with matching google_id AND role, or email AND role
  let user = await c.env.DB.prepare(
    'SELECT * FROM users WHERE (google_id = ? OR email = ?) AND role = ?'
  ).bind(googleUser.sub, googleUser.email, portalRole).first();

  if (!user) {
    // Auto-register with the correct role
    const id = generateId();
    await c.env.DB.prepare(
      'INSERT INTO users (id, email, name, avatar_url, role, google_id, email_verified) VALUES (?, ?, ?, ?, ?, ?, 1)'
    ).bind(id, googleUser.email, googleUser.name, googleUser.picture, portalRole, googleUser.sub).run();
    user = await c.env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(id).first();
  } else if (!user.google_id) {
    await c.env.DB.prepare(
      'UPDATE users SET google_id = ?, avatar_url = COALESCE(avatar_url, ?), email_verified = 1 WHERE id = ?'
    ).bind(googleUser.sub, googleUser.picture, user.id).run();
    user = await c.env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(user.id).first();
  }

  const token = await signJWT(
    { sub: user!.id as string, email: user!.email as string, role: user!.role as string },
    c.env.JWT_SECRET
  );

  return c.json({
    success: true,
    data: {
      token,
      user: {
        id: user!.id,
        email: user!.email,
        name: user!.name,
        avatar_url: user!.avatar_url,
        role: user!.role,
      },
    },
  });
});

// Get current user
authRoutes.get('/me', async (c) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ success: false, error: 'Not authenticated' }, 401);
  }

  const payload = await verifyJWT(authHeader.slice(7), c.env.JWT_SECRET);
  if (!payload) {
    return c.json({ success: false, error: 'Invalid token' }, 401);
  }

  const user = await c.env.DB.prepare(
    'SELECT id, email, name, avatar_url, role, created_at FROM users WHERE id = ?'
  ).bind(payload.sub).first();

  if (!user) {
    return c.json({ success: false, error: 'User not found' }, 404);
  }

  return c.json({ success: true, data: user });
});
