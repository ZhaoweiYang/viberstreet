import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../lib/i18n';
import { getProducts } from '../lib/api';

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    draft: 'bg-slate-100 text-slate-600',
    published: 'bg-emerald-100 text-emerald-700',
    unpublished: 'bg-amber-100 text-amber-700',
    pending_review: 'bg-amber-100 text-amber-700',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || 'bg-slate-100 text-slate-600'}`}>
      {status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
    </span>
  );
}

export default function ProductListPage() {
  const { t } = useI18n();
  const [products, setProducts] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(true);

  const statusFilters = [
    { key: '', label: t('products.tab_all') },
    { key: 'draft', label: t('products.tab_draft') },
    { key: 'published', label: t('products.tab_published') },
    { key: 'unpublished', label: t('products.tab_unpublished') },
  ];

  useEffect(() => {
    setLoading(true);
    getProducts({ page, status: statusFilter, search })
      .then((res) => {
        setProducts(res.products);
        setTotal(res.total);
        setTotalPages(res.totalPages);
      })
      .catch(() => {
        setProducts([]);
        setTotal(0);
      })
      .finally(() => setLoading(false));
  }, [page, statusFilter, search]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">{t('products.title')}</h1>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
          {statusFilters.map((f) => (
            <button
              key={f.key}
              onClick={() => {
                setStatusFilter(f.key);
                setPage(1);
              }}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                statusFilter === f.key
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={t('common.search')}
            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
          >
            {t('common.search')}
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600" />
          </div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center">
            <svg className="w-12 h-12 mx-auto text-slate-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <p className="text-slate-500 text-sm">{t('products.no_products')}</p>
          </div>
        ) : (
          <>
            <div className="px-6 py-3 border-b border-slate-100 text-xs text-slate-500">
              {total} product{total !== 1 ? 's' : ''}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">
                      {t('products.name')}
                    </th>
                    <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">
                      {t('products.developer')}
                    </th>
                    <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">
                      {t('products.platform')}
                    </th>
                    <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">
                      {t('products.product_type')}
                    </th>
                    <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">
                      {t('products.status')}
                    </th>
                    <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">
                      {t('products.price')}
                    </th>
                    <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">
                      {t('products.downloads')}
                    </th>
                    <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">
                      {t('products.created')}
                    </th>
                    <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">
                      {t('reviews.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.map((product: any) => (
                    <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {product.avatar_url ? (
                            <img
                              src={product.avatar_url}
                              alt=""
                              className="w-8 h-8 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                              </svg>
                            </div>
                          )}
                          <p className="text-sm font-medium text-slate-900">{product.name}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {product.developer_name || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {product.platform ? t(`platform.${product.platform}`) : '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {product.product_type ? t(`product_type.${product.product_type}`) : '-'}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={product.status || 'draft'} />
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {product.is_free || product.price_cents === 0
                          ? t('products.free')
                          : `$${((product.price_cents || 0) / 100).toFixed(2)}`}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {(product.download_count || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {product.created_at
                          ? new Date(product.created_at).toLocaleDateString()
                          : '-'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {product.latest_version_id ? (
                          <Link
                            to={`/reviews/${product.latest_version_id}`}
                            className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-md transition-colors"
                          >
                            {t('reviews.review')}
                          </Link>
                        ) : (
                          <span className="text-xs text-slate-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
                <p className="text-sm text-slate-500">
                  {t('common.page')} {page} {t('common.of')} {totalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="px-3 py-1.5 text-sm border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {t('common.previous')}
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="px-3 py-1.5 text-sm border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {t('common.next')}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
