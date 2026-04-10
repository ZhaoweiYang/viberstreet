import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getProducts } from '../lib/api';
import { useI18n } from '../lib/i18n';
import ProductCard from '../components/ProductCard';

const PLATFORMS = [
  { key: 'web', icon: '🌐' },
  { key: 'ios', icon: '🍎' },
  { key: 'android', icon: '🤖' },
  { key: 'macos', icon: '💻' },
  { key: 'windows', icon: '🪟' },
];

const PRODUCT_TYPES = [
  { key: 'browser', icon: '🌍' },
  { key: 'vpn', icon: '🔒' },
  { key: 'input-method', icon: '⌨️' },
  { key: 'finance', icon: '💰' },
  { key: 'office', icon: '📄' },
  { key: 'erp', icon: '🏢' },
  { key: 'web3-wallet', icon: '💎' },
  { key: 'email-client', icon: '📧' },
];

export default function HomePage() {
  const { t } = useI18n();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params: any = { limit: 12 };
    if (searchQuery) params.search = searchQuery;
    getProducts(params)
      .then((res: any) => setProducts(Array.isArray(res) ? res : res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [searchQuery]);

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16 sm:py-24 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">{t('hero.title')}</h1>
          <p className="text-lg sm:text-xl text-purple-100 max-w-2xl mx-auto mb-8">{t('hero.subtitle')}</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Platform Filter - Level 1 */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">{t('categories.platforms')}</h2>
          <div className="flex flex-wrap gap-3">
            {PLATFORMS.map((p) => (
              <Link
                key={p.key}
                to={`/browse/${p.key}`}
                className="flex items-center gap-2 px-5 py-3 bg-white border border-gray-200 rounded-xl hover:border-purple-300 hover:shadow-md transition group"
              >
                <span className="text-2xl">{p.icon}</span>
                <span className="font-medium text-gray-700 group-hover:text-purple-700">{t(`platform.${p.key}`)}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Product Type Filter - Level 2 */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">{t('categories.product_types')}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {PRODUCT_TYPES.map((pt) => (
              <Link
                key={pt.key}
                to={`/browse/all/${pt.key}`}
                className="flex flex-col items-center gap-2 p-4 bg-white border border-gray-200 rounded-xl hover:border-purple-300 hover:shadow-md transition group text-center"
              >
                <span className="text-3xl">{pt.icon}</span>
                <span className="text-sm font-medium text-gray-600 group-hover:text-purple-700">{t(`product_type.${pt.key}`)}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Product Grid */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            {searchQuery ? `"${searchQuery}"` : t('products.popular')}
          </h2>
          {loading ? (
            <div className="text-center py-16 text-gray-500">Loading...</div>
          ) : products.length === 0 ? (
            <div className="text-center py-16 text-gray-500">{t('products.no_results')}</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((p: any) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
