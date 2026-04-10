import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProducts } from '../lib/api';
import { useI18n } from '../lib/i18n';
import ProductCard from '../components/ProductCard';
import { PlatformIcon, ProductTypeIcon } from '../components/Icons';

const PLATFORMS = ['web', 'ios', 'android', 'macos', 'windows'];
const PRODUCT_TYPES = ['browser', 'vpn', 'input-method', 'finance', 'office', 'erp', 'web3-wallet', 'email-client', 'dao-message'];

export default function CategoryPage() {
  const { platform, productType } = useParams<{ platform?: string; productType?: string }>();
  const { t } = useI18n();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setLoading(true);
    setPage(1);
    const params: any = { limit: 20, page: 1 };
    if (platform && platform !== 'all') params.platform = platform;
    if (productType) params.product_type = productType;
    getProducts(params)
      .then((res: any) => {
        setProducts(Array.isArray(res) ? res : res.data || []);
        setTotalPages(res.pagination?.totalPages || 1);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [platform, productType]);

  const loadPage = (p: number) => {
    setLoading(true);
    const params: any = { limit: 20, page: p };
    if (platform && platform !== 'all') params.platform = platform;
    if (productType) params.product_type = productType;
    getProducts(params)
      .then((res: any) => {
        setProducts(Array.isArray(res) ? res : res.data || []);
        setPage(p);
        setTotalPages(res.pagination?.totalPages || 1);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb + Platform header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
          <Link to="/" className="hover:text-violet-400 transition">{t('categories.all')}</Link>
          {platform && platform !== 'all' && (
            <>
              <span>/</span>
              <Link to={`/browse/${platform}`} className="hover:text-violet-400 transition">
                <PlatformIcon platform={platform} /> {t(`platform.${platform}`)}
              </Link>
            </>
          )}
          {productType && (
            <>
              <span>/</span>
              <span className="text-white flex items-center gap-1"><ProductTypeIcon type={productType} /> {t(`product_type.${productType}`)}</span>
            </>
          )}
        </div>

        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          {productType ? (
            <><ProductTypeIcon type={productType} /> {t(`product_type.${productType}`)}</>
          ) : platform && platform !== 'all' ? (
            <><PlatformIcon platform={platform} /> {t(`platform.${platform}`)}</>
          ) : (
            t('products.all')
          )}
        </h1>
      </div>

      {/* Platform tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Link
          to="/browse"
          className={`px-3 py-1.5 rounded-xl text-sm font-medium transition ${
            !platform || platform === 'all' ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 border border-slate-700'
          }`}
        >
          {t('categories.all')}
        </Link>
        {PLATFORMS.map((p) => (
          <Link
            key={p}
            to={productType ? `/browse/${p}/${productType}` : `/browse/${p}`}
            className={`px-3 py-1.5 rounded-xl text-sm font-medium transition ${
              platform === p ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 border border-slate-700'
            }`}
          >
            <PlatformIcon platform={p} /> {t(`platform.${p}`)}
          </Link>
        ))}
      </div>

      {/* Product type tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        <Link
          to={platform && platform !== 'all' ? `/browse/${platform}` : '/browse'}
          className={`px-3 py-1.5 rounded-xl text-sm font-medium transition ${
            !productType ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 border border-slate-700'
          }`}
        >
          {t('categories.all')}
        </Link>
        {PRODUCT_TYPES.map((pt) => (
          <Link
            key={pt}
            to={`/browse/${platform || 'all'}/${pt}`}
            className={`px-3 py-1.5 rounded-xl text-sm font-medium transition ${
              productType === pt ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 border border-slate-700'
            }`}
          >
            <ProductTypeIcon type={pt} /> {t(`product_type.${pt}`)}
          </Link>
        ))}
      </div>

      {/* Products */}
      {loading ? (
        <div className="text-center py-16 text-slate-500">Loading...</div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 text-slate-500">{t('products.no_results')}</div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((p: any) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => loadPage(p)}
                  className={`px-3 py-1.5 rounded-xl text-sm font-medium transition ${
                    p === page ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
