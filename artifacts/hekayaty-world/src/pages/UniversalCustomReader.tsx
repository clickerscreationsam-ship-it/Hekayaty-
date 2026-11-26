import React, { useState, useEffect, useRef } from 'react';
import { useLocation, Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  FileText,
  Upload,
  AlignJustify,
  Square,
  Sun,
  Moon,
  Type,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Trash2,
  Bookmark,
  Share2,
  Lock,
  Menu,
  X,
  Clock,
  Compass,
  CheckCircle2,
  Layers,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';

interface ChapterItem {
  id: string;
  chapterNumber: number;
  titleAr: string;
  titleEn?: string;
  subtitle?: string;
  summaryAr?: string;
  readingTimeMinutes?: number;
  wordCount?: number;
  accessLevel?: string;
  isLocked?: boolean;
  content: string;
}

export default function UniversalCustomReader() {
  const [location] = useLocation();
  const { toast } = useToast();

  // Parse query parameters
  const searchParams = new URLSearchParams(window.location.search);
  const storyIdParam = searchParams.get('storyId');
  const comicIdParam = searchParams.get('comicId');
  const pdfUrlParam = searchParams.get('pdf');
  const mysterySlugParam = searchParams.get('mystery') || searchParams.get('episode');
  const draftMysteryParam = searchParams.get('draft_mystery') === '1' || searchParams.get('mode') === 'draft_mystery';

  // Modes: 'story' (novel chapters), 'comic' (page-based), 'pdf' (document), 'custom' (pasted text)
  const [mode, setMode] = useState<'story' | 'comic' | 'pdf' | 'custom'>(
    storyIdParam ? 'story' : comicIdParam ? 'comic' : pdfUrlParam ? 'pdf' : 'custom'
  );

  // Mystery State
  const [mysteryData, setMysteryData] = useState<any>(null);

  // Story / Novel State
  const [storyData, setStoryData] = useState<any>(null);
  const [chapters, setChapters] = useState<ChapterItem[]>([]);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [showTocDrawer, setShowTocDrawer] = useState(false);

  // Comic State
  const [comicPages, setComicPages] = useState<any[]>([]);
  const [currentComicPageIndex, setCurrentComicPageIndex] = useState(0);
  const [readingDirection, setReadingDirection] = useState<'rtl' | 'ltr'>('rtl');
  const [comicSpread, setComicSpread] = useState<'single' | 'double'>('single');

  // PDF State
  const [pdfUrl, setPdfUrl] = useState<string | null>(pdfUrlParam);
  const [pdfFileName, setPdfFileName] = useState('');

  // Custom text state
  const [contentTitle, setContentTitle] = useState('قصيدة المجد والأكوان');
  const [textContent, setTextContent] = useState('');
  const [isReadingMode, setIsReadingMode] = useState(false);

  // Reader Settings
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large' | 'xlarge'>('medium');
  const [lineHeight, setLineHeight] = useState<'normal' | 'relaxed' | 'loose'>('relaxed');
  const [themeMode, setThemeMode] = useState<'dark' | 'sepia' | 'light'>('dark');
  const [brightness, setBrightness] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Bookmarks
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const mainScrollRef = useRef<HTMLDivElement>(null);

  // Load Story data if storyId is present
  useEffect(() => {
    if (storyIdParam) {
      setLoading(true);
      setMode('story');
      api
        .getPublicStoryChapters(storyIdParam)
        .then((res) => {
          if (res && res.chapters) {
            setStoryData(res);
            setChapters(res.chapters);
            setContentTitle(res.titleAr || 'رواية ملحمية');
            setCurrentChapterIndex(0);
          }
        })
        .catch(() => {
          toast({ title: 'تعذر تحميل فصول الرواية', variant: 'destructive' });
        })
        .finally(() => setLoading(false));
    }
  }, [storyIdParam]);

  // Load Comic data if comicId is present
  useEffect(() => {
    if (comicIdParam) {
      setLoading(true);
      setMode('comic');
      api
        .getAdminComicPages(comicIdParam)
        .then((pages) => {
          setComicPages(pages || []);
          setCurrentComicPageIndex(0);
        })
        .catch(() => {
          toast({ title: 'تعذر تحميل صفحات الكوميكس', variant: 'destructive' });
        })
        .finally(() => setLoading(false));
    }
  }, [comicIdParam]);

  // Load Mystery episode if mystery parameter is present
  useEffect(() => {
    if (mysterySlugParam) {
      setLoading(true);
      setMode('custom');
      api
        .getMysteryEpisodeDetail(mysterySlugParam)
        .then((ep) => {
          if (ep) {
            setMysteryData(ep);
            setContentTitle(`لغز حكاياتي #${ep.episode_number}: ${ep.title_ar}`);
            setTextContent(ep.content_ar || '');
            setIsReadingMode(true);
          }
        })
        .catch(() => {
          toast({ title: 'تعذر تحميل حلقة اللغز', variant: 'destructive' });
        })
        .finally(() => setLoading(false));
    }
  }, [mysterySlugParam]);

  // Handle draft mystery authoring inside the reader
  useEffect(() => {
    if (draftMysteryParam) {
      setMode('custom');
      setIsReadingMode(false);
      try {
        const draftTitle = localStorage.getItem('hekayaty_draft_mystery_title');
        const draftContent = localStorage.getItem('hekayaty_draft_mystery_content');
        if (draftTitle) setContentTitle(draftTitle);
        if (draftContent) setTextContent(draftContent);
      } catch {}
    }
  }, [draftMysteryParam]);

  // Restore saved reader cache from localStorage
  useEffect(() => {
    try {
      const savedText = localStorage.getItem('hekayaty_custom_reader_text');
      const savedTitle = localStorage.getItem('hekayaty_custom_reader_title');
      if (savedText && !storyIdParam && !comicIdParam) setTextContent(savedText);
      if (savedTitle && !storyIdParam && !comicIdParam) setContentTitle(savedTitle);
    } catch { }
  }, [storyIdParam, comicIdParam]);

  // Auto-save reading progress to API
  const saveProgressDebounced = (chapterIdx: number, pageIdx: number) => {
    try {
      const activeId = storyIdParam || comicIdParam;
      if (activeId) {
        api.saveProgress({
          contentType: storyIdParam ? 'story' : 'comic',
          contentId: activeId,
          progress: chapterIdx + 1,
          isCompleted: false,
        });
      }
    } catch { }
  };

  const handleNextChapter = () => {
    if (currentChapterIndex < chapters.length - 1) {
      const nextIdx = currentChapterIndex + 1;
      setCurrentChapterIndex(nextIdx);
      saveProgressDebounced(nextIdx, 0);
      mainScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevChapter = () => {
    if (currentChapterIndex > 0) {
      const prevIdx = currentChapterIndex - 1;
      setCurrentChapterIndex(prevIdx);
      saveProgressDebounced(prevIdx, 0);
      mainScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type === 'application/pdf') {
      const url = URL.createObjectURL(file);
      setPdfUrl(url);
      setPdfFileName(file.name);
      setContentTitle(file.name.replace(/\.pdf$/i, ''));
      setMode('pdf');
      toast({ title: '📄 تم تحميل ملف الـ PDF بنجاح داخل القارئ الذكي' });
    } else if (file.type.startsWith('text/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setTextContent(text);
        setContentTitle(file.name.replace(/\.[^/.]+$/, ''));
        setMode('custom');
        setIsReadingMode(true);
        toast({ title: '📖 تم إدراج محتوى الملف النصي بنجاح' });
      };
      reader.readAsText(file);
    } else {
      toast({ title: 'صيغة غير مدعومة', description: 'يرجى رفع ملف PDF أو ملف نصي', variant: 'destructive' });
    }
  };

  const currentChapter = chapters[currentChapterIndex];

  const fontClasses = {
    small: 'text-sm sm:text-base',
    medium: 'text-base sm:text-lg',
    large: 'text-lg sm:text-xl',
    xlarge: 'text-xl sm:text-2xl',
  };

  const lineClasses = {
    normal: 'leading-normal',
    relaxed: 'leading-relaxed sm:leading-loose',
    loose: 'leading-loose sm:leading-[2.5]',
  };

  const themeStyles = {
    dark: 'bg-[#0E131F] text-[#FAF5EB]',
    sepia: 'bg-[#F4ECD8] text-[#433422]',
    light: 'bg-[#FAF5EB] text-[#1E293B]',
  };

  return (
    <div
      dir="rtl"
      className={`min-h-screen transition-colors duration-300 font-arabic flex flex-col ${themeStyles[themeMode]}`}
      style={{ filter: `brightness(${brightness}%)` }}
    >
      {/* ── Top Bar Header ──────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-black/10 dark:border-white/10 backdrop-blur-md bg-inherit/90 px-4 sm:px-6 py-3 flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs font-bold text-foreground/60 hover:text-foreground transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
            <span className="hidden sm:inline">الرئيسية</span>
          </Link>
          <span className="text-foreground/30">|</span>

          {/* Mode Badge & Title */}
          <div className="flex items-center gap-2">
            {mode === 'story' && (
              <button
                type="button"
                onClick={() => setShowTocDrawer(!showTocDrawer)}
                className="p-1.5 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-antique-gold/20 text-antique-gold transition-colors flex items-center gap-1.5 text-xs font-bold"
                title="فهرس الفصول"
              >
                <Menu className="w-4 h-4" />
                <span className="hidden sm:inline">الفصول</span>
              </button>
            )}

            <BookOpen className="w-4 h-4 text-antique-gold" />
            <h1 className="text-xs sm:text-sm font-bold truncate max-w-[180px] sm:max-w-xs md:max-w-md">
              {storyData ? `${storyData.titleAr} — ${currentChapter?.titleAr || ''}` : contentTitle}
            </h1>
          </div>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Theme Selector */}
          <div className="flex rounded-xl bg-black/5 dark:bg-white/5 p-1 border border-black/10 dark:border-white/10 text-xs">
            <button
              onClick={() => setThemeMode('dark')}
              className={`w-7 h-7 rounded-lg flex items-center justify-center ${themeMode === 'dark' ? 'bg-black/60 text-antique-gold shadow' : 'text-foreground/50'
                }`}
              title="الوضع الداكن السينمائي"
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setThemeMode('sepia')}
              className={`w-7 h-7 rounded-lg flex items-center justify-center font-serif font-bold text-xs ${themeMode === 'sepia' ? 'bg-[#E5D7B7] text-[#433422] shadow' : 'text-foreground/50'
                }`}
              title="ورق كلاسيكي Sepia"
            >
              ورق
            </button>
            <button
              onClick={() => setThemeMode('light')}
              className={`w-7 h-7 rounded-lg flex items-center justify-center ${themeMode === 'light' ? 'bg-white text-zinc-900 shadow' : 'text-foreground/50'
                }`}
              title="نهاري ناصع"
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Font Controls (for text / novel mode) */}
          {(mode === 'story' || mode === 'custom') && (
            <div className="hidden sm:flex items-center rounded-xl bg-black/5 dark:bg-white/5 p-1 border border-black/10 dark:border-white/10 text-xs">
              <button
                onClick={() => setFontSize('small')}
                className={`px-2 py-0.5 rounded text-xs font-bold ${fontSize === 'small' ? 'bg-antique-gold text-midnight-navy' : 'text-foreground/50'}`}
              >
                A
              </button>
              <button
                onClick={() => setFontSize('medium')}
                className={`px-2 py-0.5 rounded text-xs font-bold ${fontSize === 'medium' ? 'bg-antique-gold text-midnight-navy' : 'text-foreground/50'}`}
              >
                A+
              </button>
              <button
                onClick={() => setFontSize('large')}
                className={`px-2 py-0.5 rounded text-xs font-bold ${fontSize === 'large' ? 'bg-antique-gold text-midnight-navy' : 'text-foreground/50'}`}
              >
                A++
              </button>
            </div>
          )}

          {/* Upload Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-antique-gold/15 text-antique-gold hover:bg-antique-gold/25 border border-antique-gold/30 text-xs font-bold flex items-center gap-1.5 transition-all"
            title="رفع ملف PDF أو نص للقراءة"
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden md:inline">رفع PDF أو نص</span>
          </button>
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".pdf,.txt,.md" className="hidden" />

          {/* Fullscreen Toggle */}
          <button
            onClick={() => {
              if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch(() => { });
                setIsFullscreen(true);
              } else {
                document.exitFullscreen().catch(() => { });
                setIsFullscreen(false);
              }
            }}
            className="p-2 rounded-xl bg-black/5 dark:bg-white/5 text-foreground/60 hover:text-foreground transition-colors"
            title="وضع ملء الشاشة"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* ── Main Reader Area ────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* TOC Drawer (for Stories / Novels) */}
        <AnimatePresence>
          {showTocDrawer && mode === 'story' && (
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="absolute sm:relative right-0 top-0 bottom-0 z-30 w-72 sm:w-80 bg-[#121A2A] text-white border-l border-[#24334A] shadow-2xl flex flex-col shrink-0"
            >
              <div className="p-4 border-b border-[#24334A] flex items-center justify-between">
                <span className="font-bold text-sm flex items-center gap-2 text-antique-gold">
                  <FileText className="w-4 h-4" />
                  <span>فهرس فصول الرواية</span>
                </span>
                <button onClick={() => setShowTocDrawer(false)} className="text-zinc-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-1.5 text-xs">
                {chapters.map((ch, idx) => {
                  const isActive = idx === currentChapterIndex;
                  return (
                    <button
                      key={ch.id}
                      type="button"
                      onClick={() => {
                        setCurrentChapterIndex(idx);
                        setShowTocDrawer(false);
                        saveProgressDebounced(idx, 0);
                        mainScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className={`w-full p-3 rounded-2xl text-right transition-all flex items-center justify-between ${isActive
                        ? 'bg-[#087C7B] text-white font-bold shadow-md'
                        : 'bg-[#152033] hover:bg-[#1D2B44] text-zinc-300'
                        }`}
                    >
                      <div className="truncate flex-1">
                        <div className="text-[11px] font-mono opacity-75">#{ch.chapterNumber}</div>
                        <div className="truncate font-semibold mt-0.5">{ch.titleAr}</div>
                      </div>
                      {ch.isLocked ? (
                        <Lock className="w-4 h-4 text-amber-400 shrink-0 ml-2" />
                      ) : (
                        <span className="text-[10px] opacity-60 shrink-0 ml-2">{ch.readingTimeMinutes || 5} د</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Reading Canvas */}
        <div ref={mainScrollRef} className="flex-1 overflow-y-auto px-4 sm:px-8 py-8 sm:py-12">
          {/* MODE 1: NOVEL STORY (With Chapters & Locked Server Guard) */}
          {mode === 'story' && (
            <div className="max-w-3xl mx-auto space-y-8">
              {loading ? (
                <div className="text-center py-20 text-zinc-500 text-sm">جاري تحميل فصول الرواية...</div>
              ) : currentChapter ? (
                <div className="space-y-6">
                  {/* Chapter Header */}
                  <div className="border-b border-black/10 dark:border-white/10 pb-6 text-center space-y-2">
                    <span className="px-3 py-1 rounded-full bg-antique-gold/15 text-antique-gold font-mono font-bold text-xs inline-block">
                      الفصل {currentChapter.chapterNumber} من {chapters.length}
                    </span>
                    <h2 className="text-2xl sm:text-4xl font-bold font-cinzel leading-tight text-foreground">
                      {currentChapter.titleAr}
                    </h2>
                    {currentChapter.subtitle && (
                      <p className="text-sm text-foreground/60 italic">{currentChapter.subtitle}</p>
                    )}
                  </div>

                  {/* Chapter Body or Locked Banner */}
                  {currentChapter.isLocked ? (
                    <div className="p-8 sm:p-12 rounded-3xl bg-[#162135] border border-amber-500/30 text-white text-center space-y-4 shadow-2xl">
                      <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto shadow-inner">
                        <Lock className="w-8 h-8" />
                      </div>
                      <h3 className="text-xl font-bold text-amber-400">هذا الفصل مقفل ومتاح حصرياً للمشتركين</h3>
                      <p className="text-xs sm:text-sm text-zinc-300 max-w-md mx-auto leading-relaxed">
                        يتطلب هذا الفصل اشتراكاً نشطاً في حكاياتي للوصول إلى كامل السرد الروائي والأحداث الكونية.
                      </p>

                      {/* Free Preview Teaser */}
                      <div className="p-4 rounded-xl bg-black/40 text-right text-xs leading-relaxed text-zinc-400 italic">
                        <span className="font-bold text-amber-400 block mb-1">مقتطف تمهيدي من الفصل:</span>
                        {currentChapter.content}
                      </div>

                      <div className="pt-2">
                        <Link
                          href="/pricing"
                          className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-black font-bold text-xs shadow-lg inline-flex items-center gap-2"
                        >
                          <Sparkles className="w-4 h-4" />
                          <span>ترقية العضوية وقراءة الفصل فوراً</span>
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <article
                      className={`${fontClasses[fontSize]} ${lineClasses[lineHeight]} whitespace-pre-line text-justify tracking-wide leading-relaxed`}
                    >
                      {currentChapter.content}
                    </article>
                  )}

                  {/* Chapter Bottom Navigation */}
                  <div className="pt-8 border-t border-black/10 dark:border-white/10 flex items-center justify-between gap-4">
                    <button
                      type="button"
                      onClick={handlePrevChapter}
                      disabled={currentChapterIndex === 0}
                      className="px-4 py-2.5 rounded-2xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-foreground font-bold text-xs disabled:opacity-30 flex items-center gap-1.5 transition-all"
                    >
                      <ChevronRight className="w-4 h-4" />
                      <span>الفصل السابق</span>
                    </button>

                    <div className="text-xs text-foreground/50 font-mono">
                      {currentChapterIndex + 1} / {chapters.length}
                    </div>

                    <button
                      type="button"
                      onClick={handleNextChapter}
                      disabled={currentChapterIndex === chapters.length - 1}
                      className="px-4 py-2.5 rounded-2xl bg-deep-teal text-white hover:brightness-110 font-bold text-xs disabled:opacity-30 flex items-center gap-1.5 shadow-md transition-all"
                    >
                      <span>الفصل التالي</span>
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {/* MODE 2: COMIC HIGH-RES VIEWER */}
          {mode === 'comic' && (
            <div className="max-w-4xl mx-auto space-y-6">
              {comicPages.length === 0 ? (
                <div className="p-12 text-center rounded-3xl border border-black/10 dark:border-white/10 text-xs text-foreground/50">
                  لا توجد صفحات مضافة لهذا الكوميكس بعد.
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Current Comic Page Display */}
                  <div className="relative rounded-3xl overflow-hidden border border-black/15 dark:border-white/15 bg-black/40 shadow-2xl flex items-center justify-center min-h-[500px]">
                    <img
                      src={comicPages[currentComicPageIndex]?.image_url}
                      alt={`صفحة ${comicPages[currentComicPageIndex]?.page_number}`}
                      className="max-h-[85vh] w-auto object-contain mx-auto"
                    />

                    {/* Navigation Overlays */}
                    <button
                      type="button"
                      onClick={() => {
                        if (readingDirection === 'rtl') {
                          if (currentComicPageIndex < comicPages.length - 1)
                            setCurrentComicPageIndex(currentComicPageIndex + 1);
                        } else {
                          if (currentComicPageIndex > 0) setCurrentComicPageIndex(currentComicPageIndex - 1);
                        }
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur shadow"
                      title="الصفحة التالية"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (readingDirection === 'rtl') {
                          if (currentComicPageIndex > 0) setCurrentComicPageIndex(currentComicPageIndex - 1);
                        } else {
                          if (currentComicPageIndex < comicPages.length - 1)
                            setCurrentComicPageIndex(currentComicPageIndex + 1);
                        }
                      }}
                      className="absolute left-2 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur shadow"
                      title="الصفحة السابقة"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                  </div>

                  {/* Comic Pagination Footer */}
                  <div className="flex items-center justify-between text-xs font-bold text-foreground/70 px-2">
                    <div>
                      اتجاه القراءة:{' '}
                      <button
                        type="button"
                        onClick={() => setReadingDirection(readingDirection === 'rtl' ? 'ltr' : 'rtl')}
                        className="text-antique-gold underline mr-1"
                      >
                        {readingDirection === 'rtl' ? 'من اليمين لليسار (RTL)' : 'من اليسار لليمين (LTR)'}
                      </button>
                    </div>

                    <div className="font-mono">
                      الصفحة {currentComicPageIndex + 1} من {comicPages.length}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* MODE 3: PDF DOCUMENT VIEWER */}
          {mode === 'pdf' && (
            <div className="max-w-4xl mx-auto space-y-4">
              {pdfUrl ? (
                <div className="w-full h-[80vh] rounded-3xl overflow-hidden border border-black/15 dark:border-white/10 shadow-2xl bg-zinc-900">
                  <iframe src={pdfUrl} title="PDF Viewer" className="w-full h-full border-none" />
                </div>
              ) : (
                <div className="p-12 text-center rounded-3xl border-2 border-dashed border-black/15 dark:border-white/15">
                  <FileText className="w-12 h-12 text-antique-gold mx-auto mb-3" />
                  <h3 className="font-bold text-base mb-1">قارئ مستندات PDF</h3>
                  <p className="text-xs text-foreground/60 mb-4">اختر ملف PDF من جهازك أو افتح ملفات المنصة للقراءة</p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-5 py-2.5 rounded-2xl bg-deep-teal text-white font-bold text-xs"
                  >
                    تحديد ملف PDF
                  </button>
                </div>
              )}
            </div>
          )}

          {/* MODE 4: CUSTOM TEXT / NOVEL PASTE MODE */}
          {mode === 'custom' && (
            <div className="max-w-3xl mx-auto space-y-6">
              {!isReadingMode ? (
                <div className="p-6 rounded-3xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.03] space-y-4 shadow-lg">
                  {draftMysteryParam && (
                    <div className="p-4 rounded-2xl bg-[#C5A15B]/15 border border-[#C5A15B]/40 flex flex-wrap items-center justify-between gap-3">
                      <div className="space-y-0.5">
                        <span className="text-xs font-black text-[#E1C58B] flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-amber-400" />
                          <span>بيئة كتابة وتحرير حلقة لغز حكاياتي في القارئ الذكي</span>
                        </span>
                        <p className="text-[11px] text-foreground/70">
                          اكتب السرد والقرائن هنا بحرية، ثم اضغط حفظ لتطبيق النص فوراً في لوحة النشر.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (!textContent.trim()) {
                              toast({ title: 'يرجى كتابة نص الحلقة أولاً', variant: 'destructive' });
                              return;
                            }
                            localStorage.setItem('hekayaty_reader_exported_text', textContent);
                            localStorage.setItem('hekayaty_draft_mystery_content', textContent);
                            localStorage.setItem('hekayaty_draft_mystery_title', contentTitle);
                            toast({
                              title: '✅ تم حفظ النص بنجاح في القارئ!',
                              description: 'تم تحديث المسودة، يمكنك الآن العودة للوحة الإدارة واستيراده بنقرة واحدة.',
                            });
                          }}
                          className="px-4 py-2 rounded-xl bg-[#C5A15B] hover:bg-[#E5C77D] text-black font-extrabold text-xs shadow-md transition-all flex items-center gap-1.5"
                        >
                          <Bookmark className="w-3.5 h-3.5" />
                          <span>حفظ واعتماد النص للوحة النشر</span>
                        </button>
                        <Link href="/admin">
                          <button
                            type="button"
                            className="px-3 py-2 rounded-xl bg-black/30 border border-white/10 hover:border-white/30 text-xs font-bold text-foreground/80"
                          >
                            لوحة الإدارة
                          </button>
                        </Link>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-bold text-antique-gold flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      <span>{draftMysteryParam ? 'محرر حلقة اللغز' : 'محرر القراءة الحرة'}</span>
                    </h2>
                    <div className="flex items-center gap-3 text-xs text-foreground/60 font-mono">
                      <span>الكلمات: {textContent.trim() ? textContent.trim().split(/\s+/).length : 0}</span>
                      <span>•</span>
                      <span>وقت القراءة: ~{Math.max(1, Math.ceil((textContent.trim() ? textContent.trim().split(/\s+/).length : 0) / 160))} د</span>
                    </div>
                  </div>

                  <input
                    type="text"
                    value={contentTitle}
                    onChange={(e) => setContentTitle(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-sm font-bold outline-none"
                    placeholder="عنوان العمل أو الحلقة..."
                  />
                  <textarea
                    rows={14}
                    value={textContent}
                    onChange={(e) => setTextContent(e.target.value)}
                    className="w-full p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-sm leading-relaxed outline-none resize-y"
                    placeholder="اكتب أو الصق نص الرواية، القصة، أو حلقة اللغز هنا..."
                  />
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    {draftMysteryParam && (
                      <button
                        type="button"
                        onClick={() => {
                          if (!textContent.trim()) {
                            toast({ title: 'يرجى كتابة نص الحلقة أولاً', variant: 'destructive' });
                            return;
                          }
                          localStorage.setItem('hekayaty_reader_exported_text', textContent);
                          localStorage.setItem('hekayaty_draft_mystery_content', textContent);
                          localStorage.setItem('hekayaty_draft_mystery_title', contentTitle);
                          toast({
                            title: '✅ تم حفظ النص واعتماده!',
                            description: 'يمكنك الانتقال للوحة الإدارة والضغط على "استيراد النص من القارئ".',
                          });
                        }}
                        className="px-5 py-2.5 rounded-2xl bg-[#C5A15B] hover:bg-[#E5C77D] text-black font-extrabold text-xs shadow-md transition-all flex items-center gap-1.5"
                      >
                        <Bookmark className="w-4 h-4" />
                        <span>اعتماد النص للوحة التحكم</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        if (!textContent.trim()) {
                          toast({ title: 'يرجى إدخال نص أولاً', variant: 'destructive' });
                          return;
                        }
                        setIsReadingMode(true);
                      }}
                      className="px-6 py-2.5 rounded-2xl bg-deep-teal text-white hover:brightness-110 font-bold text-xs shadow-md transition-all mr-auto"
                    >
                      بدء القراءة السينمائية (معاينة)
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {mysteryData && (
                    <div className="p-4 sm:p-5 rounded-2xl bg-black/40 border border-[#C5A15B]/30 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="px-3 py-1 rounded-full text-xs font-black bg-[#C5A15B] text-black">
                          لغز حكاياتي #{mysteryData.episode_number}
                        </span>
                        <span className="text-xs text-foreground/60 font-mono">
                          {mysteryData.reading_time_minutes || 3} دقائق قراءة
                        </span>
                      </div>
                      {mysteryData.clues && mysteryData.clues.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-1">
                          {mysteryData.clues.map((c: string, idx: number) => (
                            <span key={idx} className="px-2.5 py-1 rounded-xl bg-black/30 border border-white/10 text-xs font-bold text-amber-200">
                              🔍 {c}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between pb-4 border-b border-black/10 dark:border-white/10">
                    <button
                      onClick={() => setIsReadingMode(false)}
                      className="text-xs text-antique-gold font-bold hover:underline flex items-center gap-1"
                    >
                      <ChevronRight className="w-4 h-4" />
                      <span>{draftMysteryParam ? 'العودة لمحرر الحلقة' : 'تعديل النص'}</span>
                    </button>
                    {draftMysteryParam && (
                      <span className="text-xs text-foreground/50 font-mono">
                        معاينة القارئ المتقدم
                      </span>
                    )}
                  </div>
                  <article
                    className={`${fontClasses[fontSize]} ${lineClasses[lineHeight]} whitespace-pre-line text-justify tracking-wide leading-relaxed`}
                  >
                    {textContent}
                  </article>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
