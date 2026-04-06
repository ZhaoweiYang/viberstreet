import React from "react";
import { Link } from "react-router-dom";
import type { Product } from "../lib/api";

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

export default function ProductCard({ product }: { product: Product }) {
  const priceLabel = product.is_free
    ? "Free"
    : `$${(product.price_cents / 100).toFixed(2)}`;

  return (
    <Link
      to={`/product/${product.slug}`}
      className="group block bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-primary-200 transition-all duration-200 overflow-hidden"
    >
      {/* Card body */}
      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-100 to-primary-50 flex items-center justify-center shrink-0 text-2xl shadow-sm">
            {product.avatar_url ? (
              <img
                src={product.avatar_url}
                alt={product.name}
                className="w-14 h-14 rounded-2xl object-cover"
              />
            ) : (
              <span>{CATEGORY_ICONS[product.category] || "\u{1F4E6}"}</span>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-gray-900 group-hover:text-primary-600 transition truncate">
              {product.name}
            </h3>
            <p className="text-sm text-gray-500 mt-0.5 truncate">
              {product.developer_name}
            </p>
            <p className="text-sm text-gray-400 mt-1 line-clamp-2 leading-relaxed">
              {product.tagline}
            </p>
          </div>
        </div>

        {/* Footer meta */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50">
          <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 bg-gray-50 px-2.5 py-1 rounded-lg">
            {CATEGORY_ICONS[product.category] || "\u{1F4E6}"}{" "}
            {CATEGORY_LABELS[product.category] || product.category}
          </span>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <svg
                className="w-3.5 h-3.5"
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
              {product.download_count.toLocaleString()}
            </span>
            <span
              className={`text-sm font-semibold px-2.5 py-1 rounded-lg ${
                product.is_free
                  ? "text-green-700 bg-green-50"
                  : "text-primary-700 bg-primary-50"
              }`}
            >
              {priceLabel}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
