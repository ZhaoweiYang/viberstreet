import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getProducts, getCategories, type Product, type Category } from "../lib/api";
import ProductCard from "../components/ProductCard";

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

const FALLBACK_CATEGORIES = [
  { slug: "web-app", name: "Web App", icon: "\u{1F310}", count: 0 },
  { slug: "mobile-app", name: "Mobile App", icon: "\u{1F4F1}", count: 0 },
  { slug: "desktop-app", name: "Desktop App", icon: "\u{1F5A5}\uFE0F", count: 0 },
  { slug: "api-service", name: "API & Service", icon: "\u26A1", count: 0 },
  { slug: "cli-tool", name: "CLI Tool", icon: "\u2328\uFE0F", count: 0 },
  { slug: "browser-extension", name: "Browser Extension", icon: "\u{1F9E9}", count: 0 },
  { slug: "ai-agent", name: "AI Agent", icon: "\u{1F916}", count: 0 },
  { slug: "saas", name: "SaaS", icon: "\u2601\uFE0F", count: 0 },
  { slug: "game", name: "Game", icon: "\u{1F3AE}", count: 0 },
  { slug: "other", name: "Other", icon: "\u{1F4E6}", count: 0 },
];

export default function HomePage() {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>(FALLBACK_CATEGORIES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params: any = { per_page: 12, sort: "popular" };
    if (searchQuery) params.search = searchQuery;

    Promise.all([getProducts(params), getCategories()])
      .then(([prodRes, cats]) => {
        setProducts(prodRes.data);
        if (cats.length > 0) setCategories(cats);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [searchQuery]);

  return (
    <div>
      {/* Hero */}
      {!searchQuery && (
        <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-purple-900">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-300 rounded-full blur-3xl" />
          </div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
            <div className="max-w-3xl">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight">
                Discover AI-Ready{" "}
                <span className="text-primary-200">Software Blueprints</span>
              </h1>
              <p className="mt-6 text-lg sm:text-xl text-primary-100 leading-relaxed max-w-2xl">
                The marketplace for vibe coding documentation. Download comprehensive
                blueprints that let AI build your next project from scratch --
                architecture, APIs, database schemas, and implementation guides all
                ready to go.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/category/web-app"
                  className="inline-flex items-center px-5 py-2.5 bg-white text-primary-700 font-semibold rounded-xl hover:bg-primary-50 transition shadow-sm text-sm"
                >
                  Browse Blueprints
                </Link>
                <a
                  href="#categories"
                  className="inline-flex items-center px-5 py-2.5 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition text-sm border border-white/20"
                >
                  View Categories
                </a>
              </div>
            </div>
          </div>
        </section>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Search results header */}
        {searchQuery && (
          <div className="pt-8 pb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              Search results for "{searchQuery}"
            </h2>
            <p className="text-gray-500 mt-1">
              {products.length} blueprint{products.length !== 1 ? "s" : ""} found
            </p>
          </div>
        )}

        {/* Categories */}
        {!searchQuery && (
          <section id="categories" className="py-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Browse Categories</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {categories.map((cat) => (
                <Link
                  key={cat.slug}
                  to={`/category/${cat.slug}`}
                  className="group flex flex-col items-center gap-2 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-primary-200 transition-all"
                >
                  <span className="text-3xl">
                    {CATEGORY_ICONS[cat.slug] || cat.icon}
                  </span>
                  <span className="text-sm font-medium text-gray-700 group-hover:text-primary-600 transition text-center">
                    {cat.name}
                  </span>
                  {cat.count > 0 && (
                    <span className="text-xs text-gray-400">
                      {cat.count} blueprint{cat.count !== 1 ? "s" : ""}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Products grid */}
        <section className="py-8">
          {!searchQuery && (
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Popular Blueprints
              </h2>
              <Link
                to="/category/web-app"
                className="text-sm font-medium text-primary-600 hover:text-primary-700 transition"
              >
                View all &rarr;
              </Link>
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse bg-gray-50 rounded-2xl h-48 border border-gray-100"
                />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">{"\u{1F50D}"}</div>
              <h3 className="text-lg font-semibold text-gray-900">
                No blueprints found
              </h3>
              <p className="text-gray-500 mt-1">
                {searchQuery
                  ? "Try a different search term."
                  : "Check back soon for new blueprints!"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>

        {/* CTA section */}
        {!searchQuery && (
          <section className="py-12 mb-8">
            <div className="bg-gradient-to-r from-primary-50 to-purple-50 rounded-3xl p-8 sm:p-12 text-center">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Are you a developer?
              </h2>
              <p className="mt-3 text-gray-600 max-w-xl mx-auto">
                Publish your software blueprints on VibeStreet and reach thousands
                of developers using AI to build their next project.
              </p>
              <a
                href="#"
                className="mt-6 inline-flex items-center px-6 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition shadow-sm"
              >
                Start Publishing
              </a>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
