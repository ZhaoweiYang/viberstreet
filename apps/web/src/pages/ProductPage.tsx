import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getProduct, downloadProduct, getPurchaseStatus, createCheckout } from '../lib/api';
import { useAuth } from '../lib/auth';
import { useI18n } from '../lib/i18n';

const PLATFORM_ICONS: Record<string, string> = { web: '🌐', ios: '🍎', android: '🤖', macos: '💻', windows: '🪟' };
const TYPE_ICONS: Record<string, string> = {
  browser: '🌍', vpn: '🔒', 'input-method': '⌨️', finance: '💰',
  office: '📄', erp: '🏢', 'web3-wallet': '💎', 'email-client': '📧',
};

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [purchased, setPurchased] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [activeScreenshot, setActiveScreenshot] = useState(0);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    getProduct(slug)
      .then((res: any) => {
        const p = res.data || res;
        setProduct(p);
        if (user && p.price > 0) {
          getPurchaseStatus(slug).then((r: any) => setPurchased(r.data?.purchased || false)).catch(() => {});
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug, user]);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 4000); };

  const handleDownload = async () => {
    if (!slug) return;
    setDownloading(true);
    try {
      const res = await downloadProduct(slug);
      const data = res.data || res;
      const blob = new Blob([data.doc_content], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${slug}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Download started!');
    } catch (err: any) {
      showToast(err.message || 'Download failed');
    } finally {
      setDownloading(false);
    }
  };

  const handleCheckout = async () => {
    if (!product) return;
    try {
      const res: any = await createCheckout(product.id);
      window.location.href = res.checkout_url || res;
    } catch (err: any) {
      showToast(err.message || 'Checkout failed');
    }
  };

  if (loading) {
    return <div className="max-w-7xl mx-auto px-4 py-12"><div className="animate-pulse space-y-6"><div className="h-24 bg-gray-100 rounded-2xl" /><div className="h-64 bg-gray-100 rounded-2xl" /></div></div>;
  }

  if (!product) {
    return <div className="max-w-7xl mx-auto px-4 py-20 text-center"><h2 className="text-2xl font-bold text-gray-900">{t('products.no_results')}</h2><Link to="/" className="mt-6 inline-flex text-purple-600">&larr; Back</Link></div>;
  }

  const price = product.price || 0;
  const isFree = price === 0;
  const priceLabel = isFree ? t('products.free') : `$${(price / 100).toFixed(2)}`;
  const canDownload = isFree || purchased;
  const screenshots = product.screenshots?.map((s: any) => s.url || s) || product.screenshot_urls || [];
  const versions = product.versions || [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {toast && (
        <div className="fixed top-20 right-4 z-50"><div className="bg-gray-900 text-white px-5 py-3 rounded-xl shadow-lg text-sm font-medium">{toast}</div></div>
      )}

      <nav className="mb-6 text-sm text-gray-500">
        <Link to="/" className="hover:text-purple-600">Home</Link>
        <span className="mx-2">/</span>
        <Link to={`/browse/${product.platform}`} className="hover:text-purple-600">
          {PLATFORM_ICONS[product.platform]} {t(`platform.${product.platform}`)}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900 font-medium">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Header */}
          <div className="flex items-start gap-5">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-br from-purple-100 to-purple-50 flex items-center justify-center text-4xl shadow-sm shrink-0">
              {product.avatar_url ? (
                <img src={product.avatar_url} alt={product.name} className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover" />
              ) : (
                <span>{TYPE_ICONS[product.product_type] || '📦'}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{product.name}</h1>
              <p className="text-gray-500 mt-1">{t('product.by')} {product.developer_name}</p>
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-600 bg-gray-100 px-2.5 py-1 rounded-lg">
                  {PLATFORM_ICONS[product.platform]} {t(`platform.${product.platform}`)}
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-600 bg-gray-100 px-2.5 py-1 rounded-lg">
                  {TYPE_ICONS[product.product_type]} {t(`product_type.${product.product_type}`)}
                </span>
                <span className={`text-sm font-semibold px-3 py-1 rounded-lg ${isFree ? 'text-green-700 bg-green-50' : 'text-purple-700 bg-purple-50'}`}>
                  {priceLabel}
                </span>
                {product.current_version && (
                  <span className="text-xs text-gray-400 bg-gray-50 px-2.5 py-1 rounded-lg">v{product.current_version}</span>
                )}
              </div>
            </div>
          </div>

          {/* Screenshots */}
          {screenshots.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('product.screenshots')}</h2>
              <div className="rounded-2xl overflow-hidden bg-gray-50 border border-gray-100">
                <img src={screenshots[activeScreenshot]} alt={`Screenshot ${activeScreenshot + 1}`} className="w-full h-auto max-h-[500px] object-contain" />
              </div>
              {screenshots.length > 1 && (
                <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                  {screenshots.map((url: string, i: number) => (
                    <button key={i} onClick={() => setActiveScreenshot(i)} className={`shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition ${i === activeScreenshot ? 'border-purple-500' : 'border-gray-200 opacity-60 hover:opacity-100'}`}>
                      <img src={url} alt={`Thumb ${i + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Description */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">{t('product.description')}</h2>
            <div className="text-gray-600 leading-relaxed whitespace-pre-wrap">{product.description}</div>
          </div>

          {/* Version History */}
          {versions.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">{t('product.versions')}</h2>
              <div className="space-y-3">
                {versions.map((v: any) => (
                  <div key={v.id} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-gray-900">v{v.version}</span>
                      <span className="text-xs text-gray-400">{new Date(v.created_at).toLocaleDateString()}</span>
                    </div>
                    {v.changelog && <p className="text-sm text-gray-600">{v.changelog}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="text-center mb-5"><div className="text-3xl font-bold text-gray-900">{priceLabel}</div></div>
              {!user ? (
                <button onClick={() => navigate(`/login?redirect=/product/${slug}`)} className="w-full py-3 px-4 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 transition text-sm">
                  {t('product.login_to_download')}
                </button>
              ) : canDownload ? (
                <button onClick={handleDownload} disabled={downloading} className="w-full py-3 px-4 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 transition text-sm disabled:opacity-60">
                  {downloading ? t('product.downloading') : isFree ? t('product.download_free') : t('product.download')}
                </button>
              ) : (
                <button onClick={handleCheckout} className="w-full py-3 px-4 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 transition text-sm">
                  {t('product.buy_for')} {priceLabel}
                </button>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-3">
              <div className="flex justify-between text-sm"><span className="text-gray-500">{t('products.downloads')}</span><span className="font-medium">{(product.download_count || 0).toLocaleString()}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">{t('product.version')}</span><span className="font-medium">{product.current_version || '1.0.0'}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">{t('product.by')}</span><span className="font-medium">{product.developer_name}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
