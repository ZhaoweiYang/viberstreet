import React, { useState, useRef, useEffect } from 'react';
import { useI18n } from '../lib/i18n';

export default function LanguageSwitcher() {
  const { locale, setLocale, locales } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = locales.find((l) => l.code === locale) || locales[0];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-gray-100 text-sm transition"
      >
        <span>{current.flag}</span>
        <span className="hidden sm:inline">{current.name}</span>
        <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 mt-1 w-44 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
          {locales.map((l) => (
            <button
              key={l.code}
              onClick={() => { setLocale(l.code); setOpen(false); }}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-purple-50 transition ${
                l.code === locale ? 'bg-purple-50 text-purple-700 font-medium' : 'text-gray-700'
              }`}
            >
              <span>{l.flag}</span>
              <span>{l.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
