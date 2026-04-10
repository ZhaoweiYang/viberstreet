import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createProduct, uploadImage } from '../lib/api';
import { useI18n } from '../lib/i18n';

const PLATFORMS = ['web', 'ios', 'android', 'macos', 'windows'];
const PRODUCT_TYPES = ['browser', 'vpn', 'input-method', 'finance', 'office', 'erp', 'web3-wallet', 'email-client', 'dao-message'];

export default function CreateProductPage() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [screenshots, setScreenshots] = useState<string[]>([]);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingScreenshots, setUploadingScreenshots] = useState(false);

  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('');
  const [platformDocs, setPlatformDocs] = useState<Record<string, { doc_content: string; description: string }>>({});

  const [form, setForm] = useState({
    name: '',
    description: '',
    product_type: 'browser',
    price: '',
    version: '1.0.0',
    changelog: 'Initial release',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePlatformToggle = (platform: string) => {
    setSelectedPlatforms((prev) => {
      const isSelected = prev.includes(platform);
      let next: string[];
      if (isSelected) {
        next = prev.filter((p) => p !== platform);
        // Clean up platformDocs for deselected platform
        setPlatformDocs((docs) => {
          const updated = { ...docs };
          delete updated[platform];
          return updated;
        });
        // If the active tab was deselected, switch to the first remaining
        if (activeTab === platform) {
          const remaining = next;
          setActiveTab(remaining.length > 0 ? remaining[0] : '');
        }
      } else {
        next = [...prev, platform];
        // Initialize platformDocs for newly selected platform
        setPlatformDocs((docs) => ({
          ...docs,
          [platform]: { doc_content: '', description: '' },
        }));
        // If no active tab, set this as active
        if (!activeTab || !next.includes(activeTab)) {
          setActiveTab(platform);
        }
      }
      return next;
    });
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

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const res = await uploadImage(file);
      setAvatarUrl(res.url);
    } catch (err: any) {
      setError('Failed to upload avatar: ' + err.message);
    } finally {
      setUploadingAvatar(false);
    }
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
    setError('');

    // Validation: at least one platform
    if (selectedPlatforms.length === 0) {
      setError('Please select at least one platform.');
      return;
    }

    // Validation: each selected platform must have doc_content
    for (const platform of selectedPlatforms) {
      if (!platformDocs[platform]?.doc_content?.trim()) {
        setError(`Documentation content is required for ${t(`platform.${platform}`)}.`);
        return;
      }
    }

    setLoading(true);
    try {
      const priceCents = form.price ? Math.round(parseFloat(form.price) * 100) : 0;
      const result: any = await createProduct({
        name: form.name,
        description: form.description,
        platforms: selectedPlatforms,
        product_type: form.product_type,
        price: priceCents,
        version: form.version,
        changelog: form.changelog,
        platform_docs: platformDocs,
      });
      const data = result.data || result;
      navigate(`/products/${data.id || data.product?.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">{t('create.title')}</h1>
        <p className="text-slate-400 mt-1">Submit a new product for review. It will be reviewed by our team before publishing.</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl px-4 py-3 mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Product Info */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">{t('create.title')}</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">{t('create.name')}</label>
              <input
                type="text"
                name="name"
                required
                value={form.name}
                onChange={handleChange}
                placeholder="My Awesome Product"
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">{t('create.description')}</label>
              <textarea
                name="description"
                required
                value={form.description}
                onChange={handleChange}
                rows={4}
                placeholder="Describe what your product does..."
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Platform Checkbox Grid */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">{t('create.platform')}</label>
              <div className="grid grid-cols-5 gap-3">
                {PLATFORMS.map((p) => (
                  <label
                    key={p}
                    className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border cursor-pointer transition-all text-sm font-medium ${
                      selectedPlatforms.includes(p)
                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedPlatforms.includes(p)}
                      onChange={() => handlePlatformToggle(p)}
                      className="sr-only"
                    />
                    {t(`platform.${p}`)}
                  </label>
                ))}
              </div>
            </div>

            {/* Product Type */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">{t('create.product_type')}</label>
              <select
                name="product_type"
                value={form.product_type}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                {PRODUCT_TYPES.map((pt) => (
                  <option key={pt} value={pt}>
                    {t(`product_type.${pt}`)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">{t('create.price')}</label>
              <p className="text-xs text-slate-500 mb-2">{t('create.price_hint')}</p>
              <input
                type="number"
                name="price"
                min="0"
                step="0.01"
                value={form.price}
                onChange={handleChange}
                placeholder="0.00"
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Avatar Upload */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">{t('create.avatar')}</label>
              <div className="flex items-center gap-4">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-16 h-16 rounded-xl object-cover" />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                <label className="cursor-pointer bg-slate-800 border border-slate-700 px-4 py-2 rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">
                  {uploadingAvatar ? 'Uploading...' : t('create.avatar')}
                  <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" disabled={uploadingAvatar} />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Version Info */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">{t('create.version')}</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">{t('create.version')}</label>
                <input
                  type="text"
                  name="version"
                  required
                  value={form.version}
                  onChange={handleChange}
                  placeholder="1.0.0"
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">{t('create.changelog')}</label>
              <textarea
                name="changelog"
                required
                value={form.changelog}
                onChange={handleChange}
                rows={3}
                placeholder="What's new in this version..."
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              />
            </div>
          </div>
        </div>

        {/* Per-Platform Documentation Tabs */}
        {selectedPlatforms.length > 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">{t('create.documentation')}</h2>

            {/* Tab Bar */}
            <div className="flex border-b border-slate-700 mb-4">
              {selectedPlatforms.map((p) => (
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
                    {t('create.documentation')} ({t(`platform.${activeTab}`)})
                  </label>
                  <p className="text-xs text-slate-500 mb-2">Supports markdown formatting</p>
                  <textarea
                    value={platformDocs[activeTab].doc_content}
                    onChange={(e) => handlePlatformDocChange(activeTab, 'doc_content', e.target.value)}
                    rows={12}
                    placeholder={t('create.doc_placeholder')}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-y font-mono text-sm"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Screenshots */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">{t('create.screenshots')}</h2>
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
              {uploadingScreenshots ? 'Uploading...' : t('create.screenshots')}
              <input type="file" accept="image/*" multiple onChange={handleScreenshotUpload} className="hidden" disabled={uploadingScreenshots} />
            </label>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={loading || uploadingAvatar || uploadingScreenshots}
            className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-8 py-3 rounded-xl font-medium hover:from-indigo-500 hover:to-violet-500 transition-all disabled:opacity-50 shadow-lg shadow-indigo-500/25"
          >
            {loading ? t('create.submitting') : t('create.submit')}
          </button>
          <button
            type="button"
            onClick={() => navigate('/products')}
            className="text-slate-400 hover:text-white px-4 py-3 font-medium transition-colors"
          >
            {t('detail.cancel')}
          </button>
        </div>
      </form>
    </div>
  );
}
