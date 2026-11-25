/**
 * AuthLayout — Full-screen cinematic auth wrapper.
 * Wraps Login, Register, ForgotPassword, ResetPassword.
 * Renders OUTSIDE RootLayout's Navbar/Footer so auth pages
 * get the full viewport with the magic-library backdrop.
 */
import React from 'react';
import { Link } from 'wouter';
import { motion, useReducedMotion } from 'framer-motion';
import magicLibraryBg from '@assets/generated_images/magic_library_clouds.png';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div
      dir="rtl"
      className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-midnight-navy font-arabic"
    >
      {/* ── Cinematic Background ───────────────────────────────────── */}
      <div className="absolute inset-0 z-0">
        <img
          src={magicLibraryBg}
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover object-top"
          loading="eager"
        />
        {/* Deep gradient overlay — dark enough for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-midnight-navy/80 via-midnight-navy/70 to-midnight-navy/90" />
        {/* Subtle vignette */}
        <div className="absolute inset-0 bg-radial-vignette pointer-events-none" />
      </div>

      {/* ── Animated ambient particles (CSS only, no JS cost) ──────── */}
      {!shouldReduceMotion && (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none" aria-hidden="true">
          {[...Array(6)].map((_, i) => (
            <span
              key={i}
              className="absolute rounded-full opacity-20 animate-float-slow"
              style={{
                width: `${8 + i * 4}px`,
                height: `${8 + i * 4}px`,
                background: i % 2 === 0 ? '#087C7B' : '#C5A15B',
                top: `${10 + i * 15}%`,
                left: `${5 + i * 16}%`,
                animationDelay: `${i * 0.8}s`,
                animationDuration: `${6 + i * 1.2}s`,
                filter: 'blur(2px)',
              }}
            />
          ))}
        </div>
      )}

      {/* ── HEKAYATY Logo / Back to home ───────────────────────────── */}
      <div className="absolute top-6 inset-x-0 flex justify-center z-10">
        <Link href="/">
          <a className="flex items-center gap-2 group select-none" aria-label="العودة إلى الرئيسية">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-deep-teal to-antique-gold flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <span className="text-white font-cinzel font-black text-sm">ح</span>
            </div>
            <span className="font-cinzel font-bold text-warm-ivory text-lg tracking-wide group-hover:text-antique-gold transition-colors">
              HEKAYATY
            </span>
          </a>
        </Link>
      </div>

      {/* ── Main content panel ─────────────────────────────────────── */}
      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md mx-auto px-4 pt-20 pb-10"
      >
        {children}
      </motion.div>

      {/* ── Cinematic bottom tagline ───────────────────────────────── */}
      <p className="absolute bottom-5 inset-x-0 text-center text-[11px] text-warm-ivory/30 font-arabic tracking-wider z-10 select-none">
        كل قصة بداية، وكل بطل بداية لشيء أعظم.
      </p>
    </div>
  );
}
