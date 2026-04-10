const API_BASE = import.meta.env.VITE_API_URL || 'https://viberstreet-api.cf-0de.workers.dev';

let token: string | null = localStorage.getItem('dev_portal_token');

export function setToken(t: string | null) {
  token = t;
  if (t) {
    localStorage.setItem('dev_portal_token', t);
  } else {
    localStorage.removeItem('dev_portal_token');
  }
}

export function getToken(): string | null {
  return token;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  };
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });
  if (res.status === 401) {
    setToken(null);
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || body.message || `Request failed: ${res.status}`);
  }
  const json = await res.json() as any;
  return json.data !== undefined ? json.data : json;
}

// Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar_url: string | null;
}

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

export interface ProductVersion {
  id: string;
  product_id: string;
  version: string;
  changelog: string;
  doc_content: string;
  screenshots: string[];
  status: 'draft' | 'pending_review' | 'approved' | 'rejected' | 'revoked';
  review_note: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
}

export interface DevStats {
  totalProducts: number;
  publishedProducts: number;
  totalDownloads: number;
  totalRevenue: number;
}

// Auth
export function sendCode(email: string) {
  return request<{ message: string }>('/auth/send-code', {
    method: 'POST',
    body: JSON.stringify({ email, portal: 'developer' }),
  });
}

export function verifyCode(email: string, code: string, name?: string) {
  return request<{ token: string; user: User }>('/auth/verify-code', {
    method: 'POST',
    body: JSON.stringify({ email, code, name, portal: 'developer' }),
  });
}

export function googleAuth(credential: string) {
  return request<{ token: string; user: User }>('/auth/google', {
    method: 'POST',
    body: JSON.stringify({ credential, portal: 'developer' }),
  });
}

export function getMe() {
  return request<User>('/auth/me');
}

// Developer Products
export function getMyProducts() {
  return request<{ products: Product[]; total: number }>('/developer/products');
}

export function getProduct(id: string) {
  return request<{ product: Product; versions: ProductVersion[] }>(`/developer/products/${id}`);
}

export function createProduct(data: {
  name: string;
  description: string;
  platforms: string[];
  product_type: string;
  price: number;
  avatar_url?: string;
  version: string;
  changelog: string;
  platform_docs: Record<string, { doc_content: string; description: string }>;
}) {
  return request<{ product: Product; version: ProductVersion }>('/developer/products', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateProduct(id: string, data: Partial<{
  name: string;
  description: string;
  platforms: string[];
  product_type: string;
  price: number;
  avatar_url: string;
}>) {
  return request<{ product: Product }>(`/developer/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export function submitVersion(productId: string, data: {
  version: string;
  changelog: string;
  doc_content?: string;
  platform_docs?: Record<string, { doc_content: string; description: string }>;
}) {
  return request<{ version: ProductVersion }>(`/developer/products/${productId}/versions`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function publishProduct(id: string) {
  return request<{ product: Product }>(`/developer/products/${id}/publish`, {
    method: 'POST',
  });
}

export function unpublishProduct(id: string) {
  return request<{ product: Product }>(`/developer/products/${id}/unpublish`, {
    method: 'POST',
  });
}

export function addScreenshots(productId: string, versionId: string, urls: string[]) {
  return request<{ version: ProductVersion }>(`/developer/products/${productId}/versions/${versionId}/screenshots`, {
    method: 'POST',
    body: JSON.stringify({ urls }),
  });
}

export function uploadImage(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  return request<{ url: string }>('/upload/image', {
    method: 'POST',
    body: formData,
  });
}

export function getStats() {
  return request<DevStats>('/developer/stats');
}
