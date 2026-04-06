// ========== Enums ==========
export type UserRole = 'user' | 'developer' | 'admin';

export type ProductStatus = 'draft' | 'published' | 'unpublished';

export type VersionStatus = 'draft' | 'pending_review' | 'approved' | 'rejected' | 'revoked';

export type ProductCategory =
  | 'web-app'
  | 'mobile-app'
  | 'desktop-app'
  | 'api-service'
  | 'cli-tool'
  | 'browser-extension'
  | 'ai-agent'
  | 'saas'
  | 'game'
  | 'other';

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  'web-app': 'Web App',
  'mobile-app': 'Mobile App',
  'desktop-app': 'Desktop App',
  'api-service': 'API & Service',
  'cli-tool': 'CLI Tool',
  'browser-extension': 'Browser Extension',
  'ai-agent': 'AI Agent',
  'saas': 'SaaS',
  'game': 'Game',
  'other': 'Other',
};

export const CATEGORY_ICONS: Record<ProductCategory, string> = {
  'web-app': '🌐',
  'mobile-app': '📱',
  'desktop-app': '🖥️',
  'api-service': '⚡',
  'cli-tool': '⌨️',
  'browser-extension': '🧩',
  'ai-agent': '🤖',
  'saas': '☁️',
  'game': '🎮',
  'other': '📦',
};

// ========== Database Models ==========
export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  role: UserRole;
  google_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  developer_id: string;
  name: string;
  slug: string;
  avatar_url: string | null;
  description: string;
  category: ProductCategory;
  price: number; // in cents, 0 = free
  status: ProductStatus;
  current_version_id: string | null;
  download_count: number;
  created_at: string;
  updated_at: string;
}

export interface ProductVersion {
  id: string;
  product_id: string;
  version: string;
  changelog: string;
  doc_content: string;
  status: VersionStatus;
  review_note: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
}

export interface ProductScreenshot {
  id: string;
  product_version_id: string;
  url: string;
  sort_order: number;
}

export interface Purchase {
  id: string;
  user_id: string;
  product_id: string;
  version_id: string;
  price: number;
  stripe_payment_id: string | null;
  created_at: string;
}

// ========== API Request/Response Types ==========
export interface ProductWithDeveloper extends Product {
  developer_name: string;
  developer_avatar: string | null;
  current_version: string | null;
  screenshot_urls: string[];
}

export interface ProductDetail extends ProductWithDeveloper {
  versions: ProductVersion[];
  screenshots: ProductScreenshot[];
}

export interface CreateProductRequest {
  name: string;
  description: string;
  category: ProductCategory;
  price: number;
  version: string;
  changelog: string;
  doc_content: string;
}

export interface UpdateProductRequest {
  name?: string;
  description?: string;
  category?: ProductCategory;
  price?: number;
}

export interface SubmitVersionRequest {
  version: string;
  changelog: string;
  doc_content: string;
}

export interface ReviewVersionRequest {
  status: 'approved' | 'rejected' | 'revoked';
  review_note?: string;
}

export interface LoginRequest {
  email: string;
  password?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
