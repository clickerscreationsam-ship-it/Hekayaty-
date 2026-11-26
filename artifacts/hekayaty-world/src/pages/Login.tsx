/**
 * Login — Cinematic sign-in experience for HEKAYATY.
 * Full-screen auth layout, no Navbar/Footer.
 * Preserves ?redirect= param for protected-route flows.
 */
import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { motion, useReducedMotion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle2, ArrowLeft, LogIn } from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';
import { AuthLayout } from '@/components/auth/AuthLayout';

export default function Login() {
  const [, setLocation] = useLocation();
  const { login } = useAuthStore();
  const shouldReduceMotion = useReducedMotion();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const searchParams = new URLSearchParams(window.location.search);
  const rawRedirect = searchParams.get('redirect') || '/';
  // Security Hardening: Ensure redirect is an internal relative path and prevent open redirects
  const isSafeRelative = rawRedirect.startsWith('/') && !rawRedirect.startsWith('//');
  const redirectPath = isSafeRelative ? rawRedirect : '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('يرجى إدخال البريد الإلكتروني وكلمة المرور');
      return;
    }
    setLoading(true);
    setError('');

    const res = await login({ email, password });
    if (res.success) {
      setSuccess('تم تسجيل الدخول بنجاح…');
      setTimeout(() => setLocation(redirectPath), 600);
    } else {
      // Never expose raw backend errors
      setError('البريد الإلكتروني أو كلمة المرور غير صحيحة. يرجى المحاولة مجدداً.');
      setLoading(false);
    }
  };

  const inputClass =
    'w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/[0.12] text-warm-ivory placeholder:text-warm-ivory/30 text-sm focus:outline-none focus:border-antique-gold/60 focus:bg-white/[0.09] transition-all';

  return (
    <AuthLayout>
      <div className="glass-auth-panel p-7 sm:p-9 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-md bg-midnight-navy/60">
        {/* Header */}
        <div className="text-center mb-7">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-deep-teal to-antique-gold text-white shadow-lg mb-4">
            <LogIn className="w-5 h-5" />
          </div>
          <h1 className="text-2xl font-cinzel font-bold text-warm-ivory">
            ادخل إلى عالمك
          </h1>
          <p className="text-xs text-warm-ivory/50 mt-1.5 leading-relaxed">
            استمر من حيث توقفت في حكاياتي
          </p>
        </div>

        {/* Feedback */}
        {error && (
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2 mb-5"
            role="alert"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}
        {success && (
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2 mb-5"
            role="status"
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Email */}
          <div>
            <label htmlFor="login-email" className="block text-xs font-semibold text-warm-ivory/70 mb-1.5">
              البريد الإلكتروني
            </label>
            <div className="relative">
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                placeholder="name@example.com"
                dir="ltr"
                className={`${inputClass} pl-10`}
                aria-describedby={error ? 'login-error' : undefined}
              />
              <Mail className="absolute left-3 top-3.5 w-4 h-4 text-warm-ivory/30 pointer-events-none" />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="login-password" className="text-xs font-semibold text-warm-ivory/70">
                كلمة المرور
              </label>
              <Link href="/forgot-password" className="text-[11px] text-antique-gold/80 hover:text-antique-gold transition-colors">
                نسيت كلمة المرور؟
              </Link>
            </div>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                placeholder="••••••••"
                dir="ltr"
                className={`${inputClass} pl-10 pr-10`}
              />
              <Lock className="absolute left-3 top-3.5 w-4 h-4 text-warm-ivory/30 pointer-events-none" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-warm-ivory/30 hover:text-warm-ivory/60 transition-colors"
                aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-l from-deep-teal to-[#0A9A99] text-white font-bold text-sm shadow-lg shadow-deep-teal/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                <span>جاري التحقق...</span>
              </>
            ) : (
              <>
                <span>تسجيل الدخول</span>
                <ArrowLeft className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Divider & Register link */}
        <div className="mt-6 pt-5 border-t border-white/[0.08] text-center">
          <p className="text-xs text-warm-ivory/40">
            ليس لديك حساب؟{' '}
            <Link href="/register" className="text-antique-gold font-bold hover:text-antique-gold/80 transition-colors">
              إنشاء حساب مجاني
            </Link>
          </p>
        </div>

        {/* Back to home */}
        <div className="mt-3 text-center">
          <Link href="/" className="text-[11px] text-warm-ivory/25 hover:text-warm-ivory/50 transition-colors">
            العودة إلى الصفحة الرئيسية
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
