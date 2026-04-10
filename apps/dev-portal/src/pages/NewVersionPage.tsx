import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { submitVersion, uploadImage, getProduct } from '../lib/api';
import { useI18n } from '../lib/i18n';

const PLATFORMS = ['web', 'ios', 'android', 'macos', 'windows'];

export default function NewVersionPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [error, setError] = useState('');
  const [screenshots, setScreenshots] = useState<string[]>([]);
  const [uploadingScreenshots, setUploadingScreenshots] = useState(false);

  const [productPlatforms, setProductPlatforms] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('');
  const [platformDocs, setPlatformDocs] = useState<Record<string, { doc_content: string; description: string }>>({});

  const [form, setForm] = useState({
    version: '',
    changelog: '',
  });

  useEffect(() => {
    if (!id) return;
    setLoadingProduct(true);
    getProduct(id)
      .then((r: any) => {
        const res = r.data || r;
        const p = res.product || res;
        // Get platforms from the product - support both plural and singular
        let platforms: string[] = [];
        if (p.platforms && Array.isArray(p.platforms)) {
          platforms = p.platforms;
        } else if (typeof p.platforms === 'string') {
          try {
            platforms = JSON.parse(p.platforms);
          } catch {
            platforms = [p.platforms];
          }
        } else if (p.platform) {
          platforms = [p.platform];
        }
        // Filter to known platforms only
        platforms = platforms.filter((pl: string) => PLATFORMS.includes(pl));
        if (platforms.length === 0) {
          platforms = ['web']; // fallback
        }
        setProductPlatforms(platforms);
        setActiveTab(platforms[0]);
        // Initialize platformDocs for each platform
        const docs: Record<string, { doc_content: string; description: string }> = {};
        for (const pl of platforms) {
          docs[pl] = { doc_content: '', description: '' };
        }
        setPlatformDocs(docs);
      })
      .catch(() => setError(t('common.error')))
      .finally(() => setLoadingProduct(false));
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePlatformDocChange = (platform: string, field: 'doc_content' | 'description', value: string) => {
    setPlatformDocs((prev) => ({
      ...prev,
      [platform]: {
        ...prev[platform],
        [field]: value,
      },
    }));
  };

  const handleScreenshotUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploadingScreenshots(true);
    try {
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        const res = await uploadImage(file);
        urls.push(res.url);
      }
      setScreenshots((prev) => [...prev, ...urls]);
    } catch (err: any) {
      setError('Failed to upload screenshots: ' + err.message);
    } finally {
      setUploadingScreenshots(false);
    }
  };

  const removeScreenshot = (index: number) => {
    setScreenshots((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setError('');

    // Validation: each platform must have doc_content
    for (const platform of productPlatforms) {
      if (!platformDocs[platform]?.doc_content?.trim()) {
        setError(`Documentation content is required for ${t(`platform.${platform}`)}.`);
        return;
      }
    }

    setLoading(true);
    try {
      await submitVersion(id, {
        version: form.version,
        changelog: form.changelog,
        platform_docs: platformDocs,
      });
      navigate(`/products/${id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loadingProduct) {
    return (
      <div className="max-w-3xl">
        <div className="text-slate-400 text-center py-12">{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <Link to={`/products/${id}`} className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-indigo-400 mb-6 transition-colors">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        {t('common.back')}
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">{t('version.title')}</h1>
        <p className="text-slate-400 mt-1">This version will be automatically submitted for review.</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl px-4 py-3 mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">{t('version.title')}</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">{t('version.number')}</label>
              <input
                type="text"
                name="version"
                required
                value={form.version}
                onChange={handleChange}
                placeholder="2.0.0"
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">{t('version.changelog')}</label>
              <textarea
                name="changelog"
                required
                value={form.changelog}
                onChange={handleChange}
                rows={4}
                placeholder="Describe what changed in this version..."
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              />
            </div>
          </div>
        </div>

        {/* Per-Platform Documentation Tabs */}
        {productPlatforms.length > 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">{t('version.documentation')}</h2>

            {/* Tab Bar */}
            <div className="flex border-b border-slate-700 mb-4">
              {productPlatforms.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setActiveTab(p)}
                  className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
                    activeTab === p
                      ? 'border-indigo-500 text-indigo-400'
                      : 'border-transparent text-slate-500 hover:text-slate-300 hover:border-slate-600'
                  }`}
                >
                  {t(`platform.${p}`)}
                  {platformDocs[p]?.doc_content?.trim() ? (
                    <span className="ml-2 w-1.5 h-1.5 bg-emerald-400 rounded-full inline-block" />
                  ) : (
                    <span className="ml-2 w-1.5 h-1.5 bg-slate-600 rounded-full inline-block" />
                  )}
                </button>
              ))}
            </div>

            {/* Active Tab Content */}
            {activeTab && platformDocs[activeTab] && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    {t('create.description')} ({t(`platform.${activeTab}`)})
                  </label>
                  <textarea
                    value={platformDocs[activeTab].description}
                    onChange={(e) => handlePlatformDocChange(activeTab, 'description', e.target.value)}
                    rows={3}
                    placeholder={`Platform-specific description for ${t(`platform.${activeTab}`)}...`}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    {t('version.documentation')} ({t(`platform.${activeTab}`)})
                  </label>
                  <p className="text-xs text-slate-500 mb-2">Supports markdown formatting</p>
                  <textarea
                    value={platformDocs[activeTab].doc_content}
                    onChange={(e) => handlePlatformDocChange(activeTab, 'doc_content', e.target.value)}
                    rows={12}
                    placeholder={"# Getting Started\n\nUpdated documentation for this version..."}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-y font-mono text-sm"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Screenshots */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">{t('version.screenshots')}</h2>
          <div className="space-y-4">
            {screenshots.length > 0 && (
              <div className="grid grid-cols-3 gap-4">
                {screenshots.map((url, i) => (
                  <div key={i} className="relative group">
                    <img src={url} alt={`Screenshot ${i + 1}`} className="w-full h-32 object-cover rounded-xl border border-slate-700" />
                    <button
                      type="button"
                      onClick={() => removeScreenshot(i)}
                      className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                    >
                      X
                    </button>
                  </div>
                ))}
              </div>
            )}
            <label className="cursor-pointer inline-flex items-center gap-2 bg-slate-800 border border-slate-700 px-4 py-2 rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {uploadingScreenshots ? 'Uploading...' : t('version.screenshots')}
              <input type="file" accept="image/*" multiple onChange={handleScreenshotUpload} className="hidden" disabled={uploadingScreenshots} />
            </label>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={loading || uploadingScreenshots}
            className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-8 py-3 rounded-xl font-medium hover:from-indigo-500 hover:to-violet-500 transition-all disabled:opacity-50 shadow-lg shadow-indigo-500/25"
          >
            {loading ? t('version.submitting') : t('version.submit')}
          </button>
          <button
            type="button"
            onClick={() => navigate(`/products/${id}`)}
            className="text-slate-400 hover:text-white px-4 py-3 font-medium transition-colors"
          >
            {t('detail.cancel')}
          </button>
        </div>
      </form>
    </div>
  );
}
