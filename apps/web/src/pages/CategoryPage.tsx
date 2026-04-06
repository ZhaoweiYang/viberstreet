import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProducts } from '../lib/api';
import { useI18n } from '../lib/i18n';
import ProductCard from '../components/ProductCard';

const PLATFORMS = ['web', 'ios', 'android', 'macos', 'windows'];
const PLATFORM_ICONS: Record<string, string> = { web: '🌐', ios: '🍎', android: '🤖', macos: '💻', windows: '🪟' };

const PRODUCT_TYPES = ['browser', 'vpn', 'input-method', 'finance', 'office', 'erp', 'web3-wallet', 'email-client'];
const TYPE_ICONS: Record<string, string> = {
  browser: '🌍', vpn: '🔒', 'input-method': '⌨️', finance: '💰',
  office: '📄', erp: '🏢', 'web3-wallet': '💎', 'email-client': '📧',
};

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
        setProducts(res.data || []);
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
        setProducts(res.data || []);
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
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
          <Link to="/" className="hover:text-purple-600">{t('categories.all')}</Link>
          {platform && platform !== 'all' && (
            <>
              <span>/</span>
              <Link to={`/browse/${platform}`} className="hover:text-purple-600">
                {PLATFORM_ICONS[platform]} {t(`platform.${platform}`)}
              </Link>
            </>
          )}
          {productType && (
            <>
              <span>/</span>
              <span className="text-gray-900">{TYPE_ICONS[productType]} {t(`product_type.${productType}`)}</span>
            </>
          )}
        </div>

        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          {productType ? (
            <>{TYPE_ICONS[productType]} {t(`product_type.${productType}`)}</>
          ) : platform && platform !== 'all' ? (
            <>{PLATFORM_ICONS[platform]} {t(`platform.${platform}`)}</>
          ) : (
            t('products.all')
          )}
        </h1>
      </div>

      {/* Platform tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Link
          to="/browse"
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
            !platform || platform === 'all' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {t('categories.all')}
        </Link>
        {PLATFORMS.map((p) => (
          <Link
            key={p}
            to={productType ? `/browse/${p}/${productType}` : `/browse/${p}`}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              platform === p ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {PLATFORM_ICONS[p]} {t(`platform.${p}`)}
          </Link>
        ))}
      </div>

      {/* Product type tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        <Link
          to={platform && platform !== 'all' ? `/browse/${platform}` : '/browse'}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
            !productType ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {t('categories.all')}
        </Link>
        {PRODUCT_TYPES.map((pt) => (
          <Link
            key={pt}
            to={`/browse/${platform || 'all'}/${pt}`}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              productType === pt ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {TYPE_ICONS[pt]} {t(`product_type.${pt}`)}
          </Link>
        ))}
      </div>

      {/* Products */}
      {loading ? (
        <div className="text-center py-16 text-gray-500">Loading...</div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 text-gray-500">{t('products.no_results')}</div>
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
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                    p === page ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
