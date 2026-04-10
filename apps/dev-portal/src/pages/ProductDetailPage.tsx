import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getProduct, updateProduct, publishProduct, unpublishProduct, type Product, type ProductVersion } from '../lib/api';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [versions, setVersions] = useState<ProductVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    category: '',
    price_cents: 0,
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
          price: p.price || 0,
        });
      })
      .catch(() => setError('Failed to load product'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handlePublish = async () => {
    if (!id) return;
    setActionLoading(true);
    try {
      const res = await publishProduct(id);
      setProduct(res.product);
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
      const res = await unpublishProduct(id);
      setProduct(res.product);
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
      const res = await updateProduct(id, editForm);
      setProduct(res.product);
      setEditing(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Product not found.</p>
        <Link to="/products" className="text-indigo-600 hover:text-indigo-700 mt-2 inline-block">
          Back to products
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
      <Link to="/products" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-indigo-600 mb-6">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to products
      </Link>

      {error && (
        <div className="bg-red-50 text-red-700 text-sm rounded-lg px-4 py-3 mb-6">
          {error}
          <button onClick={() => setError('')} className="ml-2 font-medium underline">Dismiss</button>
        </div>
      )}

      {/* Product Header */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
        {editing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Product Name</label>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea
                value={editForm.description}
                onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                rows={4}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                <input
                  type="text"
                  value={editForm.category}
                  onChange={(e) => setEditForm((f) => ({ ...f, category: e.target.value }))}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Price (cents)</label>
                <input
                  type="number"
                  value={editForm.price_cents}
                  onChange={(e) => setEditForm((f) => ({ ...f, price_cents: parseInt(e.target.value) || 0 }))}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleSaveEdit}
                disabled={actionLoading}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
              >
                {actionLoading ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={() => setEditing(false)}
                className="text-slate-600 hover:text-slate-800 px-4 py-2 text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-6">
            <div className="w-16 h-16 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xl flex-shrink-0">
              {product.avatar_url ? (
                <img src={product.avatar_url} alt="" className="w-16 h-16 rounded-xl object-cover" />
              ) : (
                product.name.charAt(0).toUpperCase()
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-slate-900">{product.name}</h1>
                <StatusBadge status={product.status} />
              </div>
              <p className="text-slate-500 mb-3">{product.description}</p>
              <div className="flex items-center gap-6 text-sm text-slate-500">
                <span>Category: <strong className="text-slate-700">{product.category}</strong></span>
                <span>Price: <strong className="text-slate-700">{product.is_free ? 'Free' : `$${(product.price_cents / 100).toFixed(2)}`}</strong></span>
                <span>Version: <strong className="text-slate-700">v{product.version}</strong></span>
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={() => setEditing(true)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Edit
              </button>
              {canPublish && (
                <button
                  onClick={handlePublish}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  {actionLoading ? 'Publishing...' : 'Publish'}
                </button>
              )}
              {canUnpublish && (
                <button
                  onClick={handleUnpublish}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-slate-600 text-white rounded-lg text-sm font-medium hover:bg-slate-700 disabled:opacity-50 transition-colors"
                >
                  {actionLoading ? 'Unpublishing...' : 'Unpublish'}
                </button>
              )}
              <Link
                to={`/products/${id}/versions/new`}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
              >
                New Version
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <p className="text-sm text-slate-500">Downloads</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">{product.download_count}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <p className="text-sm text-slate-500">Revenue</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">
            ${((product.download_count * product.price_cents) / 100).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Version History */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Version History</h2>
        </div>
        {versions.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No versions found.</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Version</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Changelog</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Review Note</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Submitted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {versions.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">v{v.version}</td>
                  <td className="px-6 py-4">
                    <VersionStatusBadge status={v.status} />
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate">{v.changelog}</td>
                  <td className="px-6 py-4 text-sm max-w-xs">
                    {v.review_note ? (
                      <span className={v.status === 'rejected' || v.status === 'revoked' ? 'text-red-600' : 'text-slate-600'}>
                        {v.review_note}
                      </span>
                    ) : (
                      <span className="text-slate-300">-</span>
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
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 mt-6">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">Screenshots</h2>
          </div>
          <div className="p-6 grid grid-cols-3 gap-4">
            {product.screenshots.map((url, i) => (
              <img key={i} src={url} alt={`Screenshot ${i + 1}`} className="w-full h-40 object-cover rounded-lg border border-slate-200" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    draft: 'bg-slate-100 text-slate-700',
    published: 'bg-green-100 text-green-700',
    unpublished: 'bg-slate-100 text-slate-600',
  };
  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || 'bg-slate-100 text-slate-700'}`}>
      {status}
    </span>
  );
}

function VersionStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    draft: 'bg-slate-100 text-slate-700',
    pending_review: 'bg-yellow-100 text-yellow-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
    revoked: 'bg-red-100 text-red-700',
  };
  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || 'bg-slate-100 text-slate-700'}`}>
      {status.replace('_', ' ')}
    </span>
  );
}
