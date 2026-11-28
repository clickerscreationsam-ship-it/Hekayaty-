/**
 * ForgotPassword — Secure password recovery request page for HEKAYATY.
 *
 * Uses Supabase Auth's native resetPasswordForEmail via our backend proxy
 * which correctly sets the redirectTo origin from req.headers.origin,
 * ensuring production and dev URLs are handled automatically.
 *
 * Security:
 * - Never reveals whether an email is registered.
 * - Prevents duplicate submissions while loading.
 * - Validates email format before submitting.
 * - Generic success message regardless of whether email exists.
 */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import {
  Mail,
  KeyRound,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { AuthLayout } from '@/components/auth/AuthLayout';

// Generic success message — never reveals whether email is registered
const GENERIC_SUCCESS_AR =
  'لو فيه حساب مرتبط بالبريد الإلكتروني ده، هيوصلك رابط إعادة تعيين كلمة المرور خلال دقائق. راجع صندوق الوارد والبريد غير المرغوب فيه.';

function getRedirectUrl(): string {
  // Use the current window origin so it works in dev and production
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://hekayaty-v3.vercel.app';
  return `${origin}/reset-password`;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      setError('يرجى إدخال بريدك الإلكتروني');
      return;
    }
    if (!isValidEmail(trimmedEmail)) {
      setError('يرجى إدخال بريد إلكتروني صحيح');
      return;
    }

    setLoading(true);
    try {
      // Call Supabase Auth directly from the frontend — avoids backend proxy issues
      // and uses the correct redirectTo for the current environment
      const { error: sbError } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
        redirectTo: getRedirectUrl(),
      });

      // We deliberately ignore sbError here and show the same generic message
      // to avoid revealing whether an email is registered (security best practice)
      if (sbError) {
        // Log for debugging only — never expose to user
        console.error('[ForgotPassword] Supabase error (not shown to user):', sbError.message);
      }

      setSubmitted(true);
      startResendCooldown();
    } catch (err: any) {
      // Network or unexpected error — safe to show generic message
      setError('تعذر إرسال الطلب. يرجى التحقق من اتصالك بالإنترنت والمحاولة مجدداً.');
    } finally {
      setLoading(false);
    }
  };

  const startResendCooldown = () => {
    setResendCooldown(60);
    const timer = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || loading) return;
    setSubmitted(false);
    setError('');
  };

  const inputClass =
    'w-full px-4 py-3 pl-11 rounded-xl bg-white/[0.06] border border-white/[0.12] text-warm-ivory placeholder:text-warm-ivory/30 text-sm focus:outline-none focus:border-antique-gold/60 focus:bg-white/[0.09] transition-all';

  return (
    <AuthLayout>
      <div className="glass-auth-panel p-7 sm:p-9 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-md bg-midnight-navy/60" dir="rtl">
        {/* Header */}
        <div className="text-center mb-7">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-deep-teal to-antique-gold text-white shadow-lg mb-4">
            <KeyRound className="w-5 h-5" />
          </div>
          <h1 className="text-2xl font-cinzel font-bold text-warm-ivory">
            استعادة كلمة المرور
          </h1>
          <p className="text-[11px] font-cinzel text-antique-gold/70 mt-0.5 tracking-wider uppercase">
            Forgot Your Password?
          </p>
          <p className="text-xs text-warm-ivory/60 mt-2 leading-relaxed">
            {submitted
              ? 'تم إرسال التعليمات إلى بريدك الإلكتروني'
              : 'أدخل البريد الإلكتروني المرتبط بحسابك. سنرسل لك رابطاً آمناً لإعادة تعيين كلمة المرور.'}
          </p>
          {!submitted && (
            <p className="text-[11px] text-warm-ivory/40 mt-1 leading-relaxed">
              Enter the email address associated with your account. We'll send you a secure link to reset your password.
            </p>
          )}
        </div>

        {/* Error feedback */}
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2 mb-5"
            role="alert"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        {/* Success state */}
        {submitted ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5"
          >
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-emerald-400">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>تم إرسال التعليمات بنجاح</span>
              </div>
              <p className="leading-relaxed">{GENERIC_SUCCESS_AR}</p>
            </div>

            {/* Resend option */}
            <div className="text-center">
              {resendCooldown > 0 ? (
                <p className="text-xs text-warm-ivory/40">
                  يمكنك إعادة الإرسال بعد{' '}
                  <span className="text-antique-gold font-bold">{resendCooldown}</span> ثانية
                </p>
              ) : (
                <button
                  onClick={handleResend}
                  className="inline-flex items-center gap-1.5 text-xs text-antique-gold/80 hover:text-antique-gold transition-colors font-bold"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>لم يصلني البريد — إعادة الإرسال</span>
                </button>
              )}
            </div>

            {/* Checklist tips */}
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.07] text-warm-ivory/40 text-[11px] space-y-1.5">
              <p className="font-semibold text-warm-ivory/50 mb-1">تحقق من:</p>
              <p>• صندوق الوارد الخاص بك</p>
              <p>• مجلد البريد غير المرغوب فيه (Spam)</p>
              <p>• أن البريد المدخل هو المسجل في حكاياتي</p>
            </div>
          </motion.div>
        ) : (
          /* Form */
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label htmlFor="forgot-email" className="block text-xs font-semibold text-warm-ivory/70 mb-1.5">
                البريد الإلكتروني
              </label>
              <div className="relative">
                <input
                  id="forgot-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  placeholder="name@example.com"
                  dir="ltr"
                  className={inputClass}
                  disabled={loading}
                  aria-describedby={error ? 'forgot-error' : undefined}
                />
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-warm-ivory/30 pointer-events-none" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-l from-deep-teal to-[#0A9A99] text-white font-bold text-sm shadow-lg shadow-deep-teal/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جاري الإرسال...</span>
                </>
              ) : (
                <span>إرسال رابط إعادة التعيين</span>
              )}
            </button>
          </form>
        )}

        {/* Back to login */}
        <div className="mt-6 pt-5 border-t border-white/[0.08] text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs text-antique-gold/80 hover:text-antique-gold transition-colors font-bold"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>العودة إلى تسجيل الدخول</span>
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
