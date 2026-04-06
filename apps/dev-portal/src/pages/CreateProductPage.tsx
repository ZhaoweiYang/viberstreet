import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createProduct, uploadImage } from '../lib/api';

const CATEGORIES = [
  'productivity',
  'design',
  'development',
  'marketing',
  'analytics',
  'communication',
  'finance',
  'education',
  'entertainment',
  'utilities',
  'other',
];

export default function CreateProductPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [screenshots, setScreenshots] = useState<string[]>([]);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingScreenshots, setUploadingScreenshots] = useState(false);

  const [form, setForm] = useState({
    name: '',
    description: '',
    category: 'productivity',
    price: '',
    version: '1.0.0',
    changelog: 'Initial release',
    doc_content: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
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
    setLoading(true);
    try {
      const priceCents = form.price ? Math.round(parseFloat(form.price) * 100) : 0;
      const result = await createProduct({
        name: form.name,
        description: form.description,
        category: form.category,
        price_cents: priceCents,
        avatar_url: avatarUrl || undefined,
        version: form.version,
        changelog: form.changelog,
        doc_content: form.doc_content,
        screenshots,
      });
      navigate(`/products/${result.product.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Create New Product</h1>
        <p className="text-slate-500 mt-1">Submit a new product for review. It will be reviewed by our team before publishing.</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 text-sm rounded-lg px-4 py-3 mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Product Info */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Product Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Product Name</label>
              <input
                type="text"
                name="name"
                required
                value={form.name}
                onChange={handleChange}
                placeholder="My Awesome Product"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea
                name="description"
                required
                value={form.description}
                onChange={handleChange}
                rows={4}
                placeholder="Describe what your product does..."
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Price (USD, 0 = free)</label>
                <input
                  type="number"
                  name="price"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={handleChange}
                  placeholder="0.00"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Avatar Upload */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Product Avatar</label>
              <div className="flex items-center gap-4">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-16 h-16 rounded-lg object-cover" />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-400">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                <label className="cursor-pointer bg-white border border-slate-300 px-4 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                  {uploadingAvatar ? 'Uploading...' : 'Upload Avatar'}
                  <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" disabled={uploadingAvatar} />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Version Info */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Initial Version</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Version</label>
                <input
                  type="text"
                  name="version"
                  required
                  value={form.version}
                  onChange={handleChange}
                  placeholder="1.0.0"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Changelog</label>
              <textarea
                name="changelog"
                required
                value={form.changelog}
                onChange={handleChange}
                rows={3}
                placeholder="What's new in this version..."
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Documentation Content</label>
              <p className="text-xs text-slate-400 mb-2">Supports markdown formatting</p>
              <textarea
                name="doc_content"
                value={form.doc_content}
                onChange={handleChange}
                rows={12}
                placeholder={"# Getting Started\n\nDescribe how to use your product...\n\n## Installation\n\n## Usage\n\n## API Reference"}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-y font-mono text-sm"
              />
            </div>
          </div>
        </div>

        {/* Screenshots */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Screenshots</h2>
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
              {uploadingScreenshots ? 'Uploading...' : 'Add Screenshots'}
              <input type="file" accept="image/*" multiple onChange={handleScreenshotUpload} className="hidden" disabled={uploadingScreenshots} />
            </label>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={loading || uploadingAvatar || uploadingScreenshots}
            className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Product & Submit for Review'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/products')}
            className="text-slate-600 hover:text-slate-800 px-4 py-3 font-medium"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
