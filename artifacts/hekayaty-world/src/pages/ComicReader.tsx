import React, { useState, useEffect, useRef } from 'react';
import { useRoute, useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, AlignJustify, Square, Sun, BookOpen } from 'lucide-react';
import { useComic } from '@/lib/hooks';
import type { Comic } from '@/types';

function getTitleAr(comic: Comic): string {
  return (comic as any).titleAr || (comic as any).title || '';
}

function getPages(comic: Comic): string[] {
  return (comic as any).pages || [];
}

const LS_PREFIX = 'hekayaty_reader_';
function saveProgress(comicId: string, page: number) {
  try {
    localStorage.setItem(`${LS_PREFIX}${comicId}`, String(page));
  } catch {}
}
function loadProgress(comicId: string): number | null {
  try {
    const v = localStorage.getItem(`${LS_PREFIX}${comicId}`);
    return v ? parseInt(v, 10) : null;
  } catch {
    return null;
  }
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function ComicReader() {
  const [, params] = useRoute('/comics/:id/read');
  const [, navigate] = useLocation();

  const comicId = params?.id || '';
  const { data: comic } = useComic(comicId);
  const pages = comic ? getPages(comic) : [];
  const hasPages = pages.length > 0;

  // ── Reader state ──────────────────────────────────────────────────────────

  const [currentPage, setCurrentPage] = useState(0);
  const [mode, setMode] = useState<'scroll' | 'page'>('scroll');
  const [brightness, setBrightness] = useState(100);
  const [showSettings, setShowSettings] = useState(false);
  const [resumeBanner, setResumeBanner] = useState<number | null>(null);
  const saveTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load saved progress on mount
  useEffect(() => {
    if (!comic || !hasPages) return;
    const saved = loadProgress(comic.id);
    if (saved !== null && saved > 0 && saved < pages.length) {
      setCurrentPage(saved);
      setResumeBanner(saved + 1); // 1-indexed for display
    }
  }, [comic?.id]);

  // Auto-save every 5 seconds
  useEffect(() => {
    if (!comic || !hasPages) return;
    saveTimer.current = setInterval(() => {
      saveProgress(comic.id, currentPage);
    }, 5000);
    return () => {
      if (saveTimer.current) clearInterval(saveTimer.current);
    };
  }, [comic?.id, currentPage, hasPages]);

  // Keyboard navigation
  useEffect(() => {
    if (!hasPages || mode !== 'page') return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        setCurrentPage((p) => Math.min(p + 1, pages.length - 1));
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        setCurrentPage((p) => Math.max(p - 1, 0));
      } else if (e.key === 'Escape') {
        handleExit();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mode, hasPages, pages.length]);

  // Touch swipe for page mode
  const touchStart = useRef<number | null>(null);
  function onTouchStart(e: React.TouchEvent) {
    touchStart.current = e.touches[0].clientX;
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchStart.current === null || mode !== 'page') return;
    const delta = e.changedTouches[0].clientX - touchStart.current;
    if (Math.abs(delta) > 50) {
      if (delta > 0) {
        // swipe right → prev page (RTL: next)
        setCurrentPage((p) => Math.min(p + 1, pages.length - 1));
      } else {
        setCurrentPage((p) => Math.max(p - 1, 0));
      }
    }
    touchStart.current = null;
  }

  function handleExit() {
    if (comic) saveProgress(comic.id, currentPage);
    navigate(`/comics/${comic?.id}`);
  }

  function dismissResumeBanner() {
    setResumeBanner(null);
  }

  // ── Not found ─────────────────────────────────────────────────────────────

  if (!comic) {
    return (
      <div className="min-h-screen flex items-center justify-center text-foreground font-arabic" dir="rtl">
        <div className="text-center">
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-foreground/20" />
          <p className="text-xl mb-6">الكوميكس غير موجود</p>
          <button
            onClick={() => navigate('/comics')}
            className="px-6 py-3 bg-deep-teal text-white dark:bg-antique-gold dark:text-midnight-navy rounded-xl font-bold"
          >
            العودة إلى المكتبة
          </button>
        </div>
      </div>
    );
  }

  const titleAr = getTitleAr(comic);
  const coverStyle = comic.coverImage.startsWith('linear-gradient')
    ? { background: comic.coverImage }
    : { backgroundImage: `url(${comic.coverImage})` };

  // ── No pages (unavailable) ────────────────────────────────────────────────

  if (!hasPages) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" dir="rtl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-sm w-full text-center"
        >
          {/* Cover */}
          <div
            className="aspect-[2/3] rounded-2xl mx-auto mb-8 overflow-hidden border-2 border-soft-sand/50 dark:border-white/10 shadow-[0_15px_40px_rgba(0,0,0,0.5)] relative"
            style={{ width: '200px' }}
          >
            <div className="absolute inset-0 bg-cover bg-center" style={coverStyle} />
            <div className="absolute inset-0 bg-black/40 flex items-end justify-center pb-4">
              <div className="bg-midnight-navy/90 rounded-lg px-3 py-1 text-xs text-warm-ivory font-arabic">
                غير متاح حالياً
              </div>
            </div>
          </div>

          <BookOpen className="w-12 h-12 mx-auto mb-4 text-foreground/20" />
          <h2 className="text-xl font-cinzel text-foreground mb-2">{titleAr}</h2>
          <p className="text-foreground/60 font-arabic leading-relaxed mb-8">
            هذا الكوميكس غير متاح للقراءة المباشرة حاليًا.
            يمكنك متابعة منصة حكاياتي لمعرفة موعد إتاحته.
          </p>

          <button
            onClick={() => navigate(`/comics/${comic.id}`)}
            className="px-8 py-3 bg-deep-teal text-white hover:bg-deep-teal/90 dark:bg-antique-gold dark:text-midnight-navy dark:hover:bg-champagne-gold font-bold rounded-xl transition-colors font-arabic"
          >
            العودة إلى التفاصيل
          </button>
        </motion.div>
      </div>
    );
  }

  // ── Full Reader ───────────────────────────────────────────────────────────

  const progress = pages.length > 1 ? (currentPage / (pages.length - 1)) * 100 : 100;

  return (
    <div
      className="min-h-screen bg-midnight-navy dark:bg-black flex flex-col"
      style={{ filter: `brightness(${brightness}%)` }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      dir="rtl"
    >
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 h-1 z-50 bg-white/10">
        <motion.div
          className="h-full bg-deep-teal dark:bg-antique-gold"
          style={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Top bar */}
      <div className="fixed top-1 left-0 right-0 z-40 flex items-center justify-between px-4 py-3 bg-midnight-navy/90 dark:bg-black/80 backdrop-blur-md border-b border-white/10">
        {/* Exit */}
        <button
          onClick={handleExit}
          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-warm-ivory"
          title="خروج"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title + Page */}
        <div className="text-center flex-1 mx-4">
          <p className="text-warm-ivory font-bold text-sm font-arabic line-clamp-1">{titleAr}</p>
          <p className="text-warm-ivory/60 text-xs font-arabic">
            الصفحة {currentPage + 1} من {pages.length}
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* Mode toggle */}
          <button
            onClick={() => setMode((m) => (m === 'scroll' ? 'page' : 'scroll'))}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-warm-ivory"
            title={mode === 'scroll' ? 'وضع الصفحة الواحدة' : 'وضع التمرير'}
          >
            {mode === 'scroll' ? <Square className="w-4 h-4" /> : <AlignJustify className="w-4 h-4" />}
          </button>

          {/* Settings */}
          <button
            onClick={() => setShowSettings((v) => !v)}
            className={`p-2 rounded-lg transition-colors text-warm-ivory ${showSettings ? 'bg-antique-gold/30' : 'bg-white/10 hover:bg-white/20'}`}
            title="الإعدادات"
          >
            <Sun className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Settings panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-16 left-0 right-0 z-30 mx-auto max-w-xs bg-midnight-navy/95 dark:bg-black/90 backdrop-blur-md border border-white/15 rounded-2xl p-5 mt-2"
            style={{ width: 'calc(100% - 2rem)', margin: '0 auto' }}
          >
            <div className="flex items-center gap-3" dir="rtl">
              <Sun className="w-4 h-4 text-antique-gold" />
              <span className="text-warm-ivory text-sm font-arabic">السطوع</span>
              <input
                type="range"
                min={30}
                max={150}
                value={brightness}
                onChange={(e) => setBrightness(Number(e.target.value))}
                className="flex-1 accent-antique-gold"
              />
              <span className="text-warm-ivory/60 text-xs w-10 text-left">{brightness}%</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Resume banner */}
      <AnimatePresence>
        {resumeBanner !== null && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-20 left-0 right-0 z-30 flex justify-center px-4"
          >
            <div className="bg-antique-gold text-midnight-navy px-5 py-3 rounded-2xl flex items-center gap-4 font-arabic text-sm font-bold shadow-xl">
              <span>استمر من حيث توقفت — الصفحة {resumeBanner}</span>
              <button
                onClick={dismissResumeBanner}
                className="text-midnight-navy/70 hover:text-midnight-navy transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Scroll mode ── */}
      {mode === 'scroll' && (
        <div className="pt-14 flex flex-col items-center gap-1" ref={scrollRef}>
          {pages.map((pageUrl, i) => (
            <img
              key={i}
              src={pageUrl}
              alt={`صفحة ${i + 1}`}
              className="w-full max-w-2xl object-contain select-none"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ))}
          <div className="py-10 text-warm-ivory/40 text-sm font-arabic">نهاية العدد</div>
        </div>
      )}

      {/* ── Page-by-page mode ── */}
      {mode === 'page' && (
        <div className="flex-1 flex items-center justify-center pt-14 relative">
          <AnimatePresence mode="wait">
            <motion.img
              key={currentPage}
              src={pages[currentPage]}
              alt={`صفحة ${currentPage + 1}`}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.25 }}
              className="max-h-[calc(100vh-5rem)] w-auto max-w-full object-contain select-none"
              onError={(e) => {
                (e.target as HTMLImageElement).alt = `خطأ في تحميل الصفحة ${currentPage + 1}`;
              }}
            />
          </AnimatePresence>

          {/* Page nav buttons */}
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, pages.length - 1))}
            disabled={currentPage >= pages.length - 1}
            className="fixed right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-midnight-navy/70 hover:bg-midnight-navy text-warm-ivory disabled:opacity-20 transition-all border border-white/10"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 0))}
            disabled={currentPage <= 0}
            className="fixed left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-midnight-navy/70 hover:bg-midnight-navy text-warm-ivory disabled:opacity-20 transition-all border border-white/10"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        </div>
      )}

      {/* Bottom page indicator (page mode) */}
      {mode === 'page' && (
        <div className="fixed bottom-6 left-0 right-0 flex justify-center z-20">
          <div className="flex gap-1.5 bg-midnight-navy/80 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
            {pages.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === currentPage ? 'bg-antique-gold w-5' : 'bg-white/20 hover:bg-white/40'
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
