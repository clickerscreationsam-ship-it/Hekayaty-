import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { Mail, KeyRound, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { api } from '@/lib/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('يرجى إدخال البريد الإلكتروني المسجل');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await api.forgotPassword(email);
      setSuccess(
        res?.message || 'إذا كان هذا البريد مسجلاً في حكاياتي، فقد أرسلنا لك رابطاً آمناً لإعادة تعيين كلمة المرور.'
      );
    } catch (err: any) {
      setError(err.message || 'تعذر إرسال طلب استعادة كلمة المرور');
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
              استعادة كلمة المرور
            </h1>
            <p className="text-xs sm:text-sm text-foreground/65 mt-2">
              أدخل بريدك الإلكتروني المسجل وسنرسل لك رابطاً مباشراً لتعيين كلمة مرور جديدة لحسابك.
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center gap-2.5 mb-6">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs flex flex-col gap-2 mb-6">
              <div className="flex items-center gap-2 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>تم إرسال التعليمات بنجاح</span>
              </div>
              <p className="text-[11px] leading-relaxed">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-foreground/80 mb-1.5">
                البريد الإلكتروني
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  dir="ltr"
                  className="w-full px-4 py-3 pl-11 rounded-2xl bg-soft-cream/80 dark:bg-white/[0.04] border border-soft-sand dark:border-white/10 text-foreground placeholder:text-foreground/40 text-sm focus:outline-none focus:border-deep-teal dark:focus:border-antique-gold transition-colors"
                />
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-foreground/40" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-deep-teal text-white dark:bg-gradient-to-r dark:from-antique-gold dark:to-muted-gold dark:text-midnight-navy font-bold text-sm shadow-lg hover:brightness-105 transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
            >
              {loading ? (
                <span>جاري إرسال الرابط...</span>
              ) : (
                <span>إرسال رابط إعادة التعيين</span>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-soft-sand/40 dark:border-white/10 text-center">
            <Link
              href="/login"
              className="text-xs text-deep-teal dark:text-antique-gold font-bold hover:underline inline-flex items-center gap-1.5"
            >
              <ArrowRight className="w-3.5 h-3.5 rotate-0" />
              <span>العودة إلى صفحة تسجيل الدخول</span>
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
