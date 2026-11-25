/**
 * Welcome — Cinematic first-screen for HEKAYATY.
 * Shown ONLY to unauthenticated visitors who land on /welcome.
 * Also linked from the homepage hero for explicit "enter your story" CTA.
 *
 * Goals:
 *  1. Immediately surface Sign Up & Sign In CTAs.
 *  2. Convey HEKAYATY's cinematic fantasy identity.
 *  3. Allow guest exploration without forced registration.
 *  4. Zero mandatory storytelling before auth.
 */
import React from 'react';
import { Link, useLocation } from 'wouter';
import { motion, useReducedMotion } from 'framer-motion';
import { BookOpen, PenTool, Building2, ArrowLeft, Compass } from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';
import magicLibraryBg from '@assets/generated_images/magic_library_clouds.png';

const FEATURES = [
  { icon: BookOpen, text: 'كوميكس وروايات عربية أصيلة' },
  { icon: PenTool, text: 'انشر إبداعك مع مجتمع المبدعين' },
  { icon: Building2, text: 'عوالم متشابكة وشخصيات لا تُنسى' },
];

export default function Welcome() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, user } = useAuthStore();
  const shouldReduceMotion = useReducedMotion();

  // If already authenticated, send to appropriate destination
  React.useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin') setLocation('/admin');
      else if (user.role === 'writer') setLocation('/editorial');
      else if (user.role === 'publishing_house') setLocation('/editorial');
      else setLocation('/');
    }
  }, [isAuthenticated, user, setLocation]);

  const fadeUp = (delay = 0) =>
    shouldReduceMotion
      ? {}
      : { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5, delay } };

  return (
    <div
      dir="rtl"
      className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-midnight-navy font-arabic"
    >
      {/* ── Background ──────────────────────────────────────────────── */}
      <div className="absolute inset-0 z-0">
        <img
          src={magicLibraryBg}
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover object-top"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-midnight-navy/75 via-midnight-navy/65 to-midnight-navy/90" />
        <div className="absolute inset-0 bg-gradient-to-r from-midnight-navy/40 via-transparent to-midnight-navy/40" />
      </div>

      {/* ── Ambient floating orbs ───────────────────────────────────── */}
      {!shouldReduceMotion && (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div className="absolute top-1/4 left-10 w-32 h-32 bg-deep-teal/15 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
          <div className="absolute bottom-1/3 right-16 w-24 h-24 bg-antique-gold/15 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '5s', animationDelay: '1.5s' }} />
          <div className="absolute top-2/3 left-1/3 w-20 h-20 bg-deep-teal/10 rounded-full blur-2xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '0.8s' }} />
        </div>
      )}

      {/* ── HEKAYATY logo ───────────────────────────────────────────── */}
      <motion.div {...fadeUp(0)} className="relative z-10 mb-6 flex flex-col items-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-deep-teal via-[#0A9A99] to-antique-gold flex items-center justify-center shadow-2xl mb-3 ring-1 ring-white/10">
          <span className="text-white font-cinzel font-black text-2xl">ح</span>
        </div>
        <span className="font-cinzel font-bold text-warm-ivory/90 text-xl tracking-widest uppercase">HEKAYATY</span>
      </motion.div>

      {/* ── Headline ────────────────────────────────────────────────── */}
      <motion.div {...fadeUp(0.1)} className="relative z-10 text-center px-6 mb-3">
        <h1 className="text-3xl sm:text-4xl font-cinzel font-bold text-warm-ivory leading-snug">
          عالمٌ من الحكايات{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-l from-antique-gold to-[#E0C97B]">
            ينتظرك
          </span>
        </h1>
      </motion.div>

      <motion.div {...fadeUp(0.15)} className="relative z-10 text-center px-8 mb-8">
        <p className="text-sm text-warm-ivory/60 leading-relaxed max-w-xs mx-auto">
          اكتشف كوميكس وروايات عربية، أو شارك إبداعك مع مجتمع من المبدعين.
        </p>
      </motion.div>

      {/* ── Primary CTAs ────────────────────────────────────────────── */}
      <motion.div {...fadeUp(0.2)} className="relative z-10 w-full max-w-xs px-4 flex flex-col gap-3 mb-4">
        {/* Create Account — Primary */}
        <Link href="/register">
          <a className="w-full py-3.5 rounded-2xl bg-gradient-to-l from-deep-teal to-[#0A9A99] text-white font-bold text-sm shadow-lg shadow-deep-teal/30 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 ring-1 ring-white/10">
            <span>إنشاء حساب جديد</span>
            <ArrowLeft className="w-4 h-4" />
          </a>
        </Link>

        {/* Sign In — Secondary */}
        <Link href="/login">
          <a className="w-full py-3.5 rounded-2xl bg-white/8 backdrop-blur-sm border border-white/15 text-warm-ivory font-bold text-sm hover:bg-white/12 hover:border-antique-gold/40 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
            <span>تسجيل الدخول</span>
          </a>
        </Link>
      </motion.div>

      {/* ── Guest exploration link ───────────────────────────────────── */}
      <motion.div {...fadeUp(0.25)} className="relative z-10 mb-10">
        <Link href="/">
          <a className="flex items-center gap-1.5 text-xs text-warm-ivory/40 hover:text-warm-ivory/70 transition-colors">
            <Compass className="w-3.5 h-3.5" />
            <span>استكشف كزائر</span>
          </a>
        </Link>
      </motion.div>

      {/* ── Feature pills ────────────────────────────────────────────── */}
      <motion.div
        {...fadeUp(0.3)}
        className="relative z-10 flex flex-wrap justify-center gap-2 px-6 max-w-sm"
      >
        {FEATURES.map(({ icon: Icon, text }) => (
          <div
            key={text}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.08] backdrop-blur-sm"
          >
            <Icon className="w-3 h-3 text-antique-gold shrink-0" />
            <span className="text-[11px] text-warm-ivory/70 whitespace-nowrap">{text}</span>
          </div>
        ))}
      </motion.div>

      {/* ── Bottom tagline ───────────────────────────────────────────── */}
      <p className="absolute bottom-5 inset-x-0 text-center text-[11px] text-warm-ivory/25 font-arabic tracking-wider z-10 select-none">
        كل قصة بداية، وكل بطل بداية لشيء أعظم.
      </p>
    </div>
  );
}
