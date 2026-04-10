import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { submitVersion, uploadImage } from '../lib/api';
import { useI18n } from '../lib/i18n';

export default function NewVersionPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [screenshots, setScreenshots] = useState<string[]>([]);
  const [uploadingScreenshots, setUploadingScreenshots] = useState(false);

  const [form, setForm] = useState({
    version: '',
    changelog: '',
    doc_content: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
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
    setLoading(true);
    try {
      await submitVersion(id, {
        version: form.version,
        changelog: form.changelog,
        doc_content: form.doc_content,
        screenshots,
      });
      navigate(`/products/${id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <Link to={`/products/${id}`} className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-indigo-600 mb-6">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        {t('common.back')}
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">{t('version.title')}</h1>
        <p className="text-slate-500 mt-1">This version will be automatically submitted for review.</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 text-sm rounded-lg px-4 py-3 mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">{t('version.title')}</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t('version.number')}</label>
              <input
                type="text"
                name="version"
                required
                value={form.version}
                onChange={handleChange}
                placeholder="2.0.0"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t('version.changelog')}</label>
              <textarea
                name="changelog"
                required
                value={form.changelog}
                onChange={handleChange}
                rows={4}
                placeholder="Describe what changed in this version..."
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t('version.documentation')}</label>
              <p className="text-xs text-slate-400 mb-2">Supports markdown formatting</p>
              <textarea
                name="doc_content"
                value={form.doc_content}
                onChange={handleChange}
                rows={12}
                placeholder={"# Getting Started\n\nUpdated documentation for this version..."}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-y font-mono text-sm"
              />
            </div>
          </div>
        </div>

        {/* Screenshots */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">{t('version.screenshots')}</h2>
          <div className="space-y-4">
            {screenshots.length > 0 && (
              <div className="grid grid-cols-3 gap-4">
                {screenshots.map((url, i) => (
                  <div key={i} className="relative group">
                    <img src={url} alt={`Screenshot ${i + 1}`} className="w-full h-32 object-cover rounded-lg border border-slate-200" />
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
            <label className="cursor-pointer inline-flex items-center gap-2 bg-white border border-slate-300 px-4 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
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
            className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {loading ? t('version.submitting') : t('version.submit')}
          </button>
          <button
            type="button"
            onClick={() => navigate(`/products/${id}`)}
            className="text-slate-600 hover:text-slate-800 px-4 py-3 font-medium"
          >
            {t('detail.cancel')}
          </button>
        </div>
      </form>
    </div>
  );
}
