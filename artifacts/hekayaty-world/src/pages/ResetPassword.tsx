import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'wouter';
import { Lock, KeyRound, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { api } from '@/lib/api';

export default function ResetPassword() {
  const [, setLocation] = useLocation();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [accessToken, setAccessToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // Extract access_token from URL hash (standard Supabase redirect format)
    const hash = window.location.hash;
    if (hash && hash.includes('access_token=')) {
      const token = new URLSearchParams(hash.replace(/^#/, '')).get('access_token');
      if (token) {
        setAccessToken(token);
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword.length < 8) {
      setError('يجب ألا تقل كلمة المرور عن 8 خانات');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('كلمتا المرور غير متطابقتين');
      return;
    }

    setLoading(true);

    try {
      const res = await api.resetPassword({
        newPassword,
        accessToken: accessToken || undefined,
      });

      if (res?.message) {
        setSuccess('تم تغيير كلمة المرور بنجاح! جاري تحويلك لصفحة تسجيل الدخول...');
        setTimeout(() => {
          setLocation('/login');
        }, 1500);
      } else {
        setError(res?.error || 'تعذر إعادة تعيين كلمة المرور');
      }
    } catch (err: any) {
      setError(err.message || 'خطأ أثناء إعادة تعيين كلمة المرور');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-arabic" dir="rtl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-soft-sand/60 dark:border-white/10 shadow-2xl relative overflow-hidden">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-deep-teal to-[#119B98] dark:from-antique-gold dark:to-[#927849] text-white dark:text-midnight-navy shadow-lg mb-4">
              <KeyRound className="w-7 h-7" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground font-cinzel">
              تعيين كلمة المرور الجديدة
            </h1>
            <p className="text-xs sm:text-sm text-foreground/65 mt-2">
              أدخل كلمة المرور الجديدة لحسابك لتأمين وصولك إلى حكاياتي.
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center gap-2.5 mb-6">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2.5 mb-6">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-foreground/80 mb-1.5">
                كلمة المرور الجديدة
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="8 خانات على الأقل"
                  dir="ltr"
                  className="w-full px-4 py-3 pl-11 rounded-2xl bg-soft-cream/80 dark:bg-white/[0.04] border border-soft-sand dark:border-white/10 text-foreground placeholder:text-foreground/40 text-sm focus:outline-none focus:border-deep-teal dark:focus:border-antique-gold transition-colors"
                />
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-foreground/40" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-foreground/80">
                  تأكيد كلمة المرور
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[11px] text-foreground/50 hover:text-foreground transition-colors"
                >
                  {showPassword ? 'إخفاء' : 'إظهار'}
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="أعد إدخال كلمة المرور"
                  dir="ltr"
                  className="w-full px-4 py-3 pl-11 rounded-2xl bg-soft-cream/80 dark:bg-white/[0.04] border border-soft-sand dark:border-white/10 text-foreground placeholder:text-foreground/40 text-sm focus:outline-none focus:border-deep-teal dark:focus:border-antique-gold transition-colors"
                />
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-foreground/40" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-deep-teal text-white dark:bg-gradient-to-r dark:from-antique-gold dark:to-muted-gold dark:text-midnight-navy font-bold text-sm shadow-lg hover:brightness-105 transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
            >
              {loading ? (
                <span>جاري الحفظ...</span>
              ) : (
                <span>تحديث كلمة المرور</span>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-soft-sand/40 dark:border-white/10 text-center">
            <Link
              href="/login"
              className="text-xs text-deep-teal dark:text-antique-gold font-bold hover:underline"
            >
              العودة إلى صفحة تسجيل الدخول
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
