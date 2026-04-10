import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../lib/i18n';
import { getStats, getReviews } from '../lib/api';

interface Stats {
  totalProducts: number;
  pendingReviews: number;
  totalUsers: number;
  totalRevenue: number;
}

export default function DashboardPage() {
  const { t } = useI18n();
  const [stats, setStats] = useState<Stats | null>(null);
  const [pendingReviews, setPendingReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getStats(), getReviews('pending_review')])
      .then(([s, r]: any[]) => {
        setStats(s);
        const reviews = Array.isArray(r) ? r : r.reviews || [];
        setPendingReviews(reviews.slice(0, 5));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500" />
      </div>
    );
  }

  const statCards = [
    {
      label: t('dashboard.total_products'),
      value: stats?.totalProducts ?? 0,
      icon: ProductIcon,
      iconBg: 'bg-blue-500/10',
      iconColor: 'text-blue-400',
    },
    {
      label: t('dashboard.pending_reviews'),
      value: stats?.pendingReviews ?? 0,
      icon: ReviewIcon,
      iconBg: 'bg-amber-500/10',
      iconColor: 'text-amber-400',
      link: '/reviews',
    },
    {
      label: t('dashboard.total_users'),
      value: stats?.totalUsers ?? 0,
      icon: UsersIcon,
      iconBg: 'bg-emerald-500/10',
      iconColor: 'text-emerald-400',
    },
    {
      label: t('dashboard.total_revenue'),
      value: `$${((stats?.totalRevenue ?? 0) / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      icon: RevenueIcon,
      iconBg: 'bg-rose-500/10',
      iconColor: 'text-rose-400',
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">{t('dashboard.title')}</h1>
      </div>

      {/* Bento Grid Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card) => {
          const content = (
            <div key={card.label} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">{card.label}</p>
                  <p className="text-2xl font-bold text-white mt-1">{card.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl ${card.iconBg} flex items-center justify-center`}>
                  <card.icon className={card.iconColor} />
                </div>
              </div>
            </div>
          );
          return card.link ? (
            <Link key={card.label} to={card.link}>
              {content}
            </Link>
          ) : (
            <div key={card.label}>{content}</div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Reviews */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">{t('dashboard.recent_pending')}</h2>
            <Link to="/reviews" className="text-sm text-rose-400 hover:text-rose-300 font-medium">
              {t('dashboard.view_all_reviews')}
            </Link>
          </div>
          {pendingReviews.length === 0 ? (
            <div className="p-6 text-center text-slate-500 text-sm">
              {t('dashboard.no_pending')}
            </div>
          ) : (
            <div className="divide-y divide-slate-800">
              {pendingReviews.map((review: any) => (
                <Link
                  key={review.id || review.version_id}
                  to={`/reviews/${review.version_id || review.id}`}
                  className="flex items-center gap-4 p-4 hover:bg-slate-800/30 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {review.product_name || review.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      v{review.version} by {review.developer_name || review.developer}
                    </p>
                  </div>
                  <div className="text-xs text-slate-500">
                    {review.submitted_at
                      ? new Date(review.submitted_at).toLocaleDateString()
                      : ''}
                  </div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400">
                    {t('reviews.tab_pending')}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="p-6 border-b border-slate-800">
            <h2 className="text-lg font-semibold text-white">Quick Actions</h2>
          </div>
          <div className="p-4 space-y-2">
            <Link
              to="/reviews"
              className="flex items-center gap-3 w-full px-4 py-3 text-sm text-slate-300 hover:bg-rose-500/10 hover:text-rose-400 rounded-xl transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              {t('sidebar.review_queue')}
            </Link>
            <Link
              to="/products"
              className="flex items-center gap-3 w-full px-4 py-3 text-sm text-slate-300 hover:bg-rose-500/10 hover:text-rose-400 rounded-xl transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              {t('sidebar.products')}
            </Link>
            <Link
              to="/users"
              className="flex items-center gap-3 w-full px-4 py-3 text-sm text-slate-300 hover:bg-rose-500/10 hover:text-rose-400 rounded-xl transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              {t('sidebar.users')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductIcon({ className }: { className?: string }) {
  return (
    <svg className={`w-6 h-6 ${className || ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  );
}

function ReviewIcon({ className }: { className?: string }) {
  return (
    <svg className={`w-6 h-6 ${className || ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  );
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg className={`w-6 h-6 ${className || ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}

function RevenueIcon({ className }: { className?: string }) {
  return (
    <svg className={`w-6 h-6 ${className || ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
