import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useI18n } from '../lib/i18n';
import { getReviewDetail, reviewVersion } from '../lib/api';

function StatusBadge({ status }: { status: string }) {
  const { t } = useI18n();
  const styles: Record<string, string> = {
    pending_review: 'bg-amber-500/10 text-amber-400',
    pending: 'bg-amber-500/10 text-amber-400',
    approved: 'bg-emerald-500/10 text-emerald-400',
    rejected: 'bg-red-500/10 text-red-400',
    revoked: 'bg-rose-500/10 text-rose-400',
  };
  const labels: Record<string, string> = {
    pending_review: t('reviews.tab_pending'),
    pending: t('reviews.tab_pending'),
    approved: t('reviews.tab_approved'),
    rejected: t('reviews.tab_rejected'),
    revoked: t('reviews.tab_revoked'),
  };
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${styles[status] || 'bg-slate-800 text-slate-400'}`}>
      {labels[status] || status}
    </span>
  );
}

export default function ReviewDetailPage() {
  const { t } = useI18n();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [detail, setDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectNote, setRejectNote] = useState('');
  const [revokeNote, setRevokeNote] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [showRevokeConfirm, setShowRevokeConfirm] = useState(false);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getReviewDetail(id)
      .then(setDetail)
      .catch((err) => setError(err.message || 'Failed to load review'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAction = async (status: 'approved' | 'rejected' | 'revoked') => {
    if (!id) return;
    const note = status === 'rejected' ? rejectNote : status === 'revoked' ? revokeNote : undefined;

    if (status === 'rejected' && !rejectNote.trim()) {
      setActionError(t('review_detail.rejection_reason'));
      return;
    }

    setActionLoading(true);
    setActionError('');
    setActionSuccess('');
    try {
      await reviewVersion(id, status, note);
      setActionSuccess(
        status === 'approved'
          ? 'Version approved successfully. Developer can now publish.'
          : status === 'rejected'
          ? 'Version rejected. Developer has been notified.'
          : 'Version revoked. Product has been auto-unpublished.'
      );
      setShowRejectForm(false);
      setShowRevokeConfirm(false);
      // Refresh detail
      const updated = await getReviewDetail(id);
      setDetail(updated);
    } catch (err: any) {
      setActionError(err.message || 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500" />
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400 mb-4">{error || 'Review not found'}</p>
        <Link to="/reviews" className="text-rose-400 hover:text-rose-300 text-sm font-medium">
          {t('common.back')}
        </Link>
      </div>
    );
  }

  const reviewStatus = detail.review_status || detail.status || 'pending_review';
  const isPending = reviewStatus === 'pending_review' || reviewStatus === 'pending';
  const isApproved = reviewStatus === 'approved';
  const screenshots = detail.screenshots || [];
  const reviewHistory = detail.review_history || [];

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <Link
          to="/reviews"
          className="text-slate-500 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white">{t('review_detail.title')}: {detail.product_name || detail.name}</h1>
          <p className="text-sm text-slate-500 mt-1">{t('reviews.version')} {detail.version}</p>
        </div>
        <StatusBadge status={reviewStatus} />
      </div>

      {/* Action messages */}
      {actionSuccess && (
        <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-sm">
          {actionSuccess}
        </div>
      )}
      {actionError && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm">
          {actionError}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Product Info */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">{t('review_detail.product_info')}</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">{t('products.name')}</p>
                <p className="text-sm font-medium text-white">{detail.product_name || detail.name}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">{t('reviews.developer')}</p>
                <p className="text-sm text-slate-300">{detail.developer_name || detail.developer}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">{t('reviews.platform')}</p>
                <p className="text-sm text-slate-300">{detail.platform ? t(`platform.${detail.platform}`) : '-'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">{t('reviews.product_type')}</p>
                <p className="text-sm text-slate-300">{detail.product_type ? t(`product_type.${detail.product_type}`) : '-'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">{t('products.price')}</p>
                <p className="text-sm text-slate-300">
                  {detail.is_free || detail.price_cents === 0
                    ? t('products.free')
                    : `$${((detail.price_cents || 0) / 100).toFixed(2)}`}
                </p>
              </div>
            </div>
          </div>

          {/* Version Info */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">{t('review_detail.version_details')}</h2>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">{t('reviews.version')}</p>
                <p className="text-sm font-mono text-white">v{detail.version}</p>
              </div>
              {(detail.changelog || detail.change_log) && (
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">{t('review_detail.changelog')}</p>
                  <div className="text-sm text-slate-300 bg-slate-800 rounded-xl p-4 whitespace-pre-wrap border border-slate-700">
                    {detail.changelog || detail.change_log}
                  </div>
                </div>
              )}
              {detail.submitted_at && (
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">{t('reviews.submitted')}</p>
                  <p className="text-sm text-slate-300">
                    {new Date(detail.submitted_at).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Documentation Content */}
          {detail.doc_content && (
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
              <h2 className="text-lg font-semibold text-white mb-4">{t('review_detail.documentation')}</h2>
              <div className="max-h-96 overflow-y-auto bg-slate-800 rounded-xl p-4 border border-slate-700">
                <div className="prose prose-sm prose-invert max-w-none whitespace-pre-wrap text-sm text-slate-300 leading-relaxed">
                  {detail.doc_content}
                </div>
              </div>
            </div>
          )}

          {/* Screenshots */}
          {screenshots.length > 0 && (
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
              <h2 className="text-lg font-semibold text-white mb-4">
                {t('review_detail.screenshots')} ({screenshots.length})
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {screenshots.map((url: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => setSelectedScreenshot(url)}
                    className="relative aspect-video rounded-xl overflow-hidden border border-slate-700 hover:border-rose-500/50 transition-colors group"
                  >
                    <img
                      src={url}
                      alt={`Screenshot ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                      </svg>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Review History */}
          {reviewHistory.length > 0 && (
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
              <h2 className="text-lg font-semibold text-white mb-4">{t('review_detail.review_note')}</h2>
              <div className="space-y-4">
                {reviewHistory.map((entry: any, i: number) => (
                  <div key={i} className="flex gap-3">
                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                      entry.status === 'approved' ? 'bg-emerald-500' :
                      entry.status === 'rejected' ? 'bg-red-500' :
                      entry.status === 'revoked' ? 'bg-rose-700' :
                      'bg-slate-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={entry.status} />
                        <span className="text-xs text-slate-500">
                          {entry.reviewed_at
                            ? new Date(entry.reviewed_at).toLocaleString()
                            : ''}
                        </span>
                      </div>
                      {entry.reviewer_name && (
                        <p className="text-xs text-slate-500 mt-1">
                          {t('review_detail.reviewed_by')} {entry.reviewer_name}
                        </p>
                      )}
                      {entry.note && (
                        <p className="text-sm text-slate-400 mt-1 bg-slate-800 rounded-lg p-2 border border-slate-700">
                          {entry.note}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar - Review Actions */}
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 sticky top-8">
            <h2 className="text-lg font-semibold text-white mb-4">{t('reviews.actions')}</h2>

            {isPending && (
              <div className="space-y-3">
                {/* Approve */}
                <button
                  onClick={() => handleAction('approved')}
                  disabled={actionLoading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-500 transition-colors disabled:opacity-50"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {t('review_detail.approve')}
                </button>

                {/* Reject */}
                {!showRejectForm ? (
                  <button
                    onClick={() => setShowRejectForm(true)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-500 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    {t('review_detail.reject')}
                  </button>
                ) : (
                  <div className="border border-red-500/20 rounded-xl p-4 bg-red-500/10">
                    <p className="text-sm font-medium text-red-400 mb-2">{t('review_detail.rejection_reason')}</p>
                    <textarea
                      value={rejectNote}
                      onChange={(e) => setRejectNote(e.target.value)}
                      placeholder={t('review_detail.rejection_reason')}
                      rows={4}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                    />
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleAction('rejected')}
                        disabled={actionLoading}
                        className="flex-1 px-3 py-2 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-500 transition-colors disabled:opacity-50"
                      >
                        {actionLoading ? t('review_detail.submitting') : t('review_detail.reject')}
                      </button>
                      <button
                        onClick={() => {
                          setShowRejectForm(false);
                          setRejectNote('');
                          setActionError('');
                        }}
                        className="px-3 py-2 bg-slate-800 border border-slate-700 text-slate-300 rounded-xl text-sm hover:bg-slate-700 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {isApproved && (
              <div className="space-y-3">
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                  <p className="text-sm text-emerald-400">{t('reviews.tab_approved')}</p>
                </div>

                {/* Revoke */}
                {!showRevokeConfirm ? (
                  <button
                    onClick={() => setShowRevokeConfirm(true)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-rose-800 text-white rounded-xl text-sm font-medium hover:bg-rose-700 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                    {t('review_detail.revoke')}
                  </button>
                ) : (
                  <div className="border border-rose-500/20 rounded-xl p-4 bg-rose-500/10">
                    <p className="text-sm font-medium text-rose-400 mb-1">{t('review_detail.revoke')}</p>
                    <p className="text-xs text-rose-400/70 mb-3">
                      {t('review_detail.revoke_confirm')}
                    </p>
                    <textarea
                      value={revokeNote}
                      onChange={(e) => setRevokeNote(e.target.value)}
                      placeholder={t('review_detail.review_note')}
                      rows={3}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent resize-none"
                    />
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleAction('revoked')}
                        disabled={actionLoading}
                        className="flex-1 px-3 py-2 bg-rose-800 text-white rounded-xl text-sm font-medium hover:bg-rose-700 transition-colors disabled:opacity-50"
                      >
                        {actionLoading ? t('review_detail.submitting') : t('review_detail.revoke')}
                      </button>
                      <button
                        onClick={() => {
                          setShowRevokeConfirm(false);
                          setRevokeNote('');
                          setActionError('');
                        }}
                        className="px-3 py-2 bg-slate-800 border border-slate-700 text-slate-300 rounded-xl text-sm hover:bg-slate-700 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {!isPending && !isApproved && (
              <div className={`p-3 rounded-xl ${
                reviewStatus === 'rejected' ? 'bg-red-500/10 border border-red-500/20' : 'bg-rose-500/10 border border-rose-500/20'
              }`}>
                <p className={`text-sm ${reviewStatus === 'rejected' ? 'text-red-400' : 'text-rose-400'}`}>
                  {reviewStatus === 'rejected' ? t('reviews.tab_rejected') : t('reviews.tab_revoked')}
                </p>
              </div>
            )}
          </div>

          {/* Product Meta */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
            <h3 className="text-sm font-semibold text-white mb-3">Additional Info</h3>
            <dl className="space-y-3">
              {detail.tagline && (
                <div>
                  <dt className="text-xs text-slate-500">Tagline</dt>
                  <dd className="text-sm text-slate-300 mt-0.5">{detail.tagline}</dd>
                </div>
              )}
              {detail.slug && (
                <div>
                  <dt className="text-xs text-slate-500">Slug</dt>
                  <dd className="text-sm text-slate-300 font-mono mt-0.5">{detail.slug}</dd>
                </div>
              )}
              {detail.download_count !== undefined && (
                <div>
                  <dt className="text-xs text-slate-500">{t('products.downloads')}</dt>
                  <dd className="text-sm text-slate-300 mt-0.5">{detail.download_count.toLocaleString()}</dd>
                </div>
              )}
              {detail.created_at && (
                <div>
                  <dt className="text-xs text-slate-500">{t('products.created')}</dt>
                  <dd className="text-sm text-slate-300 mt-0.5">
                    {new Date(detail.created_at).toLocaleDateString()}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>

      {/* Screenshot Modal */}
      {selectedScreenshot && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedScreenshot(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelectedScreenshot(null)}
              className="absolute -top-3 -right-3 w-8 h-8 bg-slate-800 border border-slate-700 rounded-full shadow-lg flex items-center justify-center text-slate-300 hover:text-white"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img
              src={selectedScreenshot}
              alt="Screenshot preview"
              className="max-w-full max-h-[85vh] rounded-xl shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}
