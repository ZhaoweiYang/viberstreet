const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

let token: string | null = localStorage.getItem('admin_token');

export function setToken(t: string | null) {
  token = t;
  if (t) {
    localStorage.setItem('admin_token', t);
  } else {
    localStorage.removeItem('admin_token');
  }
}

export function getToken(): string | null {
  return token;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
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
    throw new Error(body.message || `Request failed: ${res.status}`);
  }
  return res.json();
}

// Auth
export function sendCode(email: string) {
  return request<{ message: string }>('/auth/send-code', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export function verifyCode(email: string, code: string) {
  return request<{ token: string; user: any }>('/auth/verify-code', {
    method: 'POST',
    body: JSON.stringify({ email, code }),
  });
}

export function googleAuth(credential: string) {
  return request<{ token: string; user: any }>('/auth/google', {
    method: 'POST',
    body: JSON.stringify({ credential }),
  });
}

export function getMe() {
  return request<{ id: string; email: string; name: string; role: string }>('/auth/me');
}

// Dashboard stats
export function getStats() {
  return request<{
    totalProducts: number;
    pendingReviews: number;
    totalUsers: number;
    totalRevenue: number;
  }>('/admin/stats');
}

// Products
export function getProducts(params: {
  page?: number;
  status?: string;
  search?: string;
} = {}) {
  const query = new URLSearchParams();
  if (params.page) query.set('page', String(params.page));
  if (params.status) query.set('status', params.status);
  if (params.search) query.set('search', params.search);
  const qs = query.toString();
  return request<{
    products: any[];
    total: number;
    page: number;
    totalPages: number;
  }>(`/admin/products${qs ? `?${qs}` : ''}`);
}

// Reviews
export function getReviews(status: string = 'pending') {
  return request<{
    reviews: any[];
    total: number;
  }>(`/admin/reviews?status=${encodeURIComponent(status)}`);
}

export function getReviewDetail(versionId: string) {
  return request<any>(`/admin/reviews/${versionId}`);
}

export function reviewVersion(versionId: string, status: 'approved' | 'rejected' | 'revoked', note?: string) {
  return request<any>(`/admin/reviews/${versionId}/review`, {
    method: 'POST',
    body: JSON.stringify({ status, note }),
  });
}

// Users
export function getUsers(page: number = 1) {
  return request<{
    users: any[];
    total: number;
    page: number;
    totalPages: number;
  }>(`/admin/users?page=${page}`);
}

export function updateUserRole(userId: string, role: string) {
  return request<any>(`/admin/users/${userId}/role`, {
    method: 'PATCH',
    body: JSON.stringify({ role }),
  });
}
