/**
 * StoryGuide (الراوي) — Literary, Contextual & Role-Aware In-App Guidance
 *
 * Enhanced features:
 * - Scoped dismissal state to user ID (`hekayaty_guide_${userId}_${promptId}`)
 * - Allows reopening / restarting the tutorial on demand
 * - Short, literary, non-blocking, and dismissible
 */
import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Sparkles, X, ChevronLeft, Feather, RotateCcw } from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';
import { useOnboardingStore } from '@/stores/useOnboardingStore';

interface GuidePrompt {
  id: string;
  matchPrefix: string;
  roles?: string[]; // if specified, only show for these roles
  title: string;
  message: string;
  actionText: string;
  actionHref: string;
}

const GUIDE_PROMPTS: GuidePrompt[] = [
  {
    id: 'guide-comics',
    matchPrefix: '/comics',
    title: 'تلميح الراوي',
    message: 'يمكنك التبديل بين وضع التمرير العمودي وتقليب الصفحات داخل القارئ الذكي.',
    actionText: 'اكتشف المزيد',
    actionHref: '/comics',
  },
  {
    id: 'guide-stories',
    matchPrefix: '/stories',
    title: 'سرد حكاياتي',
    message: 'القصص الأدبية مرتبطة بالخط الزمني الكوني؛ كل حدث يؤثر في مسار الأبطال.',
    actionText: 'استكشف الخط الزمني',
    actionHref: '/timeline',
  },
  {
    id: 'guide-editorial-writer',
    matchPrefix: '/editorial',
    roles: ['writer'],
    title: 'إرشاد الكاتب',
    message: 'تأكد من إرفاق ملخص العمل والتصنيف الفني قبل تقديم المسودة للمراجعة التحريرية.',
    actionText: 'شروط النشر',
    actionHref: '/selected',
  },
  {
    id: 'guide-editorial-publisher',
    matchPrefix: '/editorial',
    roles: ['publishing_house'],
    title: 'إرشاد دار النشر',
    message: 'يمكنك تسجيل كتالوج الإصدارات وحفظ حقوق الطباعة والنشر الرقمي عبر لوحة التحرير.',
    actionText: 'الكتالوج المعتمد',
    actionHref: '/selected',
  },
  {
    id: 'guide-characters',
    matchPrefix: '/characters',
    title: 'سجل الأبطال',
    message: 'اضغط على أي شخصية للتعرف على قدراتها الخارقة وعلاقتها بالقوى والممالك.',
    actionText: 'الموسوعة الكونية',
    actionHref: '/encyclopedia',
  },
];

export function StoryGuide() {
  const [location, setLocation] = useLocation();
  const { user } = useAuthStore();
  const { restartOnboarding } = useOnboardingStore();
  const shouldReduceMotion = useReducedMotion();
  const [activePrompt, setActivePrompt] = useState<GuidePrompt | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);

  const userId = user?.id || 'guest';

  useEffect(() => {
    setIsDismissed(false);

    // Look for matching prompt for current route
    const prompt = GUIDE_PROMPTS.find((p) => {
      const match = location.startsWith(p.matchPrefix);
      if (!match) return false;
      if (p.roles && user?.role) {
        return p.roles.includes(user.role);
      }
      return true;
    });

    if (prompt) {
      // Scoped per-user key
      const dismissedStorage = localStorage.getItem(`hekayaty_guide_${userId}_${prompt.id}`);
      if (!dismissedStorage) {
        const timer = setTimeout(() => {
          setActivePrompt(prompt);
        }, 1200);
        return () => clearTimeout(timer);
      }
    }

    setActivePrompt(null);
    return undefined;
  }, [location, user?.role, userId]);

  const handleDismiss = () => {
    if (activePrompt) {
      localStorage.setItem(`hekayaty_guide_${userId}_${activePrompt.id}`, 'dismissed');
    }
    setIsDismissed(true);
  };

  const handleRestartTour = () => {
    restartOnboarding();
    setLocation('/welcome-aboard');
  };

  // Hide on onboarding or auth pages
  if (
    location === '/welcome' ||
    location === '/welcome-aboard' ||
    location === '/login' ||
    location === '/register'
  ) {
    return null;
  }

  return (
    <>
      {activePrompt && !isDismissed && (
        <aside aria-label="تلميح الراوي" className="fixed bottom-6 left-6 z-40 max-w-sm pointer-events-none">
          <AnimatePresence>
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.95 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="pointer-events-auto p-4 rounded-2xl bg-midnight-navy/90 dark:bg-midnight-navy/95 border border-antique-gold/40 shadow-2xl backdrop-blur-md text-right font-arabic ring-1 ring-white/10"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-antique-gold/20 text-antique-gold flex items-center justify-center">
                    <Feather className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-antique-gold font-cinzel">
                    {activePrompt.title}
                  </span>
                </div>
                <button
                  onClick={handleDismiss}
                  aria-label="إغلاق التلميح"
                  className="text-warm-ivory/40 hover:text-warm-ivory transition-colors p-1 rounded-lg hover:bg-white/5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Body */}
              <p className="text-xs text-warm-ivory/80 leading-relaxed mb-3">
                {activePrompt.message}
              </p>

              {/* Footer Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => {
                    handleDismiss();
                    if (activePrompt.actionHref) setLocation(activePrompt.actionHref);
                  }}
                  className="text-[11px] font-bold text-antique-gold hover:text-antique-gold/80 flex items-center gap-1 transition-colors cursor-pointer bg-transparent border-0 p-0"
                >
                  <span>{activePrompt.actionText}</span>
                  <ChevronLeft className="w-3 h-3" />
                </button>
                <button
                  onClick={handleDismiss}
                  className="text-[10px] text-warm-ivory/40 hover:text-warm-ivory/60 transition-colors"
                >
                  لا تظهر مجدداً
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </aside>
      )}
    </>
  );
}
