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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
      </div>
    );
  }

  const statCards = [
    { label: t('dashboard.total_products'), value: stats?.totalProducts ?? 0, icon: PackageIcon, gradient: 'from-indigo-600 to-indigo-500' },
    { label: t('dashboard.published'), value: stats?.publishedProducts ?? 0, icon: CheckIcon, gradient: 'from-emerald-600 to-emerald-500' },
    { label: t('dashboard.total_downloads'), value: stats?.totalDownloads ?? 0, icon: DownloadIcon, gradient: 'from-violet-600 to-violet-500' },
    { label: t('dashboard.revenue'), value: `$${((stats?.totalRevenue ?? 0) / 100).toFixed(2)}`, icon: DollarIcon, gradient: 'from-amber-600 to-amber-500' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Welcome back, {user?.name}</h1>
        <p className="text-slate-400 mt-1">Here's an overview of your products</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card) => (
          <div key={card.label} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-colors">
            <div className="flex items-center gap-4">
              <div className={`bg-gradient-to-br ${card.gradient} w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg`}>
                <card.icon />
              </div>
              <div>
                <p className="text-sm text-slate-400">{card.label}</p>
                <p className="text-2xl font-bold text-white">{card.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Link
          to="/products/new"
          className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-2xl p-6 hover:from-indigo-500 hover:to-violet-500 transition-all group"
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
          className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-indigo-500/50 transition-colors group"
        >
          <div className="flex items-center gap-3 mb-2">
            <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <h3 className="text-lg font-semibold text-white">{t('products.title')}</h3>
          </div>
          <p className="text-slate-400 text-sm">Manage and update your products</p>
        </Link>
        <a
          href="https://docs.viberstreet.com"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-violet-500/50 transition-colors group"
        >
          <div className="flex items-center gap-3 mb-2">
            <svg className="w-6 h-6 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <h3 className="text-lg font-semibold text-white">Documentation</h3>
          </div>
          <p className="text-slate-400 text-sm">Read the developer docs</p>
        </a>
      </div>

      {/* Recent Products */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">{t('dashboard.recent_products')}</h2>
          <Link to="/products" className="text-sm text-indigo-400 hover:text-indigo-300 font-medium">
            {t('dashboard.view_all')}
          </Link>
        </div>
        {products.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-slate-500 mb-4">{t('products.no_products')}</p>
            <Link
              to="/products/new"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:from-indigo-500 hover:to-violet-500 transition-all"
            >
              {t('dashboard.create_new')}
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {products.map((product) => (
              <Link
                key={product.id}
                to={`/products/${product.id}`}
                className="flex items-center gap-4 px-6 py-4 hover:bg-slate-800/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-semibold text-sm">
                  {product.avatar_url ? (
                    <img src={product.avatar_url} alt="" className="w-10 h-10 rounded-lg object-cover" />
                  ) : (
                    product.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{product.name}</p>
                  <p className="text-xs text-slate-500">v{product.version} &middot; {t(`platform.${product.platform || 'web'}`)} &middot; {t(`product_type.${product.product_type || 'browser'}`)}</p>
                </div>
                <StatusBadge status={product.status} />
                <div className="text-right">
                  <p className="text-sm font-medium text-white">
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
    draft: 'bg-slate-500/10 text-slate-400',
    published: 'bg-emerald-500/10 text-emerald-400',
    unpublished: 'bg-slate-500/10 text-slate-400',
    pending_review: 'bg-yellow-500/10 text-yellow-400',
    approved: 'bg-emerald-500/10 text-emerald-400',
    rejected: 'bg-red-500/10 text-red-400',
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || 'bg-slate-500/10 text-slate-400'}`}>
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
