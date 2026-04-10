import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../lib/i18n';
import { getReviews } from '../lib/api';

function StatusBadge({ status }: { status: string }) {
  const { t } = useI18n();
  const styles: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    approved: 'bg-emerald-100 text-emerald-700',
    rejected: 'bg-red-100 text-red-700',
    revoked: 'bg-rose-200 text-rose-800',
  };
  const labels: Record<string, string> = {
    pending: t('reviews.tab_pending'),
    approved: t('reviews.tab_approved'),
    rejected: t('reviews.tab_rejected'),
    revoked: t('reviews.tab_revoked'),
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || 'bg-slate-100 text-slate-600'}`}>
      {labels[status] || status}
    </span>
  );
}

export default function ReviewListPage() {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState('pending_review');
  const [reviews, setReviews] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const tabs = [
    { key: 'pending_review', label: t('reviews.tab_pending'), color: 'amber' },
    { key: 'approved', label: t('reviews.tab_approved'), color: 'emerald' },
    { key: 'rejected', label: t('reviews.tab_rejected'), color: 'red' },
    { key: 'revoked', label: t('reviews.tab_revoked'), color: 'rose' },
  ];

  useEffect(() => {
    setLoading(true);
    getReviews(activeTab)
      .then((res: any) => {
        setReviews(Array.isArray(res) ? res : res.reviews || []);
        setTotal(res.total || (Array.isArray(res) ? res.length : 0));
      })
      .catch(() => {
        setReviews([]);
        setTotal(0);
      })
      .finally(() => setLoading(false));
  }, [activeTab]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">{t('reviews.title')}</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-slate-100 p-1 rounded-lg w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === tab.key
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="p-12 text-center">
            <svg className="w-12 h-12 mx-auto text-slate-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-slate-500 text-sm">{t('reviews.no_reviews')}</p>
          </div>
        ) : (
          <>
            <div className="px-6 py-3 border-b border-slate-100 text-xs text-slate-500">
              {total} result{total !== 1 ? 's' : ''}
            </div>
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50">
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">
                    {t('reviews.product')}
                  </th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">
                    {t('reviews.version')}
                  </th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">
                    {t('reviews.developer')}
                  </th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">
                    {t('reviews.platform')}
                  </th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">
                    {t('reviews.product_type')}
                  </th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">
                    {t('reviews.submitted')}
                  </th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">
                    {t('reviews.status')}
                  </th>
                  <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">
                    {t('reviews.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reviews.map((review: any) => (
                  <tr key={review.id || review.version_id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-slate-900">
                        {review.product_name || review.name}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600 font-mono">
                        v{review.version}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600">
                        {review.developer_name || review.developer}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600">
                        {review.platform ? t(`platform.${review.platform}`) : '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600">
                        {review.product_type ? t(`product_type.${review.product_type}`) : '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-500">
                        {review.submitted_at
                          ? new Date(review.submitted_at).toLocaleDateString()
                          : '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={review.review_status || activeTab} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/reviews/${review.version_id || review.id}`}
                        className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-md transition-colors"
                      >
                        {t('reviews.review')}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  );
}
