import React from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../lib/i18n';

export default function Footer() {
  const { t } = useI18n();

  return (
    <footer className="bg-slate-900 border-t border-slate-800 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="mb-3">
              <span className="text-xl font-black tracking-tight">
                <span className="bg-gradient-to-r from-violet-600 via-purple-500 to-fuchsia-500 bg-clip-text text-transparent">Viber</span><span className="bg-gradient-to-r from-fuchsia-500 to-pink-500 bg-clip-text text-transparent">Street</span>
              </span>
            </div>
            <p className="text-sm text-slate-400">{t('footer.tagline')}</p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white mb-3">{t('categories.platforms')}</h3>
            <ul className="space-y-2">
              {['web', 'ios', 'android', 'macos', 'windows'].map((p) => (
                <li key={p}><Link to={`/browse/${p}`} className="text-sm text-slate-400 hover:text-violet-400 transition">{t(`platform.${p}`)}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white mb-3">{t('categories.product_types')}</h3>
            <ul className="space-y-2">
              {['browser', 'vpn', 'finance', 'office', 'web3-wallet'].map((pt) => (
                <li key={pt}><Link to={`/browse/all/${pt}`} className="text-sm text-slate-400 hover:text-violet-400 transition">{t(`product_type.${pt}`)}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white mb-3">{t('footer.about')}</h3>
            <ul className="space-y-2">
              <li><a href="https://dev.viberstreet.com" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-400 hover:text-violet-400 transition">{t('header.developer')}</a></li>
              <li><span className="text-sm text-slate-400">{t('footer.terms')}</span></li>
              <li><span className="text-sm text-slate-400">{t('footer.privacy')}</span></li>
              <li><span className="text-sm text-slate-400">{t('footer.contact')}</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-700 text-center text-sm text-slate-500">
          &copy; {new Date().getFullYear()} Viber Street. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
