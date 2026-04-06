const BASE_URL =
  import.meta.env.PROD
    ? 'https://api.viberstreet.com'
    : 'http://localhost:8787';

interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | undefined>;
}

async function request<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { params, ...fetchOptions } = options;

  let url = `${BASE_URL}${path}`;
  if (params) {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== '') {
        searchParams.set(key, String(value));
      }
    }
    const qs = searchParams.toString();
    if (qs) url += `?${qs}`;
  }

  const token = localStorage.getItem('viberstreet_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers as Record<string, string>),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...fetchOptions,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// Product types
export interface Product {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  category: string;
  price_cents: number;
  is_free: boolean;
  avatar_url: string | null;
  screenshots: string[];
  download_count: number;
  developer_id: string;
  developer_name: string;
  developer_avatar: string | null;
  version: string;
  changelog: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  slug: string;
  name: string;
  icon: string;
  count: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar_url: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

// Products
export function getProducts(params?: {
  category?: string;
  search?: string;
  sort?: string;
  page?: number;
  per_page?: number;
}) {
  return request<PaginatedResponse<Product>>('/api/products', { params: params as any });
}

export function getProduct(slug: string) {
  return request<Product>(`/api/products/${slug}`);
}

export function downloadProduct(slug: string) {
  return request<{ doc_content: string; filename: string }>(`/api/products/${slug}/download`, {
    method: 'POST',
  });
}

export function getCategories() {
  return request<Category[]>('/api/categories');
}

// Auth
export function sendCode(email: string) {
  return request<{ message: string }>('/api/auth/send-code', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export function verifyCode(email: string, code: string, name?: string, role?: string) {
  return request<{ token: string; user: User }>('/api/auth/verify-code', {
    method: 'POST',
    body: JSON.stringify({ email, code, name, role }),
  });
}

export function googleAuth(credential: string) {
  return request<{ token: string; user: User }>('/api/auth/google', {
    method: 'POST',
    body: JSON.stringify({ credential }),
  });
}

export function getMe() {
  return request<User>('/api/auth/me');
}

// Purchases
export function createCheckout(product_id: string) {
  return request<{ checkout_url: string }>('/api/checkout', {
    method: 'POST',
    body: JSON.stringify({ product_id }),
  });
}

export function getPurchaseStatus(slug: string) {
  return request<{ purchased: boolean }>(`/api/products/${slug}/purchase-status`);
}

export function getMyPurchases() {
  return request<Product[]>('/api/purchases');
}
