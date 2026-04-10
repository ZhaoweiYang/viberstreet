import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { getStats, getMyProducts, type DevStats, type Product } from '../lib/api';
import { useI18n } from '../lib/i18n';

export default function DashboardPage() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [stats, setStats] = useState<DevStats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getStats(), getMyProducts()])
      .then(([s, p]: any[]) => {
        setStats(s);
        const list = Array.isArray(p) ? p : (p.data || p.products || []);
        setProducts(list.slice(0, 5));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  const statCards = [
    { label: t('dashboard.total_products'), value: stats?.totalProducts ?? 0, icon: PackageIcon, color: 'bg-indigo-500' },
    { label: t('dashboard.published'), value: stats?.publishedProducts ?? 0, icon: CheckIcon, color: 'bg-green-500' },
    { label: t('dashboard.total_downloads'), value: stats?.totalDownloads ?? 0, icon: DownloadIcon, color: 'bg-purple-500' },
    { label: t('dashboard.revenue'), value: `$${((stats?.totalRevenue ?? 0) / 100).toFixed(2)}`, icon: DollarIcon, color: 'bg-amber-500' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Welcome back, {user?.name}</h1>
        <p className="text-slate-500 mt-1">Here's an overview of your products</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-4">
              <div className={`${card.color} w-12 h-12 rounded-lg flex items-center justify-center text-white`}>
                <card.icon />
              </div>
              <div>
                <p className="text-sm text-slate-500">{card.label}</p>
                <p className="text-2xl font-bold text-slate-900">{card.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Link
          to="/products/new"
          className="bg-indigo-600 text-white rounded-xl p-6 hover:bg-indigo-700 transition-colors group"
        >
          <div className="flex items-center gap-3 mb-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <h3 className="text-lg font-semibold">{t('dashboard.create_new')}</h3>
          </div>
          <p className="text-indigo-200 text-sm">Submit a new product for review</p>
        </Link>
        <Link
          to="/products"
          className="bg-white border border-slate-200 rounded-xl p-6 hover:border-indigo-300 transition-colors group"
        >
          <div className="flex items-center gap-3 mb-2">
            <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <h3 className="text-lg font-semibold text-slate-900">{t('products.title')}</h3>
          </div>
          <p className="text-slate-500 text-sm">Manage and update your products</p>
        </Link>
        <a
          href="https://docs.viberstreet.com"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white border border-slate-200 rounded-xl p-6 hover:border-indigo-300 transition-colors group"
        >
          <div className="flex items-center gap-3 mb-2">
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <h3 className="text-lg font-semibold text-slate-900">Documentation</h3>
          </div>
          <p className="text-slate-500 text-sm">Read the developer docs</p>
        </a>
      </div>

      {/* Recent Products */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">{t('dashboard.recent_products')}</h2>
          <Link to="/products" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
            {t('dashboard.view_all')}
          </Link>
        </div>
        {products.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-slate-500 mb-4">{t('products.no_products')}</p>
            <Link
              to="/products/new"
              className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              {t('dashboard.create_new')}
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {products.map((product) => (
              <Link
                key={product.id}
                to={`/products/${product.id}`}
                className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold text-sm">
                  {product.avatar_url ? (
                    <img src={product.avatar_url} alt="" className="w-10 h-10 rounded-lg object-cover" />
                  ) : (
                    product.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{product.name}</p>
                  <p className="text-xs text-slate-500">v{product.version} &middot; {t(`platform.${product.platform || 'web'}`)} &middot; {t(`product_type.${product.product_type || 'browser'}`)}</p>
                </div>
                <StatusBadge status={product.status} />
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-900">
                    {!product.price ? t('common.free') : `$${(product.price / 100).toFixed(2)}`}
                  </p>
                  <p className="text-xs text-slate-500">{product.download_count} {t('detail.downloads').toLowerCase()}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const { t } = useI18n();
  const styles: Record<string, string> = {
    draft: 'bg-slate-100 text-slate-700',
    published: 'bg-green-100 text-green-700',
    unpublished: 'bg-slate-100 text-slate-600',
    pending_review: 'bg-yellow-100 text-yellow-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || 'bg-slate-100 text-slate-700'}`}>
      {t(`status.${status}`)}
    </span>
  );
}

function PackageIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  );
}

function DollarIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
