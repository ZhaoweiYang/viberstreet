import React from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../lib/i18n';

const PLATFORM_ICONS: Record<string, string> = { web: '🌐', ios: '🍎', android: '🤖', macos: '💻', windows: '🪟' };
const TYPE_ICONS: Record<string, string> = {
  browser: '🌍', vpn: '🔒', 'input-method': '⌨️', finance: '💰',
  office: '📄', erp: '🏢', 'web3-wallet': '💎', 'email-client': '📧',
};

export default function ProductCard({ product }: { product: any }) {
  const { t } = useI18n();
  const price = product.price || 0;
  const priceLabel = price === 0 ? t('products.free') : `$${(price / 100).toFixed(2)}`;

  return (
    <Link
      to={`/product/${product.slug}`}
      className="group block bg-slate-900 rounded-2xl border border-slate-800 hover:border-violet-500/50 hover:shadow-lg hover:shadow-violet-500/10 transition-all duration-300 overflow-hidden"
    >
      <div className="p-5">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/10 flex items-center justify-center shrink-0 text-2xl">
            {product.avatar_url ? (
              <img src={product.avatar_url} alt={product.name} className="w-14 h-14 rounded-2xl object-cover" />
            ) : (
              <span>{TYPE_ICONS[product.product_type] || '📦'}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-white group-hover:text-violet-400 transition truncate">
              {product.name}
            </h3>
            <p className="text-sm text-slate-500 mt-0.5 truncate">{product.developer_name}</p>
            <p className="text-sm text-slate-400 mt-1 line-clamp-2 leading-relaxed">{product.description}</p>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-800">
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-400 bg-slate-800 px-2 py-1 rounded-lg">
              {PLATFORM_ICONS[product.platform] || '🌐'} {t(`platform.${product.platform}`)}
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-400 bg-slate-800 px-2 py-1 rounded-lg">
              {TYPE_ICONS[product.product_type] || '📦'} {t(`product_type.${product.product_type}`)}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-xs text-slate-500">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              {(product.download_count || 0).toLocaleString()}
            </span>
            <span className={`text-sm font-semibold px-2.5 py-1 rounded-lg ${price === 0 ? 'text-emerald-400 bg-emerald-500/10' : 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white'}`}>
              {priceLabel}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
