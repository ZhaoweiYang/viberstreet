import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { useI18n } from '../lib/i18n';
import LanguageSwitcher from './LanguageSwitcher';

export default function Header() {
  const { user, logout } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/?search=${encodeURIComponent(search.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">VS</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
              VibeStreet
            </span>
          </Link>

          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-lg mx-8">
            <div className="relative w-full">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('header.search_placeholder')}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
              />
            </div>
          </form>

          <nav className="flex items-center gap-3">
            <a href="https://dev.viberstreet.com" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-600 hover:text-purple-600 font-medium transition hidden md:block">
              {t('header.developer')}
            </a>
            <LanguageSwitcher />
            {user ? (
              <>
                <Link to="/my-purchases" className="text-sm text-gray-600 hover:text-purple-600 font-medium transition hidden sm:block">
                  {t('header.my_purchases')}
                </Link>
                <div className="relative">
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-full bg-gray-50 hover:bg-gray-100 transition"
                  >
                    <span className="text-sm font-medium text-gray-700 hidden sm:block">{user.name}</span>
                    <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center">
                      {user.avatar_url ? (
                        <img src={user.avatar_url} alt={user.name} className="w-7 h-7 rounded-full object-cover" />
                      ) : (
                        <span className="text-purple-600 text-xs font-semibold">{user.name.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                  </button>
                  {menuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                      <Link to="/my-purchases" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 sm:hidden" onClick={() => setMenuOpen(false)}>
                        {t('header.my_purchases')}
                      </Link>
                      <button onClick={() => { logout(); setMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        {t('header.logout')}
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link to="/login" className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-xl hover:bg-purple-700 transition shadow-sm">
                {t('header.login')}
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
