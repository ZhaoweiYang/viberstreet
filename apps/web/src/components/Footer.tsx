import React from 'react';
import { Link } from 'react-router-dom';

const CATEGORIES = [
  { slug: 'web-app', name: 'Web App' },
  { slug: 'mobile-app', name: 'Mobile App' },
  { slug: 'api-service', name: 'API & Service' },
  { slug: 'ai-agent', name: 'AI Agent' },
  { slug: 'saas', name: 'SaaS' },
];

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-100 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">VS</span>
              </div>
              <span className="text-lg font-bold text-gray-900">VibeStreet</span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              The marketplace for AI-ready software blueprints. Build faster with vibe coding documentation.
            </p>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Categories</h3>
            <ul className="space-y-2">
              {CATEGORIES.map((cat) => (
                <li key={cat.slug}>
                  <Link
                    to={`/category/${cat.slug}`}
                    className="text-sm text-gray-500 hover:text-primary-600 transition"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Resources</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm text-gray-500 hover:text-primary-600 transition">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-500 hover:text-primary-600 transition">
                  Developer Portal
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-500 hover:text-primary-600 transition">
                  API Reference
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-500 hover:text-primary-600 transition">
                  Blog
                </a>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Company</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm text-gray-500 hover:text-primary-600 transition">
                  About
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-500 hover:text-primary-600 transition">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-500 hover:text-primary-600 transition">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-500 hover:text-primary-600 transition">
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} VibeStreet. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
