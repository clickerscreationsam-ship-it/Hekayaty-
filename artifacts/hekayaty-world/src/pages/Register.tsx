/**
 * Register — Fast 2-step registration with cinematic auth layout.
 * Step 1: Name + Email + Password
 * Step 2: Role selection with benefit bullets
 * After success → /welcome-aboard (role-aware cinematic transition)
 */
import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  User, Mail, Lock, Eye, EyeOff,
  AlertCircle, CheckCircle2, ArrowLeft, ArrowRight,
  BookOpen, PenTool, Building2, ChevronRight,
} from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';
import { AuthLayout } from '@/components/auth/AuthLayout';

type Role = 'reader' | 'writer' | 'publishing_house';

const ROLES: { id: Role; icon: React.ElementType; title: string; tagline: string; benefits: string[] }[] = [
  {
    id: 'reader',
    icon: BookOpen,
    title: 'قارئ ومستكشف',
    tagline: 'ادخل عوالم لا تنتهي',
    benefits: ['احفظ مفضلاتك وتابع قراءاتك', 'شارك مجتمع المبدعين', 'تلقَّ توصيات مخصصة'],
  },
  {
    id: 'writer',
    icon: PenTool,
    title: 'كاتب أو رسام',
    tagline: 'شارك إبداعك مع العالم',
    benefits: ['قدّم أعمالك لهيئة التحرير', 'انشر في حكاياتي المختارة', 'احصل على قراء حقيقيين'],
  },
  {
    id: 'publishing_house',
    icon: Building2,
    title: 'دار نشر',
    tagline: 'وسّع نطاق كتالوجك رقمياً',
    benefits: ['إدارة كتالوج كامل', 'متابعة المبيعات والطلبات', 'يتطلب موافقة الإدارة'],
  },
];

function PasswordStrength({ password }: { password: string }) {
  const len = password.length;
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const score = len === 0 ? 0 : len < 6 ? 1 : len < 10 && !hasUpper && !hasNumber ? 2 : len >= 10 && hasUpper && hasNumber ? 4 : 3;
  const labels = ['', 'ضعيفة', 'مقبولة', 'جيدة', 'قوية'];
  const colors = ['', 'bg-red-500', 'bg-orange-400', 'bg-yellow-400', 'bg-emerald-500'];
  if (!password) return null;
  return (
    <div className="flex items-center gap-2 mt-1.5">
      <div className="flex gap-1 flex-1">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className={`h-1 flex-1 rounded-full transition-colors ${score >= s ? colors[score] : 'bg-white/10'}`} />
        ))}
      </div>
      <span className={`text-[10px] font-semibold ${score >= 4 ? 'text-emerald-400' : score >= 3 ? 'text-yellow-400' : 'text-red-400'}`}>
        {labels[score]}
      </span>
    </div>
  );
}

export default function Register() {
  const [, setLocation] = useLocation();
  const { register } = useAuthStore();
  const shouldReduceMotion = useReducedMotion();

  // Step state
  const [step, setStep] = useState<1 | 2>(1);

  // Fields
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<Role>('reader');
  const [showPassword, setShowPassword] = useState(false);

  // Status
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const inputClass =
    'w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/[0.12] text-warm-ivory placeholder:text-warm-ivory/30 text-sm focus:outline-none focus:border-antique-gold/60 focus:bg-white/[0.09] transition-all';

  // ── Step 1 validation ──────────────────────────────────────────
  const validateStep1 = () => {
    const errs: Record<string, string> = {};
    if (!displayName.trim()) errs.displayName = 'الاسم مطلوب';
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'بريد إلكتروني غير صالح';
    if (password.length < 8) errs.password = 'كلمة المرور يجب أن تكون 8 خانات على الأقل';
    if (password !== confirmPassword) errs.confirmPassword = 'كلمتا المرور غير متطابقتين';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleStep1Next = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep1()) setStep(2);
  };

  // ── Final submit ───────────────────────────────────────────────
  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    const res = await register({ email, password, displayName: displayName.trim(), role });
    if (res.success) {
      // Store new-user flag for welcome screen
      localStorage.setItem('hekayaty_new_user', 'true');
      setLocation('/welcome-aboard');
    } else {
      const msg = res.error || '';
      if (msg.includes('already') || msg.includes('registered') || msg.includes('exists')) {
        setError('هذا البريد الإلكتروني مسجل بالفعل. يمكنك تسجيل الدخول مباشرة.');
      } else {
        setError('تعذر إنشاء الحساب. يرجى المحاولة مرة أخرى.');
      }
      setLoading(false);
    }
  };

  const slideVariants = {
    enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 40 : -40 }),
    center: { opacity: 1, x: 0 },
    exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -40 : 40 }),
  };

  return (
    <AuthLayout>
      <div className="p-7 sm:p-9 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-md bg-midnight-navy/60">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-cinzel font-bold text-warm-ivory">
            {step === 1 ? 'ابدأ قصتك' : 'اختر دورك'}
          </h1>
          <p className="text-xs text-warm-ivory/45 mt-1.5">
            {step === 1 ? 'أنشئ حسابك المجاني في دقيقة واحدة' : 'يمكنك تغيير دورك لاحقاً من الإعدادات'}
          </p>
          {/* Step indicator */}
          <div className="flex items-center justify-center gap-2 mt-4" aria-label={`الخطوة ${step} من 2`}>
            <div className={`h-1.5 rounded-full transition-all duration-300 ${step >= 1 ? 'w-8 bg-antique-gold' : 'w-4 bg-white/20'}`} />
            <div className={`h-1.5 rounded-full transition-all duration-300 ${step >= 2 ? 'w-8 bg-antique-gold' : 'w-4 bg-white/20'}`} />
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2 mb-4"
            role="alert"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        {/* ── STEP 1 ─────────────────────────────────────────────── */}
        <AnimatePresence mode="wait" custom={1}>
          {step === 1 && (
            <motion.form
              key="step1"
              custom={1}
              variants={shouldReduceMotion ? {} : slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              onSubmit={handleStep1Next}
              className="space-y-4"
              noValidate
            >
              {/* Display Name */}
              <div>
                <label htmlFor="reg-name" className="block text-xs font-semibold text-warm-ivory/70 mb-1.5">
                  الاسم المعروض
                </label>
                <div className="relative">
                  <input
                    id="reg-name"
                    type="text"
                    autoComplete="name"
                    required
                    value={displayName}
                    onChange={(e) => { setDisplayName(e.target.value); setFieldErrors(p => ({ ...p, displayName: '' })); }}
                    placeholder="مثال: زائر حكاياتي"
                    className={`${inputClass} pl-10 ${fieldErrors.displayName ? 'border-red-500/50' : ''}`}
                    aria-invalid={!!fieldErrors.displayName}
                  />
                  <User className="absolute left-3 top-3.5 w-4 h-4 text-warm-ivory/30 pointer-events-none" />
                </div>
                {fieldErrors.displayName && (
                  <p className="text-red-400 text-[11px] mt-1">{fieldErrors.displayName}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="reg-email" className="block text-xs font-semibold text-warm-ivory/70 mb-1.5">
                  البريد الإلكتروني
                </label>
                <div className="relative">
                  <input
                    id="reg-email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setFieldErrors(p => ({ ...p, email: '' })); }}
                    placeholder="name@example.com"
                    dir="ltr"
                    className={`${inputClass} pl-10 ${fieldErrors.email ? 'border-red-500/50' : ''}`}
                    aria-invalid={!!fieldErrors.email}
                  />
                  <Mail className="absolute left-3 top-3.5 w-4 h-4 text-warm-ivory/30 pointer-events-none" />
                </div>
                {fieldErrors.email && (
                  <p className="text-red-400 text-[11px] mt-1">{fieldErrors.email}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="reg-password" className="block text-xs font-semibold text-warm-ivory/70 mb-1.5">
                  كلمة المرور
                </label>
                <div className="relative">
                  <input
                    id="reg-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setFieldErrors(p => ({ ...p, password: '' })); }}
                    placeholder="8 خانات على الأقل"
                    dir="ltr"
                    className={`${inputClass} pl-10 pr-10 ${fieldErrors.password ? 'border-red-500/50' : ''}`}
                    aria-invalid={!!fieldErrors.password}
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
                <PasswordStrength password={password} />
                {fieldErrors.password && (
                  <p className="text-red-400 text-[11px] mt-1">{fieldErrors.password}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="reg-confirm" className="block text-xs font-semibold text-warm-ivory/70 mb-1.5">
                  تأكيد كلمة المرور
                </label>
                <div className="relative">
                  <input
                    id="reg-confirm"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setFieldErrors(p => ({ ...p, confirmPassword: '' })); }}
                    placeholder="أعد كتابة كلمة المرور"
                    dir="ltr"
                    className={`${inputClass} pl-10 ${fieldErrors.confirmPassword ? 'border-red-500/50' : ''}`}
                    aria-invalid={!!fieldErrors.confirmPassword}
                  />
                  <Lock className="absolute left-3 top-3.5 w-4 h-4 text-warm-ivory/30 pointer-events-none" />
                  {confirmPassword && password === confirmPassword && (
                    <CheckCircle2 className="absolute right-3 top-3.5 w-4 h-4 text-emerald-400" />
                  )}
                </div>
                {fieldErrors.confirmPassword && (
                  <p className="text-red-400 text-[11px] mt-1">{fieldErrors.confirmPassword}</p>
                )}
              </div>

              {/* Next button */}
              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-gradient-to-l from-deep-teal to-[#0A9A99] text-white font-bold text-sm shadow-lg shadow-deep-teal/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4"
              >
                <span>التالي — اختر دورك</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            </motion.form>
          )}

          {/* ── STEP 2 — Role Selection ──────────────────────────── */}
          {step === 2 && (
            <motion.div
              key="step2"
              custom={1}
              variants={shouldReduceMotion ? {} : slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="space-y-3"
            >
              {ROLES.map(({ id, icon: Icon, title, tagline, benefits }) => {
                const isSelected = role === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setRole(id)}
                    className={`w-full p-4 rounded-2xl border text-right transition-all ${
                      isSelected
                        ? 'border-antique-gold/60 bg-antique-gold/10 shadow-lg shadow-antique-gold/10'
                        : 'border-white/[0.1] bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]'
                    }`}
                    aria-pressed={isSelected}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        isSelected ? 'bg-antique-gold/20 text-antique-gold' : 'bg-white/[0.06] text-warm-ivory/40'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className={`text-sm font-bold ${isSelected ? 'text-antique-gold' : 'text-warm-ivory'}`}>
                            {title}
                          </span>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-antique-gold shrink-0" />}
                        </div>
                        <p className="text-[11px] text-warm-ivory/40 mt-0.5">{tagline}</p>
                        {isSelected && (
                          <ul className="mt-2 space-y-1">
                            {benefits.map((b) => (
                              <li key={b} className="text-[11px] text-warm-ivory/60 flex items-center gap-1.5">
                                <ChevronRight className="w-3 h-3 text-antique-gold/70 shrink-0" />
                                {b}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}

              {/* Action buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 rounded-xl border border-white/[0.1] text-warm-ivory/60 text-sm font-semibold hover:border-white/20 hover:text-warm-ivory/80 transition-all flex items-center justify-center gap-2"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>رجوع</span>
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-[2] py-3 rounded-xl bg-gradient-to-l from-deep-teal to-[#0A9A99] text-white font-bold text-sm shadow-lg shadow-deep-teal/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      <span>جاري الإنشاء...</span>
                    </>
                  ) : (
                    <>
                      <span>إتمام التسجيل</span>
                      <ArrowLeft className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <div className="mt-5 pt-4 border-t border-white/[0.07] text-center">
          <p className="text-xs text-warm-ivory/35">
            لديك حساب بالفعل؟{' '}
            <Link href="/login" className="text-antique-gold font-bold hover:text-antique-gold/80 transition-colors">
              تسجيل الدخول
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}
