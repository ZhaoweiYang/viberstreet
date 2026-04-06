export interface Env {
  DB: D1Database;
  R2: R2Bucket;
  JWT_SECRET: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  RESEND_API_KEY: string;
}

export interface JWTPayload {
  sub: string;
  email: string;
  role: string;
  exp: number;
}
