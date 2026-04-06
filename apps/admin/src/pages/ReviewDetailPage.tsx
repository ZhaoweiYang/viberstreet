import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getReviewDetail, reviewVersion } from '../lib/api';

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    approved: 'bg-emerald-100 text-emerald-700',
    rejected: 'bg-red-100 text-red-700',
    revoked: 'bg-rose-200 text-rose-800',
  };
  const labels: Record<string, string> = {
    pending: 'Pending Review',
    approved: 'Approved',
    rejected: 'Rejected',
    revoked: 'Revoked',
  };
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${styles[status] || 'bg-slate-100 text-slate-600'}`}>
      {labels[status] || status}
    </span>
  );
}

export default function ReviewDetailPage() {
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
      setActionError('Please provide a reason for rejection.');
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600" />
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">{error || 'Review not found'}</p>
        <Link to="/reviews" className="text-rose-600 hover:text-rose-700 text-sm font-medium">
          Back to reviews
        </Link>
      </div>
    );
  }

  const reviewStatus = detail.review_status || detail.status || 'pending';
  const isPending = reviewStatus === 'pending';
  const isApproved = reviewStatus === 'approved';
  const screenshots = detail.screenshots || [];
  const reviewHistory = detail.review_history || [];

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <Link
          to="/reviews"
          className="text-slate-400 hover:text-slate-600 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900">Review: {detail.product_name || detail.name}</h1>
          <p className="text-sm text-slate-500 mt-1">Version {detail.version} submission review</p>
        </div>
        <StatusBadge status={reviewStatus} />
      </div>

      {/* Action messages */}
      {actionSuccess && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-sm">
          {actionSuccess}
        </div>
      )}
      {actionError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {actionError}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Product Info */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Product Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Name</p>
                <p className="text-sm font-medium text-slate-900">{detail.product_name || detail.name}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Developer</p>
                <p className="text-sm text-slate-700">{detail.developer_name || detail.developer}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Category</p>
                <p className="text-sm text-slate-700 capitalize">{detail.category || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Price</p>
                <p className="text-sm text-slate-700">
                  {detail.is_free || detail.price_cents === 0
                    ? 'Free'
                    : `$${((detail.price_cents || 0) / 100).toFixed(2)}`}
                </p>
              </div>
            </div>
          </div>

          {/* Version Info */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Version Details</h2>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Version</p>
                <p className="text-sm font-mono text-slate-900">v{detail.version}</p>
              </div>
              {(detail.changelog || detail.change_log) && (
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Changelog</p>
                  <div className="text-sm text-slate-700 bg-slate-50 rounded-lg p-4 whitespace-pre-wrap">
                    {detail.changelog || detail.change_log}
                  </div>
                </div>
              )}
              {detail.submitted_at && (
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Submitted</p>
                  <p className="text-sm text-slate-700">
                    {new Date(detail.submitted_at).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Documentation Content */}
          {detail.doc_content && (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Documentation Content</h2>
              <div className="max-h-96 overflow-y-auto bg-slate-50 rounded-lg p-4 border border-slate-200">
                <div className="prose prose-sm prose-slate max-w-none whitespace-pre-wrap text-sm text-slate-700 leading-relaxed">
                  {detail.doc_content}
                </div>
              </div>
            </div>
          )}

          {/* Screenshots */}
          {screenshots.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Screenshots ({screenshots.length})
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {screenshots.map((url: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => setSelectedScreenshot(url)}
                    className="relative aspect-video rounded-lg overflow-hidden border border-slate-200 hover:border-rose-300 transition-colors group"
                  >
                    <img
                      src={url}
                      alt={`Screenshot ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
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
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Review History</h2>
              <div className="space-y-4">
                {reviewHistory.map((entry: any, i: number) => (
                  <div key={i} className="flex gap-3">
                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                      entry.status === 'approved' ? 'bg-emerald-500' :
                      entry.status === 'rejected' ? 'bg-red-500' :
                      entry.status === 'revoked' ? 'bg-rose-700' :
                      'bg-slate-400'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={entry.status} />
                        <span className="text-xs text-slate-400">
                          {entry.reviewed_at
                            ? new Date(entry.reviewed_at).toLocaleString()
                            : ''}
                        </span>
                      </div>
                      {entry.reviewer_name && (
                        <p className="text-xs text-slate-500 mt-1">
                          by {entry.reviewer_name}
                        </p>
                      )}
                      {entry.note && (
                        <p className="text-sm text-slate-600 mt-1 bg-slate-50 rounded p-2">
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
          <div className="bg-white rounded-xl border border-slate-200 p-6 sticky top-8">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Review Actions</h2>

            {isPending && (
              <div className="space-y-3">
                {/* Approve */}
                <button
                  onClick={() => handleAction('approved')}
                  disabled={actionLoading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Approve Version
                </button>

                {/* Reject */}
                {!showRejectForm ? (
                  <button
                    onClick={() => setShowRejectForm(true)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Reject Version
                  </button>
                ) : (
                  <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                    <p className="text-sm font-medium text-red-800 mb-2">Rejection Reason</p>
                    <textarea
                      value={rejectNote}
                      onChange={(e) => setRejectNote(e.target.value)}
                      placeholder="Explain why this version is being rejected..."
                      rows={4}
                      className="w-full px-3 py-2 border border-red-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                    />
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleAction('rejected')}
                        disabled={actionLoading}
                        className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                      >
                        {actionLoading ? 'Rejecting...' : 'Confirm Reject'}
                      </button>
                      <button
                        onClick={() => {
                          setShowRejectForm(false);
                          setRejectNote('');
                          setActionError('');
                        }}
                        className="px-3 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm hover:bg-slate-50 transition-colors"
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
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <p className="text-sm text-emerald-700">This version has been approved.</p>
                </div>

                {/* Revoke */}
                {!showRevokeConfirm ? (
                  <button
                    onClick={() => setShowRevokeConfirm(true)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-rose-800 text-white rounded-lg text-sm font-medium hover:bg-rose-900 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                    Revoke Approval
                  </button>
                ) : (
                  <div className="border border-rose-300 rounded-lg p-4 bg-rose-50">
                    <p className="text-sm font-medium text-rose-800 mb-1">Revoke Approval</p>
                    <p className="text-xs text-rose-600 mb-3">
                      This will auto-unpublish the product if it is currently published.
                    </p>
                    <textarea
                      value={revokeNote}
                      onChange={(e) => setRevokeNote(e.target.value)}
                      placeholder="Reason for revoking (e.g., policy violation)..."
                      rows={3}
                      className="w-full px-3 py-2 border border-rose-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent resize-none"
                    />
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleAction('revoked')}
                        disabled={actionLoading}
                        className="flex-1 px-3 py-2 bg-rose-800 text-white rounded-lg text-sm font-medium hover:bg-rose-900 transition-colors disabled:opacity-50"
                      >
                        {actionLoading ? 'Revoking...' : 'Confirm Revoke'}
                      </button>
                      <button
                        onClick={() => {
                          setShowRevokeConfirm(false);
                          setRevokeNote('');
                          setActionError('');
                        }}
                        className="px-3 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm hover:bg-slate-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {!isPending && !isApproved && (
              <div className={`p-3 rounded-lg ${
                reviewStatus === 'rejected' ? 'bg-red-50 border border-red-200' : 'bg-rose-50 border border-rose-200'
              }`}>
                <p className={`text-sm ${reviewStatus === 'rejected' ? 'text-red-700' : 'text-rose-700'}`}>
                  This version has been {reviewStatus}.
                </p>
              </div>
            )}
          </div>

          {/* Product Meta */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Additional Info</h3>
            <dl className="space-y-3">
              {detail.tagline && (
                <div>
                  <dt className="text-xs text-slate-500">Tagline</dt>
                  <dd className="text-sm text-slate-700 mt-0.5">{detail.tagline}</dd>
                </div>
              )}
              {detail.slug && (
                <div>
                  <dt className="text-xs text-slate-500">Slug</dt>
                  <dd className="text-sm text-slate-700 font-mono mt-0.5">{detail.slug}</dd>
                </div>
              )}
              {detail.download_count !== undefined && (
                <div>
                  <dt className="text-xs text-slate-500">Downloads</dt>
                  <dd className="text-sm text-slate-700 mt-0.5">{detail.download_count.toLocaleString()}</dd>
                </div>
              )}
              {detail.created_at && (
                <div>
                  <dt className="text-xs text-slate-500">Product Created</dt>
                  <dd className="text-sm text-slate-700 mt-0.5">
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
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedScreenshot(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelectedScreenshot(null)}
              className="absolute -top-3 -right-3 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center text-slate-600 hover:text-slate-900"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img
              src={selectedScreenshot}
              alt="Screenshot preview"
              className="max-w-full max-h-[85vh] rounded-lg shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}
