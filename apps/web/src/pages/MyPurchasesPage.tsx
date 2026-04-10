import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getMyPurchases, downloadProduct } from '../lib/api';
import { useAuth } from '../lib/auth';
import { useI18n } from '../lib/i18n';

export default function MyPurchasesPage() {
  const { user } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [purchases, setPurchases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate('/login?redirect=/my-purchases'); return; }
    getMyPurchases()
      .then((res: any) => setPurchases(Array.isArray(res) ? res : res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const handleRedownload = async (slug: string) => {
    try {
      const res: any = await downloadProduct(slug);
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
    } catch {}
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('purchases.title')}</h1>
      {loading ? (
        <div className="text-center py-16 text-gray-500">Loading...</div>
      ) : purchases.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500 mb-4">{t('purchases.empty')}</p>
          <Link to="/" className="text-purple-600 font-medium hover:text-purple-700">Browse blueprints</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {purchases.map((p: any) => (
            <div key={p.id} className="bg-white border border-gray-100 rounded-xl p-5 flex items-center justify-between">
              <div>
                <Link to={`/product/${p.product_slug}`} className="font-semibold text-gray-900 hover:text-purple-600">{p.product_name}</Link>
                <p className="text-sm text-gray-500 mt-1">v{p.version} &middot; {t('purchases.date')} {new Date(p.created_at).toLocaleDateString()}</p>
              </div>
              <button onClick={() => handleRedownload(p.product_slug)} className="px-4 py-2 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-100 transition">
                {t('purchases.redownload')}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
