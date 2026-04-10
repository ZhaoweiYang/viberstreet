import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getMyPurchases, downloadProduct } from '../lib/api';
import { useAuth } from '../lib/auth';
import { useI18n } from '../lib/i18n';

const PLATFORM_ICONS: Record<string, string> = { web: '🌐', ios: '🍎', android: '🤖', macos: '💻', windows: '🪟' };
const TYPE_ICONS: Record<string, string> = {
  browser: '🌍', vpn: '🔒', 'input-method': '⌨️', finance: '💰',
  office: '📄', erp: '🏢', 'web3-wallet': '💎', 'email-client': '📧',
};

export default function MyPurchasesPage() {
  const { user } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [purchases, setPurchases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) { navigate('/login?redirect=/my-purchases'); return; }
    getMyPurchases()
      .then((res: any) => setPurchases(Array.isArray(res) ? res : res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const handleRedownload = async (slug: string, id: string) => {
    setDownloadingId(id);
    try {
      const res: any = await downloadProduct(slug);
      const data = res.doc_content ? res : res.data || res;
      const blob = new Blob([data.doc_content], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${slug}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {}
    setDownloadingId(null);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-6">{t('purchases.title')}</h1>
      {loading ? (
        <div className="text-center py-16 text-slate-500">Loading...</div>
      ) : purchases.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-slate-500 mb-4">{t('purchases.empty')}</p>
          <Link to="/" className="text-violet-400 font-medium hover:text-violet-300 transition">Browse blueprints</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {purchases.map((p: any) => (
            <div key={p.id} className="bg-slate-900 border border-slate-800 rounded-2xl hover:border-violet-500/50 transition-all duration-300 overflow-hidden">
              <div className="p-5">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/10 flex items-center justify-center text-2xl shrink-0">
                    {p.product_avatar ? (
                      <img src={p.product_avatar} alt="" className="w-14 h-14 rounded-xl object-cover" />
                    ) : (
                      <span>{TYPE_ICONS[p.product_type] || '📦'}</span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <Link to={`/product/${p.product_slug}`} className="text-lg font-semibold text-white hover:text-violet-400 transition">
                          {p.product_name}
                        </Link>
                        <p className="text-sm text-slate-500 mt-0.5">{p.developer_name || 'Developer'}</p>
                      </div>
                      <button
                        onClick={() => handleRedownload(p.product_slug, p.id)}
                        disabled={downloadingId === p.id}
                        className="shrink-0 px-4 py-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white rounded-xl text-sm font-medium transition disabled:opacity-60"
                      >
                        {downloadingId === p.id ? '...' : t('purchases.redownload')}
                      </button>
                    </div>

                    {/* Description */}
                    {p.description && (
                      <p className="text-sm text-slate-400 mt-2 line-clamp-2">{p.description}</p>
                    )}

                    {/* Meta */}
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      {p.platform && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-400 bg-slate-800 px-2 py-1 rounded-lg">
                          {PLATFORM_ICONS[p.platform] || '🌐'} {t(`platform.${p.platform}`)}
                        </span>
                      )}
                      {p.product_type && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-400 bg-slate-800 px-2 py-1 rounded-lg">
                          {TYPE_ICONS[p.product_type] || '📦'} {t(`product_type.${p.product_type}`)}
                        </span>
                      )}
                      <span className="text-xs text-slate-500">v{p.version}</span>
                      <span className="text-xs text-slate-600">&middot;</span>
                      <span className="text-xs text-slate-500">{t('purchases.date')} {new Date(p.created_at).toLocaleDateString()}</span>
                      {p.price > 0 && (
                        <>
                          <span className="text-xs text-slate-600">&middot;</span>
                          <span className="text-xs font-medium text-violet-400">${(p.price / 100).toFixed(2)}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
