import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  getProduct,
  downloadProduct,
  getPurchaseStatus,
  createCheckout,
  type Product,
} from "../lib/api";
import { useAuth } from "../lib/auth";

const CATEGORY_ICONS: Record<string, string> = {
  "web-app": "\u{1F310}",
  "mobile-app": "\u{1F4F1}",
  "desktop-app": "\u{1F5A5}\uFE0F",
  "api-service": "\u26A1",
  "cli-tool": "\u2328\uFE0F",
  "browser-extension": "\u{1F9E9}",
  "ai-agent": "\u{1F916}",
  saas: "\u2601\uFE0F",
  game: "\u{1F3AE}",
  other: "\u{1F4E6}",
};

const CATEGORY_LABELS: Record<string, string> = {
  "web-app": "Web App",
  "mobile-app": "Mobile App",
  "desktop-app": "Desktop App",
  "api-service": "API & Service",
  "cli-tool": "CLI Tool",
  "browser-extension": "Browser Extension",
  "ai-agent": "AI Agent",
  saas: "SaaS",
  game: "Game",
  other: "Other",
};

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchased, setPurchased] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [activeScreenshot, setActiveScreenshot] = useState(0);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    getProduct(slug)
      .then((p) => {
        setProduct(p);
        if (user && !p.is_free) {
          getPurchaseStatus(slug)
            .then((res) => setPurchased(res.purchased))
            .catch(() => {});
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug, user]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const handleDownload = async () => {
    if (!slug) return;
    setDownloading(true);
    try {
      const res = await downloadProduct(slug);
      const blob = new Blob([res.doc_content], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = res.filename || `${slug}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast("Download started! Your blueprint is ready.");
    } catch (err: any) {
      showToast(err.message || "Download failed. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  const handleCheckout = async () => {
    if (!product) return;
    setCheckingOut(true);
    try {
      const res = await createCheckout(product.id);
      window.location.href = res.checkout_url;
    } catch (err: any) {
      showToast(err.message || "Checkout failed. Please try again.");
      setCheckingOut(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse space-y-6">
          <div className="flex gap-6">
            <div className="w-24 h-24 bg-gray-100 rounded-2xl" />
            <div className="flex-1 space-y-3">
              <div className="h-8 bg-gray-100 rounded-lg w-1/3" />
              <div className="h-4 bg-gray-100 rounded w-1/4" />
              <div className="h-4 bg-gray-100 rounded w-1/2" />
            </div>
          </div>
          <div className="h-64 bg-gray-100 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="text-5xl mb-4">{"\u{1F50D}"}</div>
        <h2 className="text-2xl font-bold text-gray-900">Blueprint not found</h2>
        <p className="text-gray-500 mt-2">
          This blueprint may have been removed or doesn't exist.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-700"
        >
          &larr; Back to Home
        </Link>
      </div>
    );
  }

  const priceLabel = product.is_free
    ? "Free"
    : `$${(product.price_cents / 100).toFixed(2)}`;

  const canDownload = product.is_free || purchased;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Toast */}
      {toast && (
        <div className="fixed top-20 right-4 z-50 animate-[slideIn_0.3s_ease-out]">
          <div className="bg-gray-900 text-white px-5 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2">
            <svg className="w-5 h-5 text-green-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {toast}
          </div>
        </div>
      )}

      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-gray-500">
        <Link to="/" className="hover:text-primary-600 transition">
          Home
        </Link>
        <span className="mx-2">/</span>
        <Link
          to={`/category/${product.category}`}
          className="hover:text-primary-600 transition"
        >
          {CATEGORY_LABELS[product.category] || product.category}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900 font-medium">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Product header */}
          <div className="flex items-start gap-5">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-br from-primary-100 to-primary-50 flex items-center justify-center text-4xl sm:text-5xl shadow-sm shrink-0">
              {product.avatar_url ? (
                <img
                  src={product.avatar_url}
                  alt={product.name}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover"
                />
              ) : (
                <span>
                  {CATEGORY_ICONS[product.category] || "\u{1F4E6}"}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                {product.name}
              </h1>
              <p className="text-gray-500 mt-1">{product.developer_name}</p>
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <Link
                  to={`/category/${product.category}`}
                  className="inline-flex items-center gap-1 text-xs font-medium text-gray-600 bg-gray-100 px-2.5 py-1 rounded-lg hover:bg-gray-200 transition"
                >
                  {CATEGORY_ICONS[product.category]}{" "}
                  {CATEGORY_LABELS[product.category] || product.category}
                </Link>
                <span
                  className={`text-sm font-semibold px-3 py-1 rounded-lg ${
                    product.is_free
                      ? "text-green-700 bg-green-50"
                      : "text-primary-700 bg-primary-50"
                  }`}
                >
                  {priceLabel}
                </span>
                {product.version && (
                  <span className="text-xs text-gray-400 bg-gray-50 px-2.5 py-1 rounded-lg">
                    v{product.version}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Tagline */}
          {product.tagline && (
            <p className="text-lg text-gray-600 leading-relaxed">
              {product.tagline}
            </p>
          )}

          {/* Screenshots */}
          {product.screenshots && product.screenshots.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Screenshots
              </h2>
              <div className="relative rounded-2xl overflow-hidden bg-gray-50 border border-gray-100">
                <img
                  src={product.screenshots[activeScreenshot]}
                  alt={`Screenshot ${activeScreenshot + 1}`}
                  className="w-full h-auto max-h-[500px] object-contain"
                />
              </div>
              {product.screenshots.length > 1 && (
                <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                  {product.screenshots.map((url, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveScreenshot(i)}
                      className={`shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition ${
                        i === activeScreenshot
                          ? "border-primary-500 shadow-sm"
                          : "border-gray-200 opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={url}
                        alt={`Thumbnail ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Description */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              Description
            </h2>
            <div className="prose prose-gray max-w-none text-gray-600 leading-relaxed whitespace-pre-wrap">
              {product.description}
            </div>
          </div>

          {/* Changelog */}
          {product.changelog && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                Version History
              </h2>
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-semibold text-gray-900">
                    Version {product.version}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(product.updated_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">
                  {product.changelog}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-4">
            {/* Action card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="text-center mb-5">
                <div className="text-3xl font-bold text-gray-900">
                  {priceLabel}
                </div>
              </div>

              {!user ? (
                <button
                  onClick={() => navigate(`/login?redirect=/product/${slug}`)}
                  className="w-full py-3 px-4 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition shadow-sm text-sm"
                >
                  Login to Download
                </button>
              ) : canDownload ? (
                <button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="w-full py-3 px-4 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition shadow-sm text-sm disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {downloading ? (
                    <>
                      <svg
                        className="animate-spin w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                      Downloading...
                    </>
                  ) : product.is_free ? (
                    "Download Free"
                  ) : (
                    "Download"
                  )}
                </button>
              ) : (
                <button
                  onClick={handleCheckout}
                  disabled={checkingOut}
                  className="w-full py-3 px-4 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition shadow-sm text-sm disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {checkingOut ? (
                    <>
                      <svg
                        className="animate-spin w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                      Redirecting to checkout...
                    </>
                  ) : (
                    `Buy for ${priceLabel}`
                  )}
                </button>
              )}
            </div>

            {/* Stats */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
              <h3 className="text-sm font-semibold text-gray-900">
                Information
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Downloads</span>
                  <span className="font-medium text-gray-900">
                    {product.download_count.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Category</span>
                  <Link
                    to={`/category/${product.category}`}
                    className="font-medium text-primary-600 hover:text-primary-700"
                  >
                    {CATEGORY_LABELS[product.category] || product.category}
                  </Link>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Version</span>
                  <span className="font-medium text-gray-900">
                    {product.version || "1.0.0"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Updated</span>
                  <span className="font-medium text-gray-900">
                    {new Date(product.updated_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Developer</span>
                  <span className="font-medium text-gray-900">
                    {product.developer_name}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
