import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { SEOHead } from '@/components/common/SEOHead';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/useAuthStore';
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Clock,
  Sparkles,
  Maximize2,
  Minimize2,
  Layers,
  Menu,
  X,
  Share2,
} from 'lucide-react';

export default function SeriesEpisodeReader() {
  const params = useParams<{ seriesSlug: string; episodeId: string }>();
  const { seriesSlug = '', episodeId = '' } = params;
  const { isAuthenticated } = useAuthStore();

  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'huge'>('normal');
  const [themeMode, setThemeMode] = useState<'dark' | 'sepia' | 'light'>('dark');
  const [showDrawer, setShowDrawer] = useState(false);

  // Comic mode state
  const [currentComicPageIndex, setCurrentComicPageIndex] = useState(0);

  useEffect(() => {
    if (!seriesSlug || !episodeId) return;
    setLoading(true);
    api
      .getSeriesPlatformEpisode(seriesSlug, episodeId)
      .then((res) => {
        setData(res);
        setLoading(false);
        // Record progress if user is logged in
        if (isAuthenticated && res?.series?.id) {
          api.saveSeriesProgress(res.series.id, res.episode.id, true).catch(() => {});
        }
      })
      .catch(() => setLoading(false));
  }, [seriesSlug, episodeId, isAuthenticated]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070B14] flex items-center justify-center font-arabic" dir="rtl">
        <div className="w-12 h-12 rounded-full border-4 border-[#C5A15B]/30 border-t-[#C5A15B] animate-spin" />
      </div>
    );
  }

  if (!data || !data.episode) {
    return (
      <div className="min-h-screen bg-[#070B14] flex flex-col items-center justify-center gap-4 text-white font-arabic p-4" dir="rtl">
        <BookOpen className="w-16 h-16 text-[#C5A15B]" />
        <h2 className="text-2xl font-bold">الفصل أو الحلقة غير موجودة</h2>
        <p className="text-zinc-400 text-sm">تأكد من رقم الفصل أو تصفح السلسلة من جديد.</p>
        <Link href={`/series/${seriesSlug}`}>
          <button className="px-6 py-2.5 rounded-xl bg-[#C5A15B] text-black font-bold text-sm">
            العودة لصفحة السلسلة
          </button>
        </Link>
      </div>
    );
  }

  const { series, season, episode, all_episodes_list = [], prev_episode, next_episode } = data;

  const fontClass =
    fontSize === 'huge'
      ? 'text-2xl leading-[2.4]'
      : fontSize === 'large'
      ? 'text-xl leading-[2.2]'
      : 'text-lg leading-[2.0]';

  const themeClasses = {
    dark: 'bg-[#070B14] text-zinc-100',
    sepia: 'bg-[#F4ECD8] text-[#3E2723]',
    light: 'bg-[#FAF5EB] text-[#1E293B]',
  };

  const isComic = episode.content_type === 'comic';
  const comicPages = episode.comic_pages || [];

  return (
    <div
      className={`min-h-screen font-arabic notranslate relative transition-colors duration-300 ${themeClasses[themeMode]}`}
      dir="rtl"
      translate="no"
    >
      <SEOHead
        title={`${episode.title_ar} | ${series.title_ar}`}
        description={episode.short_description_ar || episode.content_ar?.slice(0, 150)}
        ogImage={episode.cover_image_url}
        ogType="article"
      />

      {/* ── Top Header Toolbar ──────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-black/10 dark:border-white/10 backdrop-blur-md bg-inherit/90 px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href={`/series/${series.slug || series.id}`}
            className="flex items-center gap-1.5 text-xs font-bold hover:text-[#C5A15B] transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
            <span className="hidden sm:inline">{series.title_ar}</span>
          </Link>
          <span className="opacity-30">|</span>
          <span className="text-xs font-bold text-[#E1C58B]">
            #{episode.episode_number} {season ? `(${season.title_ar})` : ''}
          </span>
        </div>

        {/* Reader Controls */}
        <div className="flex items-center gap-2">
          {/* Theme Switcher */}
          {!isComic && (
            <div className="flex items-center gap-1 bg-black/20 p-1 rounded-xl text-xs">
              <button
                onClick={() => setThemeMode('dark')}
                className={`px-2 py-1 rounded-lg ${themeMode === 'dark' ? 'bg-[#C5A15B] text-black font-bold' : ''}`}
                title="الوضع الليلي"
              >
                داكن
              </button>
              <button
                onClick={() => setThemeMode('sepia')}
                className={`px-2 py-1 rounded-lg ${themeMode === 'sepia' ? 'bg-[#C5A15B] text-black font-bold' : ''}`}
                title="وضع القراءة الورقي"
              >
                ورقي
              </button>
              <button
                onClick={() => setThemeMode('light')}
                className={`px-2 py-1 rounded-lg ${themeMode === 'light' ? 'bg-[#C5A15B] text-black font-bold' : ''}`}
                title="الوضع الفاتح"
              >
                فاتح
              </button>
            </div>
          )}

          {/* Font Size */}
          {!isComic && (
            <div className="flex items-center gap-1 bg-black/20 p-1 rounded-xl text-xs">
              <button
                onClick={() => setFontSize('normal')}
                className={`px-2 py-1 rounded-lg ${fontSize === 'normal' ? 'bg-[#C5A15B] text-black font-bold' : ''}`}
              >
                عادي
              </button>
              <button
                onClick={() => setFontSize('large')}
                className={`px-2 py-1 rounded-lg ${fontSize === 'large' ? 'bg-[#C5A15B] text-black font-bold' : ''}`}
              >
                كبير
              </button>
              <button
                onClick={() => setFontSize('huge')}
                className={`px-2 py-1 rounded-lg ${fontSize === 'huge' ? 'bg-[#C5A15B] text-black font-bold' : ''}`}
              >
                ضخم
              </button>
            </div>
          )}

          {/* Episode Drawer Button */}
          <button
            onClick={() => setShowDrawer(!showDrawer)}
            className="px-3 py-1.5 rounded-xl bg-black/30 border border-white/10 hover:border-[#C5A15B] text-xs font-bold flex items-center gap-1.5"
          >
            <Menu className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">فهرس الفصول</span>
          </button>
        </div>
      </header>

      {/* ── Episode Header Banner ─────────────────────────────────────────── */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-10 pb-6 text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C5A15B]/20 text-[#E1C58B] text-xs font-bold border border-[#C5A15B]/40">
          <span>الحلقة / الفصل #{episode.episode_number}</span>
          {season && <span>• {season.title_ar}</span>}
        </div>

        <h1 className="text-2xl sm:text-4xl font-black leading-tight drop-shadow">
          {episode.title_ar}
        </h1>

        <div className="flex items-center justify-center gap-4 text-xs opacity-70 font-mono pt-1">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>~{episode.reading_time_minutes || 5} دقائق قراءة</span>
          </span>
          {episode.word_count > 0 && (
            <span>{episode.word_count} كلمة</span>
          )}
        </div>
      </div>

      {/* ── Main Reading Body ──────────────────────────────────────────────── */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* NOVEL MODE */}
        {!isComic && (
          <article className={`whitespace-pre-line tracking-wide text-justify font-normal selection:bg-[#C5A15B] selection:text-black ${fontClass}`}>
            {episode.content_ar}
          </article>
        )}

        {/* COMIC MODE */}
        {isComic && (
          <div className="space-y-6">
            {comicPages.length === 0 && !episode.pdf_url ? (
              <div className="p-12 text-center rounded-3xl border border-white/10 text-xs opacity-60">
                لا توجد صفحات مرفوعة لهذا العدد بعد.
              </div>
            ) : episode.pdf_url ? (
              <div className="w-full h-[85vh] rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-black">
                <iframe src={episode.pdf_url} title="Comic Viewer" className="w-full h-full border-none" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative rounded-3xl overflow-hidden border border-white/15 bg-black shadow-2xl flex items-center justify-center min-h-[500px]">
                  <img
                    src={comicPages[currentComicPageIndex]?.image_url}
                    alt={`صفحة ${comicPages[currentComicPageIndex]?.page_number}`}
                    className="max-h-[85vh] w-auto object-contain mx-auto"
                  />

                  {currentComicPageIndex < comicPages.length - 1 && (
                    <button
                      onClick={() => setCurrentComicPageIndex(currentComicPageIndex + 1)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur shadow"
                      title="الصفحة التالية"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  )}

                  {currentComicPageIndex > 0 && (
                    <button
                      onClick={() => setCurrentComicPageIndex(currentComicPageIndex - 1)}
                      className="absolute left-2 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur shadow"
                      title="الصفحة السابقة"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                  )}
                </div>

                <div className="text-center text-xs font-mono opacity-70">
                  الصفحة {currentComicPageIndex + 1} من {comicPages.length}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Author Notes Box */}
        {episode.author_notes && (
          <div className="mt-12 p-4 sm:p-5 rounded-2xl bg-black/20 border border-black/10 dark:border-white/10 space-y-1 text-xs">
            <span className="font-bold text-[#C5A15B] block">ملاحظات الكاتب:</span>
            <p className="opacity-80 leading-relaxed">{episode.author_notes}</p>
          </div>
        )}

        {/* ── Navigation: Prev & Next Episode ───────────────────────────────── */}
        <div className="mt-12 pt-8 border-t border-black/10 dark:border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {prev_episode ? (
            <Link
              href={`/series/${series.slug}/read/${prev_episode.id}`}
              className="p-4 rounded-2xl bg-black/30 border border-white/10 hover:border-[#C5A15B] transition-all flex items-center justify-between group"
            >
              <div>
                <span className="text-[10px] opacity-60 font-bold block">الفصل السابق</span>
                <h5 className="text-sm font-bold group-hover:text-[#E1C58B] truncate">
                  #{prev_episode.episode_number} {prev_episode.title_ar}
                </h5>
              </div>
              <ChevronRight className="w-5 h-5 opacity-60 group-hover:text-[#C5A15B] group-hover:translate-x-1 transition-transform" />
            </Link>
          ) : <div />}

          {next_episode ? (
            <Link
              href={`/series/${series.slug}/read/${next_episode.id}`}
              className="p-4 rounded-2xl bg-black/30 border border-white/10 hover:border-[#C5A15B] transition-all flex items-center justify-between group sm:text-left"
            >
              <div>
                <span className="text-[10px] opacity-60 font-bold block">الفصل التالي</span>
                <h5 className="text-sm font-bold group-hover:text-[#E1C58B] truncate">
                  #{next_episode.episode_number} {next_episode.title_ar}
                </h5>
              </div>
              <ChevronLeft className="w-5 h-5 opacity-60 group-hover:text-[#C5A15B] group-hover:-translate-x-1 transition-transform" />
            </Link>
          ) : (
            <div className="p-4 rounded-2xl bg-[#087C7B]/20 border border-[#087C7B]/30 text-center sm:col-span-2">
              <span className="text-xs font-bold text-teal-300">
                لقد قرأت آخر فصل منشور في السلسلة! ترقب موعد صدور الفصل القادم.
              </span>
            </div>
          )}
        </div>
      </main>

      {/* ── Slide-out TOC Drawer ───────────────────────────────────────────── */}
      <AnimatePresence>
        {showDrawer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-end"
          >
            <div className="w-full max-w-md bg-[#0D1524] text-white h-full p-6 space-y-4 overflow-y-auto border-r border-[#C5A15B]/30 shadow-2xl">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <h3 className="font-black text-base flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#C5A15B]" />
                  <span>فهرس فصول السلسلة</span>
                </h3>
                <button onClick={() => setShowDrawer(false)} className="text-zinc-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2">
                {all_episodes_list.map((item: any) => {
                  const isActive = item.id === episode.id;
                  return (
                    <Link
                      key={item.id}
                      href={`/series/${series.slug}/read/${item.id}`}
                      onClick={() => setShowDrawer(false)}
                      className={`block p-3 rounded-2xl border transition-all ${
                        isActive
                          ? 'bg-[#C5A15B] text-black font-black border-[#C5A15B]'
                          : 'bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:border-[#C5A15B]/40 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span>#{item.episode_number} {item.title_ar}</span>
                        <span className="font-mono text-[10px] opacity-70">
                          {item.reading_time_minutes} د
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
