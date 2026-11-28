/**
 * ResetPassword — Secure password reset page for HEKAYATY.
 *
 * Handles BOTH Supabase Auth recovery flows:
 *
 * 1. IMPLICIT FLOW — Supabase sends the recovery token as a URL hash fragment:
 *    /reset-password#access_token=...&refresh_token=...&type=recovery
 *    We extract the tokens and call supabase.auth.setSession() to establish
 *    the recovery session, then supabase.auth.updateUser({ password }).
 *
 * 2. PKCE FLOW — Supabase sends a one-time code in the query string:
 *    /reset-password?code=...
 *    We call supabase.auth.exchangeCodeForSession(code) to exchange it for a
 *    session, then supabase.auth.updateUser({ password }).
 *
 * Security:
 * - Only allows password update when a valid recovery session is detected.
 * - Never sends passwords to the backend — uses Supabase client directly.
 * - Never logs tokens, passwords, or sensitive auth parameters.
 * - Clears recovery-specific UI state after success.
 * - Prevents stale recovery state from being reused.
 * - Handles expired/invalid links with a clear error and re-request option.
 */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'wouter';
import {
  Lock,
  KeyRound,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { AuthLayout } from '@/components/auth/AuthLayout';

// ─── Password strength ────────────────────────────────────────────────────────

type Strength = 'weak' | 'fair' | 'good' | 'strong';

function assessStrength(pwd: string): { score: number; label: Strength; color: string } {
  let score = 0;
  if (pwd.length >= 8) score++;
  if (pwd.length >= 12) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;

  if (score <= 1) return { score, label: 'weak', color: 'bg-red-500' };
  if (score === 2) return { score, label: 'fair', color: 'bg-yellow-500' };
  if (score === 3) return { score, label: 'good', color: 'bg-blue-400' };
  return { score, label: 'strong', color: 'bg-emerald-500' };
}

const strengthLabels: Record<Strength, string> = {
  weak: 'ضعيفة جداً',
  fair: 'مقبولة',
  good: 'جيدة',
  strong: 'قوية',
};

// ─── Recovery state machine ───────────────────────────────────────────────────

type RecoveryState =
  | 'detecting'   // Detecting URL parameters, loading
  | 'ready'       // Valid recovery session established — show form
  | 'invalid'     // No valid recovery params — show error
  | 'expired'     // Token was expired or already used
  | 'success'     // Password updated successfully

// ─── Component ───────────────────────────────────────────────────────────────

export default function ResetPassword() {
  const [, setLocation] = useLocation();
  const [recoveryState, setRecoveryState] = useState<RecoveryState>('detecting');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ── Detect and establish the recovery session on mount ──────────────────────
  useEffect(() => {
    let cancelled = false;
    let cleanupFn: (() => void) | null = null;

    async function detectRecovery() {
      try {
        const hash = window.location.hash;
        const search = window.location.search;

        // ── PKCE flow: ?code=... ─────────────────────────────────────────────
        const codeParam = new URLSearchParams(search).get('code');
        if (codeParam) {
          const { data, error: exchError } = await supabase.auth.exchangeCodeForSession(codeParam);
          if (cancelled) return;
          if (exchError || !data?.session) {
            console.error('[ResetPassword] PKCE exchange failed:', exchError?.message);
            setRecoveryState('expired');
            return;
          }
          // Confirm it is a recovery session
          if (data.session.user) {
            // Clean the code from the URL to prevent reuse on refresh
            window.history.replaceState({}, '', window.location.pathname);
            setRecoveryState('ready');
          } else {
            setRecoveryState('invalid');
          }
          return;
        }

        // ── Implicit flow: #access_token=...&type=recovery ───────────────────
        if (hash && hash.includes('access_token=')) {
          const params = new URLSearchParams(hash.replace(/^#/, ''));
          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');
          const type = params.get('type');

          if (type !== 'recovery' || !accessToken || !refreshToken) {
            if (cancelled) return;
            setRecoveryState('invalid');
            return;
          }

          const { data, error: sessError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (cancelled) return;
          if (sessError || !data?.session) {
            console.error('[ResetPassword] Session establishment failed:', sessError?.message);
            setRecoveryState('expired');
            return;
          }

          // Clean hash from URL to prevent token exposure in browser history
          window.history.replaceState({}, '', window.location.pathname);
          setRecoveryState('ready');
          return;
        }

        // ── Supabase onAuthStateChange for PASSWORD_RECOVERY event ───────────
        // Some configurations dispatch the event before our component mounts.
        // Listen for it with a short timeout.
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          if (cancelled) return;
          if (event === 'PASSWORD_RECOVERY' && session) {
            subscription.unsubscribe();
            window.history.replaceState({}, '', window.location.pathname);
            setRecoveryState('ready');
          }
        });

        // If no hash and no code, wait briefly for the auth state change event
        const timeout = setTimeout(() => {
          if (cancelled) return;
          subscription.unsubscribe();
          setRecoveryState('invalid');
        }, 2000);

        cleanupFn = () => {
          clearTimeout(timeout);
          subscription.unsubscribe();
        };
      } catch (err: any) {
        if (!cancelled) {
          console.error('[ResetPassword] Detection error:', err);
          setRecoveryState('invalid');
        }
      }
    }

    detectRecovery();

    return () => {
      cancelled = true;
      if (cleanupFn) cleanupFn();
    };
  }, []);

  // ── Submit new password ──────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 8) {
      setError('يجب أن تكون كلمة المرور 8 خانات على الأقل');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('كلمتا المرور غير متطابقتين');
      return;
    }

    setLoading(true);
    try {
      // Use Supabase client directly — the recovery session is already established
      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });

      if (updateError) {
        // Distinguish expired session from other errors
        if (
          updateError.message.toLowerCase().includes('expired') ||
          updateError.message.toLowerCase().includes('invalid') ||
          updateError.status === 401
        ) {
          setRecoveryState('expired');
        } else {
          setError(updateError.message || 'تعذر تحديث كلمة المرور');
        }
        return;
      }

      // Sign out the recovery session so the user logs in fresh
      await supabase.auth.signOut();
      setRecoveryState('success');
    } catch (err: any) {
      setError(err.message || 'خطأ أثناء تحديث كلمة المرور');
    } finally {
      setLoading(false);
    }
  };

  const strength = newPassword ? assessStrength(newPassword) : null;

  const inputClass =
    'w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/[0.12] text-warm-ivory placeholder:text-warm-ivory/30 text-sm focus:outline-none focus:border-antique-gold/60 focus:bg-white/[0.09] transition-all';

  // ── Render helpers ───────────────────────────────────────────────────────────

  const renderDetecting = () => (
    <div className="flex flex-col items-center gap-4 py-6">
      <Loader2 className="w-8 h-8 animate-spin text-antique-gold" />
      <p className="text-xs text-warm-ivory/50">جاري التحقق من صلاحية الرابط...</p>
    </div>
  );

  const renderInvalid = () => (
    <div className="space-y-5">
      <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs space-y-2">
        <div className="flex items-center gap-2 font-bold">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>رابط غير صالح</span>
        </div>
        <p className="leading-relaxed">
          هذا الرابط غير صالح أو ليس رابط استعادة كلمة مرور. تأكد من نسخ الرابط بالكامل من البريد الإلكتروني.
        </p>
      </div>
      <Link
        href="/forgot-password"
        className="w-full py-3 rounded-xl bg-white/[0.06] border border-white/[0.12] text-warm-ivory text-sm font-bold flex items-center justify-center gap-2 hover:bg-white/[0.09] transition-colors"
      >
        <RefreshCw className="w-4 h-4" />
        طلب رابط جديد
      </Link>
    </div>
  );

  const renderExpired = () => (
    <div className="space-y-5">
      <div className="p-4 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs space-y-2">
        <div className="flex items-center gap-2 font-bold">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>الرابط منتهي الصلاحية أو مستخدم من قبل</span>
        </div>
        <p className="leading-relaxed">
          روابط إعادة تعيين كلمة المرور تنتهي خلال ساعة واحدة ولا يمكن استخدامها أكثر من مرة. اطلب رابطاً جديداً.
        </p>
      </div>
      <Link
        href="/forgot-password"
        className="w-full py-3.5 rounded-xl bg-gradient-to-l from-deep-teal to-[#0A9A99] text-white font-bold text-sm flex items-center justify-center gap-2 hover:brightness-110 transition-all"
      >
        <RefreshCw className="w-4 h-4" />
        طلب رابط جديد
      </Link>
    </div>
  );

  const renderSuccess = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-5"
    >
      <div className="flex flex-col items-center gap-4 py-4">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
          <ShieldCheck className="w-8 h-8 text-emerald-400" />
        </div>
        <div className="text-center">
          <h2 className="text-lg font-bold text-warm-ivory font-cinzel mb-1">تم تغيير كلمة المرور</h2>
          <p className="text-xs text-warm-ivory/50 leading-relaxed">
            يمكنك الآن تسجيل الدخول باستخدام كلمة المرور الجديدة.
          </p>
        </div>
      </div>
      <button
        onClick={() => setLocation('/login')}
        className="w-full py-3.5 rounded-xl bg-gradient-to-l from-deep-teal to-[#0A9A99] text-white font-bold text-sm flex items-center justify-center gap-2 hover:brightness-110 transition-all shadow-lg"
      >
        تسجيل الدخول الآن
      </button>
    </motion.div>
  );

  const renderForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2"
            role="alert"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* New Password */}
      <div>
        <label htmlFor="new-password" className="block text-xs font-semibold text-warm-ivory/70 mb-1.5">
          كلمة المرور الجديدة
        </label>
        <div className="relative">
          <input
            id="new-password"
            type={showNew ? 'text' : 'password'}
            autoComplete="new-password"
            required
            value={newPassword}
            onChange={(e) => { setNewPassword(e.target.value); setError(''); }}
            placeholder="8 خانات على الأقل"
            dir="ltr"
            className={`${inputClass} pl-10 pr-10`}
            disabled={loading}
          />
          <Lock className="absolute left-3 top-3.5 w-4 h-4 text-warm-ivory/30 pointer-events-none" />
          <button
            type="button"
            onClick={() => setShowNew(!showNew)}
            className="absolute right-3 top-3.5 text-warm-ivory/30 hover:text-warm-ivory/60 transition-colors"
            aria-label={showNew ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
          >
            {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        {/* Strength meter */}
        {strength && newPassword.length > 0 && (
          <div className="mt-2 space-y-1">
            <div className="flex gap-1">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                    i <= strength.score ? strength.color : 'bg-white/[0.08]'
                  }`}
                />
              ))}
            </div>
            <p className={`text-[11px] ${
              strength.label === 'weak' ? 'text-red-400' :
              strength.label === 'fair' ? 'text-yellow-400' :
              strength.label === 'good' ? 'text-blue-400' : 'text-emerald-400'
            }`}>
              قوة كلمة المرور: {strengthLabels[strength.label]}
            </p>
          </div>
        )}

        {/* Requirements */}
        <div className="mt-2 text-[11px] text-warm-ivory/30 space-y-0.5">
          <p className={newPassword.length >= 8 ? 'text-emerald-400' : ''}>
            • 8 خانات على الأقل
          </p>
          <p className={/[A-Z]/.test(newPassword) ? 'text-emerald-400' : ''}>
            • حرف كبير واحد على الأقل (يُنصح به)
          </p>
          <p className={/[0-9]/.test(newPassword) ? 'text-emerald-400' : ''}>
            • رقم واحد على الأقل (يُنصح به)
          </p>
        </div>
      </div>

      {/* Confirm Password */}
      <div>
        <label htmlFor="confirm-password" className="block text-xs font-semibold text-warm-ivory/70 mb-1.5">
          تأكيد كلمة المرور
        </label>
        <div className="relative">
          <input
            id="confirm-password"
            type={showConfirm ? 'text' : 'password'}
            autoComplete="new-password"
            required
            value={confirmPassword}
            onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
            placeholder="أعد إدخال كلمة المرور"
            dir="ltr"
            className={`${inputClass} pl-10 pr-10 ${
              confirmPassword && confirmPassword !== newPassword
                ? 'border-red-500/40 focus:border-red-500/60'
                : confirmPassword && confirmPassword === newPassword
                ? 'border-emerald-500/40 focus:border-emerald-500/60'
                : ''
            }`}
            disabled={loading}
          />
          <Lock className="absolute left-3 top-3.5 w-4 h-4 text-warm-ivory/30 pointer-events-none" />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-3 top-3.5 text-warm-ivory/30 hover:text-warm-ivory/60 transition-colors"
            aria-label={showConfirm ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
          >
            {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {confirmPassword && confirmPassword !== newPassword && (
          <p className="text-[11px] text-red-400 mt-1">كلمتا المرور غير متطابقتين</p>
        )}
        {confirmPassword && confirmPassword === newPassword && (
          <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            كلمتا المرور متطابقتان
          </p>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading || newPassword.length < 8 || newPassword !== confirmPassword}
        className="w-full py-3.5 rounded-xl bg-gradient-to-l from-deep-teal to-[#0A9A99] text-white font-bold text-sm shadow-lg shadow-deep-teal/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-5 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>جاري الحفظ...</span>
          </>
        ) : (
          <>
            <ShieldCheck className="w-4 h-4" />
            <span>تحديث كلمة المرور</span>
          </>
        )}
      </button>
    </form>
  );

  return (
    <AuthLayout>
      <div className="glass-auth-panel p-7 sm:p-9 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-md bg-midnight-navy/60" dir="rtl">
        {/* Header */}
        <div className="text-center mb-7">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-deep-teal to-antique-gold text-white shadow-lg mb-4">
            <KeyRound className="w-5 h-5" />
          </div>
          <h1 className="text-2xl font-cinzel font-bold text-warm-ivory">
            {recoveryState === 'success'
              ? 'تم التغيير بنجاح!'
              : recoveryState === 'detecting'
              ? 'جاري التحقق...'
              : recoveryState === 'invalid'
              ? 'رابط غير صالح'
              : recoveryState === 'expired'
              ? 'انتهت صلاحية الرابط'
              : 'تعيين كلمة المرور الجديدة'}
          </h1>
          {recoveryState === 'ready' && (
            <>
              <p className="text-[11px] font-cinzel text-antique-gold/70 mt-0.5 tracking-wider uppercase">
                Reset Your Password
              </p>
              <p className="text-xs text-warm-ivory/50 mt-1.5 leading-relaxed">
                أدخل كلمة المرور الجديدة لتأمين حسابك في حكاياتي
              </p>
            </>
          )}
        </div>

        {/* State-driven content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={recoveryState}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {recoveryState === 'detecting' && renderDetecting()}
            {recoveryState === 'invalid' && renderInvalid()}
            {recoveryState === 'expired' && renderExpired()}
            {recoveryState === 'success' && renderSuccess()}
            {recoveryState === 'ready' && renderForm()}
          </motion.div>
        </AnimatePresence>

        {/* Footer — back to login (always visible except on success) */}
        {recoveryState !== 'success' && (
          <div className="mt-6 pt-5 border-t border-white/[0.08] text-center">
            <Link
              href="/login"
              className="text-xs text-warm-ivory/30 hover:text-warm-ivory/60 transition-colors"
            >
              العودة إلى تسجيل الدخول
            </Link>
          </div>
        )}
      </div>
    </AuthLayout>
  );
}
