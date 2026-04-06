import React, { useEffect, useState } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import { getProducts, type Product, type PaginatedResponse } from "../lib/api";
import ProductCard from "../components/ProductCard";

const CATEGORY_META: Record<string, { icon: string; name: string; description: string }> = {
  "web-app": { icon: "\u{1F310}", name: "Web App", description: "Full-stack web applications, SPAs, and web platforms" },
  "mobile-app": { icon: "\u{1F4F1}", name: "Mobile App", description: "iOS, Android, and cross-platform mobile applications" },
  "desktop-app": { icon: "\u{1F5A5}\uFE0F", name: "Desktop App", description: "Native desktop applications for Windows, macOS, and Linux" },
  "api-service": { icon: "\u26A1", name: "API & Service", description: "REST APIs, GraphQL services, and microservices" },
  "cli-tool": { icon: "\u2328\uFE0F", name: "CLI Tool", description: "Command-line tools and terminal utilities" },
  "browser-extension": { icon: "\u{1F9E9}", name: "Browser Extension", description: "Chrome, Firefox, and other browser extensions" },
  "ai-agent": { icon: "\u{1F916}", name: "AI Agent", description: "AI agents, chatbots, and intelligent automation" },
  saas: { icon: "\u2601\uFE0F", name: "SaaS", description: "Software-as-a-Service platforms and subscription products" },
  game: { icon: "\u{1F3AE}", name: "Game", description: "Video games, game engines, and interactive experiences" },
  other: { icon: "\u{1F4E6}", name: "Other", description: "Other types of software blueprints" },
};

export default function CategoryPage() {
  const { category } = useParams<{ category: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get("page") || "1");

  const [data, setData] = useState<PaginatedResponse<Product> | null>(null);
  const [loading, setLoading] = useState(true);

  const meta = CATEGORY_META[category || ""] || {
    icon: "\u{1F4E6}",
    name: category,
    description: "",
  };

  useEffect(() => {
    setLoading(true);
    getProducts({ category, page, per_page: 12 })
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [category, page]);

  const goToPage = (p: number) => {
    setSearchParams({ page: String(p) });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-gray-500">
        <Link to="/" className="hover:text-primary-600 transition">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900 font-medium">{meta.name}</span>
      </nav>

      {/* Category Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center text-4xl shadow-sm">
          {meta.icon}
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{meta.name}</h1>
          <p className="text-gray-500 mt-1">{meta.description}</p>
        </div>
      </div>

      {/* Products */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse bg-gray-50 rounded-2xl h-48 border border-gray-100"
            />
          ))}
        </div>
      ) : !data || data.data.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">{meta.icon}</div>
          <h3 className="text-lg font-semibold text-gray-900">
            No blueprints yet in {meta.name}
          </h3>
          <p className="text-gray-500 mt-1">
            Check back soon or browse other categories.
          </p>
          <Link
            to="/"
            className="mt-4 inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-700"
          >
            &larr; Back to Home
          </Link>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-4">
            {data.total} blueprint{data.total !== 1 ? "s" : ""}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {data.data.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Pagination */}
          {data.total_pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <button
                onClick={() => goToPage(page - 1)}
                disabled={page <= 1}
                className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              {Array.from({ length: data.total_pages }, (_, i) => i + 1)
                .filter(
                  (p) =>
                    p === 1 ||
                    p === data.total_pages ||
                    Math.abs(p - page) <= 2
                )
                .map((p, idx, arr) => (
                  <React.Fragment key={p}>
                    {idx > 0 && arr[idx - 1] !== p - 1 && (
                      <span className="text-gray-400">...</span>
                    )}
                    <button
                      onClick={() => goToPage(p)}
                      className={`w-10 h-10 text-sm font-medium rounded-lg transition ${
                        p === page
                          ? "bg-primary-600 text-white shadow-sm"
                          : "text-gray-700 hover:bg-gray-50 border border-gray-200"
                      }`}
                    >
                      {p}
                    </button>
                  </React.Fragment>
                ))}
              <button
                onClick={() => goToPage(page + 1)}
                disabled={page >= data.total_pages}
                className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
