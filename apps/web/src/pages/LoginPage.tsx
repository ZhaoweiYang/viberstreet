import React, { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { sendCode, verifyCode } from "../lib/api";
import { useAuth } from "../lib/auth";

type Tab = "signin" | "signup";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  const [tab, setTab] = useState<Tab>("signin");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("user");
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError(null);
    try {
      await sendCode(email);
      setCodeSent(true);
    } catch (err: any) {
      setError(err.message || "Failed to send code");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return;
    setLoading(true);
    setError(null);
    try {
      const res = await verifyCode(
        email,
        code,
        tab === "signup" ? name : undefined,
        tab === "signup" ? role : undefined
      );
      login(res.token, res.user);
      navigate(redirect, { replace: true });
    } catch (err: any) {
      setError(err.message || "Invalid code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold">VS</span>
            </div>
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">
            Welcome to VibeStreet
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Sign in to download blueprints and manage purchases
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
          {/* Tabs */}
          <div className="flex bg-gray-50 rounded-xl p-1 mb-6">
            <button
              onClick={() => {
                setTab("signin");
                setCodeSent(false);
                setError(null);
              }}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition ${
                tab === "signin"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setTab("signup");
                setCodeSent(false);
                setError(null);
              }}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition ${
                tab === "signup"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
              {error}
            </div>
          )}

          {!codeSent ? (
            <form onSubmit={handleSendCode} className="space-y-4">
              {tab === "signup" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your full name"
                      required={tab === "signup"}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      I am a...
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setRole("user")}
                        className={`flex-1 py-2.5 text-sm font-medium rounded-xl border transition ${
                          role === "user"
                            ? "border-primary-300 bg-primary-50 text-primary-700"
                            : "border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        User
                      </button>
                      <button
                        type="button"
                        onClick={() => setRole("developer")}
                        className={`flex-1 py-2.5 text-sm font-medium rounded-xl border transition ${
                          role === "developer"
                            ? "border-primary-300 bg-primary-50 text-primary-700"
                            : "border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        Developer
                      </button>
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !email}
                className="w-full py-2.5 px-4 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition shadow-sm text-sm disabled:opacity-60 flex items-center justify-center"
              >
                {loading ? "Sending..." : "Send Verification Code"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-4">
              <div className="text-center mb-2">
                <p className="text-sm text-gray-500">
                  We sent a 6-digit code to{" "}
                  <span className="font-medium text-gray-900">{email}</span>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Verification Code
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) =>
                    setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  placeholder="000000"
                  maxLength={6}
                  required
                  autoFocus
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-center tracking-[0.3em] font-mono text-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                />
              </div>

              <button
                type="submit"
                disabled={loading || code.length !== 6}
                className="w-full py-2.5 px-4 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition shadow-sm text-sm disabled:opacity-60 flex items-center justify-center"
              >
                {loading ? "Verifying..." : "Verify & Sign In"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setCodeSent(false);
                  setCode("");
                  setError(null);
                }}
                className="w-full text-sm text-gray-500 hover:text-primary-600 transition"
              >
                Use a different email
              </button>
            </form>
          )}

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-3 text-gray-400">or</span>
            </div>
          </div>

          {/* Google */}
          <button
            disabled
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition text-sm font-medium text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
            <span className="text-xs text-gray-400">(coming soon)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
