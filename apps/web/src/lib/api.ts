const BASE_URL =
  import.meta.env.PROD
    ? 'https://viberstreet-api.cf-0de.workers.dev'
    : 'http://localhost:8787';

async function request<T>(path: string, options: RequestInit = {}, params?: Record<string, string | number | undefined>): Promise<T> {
  let url = `${BASE_URL}${path}`;
  if (params) {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== '') sp.set(k, String(v));
    }
    const qs = sp.toString();
    if (qs) url += `?${qs}`;
  }

  const token = localStorage.getItem('viberstreet_token');
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (!(options.body instanceof FormData)) headers['Content-Type'] = 'application/json';

  const res = await fetch(url, { ...options, headers });
  const json = await res.json().catch(() => ({})) as any;
  if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
  return json;
}

// ========== Products ==========
export function getProducts(params?: { platform?: string; product_type?: string; search?: string; page?: number; limit?: number }) {
  return request<any>('/products', {}, params as any);
}

export function getProduct(slug: string) {
  return request<any>(`/products/${slug}`);
}

export function downloadProduct(slug: string) {
  return request<any>(`/products/${slug}/download`, { method: 'POST' });
}

export function getPlatforms() {
  return request<any>('/products/meta/platforms');
}

export function getProductTypes(platform?: string) {
  return request<any>('/products/meta/product-types', {}, platform ? { platform } : undefined);
}

export function getPurchaseStatus(slug: string) {
  return request<any>(`/products/${slug}/purchase-status`);
}

// ========== Auth ==========
export function sendCode(email: string, type = 'login') {
  return request<any>('/auth/send-code', { method: 'POST', body: JSON.stringify({ email, type }) });
}

export function verifyCode(email: string, code: string, name?: string, role?: string) {
  return request<any>('/auth/verify-code', { method: 'POST', body: JSON.stringify({ email, code, name, role }) });
}

export function googleAuth(credential: string, role = 'user') {
  return request<any>('/auth/google', { method: 'POST', body: JSON.stringify({ credential, role }) });
}

export function getMe() {
  return request<any>('/auth/me');
}

// ========== Purchases ==========
export function createCheckout(product_id: string) {
  return request<any>('/purchases/create-checkout', { method: 'POST', body: JSON.stringify({ product_id }) });
}

export function getMyPurchases() {
  return request<any>('/purchases/my-purchases');
}
