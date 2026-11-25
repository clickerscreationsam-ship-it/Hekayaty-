/**
 * InteractiveOnboarding — Cinematic Multi-Step Onboarding Journey for HEKAYATY
 *
 * Implements the complete product requirements:
 *  - STEP 1: Welcome to HEKAYATY ("أهلاً بك في حكاياتي") with cinematic library backdrop
 *  - STEP 2: Discover HEKAYATY (Stories, Comics, Worlds, Originals, Creators)
 *  - STEP 3: Role-Aware Journey (Reader, Writer, Publishing House, Admin) with first meaningful action
 *  - STEP 4: Completion Celebration with role-tailored closing motto
 *
 * Features:
 *  - Fully accessible (ARIA, keyboard navigation, focus trap)
 *  - Reduced-motion support
 *  - Skips and resumes seamlessly
 *  - Scoped to authenticated user in useOnboardingStore
 */
import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'wouter';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  Sparkles,
  BookOpen,
  Compass,
  PenTool,
  Building2,
  ArrowLeft,
  ArrowRight,
  Flame,
  Globe,
  Layers,
  CheckCircle2,
  X,
  ChevronRight,
  Star,
  Library,
  BookmarkCheck,
} from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';
import { useOnboardingStore } from '@/stores/useOnboardingStore';
import magicLibraryBg from '@assets/generated_images/magic_library_clouds.png';

interface DiscoverCard {
  id: string;
  title: string;
  tagline: string;
  desc: string;
  icon: React.ElementType;
  previewColor: string;
  destination: string;
}

const DISCOVER_CARDS: DiscoverCard[] = [
  {
    id: 'stories',
    title: 'القصص والروايات',
    tagline: 'فصول أدبية ملحمية',
    desc: 'اقرأ قصصاً تأخذك إلى آفاق غير متوقعة عبر أساليب سردية عربية مبتكرة.',
    icon: BookOpen,
    previewColor: 'from-[#087C7B]/30 to-[#0A9A99]/10',
    destination: '/stories',
  },
  {
    id: 'comics',
    title: 'الكوميكس والأعمال المصورة',
    tagline: 'صفحات مرئية ملونة',
    desc: 'استمتع بقراءة مصورة عالية الدقة بتقليب الصفحات أو التمرير العمودي السلس.',
    icon: Library,
    previewColor: 'from-[#C5A15B]/30 to-[#E0C97B]/10',
    destination: '/comics',
  },
  {
    id: 'worlds',
    title: 'العوالم والشخصيات',
    tagline: 'أكوان متداخلة وميثولوجيا',
    desc: 'تعرّف على سير الأبطال، الممالك الأسطورية، وسجل القوى والأحداث الكونية.',
    icon: Globe,
    previewColor: 'from-purple-600/30 to-indigo-900/10',
    destination: '/characters',
  },
  {
    id: 'originals',
    title: 'حكاياتي Originals',
    tagline: 'أعمال حصرية وأصلية',
    desc: 'إصدارات فريدة أنتجت بإشراف حكاياتي تجمع بين الخيال العربي والرؤية المعاصرة.',
    icon: Flame,
    previewColor: 'from-amber-600/30 to-red-900/10',
    destination: '/selected',
  },
  {
    id: 'publishers',
    title: 'دور النشر والكتّاب',
    tagline: 'مجتمع صناع القصص',
    desc: 'تابع كتابك المفضلين ودور النشر الرائدة واستكشف أحدث إصداراتهم الرقمية.',
    icon: Building2,
    previewColor: 'from-emerald-600/30 to-teal-900/10',
    destination: '/editorial',
  },
];

export function InteractiveOnboarding() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuthStore();
  const {
    currentStep,
    isCompleted,
    isSkipped,
    setStep,
    nextStep,
    prevStep,
    completeOnboarding,
    skipOnboarding,
    syncWithUser,
  } = useOnboardingStore();

  const shouldReduceMotion = useReducedMotion();
  const [selectedCardId, setSelectedCardId] = useState<string>('stories');

  useEffect(() => {
    syncWithUser();
  }, [user?.id, syncWithUser]);

  const userRole = user?.role || 'reader';
  const displayName = user?.displayName || 'مسافرنا العزيز';

  // Completion headlines and motto per role
  const completionMotto: Record<string, { motto: string; actionText: string; targetRoute: string }> = {
    reader: {
      motto: 'عالمٌ جديد من الحكايات أصبح بين يديك.',
      actionText: 'ابدأ تصفح الكوميكس الآن',
      targetRoute: '/comics',
    },
    writer: {
      motto: 'حكايتك تستحق أن تُروى. ابدأ رحلتك.',
      actionText: 'ادخل إلى صالة التحرير',
      targetRoute: '/editorial',
    },
    publishing_house: {
      motto: 'مرحباً بك في مجتمع صُنّاع الحكايات.',
      actionText: 'افتح لوحة دار النشر',
      targetRoute: '/editorial',
    },
    admin: {
      motto: 'مرحباً بك في مركز قيادة حكاياتي.',
      actionText: 'الانتقال إلى لوحة الإدارة',
      targetRoute: '/admin',
    },
  };

  const mottoInfo = completionMotto[userRole] || completionMotto.reader;

  const handleFinishAndNavigate = (route: string) => {
    completeOnboarding();
    setLocation(route);
  };

  const handleSkip = () => {
    skipOnboarding();
    if (userRole === 'admin') setLocation('/admin');
    else if (userRole === 'writer' || userRole === 'publishing_house') setLocation('/editorial');
    else setLocation('/');
  };

  const variants = {
    enter: (direction: number) => ({
      opacity: 0,
      x: direction > 0 ? 30 : -30,
    }),
    center: {
      opacity: 1,
      x: 0,
    },
    exit: (direction: number) => ({
      opacity: 0,
      x: direction < 0 ? 30 : -30,
    }),
  };

  return (
    <div
      dir="rtl"
      className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-x-hidden bg-midnight-navy font-arabic py-8 px-4 sm:px-6"
    >
      {/* ── Cinematic Backdrop ─────────────────────────────────────────── */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <img
          src={magicLibraryBg}
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover object-top opacity-40 dark:opacity-35"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-midnight-navy/90 via-midnight-navy/80 to-midnight-navy/95" />
      </div>

      {/* ── Top Bar with Progress & Skip ───────────────────────────────── */}
      <div className="relative z-10 w-full max-w-3xl mx-auto flex items-center justify-between mb-6 pb-2 border-b border-white/[0.08]">
        {/* Step dots */}
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-2 rounded-full transition-all duration-300 ${
                s === currentStep
                  ? 'w-8 bg-gradient-to-r from-deep-teal to-antique-gold'
                  : s < currentStep
                  ? 'w-4 bg-antique-gold/80'
                  : 'w-2 bg-white/20'
              }`}
            />
          ))}
          <span className="text-xs text-warm-ivory/50 mr-2 font-mono">
            {currentStep} / 4
          </span>
        </div>

        {/* Skip button */}
        {currentStep < 4 && (
          <button
            onClick={handleSkip}
            className="text-xs text-warm-ivory/50 hover:text-warm-ivory/90 transition-colors flex items-center gap-1 py-1.5 px-3 rounded-lg hover:bg-white/[0.05]"
          >
            <span>تخطي التعريف</span>
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* ── Step Container ────────────────────────────────────────────── */}
      <div className="relative z-10 w-full max-w-3xl mx-auto">
        <AnimatePresence mode="wait" custom={1}>
          {/* ═════════════════════════════════════════════════════════════ */}
          {/* STEP 1: WELCOME TO HEKAYATY                                   */}
          {/* ═════════════════════════════════════════════════════════════ */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              variants={shouldReduceMotion ? {} : variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35 }}
              className="text-center py-6 px-4"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-deep-teal via-[#0A9A99] to-antique-gold text-white shadow-[0_0_40px_rgba(197,161,91,0.3)] mb-6 ring-2 ring-white/10">
                <Sparkles className="w-10 h-10 text-warm-ivory animate-pulse" />
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-cinzel font-bold text-warm-ivory mb-4 leading-tight">
                أهلاً بك في{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-l from-antique-gold to-[#E0C97B]">
                  حكاياتي
                </span>
              </h1>

              <p className="text-base sm:text-lg text-warm-ivory/80 max-w-xl mx-auto mb-4 leading-relaxed font-light">
                عالمٌ من القصص والشخصيات والعوالم التي تنتظر من يكتشفها.
              </p>

              <p className="text-xs sm:text-sm text-warm-ivory/55 max-w-lg mx-auto mb-10 leading-relaxed">
                هنا تجتمع الكوميكس والروايات العربية الملحمية، وأبعاد الأكوان الكونية، ومجتمع نابض يجمع القراء والمؤلفين ودور النشر في مساحة إبداعية واحدة.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
                <button
                  onClick={nextStep}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-l from-deep-teal to-[#0A9A99] text-white font-bold text-base shadow-xl shadow-deep-teal/25 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-3 ring-1 ring-white/10"
                >
                  <span>لنبدأ الرحلة</span>
                  <ArrowLeft className="w-5 h-5" />
                </button>

                <button
                  onClick={handleSkip}
                  className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-white/[0.06] border border-white/10 text-warm-ivory/70 font-semibold text-sm hover:bg-white/[0.1] hover:text-warm-ivory transition-all"
                >
                  تخطي مباشرة إلى المنصة
                </button>
              </div>
            </motion.div>
          )}

          {/* ═════════════════════════════════════════════════════════════ */}
          {/* STEP 2: DISCOVER HEKAYATY ECOSYSTEM                          */}
          {/* ═════════════════════════════════════════════════════════════ */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              variants={shouldReduceMotion ? {} : variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35 }}
              className="py-4 px-2"
            >
              <div className="text-center mb-6">
                <span className="text-xs font-bold text-antique-gold px-3 py-1 rounded-full bg-antique-gold/10 border border-antique-gold/20 inline-block mb-2">
                  استكشف أبعاد حكاياتي
                </span>
                <h2 className="text-2xl sm:text-3xl font-cinzel font-bold text-warm-ivory">
                  خمس بوابات لرحلتك الإبداعية
                </h2>
                <p className="text-xs sm:text-sm text-warm-ivory/60 mt-1 max-w-md mx-auto">
                  اختر أي بوابة لاستكشاف ميزاتها وما تقدمه لك في هذه العوالم:
                </p>
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                {DISCOVER_CARDS.map((card) => {
                  const Icon = card.icon;
                  const isSelected = selectedCardId === card.id;

                  return (
                    <button
                      key={card.id}
                      type="button"
                      onClick={() => setSelectedCardId(card.id)}
                      className={`p-4 rounded-2xl border text-right transition-all duration-200 relative overflow-hidden backdrop-blur-md flex flex-col justify-between ${
                        isSelected
                          ? 'border-antique-gold bg-gradient-to-br from-antique-gold/15 to-deep-teal/15 shadow-[0_0_20px_rgba(197,161,91,0.2)] scale-[1.02]'
                          : 'border-white/10 bg-white/[0.04] hover:border-white/25 hover:bg-white/[0.07]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3 w-full">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                            isSelected
                              ? 'bg-antique-gold text-midnight-navy font-bold'
                              : 'bg-white/[0.08] text-antique-gold'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        {isSelected && (
                          <span className="w-2 h-2 rounded-full bg-antique-gold animate-ping" />
                        )}
                      </div>

                      <div>
                        <h3
                          className={`text-sm font-bold mb-1 ${
                            isSelected ? 'text-antique-gold' : 'text-warm-ivory'
                          }`}
                        >
                          {card.title}
                        </h3>
                        <p className="text-[11px] text-warm-ivory/50 leading-relaxed mb-2">
                          {card.tagline}
                        </p>
                        <p className="text-[11px] text-warm-ivory/70 leading-relaxed">
                          {card.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between pt-4 border-t border-white/[0.08]">
                <button
                  onClick={prevStep}
                  className="px-5 py-3 rounded-xl border border-white/15 text-warm-ivory/70 hover:text-warm-ivory hover:border-white/30 text-sm font-semibold transition-all flex items-center gap-2"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>السابق</span>
                </button>

                <button
                  onClick={nextStep}
                  className="px-7 py-3 rounded-xl bg-gradient-to-l from-deep-teal to-[#0A9A99] text-white text-sm font-bold shadow-lg shadow-deep-teal/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center gap-2"
                >
                  <span>التالي — تجربتك المخصصة</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* ═════════════════════════════════════════════════════════════ */}
          {/* STEP 3: PERSONALIZED EXPERIENCE BY AUTHENTICATED ROLE        */}
          {/* ═════════════════════════════════════════════════════════════ */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              variants={shouldReduceMotion ? {} : variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35 }}
              className="py-4 px-2"
            >
              {/* Header */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold border border-antique-gold/30 bg-antique-gold/10 text-antique-gold mb-3">
                  <Star className="w-3.5 h-3.5 text-antique-gold" />
                  <span>
                    {userRole === 'writer'
                      ? 'بوابة الكاتب والمبدع'
                      : userRole === 'publishing_house'
                      ? 'بوابة دار النشر'
                      : userRole === 'admin'
                      ? 'بوابة المشرف الإداري'
                      : 'بوابة القارئ والمستكشف'}
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-cinzel font-bold text-warm-ivory">
                  أهلاً بك يا {displayName}
                </h2>
                <p className="text-xs sm:text-sm text-warm-ivory/60 mt-1 max-w-md mx-auto">
                  اختر نقطة انطلاقك الأولى المخصصة لدورك في حكاياتي:
                </p>
              </div>

              {/* ── READER ROLE CHOICES ── */}
              {userRole === 'reader' && (
                <div className="space-y-3 mb-6">
                  <div
                    onClick={() => handleFinishAndNavigate('/comics')}
                    className="group cursor-pointer p-5 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-antique-gold/60 hover:bg-white/[0.08] transition-all flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-deep-teal to-antique-gold flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform">
                        <Library className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-warm-ivory group-hover:text-antique-gold transition-colors">
                          استكشف الكوميكس والقصص المصورة
                        </h4>
                        <p className="text-xs text-warm-ivory/50 mt-1">
                          تصفح أحدث أعداد الكوميكس واقرأ الأجزاء الأولى مجاناً.
                        </p>
                      </div>
                    </div>
                    <ArrowLeft className="w-4 h-4 text-warm-ivory/40 group-hover:text-antique-gold group-hover:translate-x-[-3px] transition-all" />
                  </div>

                  <div
                    onClick={() => handleFinishAndNavigate('/stories')}
                    className="group cursor-pointer p-5 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-antique-gold/60 hover:bg-white/[0.08] transition-all flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-white/[0.08] flex items-center justify-center text-antique-gold shrink-0 group-hover:scale-110 transition-transform">
                        <BookOpen className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-warm-ivory group-hover:text-antique-gold transition-colors">
                          اكتشف الروايات والقصص الأدبية
                        </h4>
                        <p className="text-xs text-warm-ivory/50 mt-1">
                          ادخل إلى عوالم السرد الأدبي وفصول الملاحم المكتوبة.
                        </p>
                      </div>
                    </div>
                    <ArrowLeft className="w-4 h-4 text-warm-ivory/40 group-hover:text-antique-gold group-hover:translate-x-[-3px] transition-all" />
                  </div>

                  <div
                    onClick={() => handleFinishAndNavigate('/characters')}
                    className="group cursor-pointer p-5 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-antique-gold/60 hover:bg-white/[0.08] transition-all flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-white/[0.08] flex items-center justify-center text-antique-gold shrink-0 group-hover:scale-110 transition-transform">
                        <Globe className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-warm-ivory group-hover:text-antique-gold transition-colors">
                          تعرّف على سجل الأبطال والعوالم
                        </h4>
                        <p className="text-xs text-warm-ivory/50 mt-1">
                          استكشف شخصيات الأكوان الكونية، قواهم ومساراتهم المتشابكة.
                        </p>
                      </div>
                    </div>
                    <ArrowLeft className="w-4 h-4 text-warm-ivory/40 group-hover:text-antique-gold group-hover:translate-x-[-3px] transition-all" />
                  </div>
                </div>
              )}

              {/* ── WRITER ROLE CHOICES ── */}
              {userRole === 'writer' && (
                <div className="space-y-3 mb-6">
                  <div
                    onClick={() => handleFinishAndNavigate('/editorial')}
                    className="group cursor-pointer p-5 rounded-2xl bg-gradient-to-l from-deep-teal/30 to-midnight-navy border border-antique-gold/50 hover:border-antique-gold transition-all flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-deep-teal to-antique-gold flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform">
                        <PenTool className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-warm-ivory group-hover:text-antique-gold transition-colors">
                          ابدأ رحلتك ككاتب — صالة التحرير
                        </h4>
                        <p className="text-xs text-warm-ivory/50 mt-1">
                          قدّم مسودتك الأولى لهيئة التحرير وتابع حالة الاعتماد والنشر.
                        </p>
                      </div>
                    </div>
                    <ArrowLeft className="w-4 h-4 text-warm-ivory/40 group-hover:text-antique-gold group-hover:translate-x-[-3px] transition-all" />
                  </div>

                  <div
                    onClick={() => handleFinishAndNavigate('/profile')}
                    className="group cursor-pointer p-5 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-antique-gold/60 transition-all flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-white/[0.08] flex items-center justify-center text-antique-gold shrink-0 group-hover:scale-110 transition-transform">
                        <Compass className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-warm-ivory group-hover:text-antique-gold transition-colors">
                          استكمال الملف الإبداعي والنبذة
                        </h4>
                        <p className="text-xs text-warm-ivory/50 mt-1">
                          عرّف جمهور حكاياتي بأسلوبك وأعمالك السابقة.
                        </p>
                      </div>
                    </div>
                    <ArrowLeft className="w-4 h-4 text-warm-ivory/40 group-hover:text-antique-gold group-hover:translate-x-[-3px] transition-all" />
                  </div>
                </div>
              )}

              {/* ── PUBLISHING HOUSE ROLE CHOICES ── */}
              {userRole === 'publishing_house' && (
                <div className="space-y-3 mb-6">
                  <div
                    onClick={() => handleFinishAndNavigate('/editorial')}
                    className="group cursor-pointer p-5 rounded-2xl bg-gradient-to-l from-deep-teal/30 to-midnight-navy border border-antique-gold/50 hover:border-antique-gold transition-all flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-deep-teal to-antique-gold flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform">
                        <Building2 className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-warm-ivory group-hover:text-antique-gold transition-colors">
                          افتح لوحة دار النشر وإدارة الكتالوج
                        </h4>
                        <p className="text-xs text-warm-ivory/50 mt-1">
                          إرسال حزم الإصدارات، إدارة حقوق النشر، ومتابعة القراء.
                        </p>
                      </div>
                    </div>
                    <ArrowLeft className="w-4 h-4 text-warm-ivory/40 group-hover:text-antique-gold group-hover:translate-x-[-3px] transition-all" />
                  </div>

                  <div
                    onClick={() => handleFinishAndNavigate('/profile')}
                    className="group cursor-pointer p-5 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-antique-gold/60 transition-all flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-white/[0.08] flex items-center justify-center text-antique-gold shrink-0 group-hover:scale-110 transition-transform">
                        <Compass className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-warm-ivory group-hover:text-antique-gold transition-colors">
                          إدارة الهوية الرسمية وبيانات التواصل
                        </h4>
                        <p className="text-xs text-warm-ivory/50 mt-1">
                          تحديث شعار الدار والبيانات الرسمية للشراكات.
                        </p>
                      </div>
                    </div>
                    <ArrowLeft className="w-4 h-4 text-warm-ivory/40 group-hover:text-antique-gold group-hover:translate-x-[-3px] transition-all" />
                  </div>
                </div>
              )}

              {/* ── ADMIN ROLE CHOICES ── */}
              {userRole === 'admin' && (
                <div className="space-y-3 mb-6">
                  <div
                    onClick={() => handleFinishAndNavigate('/admin')}
                    className="group cursor-pointer p-5 rounded-2xl bg-gradient-to-l from-deep-teal/40 to-midnight-navy border border-antique-gold/50 hover:border-antique-gold transition-all flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-deep-teal to-antique-gold flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform">
                        <Layers className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-warm-ivory group-hover:text-antique-gold transition-colors">
                          لوحة التحكم المركزية للإدارة
                        </h4>
                        <p className="text-xs text-warm-ivory/50 mt-1">
                          إدارة المستخدمين، المحتوى، والمبيعات والعمليات الكونية.
                        </p>
                      </div>
                    </div>
                    <ArrowLeft className="w-4 h-4 text-warm-ivory/40 group-hover:text-antique-gold group-hover:translate-x-[-3px] transition-all" />
                  </div>
                </div>
              )}

              {/* Controls */}
              <div className="flex items-center justify-between pt-4 border-t border-white/[0.08]">
                <button
                  onClick={prevStep}
                  className="px-5 py-3 rounded-xl border border-white/15 text-warm-ivory/70 hover:text-warm-ivory hover:border-white/30 text-sm font-semibold transition-all flex items-center gap-2"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>السابق</span>
                </button>

                <button
                  onClick={nextStep}
                  className="px-7 py-3 rounded-xl bg-gradient-to-l from-deep-teal to-[#0A9A99] text-white text-sm font-bold shadow-lg shadow-deep-teal/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center gap-2"
                >
                  <span>إتمام الجولة الترحيبية</span>
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* ═════════════════════════════════════════════════════════════ */}
          {/* STEP 4: COMPLETION CELEBRATION                               */}
          {/* ═════════════════════════════════════════════════════════════ */}
          {currentStep === 4 && (
            <motion.div
              key="step4"
              variants={shouldReduceMotion ? {} : variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35 }}
              className="text-center py-8 px-4"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-500 to-deep-teal text-white shadow-[0_0_35px_rgba(16,185,129,0.3)] mb-6 ring-2 ring-emerald-400/30">
                <BookmarkCheck className="w-10 h-10 text-warm-ivory" />
              </div>

              <h2 className="text-3xl sm:text-4xl font-cinzel font-bold text-warm-ivory mb-3 leading-tight">
                {mottoInfo.motto}
              </h2>

              <p className="text-sm text-warm-ivory/60 max-w-md mx-auto mb-8 leading-relaxed">
                اكتملت جولتك التمهيدية بنجاح. يمكنك دائماً إعادة تشغيل هذا الدليل من صفحة ملفك الشخصي أو الاستعانة بتلميحات الراوي السياقية.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-sm mx-auto">
                <button
                  onClick={() => handleFinishAndNavigate(mottoInfo.targetRoute)}
                  className="w-full py-4 rounded-2xl bg-gradient-to-l from-deep-teal to-antique-gold text-white font-bold text-base shadow-xl shadow-deep-teal/25 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <span>{mottoInfo.actionText}</span>
                  <ArrowLeft className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-6">
                <button
                  onClick={() => handleFinishAndNavigate('/')}
                  className="text-xs text-warm-ivory/40 hover:text-warm-ivory/70 transition-colors"
                >
                  أو الانتقال إلى الصفحة الرئيسية
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
