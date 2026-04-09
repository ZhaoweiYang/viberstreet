import React, { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { useI18n } from '../lib/i18n';
import { sendCode, verifyCode } from '../lib/api';

export default function LoginPage() {
  const { user, login, error: authError } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (user) {
    navigate('/', { replace: true });
    return null;
  }

  const handleSendCode = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await sendCode(email);
      setStep('code');
    } catch (err: any) {
      setError(err.message || 'Failed to send code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await verifyCode(email, code);
      login(res.token, res.user);
      if (res.user.role === 'admin') {
        navigate('/', { replace: true });
      }
    } catch (err: any) {
      setError(err.message || 'Invalid code');
    } finally {
      setLoading(false);
    }
  };

  const displayError = authError || error;

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">
            <span className="text-rose-500">Viber</span>Street
          </h1>
          <p className="text-slate-400 mt-2">{t('login.subtitle')}</p>
        </div>

        <div className="bg-white rounded-xl shadow-xl p-8">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">{t('login.title')}</h2>

          {displayError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
              {displayError}
            </div>
          )}

          {step === 'email' ? (
            <form onSubmit={handleSendCode} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                  {t('login.email')}
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@viberstreet.com"
                  required
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-rose-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-rose-700 transition-colors disabled:opacity-50"
              >
                {loading ? t('review_detail.submitting') : t('login.send_code')}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyCode} className="space-y-4">
              <p className="text-sm text-slate-600">
                We sent a code to <strong>{email}</strong>
              </p>
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-slate-700 mb-1">
                  {t('login.verification_code')}
                </label>
                <input
                  id="code"
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="000000"
                  required
                  maxLength={6}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm text-center tracking-widest font-mono focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-rose-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-rose-700 transition-colors disabled:opacity-50"
              >
                {loading ? t('review_detail.submitting') : t('login.verify')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setStep('email');
                  setCode('');
                  setError('');
                }}
                className="w-full text-sm text-slate-500 hover:text-slate-700"
              >
                {t('common.back')}
              </button>
            </form>
          )}

          <p className="mt-6 text-center text-xs text-slate-400">
            {t('login.admin_only')}
          </p>
        </div>
      </div>
    </div>
  );
}
