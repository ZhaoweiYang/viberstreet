import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getProducts } from '../lib/api';
import { useI18n } from '../lib/i18n';
import ProductCard from '../components/ProductCard';
import { PlatformIcon, ProductTypeIcon } from '../components/Icons';

const PLATFORMS = ['web', 'ios', 'android', 'macos', 'windows'];
const PRODUCT_TYPES = ['browser', 'vpn', 'input-method', 'finance', 'office', 'erp', 'web3-wallet', 'email-client', 'dao-message'];

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
      {/* Hero with gradient mesh */}
      <section className="relative overflow-hidden bg-slate-950">
        {/* Gradient mesh blobs */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl" />
          <div className="absolute top-10 right-1/4 w-80 h-80 bg-fuchsia-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-64 bg-purple-500/15 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 py-20 sm:py-28 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 tracking-tight">{t('hero.title')}</h1>
          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto mb-8">{t('hero.subtitle')}</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Platform Filter - Level 1 */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-white mb-4">{t('categories.platforms')}</h2>
          <div className="flex flex-wrap gap-3">
            {PLATFORMS.map((p) => (
              <Link
                key={p}
                to={`/browse/${p}`}
                className="flex items-center gap-3 px-5 py-3 bg-slate-800 border border-slate-700 rounded-xl hover:border-violet-500/50 hover:shadow-lg hover:shadow-violet-500/5 transition-all duration-300 group"
              >
                <span className="text-slate-400 group-hover:text-violet-400 transition"><PlatformIcon platform={p} size="lg" /></span>
                <span className="font-medium text-slate-300 group-hover:text-violet-400 transition">{t(`platform.${p}`)}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Product Type Filter - Bento Grid */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-white mb-4">{t('categories.product_types')}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {PRODUCT_TYPES.map((pt) => (
              <Link
                key={pt}
                to={`/browse/all/${pt}`}
                className="flex flex-col items-center gap-3 p-4 bg-slate-900 border border-slate-800 rounded-2xl hover:border-violet-500/50 hover:shadow-lg hover:shadow-violet-500/10 transition-all duration-300 group text-center"
              >
                <span className="text-slate-400 group-hover:text-violet-400 transition"><ProductTypeIcon type={pt} size="lg" /></span>
                <span className="text-sm font-medium text-slate-400 group-hover:text-violet-400 transition">{t(`product_type.${pt}`)}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Product Grid */}
        <section>
          <h2 className="text-xl font-bold text-white mb-6">
            {searchQuery ? `"${searchQuery}"` : t('products.popular')}
          </h2>
          {loading ? (
            <div className="text-center py-16 text-slate-500">Loading...</div>
          ) : products.length === 0 ? (
            <div className="text-center py-16 text-slate-500">{t('products.no_results')}</div>
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
