import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getMyPurchases, downloadProduct, type Product } from "../lib/api";
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

export default function MyPurchasesPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [purchases, setPurchases] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingSlug, setDownloadingSlug] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/login?redirect=/my-purchases", { replace: true });
      return;
    }
    getMyPurchases()
      .then(setPurchases)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user, authLoading, navigate]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const handleDownload = async (slug: string) => {
    setDownloadingSlug(slug);
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
      showToast("Download started!");
    } catch (err: any) {
      showToast(err.message || "Download failed");
    } finally {
      setDownloadingSlug(null);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-100 rounded-lg w-48" />
          <div className="h-4 bg-gray-100 rounded w-32" />
          <div className="space-y-3 mt-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-24 bg-gray-50 rounded-2xl border border-gray-100" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Toast */}
      {toast && (
        <div className="fixed top-20 right-4 z-50">
          <div className="bg-gray-900 text-white px-5 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2">
            <svg className="w-5 h-5 text-green-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {toast}
          </div>
        </div>
      )}

      <h1 className="text-3xl font-bold text-gray-900">My Purchases</h1>
      <p className="text-gray-500 mt-1">
        {purchases.length} blueprint{purchases.length !== 1 ? "s" : ""} purchased
      </p>

      {purchases.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">{"\u{1F4E6}"}</div>
          <h3 className="text-lg font-semibold text-gray-900">
            No purchases yet
          </h3>
          <p className="text-gray-500 mt-1">
            Browse our marketplace to find your first blueprint.
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex items-center px-5 py-2.5 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition shadow-sm text-sm"
          >
            Browse Blueprints
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {purchases.map((product) => (
            <div
              key={product.id}
              className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-100 to-primary-50 flex items-center justify-center text-2xl shrink-0">
                {product.avatar_url ? (
                  <img
                    src={product.avatar_url}
                    alt={product.name}
                    className="w-14 h-14 rounded-2xl object-cover"
                  />
                ) : (
                  <span>
                    {CATEGORY_ICONS[product.category] || "\u{1F4E6}"}
                  </span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <Link
                  to={`/product/${product.slug}`}
                  className="text-base font-semibold text-gray-900 hover:text-primary-600 transition truncate block"
                >
                  {product.name}
                </Link>
                <p className="text-sm text-gray-500 truncate">
                  {product.developer_name} &middot; v{product.version || "1.0.0"}
                </p>
              </div>

              <button
                onClick={() => handleDownload(product.slug)}
                disabled={downloadingSlug === product.slug}
                className="shrink-0 inline-flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-700 font-medium rounded-xl hover:bg-primary-100 transition text-sm disabled:opacity-60"
              >
                {downloadingSlug === product.slug ? (
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
                ) : (
                  <>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                    Re-download
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
