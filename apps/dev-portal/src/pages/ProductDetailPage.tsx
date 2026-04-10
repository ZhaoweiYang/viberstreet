import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getProduct, updateProduct, publishProduct, unpublishProduct, type Product, type ProductVersion } from '../lib/api';
import { useI18n } from '../lib/i18n';

const PLATFORMS = ['web', 'ios', 'android', 'macos', 'windows'];
const PRODUCT_TYPES = ['browser', 'vpn', 'input-method', 'finance', 'office', 'erp', 'web3-wallet', 'email-client'];

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useI18n();
  const [product, setProduct] = useState<Product | null>(null);
  const [versions, setVersions] = useState<ProductVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    platform: 'web',
    product_type: 'browser',
    priceDisplay: '0',
  });

  const fetchData = () => {
    if (!id) return;
    setLoading(true);
    getProduct(id)
      .then((r: any) => {
        const res = r.data || r;
        const p = res.product || res;
        const v = res.versions || p.versions || [];
        setProduct(p);
        setVersions(v);
        setEditForm({
          name: p.name,
          description: p.description,
          platform: p.platform || 'web',
          product_type: p.product_type || 'browser',
          priceDisplay: p.price ? (p.price / 100).toFixed(2) : '0',
        });
      })
      .catch(() => setError(t('common.error')))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handlePublish = async () => {
    if (!id) return;
    setActionLoading(true);
    try {
      await publishProduct(id);
      fetchData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnpublish = async () => {
    if (!id) return;
    setActionLoading(true);
    try {
      await unpublishProduct(id);
      fetchData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!id) return;
    setActionLoading(true);
    try {
      const priceCents = Math.round(parseFloat(editForm.priceDisplay || '0') * 100);
      await updateProduct(id, {
        name: editForm.name,
        description: editForm.description,
        platform: editForm.platform,
        product_type: editForm.product_type,
        price: priceCents,
      });
      setEditing(false);
      fetchData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">{t('common.error')}</p>
        <Link to="/products" className="text-indigo-400 hover:text-indigo-300 mt-2 inline-block transition-colors">
          {t('common.back')}
        </Link>
      </div>
    );
  }

  const hasApprovedVersion = versions.some((v) => v.status === 'approved');
  const canPublish = hasApprovedVersion && product.status !== 'published';
  const canUnpublish = product.status === 'published';

  return (
    <div>
      {/* Back link */}
      <Link to="/products" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-indigo-400 mb-6 transition-colors">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        {t('common.back')}
      </Link>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl px-4 py-3 mb-6">
          {error}
          <button onClick={() => setError('')} className="ml-2 font-medium underline hover:text-red-300 transition-colors">Dismiss</button>
        </div>
      )}

      {/* Product Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6">
        {editing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">{t('create.name')}</label>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">{t('create.description')}</label>
              <textarea
                value={editForm.description}
                onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                rows={4}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">{t('create.platform')}</label>
                <select
                  value={editForm.platform}
                  onChange={(e) => setEditForm((f) => ({ ...f, platform: e.target.value }))}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  {PLATFORMS.map((p) => (
                    <option key={p} value={p}>{t(`platform.${p}`)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">{t('create.product_type')}</label>
                <select
                  value={editForm.product_type}
                  onChange={(e) => setEditForm((f) => ({ ...f, product_type: e.target.value }))}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  {PRODUCT_TYPES.map((pt) => (
                    <option key={pt} value={pt}>{t(`product_type.${pt}`)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">{t('create.price')}</label>
                <input
                  type="number"
                  value={editForm.priceDisplay}
                  step="0.01"
                  min="0"
                  onChange={(e) => setEditForm((f) => ({ ...f, priceDisplay: e.target.value }))}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleSaveEdit}
                disabled={actionLoading}
                className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 transition-all shadow-lg shadow-indigo-500/25"
              >
                {actionLoading ? t('common.loading') : t('detail.save')}
              </button>
              <button
                onClick={() => setEditing(false)}
                className="text-slate-400 hover:text-white px-4 py-2 text-sm font-medium transition-colors"
              >
                {t('detail.cancel')}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-6">
            <div className="w-16 h-16 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-bold text-xl flex-shrink-0">
              {product.avatar_url ? (
                <img src={product.avatar_url} alt="" className="w-16 h-16 rounded-xl object-cover" />
              ) : (
                product.name.charAt(0).toUpperCase()
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-white">{product.name}</h1>
                <StatusBadge status={product.status} />
              </div>
              <p className="text-slate-400 mb-3">{product.description}</p>
              <div className="flex items-center gap-6 text-sm text-slate-500">
                <span>{t('create.platform')}: <strong className="text-slate-300">{t(`platform.${product.platform || 'web'}`)}</strong></span>
                <span>{t('create.product_type')}: <strong className="text-slate-300">{t(`product_type.${product.product_type || 'browser'}`)}</strong></span>
                <span>{t('create.price')}: <strong className="text-slate-300">{!product.price ? t('common.free') : `$${(product.price / 100).toFixed(2)}`}</strong></span>
                <span>{t('create.version')}: <strong className="text-slate-300">v{product.version}</strong></span>
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={() => setEditing(true)}
                className="px-4 py-2 border border-slate-700 rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
              >
                {t('detail.edit')}
              </button>
              {canPublish && (
                <button
                  onClick={handlePublish}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-500 disabled:opacity-50 transition-colors"
                >
                  {actionLoading ? t('common.loading') : t('detail.publish')}
                </button>
              )}
              {canUnpublish && (
                <button
                  onClick={handleUnpublish}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-slate-700 text-white rounded-xl text-sm font-medium hover:bg-slate-600 disabled:opacity-50 transition-colors"
                >
                  {actionLoading ? t('common.loading') : t('detail.unpublish')}
                </button>
              )}
              <Link
                to={`/products/${id}/versions/new`}
                className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl text-sm font-medium hover:from-indigo-500 hover:to-violet-500 transition-all shadow-lg shadow-indigo-500/25"
              >
                {t('detail.new_version')}
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <p className="text-sm text-slate-400">{t('detail.downloads')}</p>
          <p className="text-3xl font-bold text-white mt-1">{product.download_count}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <p className="text-sm text-slate-400">{t('detail.revenue')}</p>
          <p className="text-3xl font-bold text-white mt-1">
            ${((product.download_count * product.price) / 100).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Version History */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl">
        <div className="px-6 py-4 border-b border-slate-800">
          <h2 className="text-lg font-semibold text-white">{t('detail.versions')}</h2>
        </div>
        {versions.length === 0 ? (
          <div className="p-8 text-center text-slate-500">{t('products.no_products')}</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-800/50">
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">{t('create.version')}</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">{t('status.draft')}</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">{t('version.changelog')}</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">{t('detail.review_note')}</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Submitted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {versions.map((v) => (
                <tr key={v.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-white">v{v.version}</td>
                  <td className="px-6 py-4">
                    <VersionStatusBadge status={v.status} />
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-400 max-w-xs truncate">{v.changelog}</td>
                  <td className="px-6 py-4 text-sm max-w-xs">
                    {v.review_note ? (
                      <span className={v.status === 'rejected' || v.status === 'revoked' ? 'text-red-400' : 'text-slate-400'}>
                        {v.review_note}
                      </span>
                    ) : (
                      <span className="text-slate-600">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {new Date(v.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Screenshots */}
      {product.screenshots && product.screenshots.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl mt-6">
          <div className="px-6 py-4 border-b border-slate-800">
            <h2 className="text-lg font-semibold text-white">{t('create.screenshots')}</h2>
          </div>
          <div className="p-6 grid grid-cols-3 gap-4">
            {product.screenshots.map((url, i) => (
              <img key={i} src={url} alt={`Screenshot ${i + 1}`} className="w-full h-40 object-cover rounded-xl border border-slate-700" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const { t } = useI18n();
  const styles: Record<string, string> = {
    draft: 'bg-slate-500/10 text-slate-400',
    published: 'bg-emerald-500/10 text-emerald-400',
    unpublished: 'bg-slate-500/10 text-slate-400',
  };
  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || 'bg-slate-500/10 text-slate-400'}`}>
      {t(`status.${status}`)}
    </span>
  );
}

function VersionStatusBadge({ status }: { status: string }) {
  const { t } = useI18n();
  const styles: Record<string, string> = {
    draft: 'bg-slate-500/10 text-slate-400',
    pending_review: 'bg-yellow-500/10 text-yellow-400',
    approved: 'bg-emerald-500/10 text-emerald-400',
    rejected: 'bg-red-500/10 text-red-400',
    revoked: 'bg-red-500/10 text-red-400',
  };
  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || 'bg-slate-500/10 text-slate-400'}`}>
      {t(`status.${status}`)}
    </span>
  );
}
