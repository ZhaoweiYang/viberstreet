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
    <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="shrink-0 group">
            <span className="text-2xl font-black tracking-tight">
              <span className="bg-gradient-to-r from-violet-600 via-purple-500 to-fuchsia-500 bg-clip-text text-transparent">Viber</span><span className="bg-gradient-to-r from-fuchsia-500 to-pink-500 bg-clip-text text-transparent">Street</span>
            </span>
          </Link>

          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-lg mx-8">
            <div className="relative w-full">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('header.search_placeholder')}
                className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
              />
            </div>
          </form>

          <nav className="flex items-center gap-3">
            <a href="https://dev.viberstreet.com" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-400 hover:text-violet-400 font-medium transition hidden md:block">
              {t('header.developer')}
            </a>
            <LanguageSwitcher />
            {user ? (
              <>
                <Link to="/my-purchases" className="text-sm text-slate-400 hover:text-violet-400 font-medium transition hidden sm:block">
                  {t('header.my_purchases')}
                </Link>
                <div className="relative">
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 transition"
                  >
                    <span className="text-sm font-medium text-slate-300 hidden sm:block">{user.name || user.email}</span>
                    <div className="w-7 h-7 rounded-full bg-violet-500/20 flex items-center justify-center">
                      {user.avatar_url ? (
                        <img src={user.avatar_url} alt={user.name} className="w-7 h-7 rounded-full object-cover" />
                      ) : (
                        <span className="text-violet-400 text-xs font-semibold">{(user.name || user.email || '?').charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                  </button>
                  {menuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-slate-800 rounded-xl shadow-lg border border-slate-700 py-1 z-50">
                      <Link to="/my-purchases" className="block px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 sm:hidden" onClick={() => setMenuOpen(false)}>
                        {t('header.my_purchases')}
                      </Link>
                      <button onClick={() => { logout(); setMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700">
                        {t('header.logout')}
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link to="/login" className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white text-sm font-medium rounded-xl transition shadow-sm">
                {t('header.login')}
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
