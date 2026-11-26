import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'wouter';
import { SEOHead } from '@/components/common/SEOHead';
import { CinematicEventBanner } from '@/components/common/CinematicEventBanner';
import { DailyMysterySection } from '@/components/common/DailyMysterySection';
import { api } from '@/lib/api';
import {
  useComics,
  useCharacters,
  useWorlds,
  useSeries,
  useStories,
  useNews,
  useTimeline,
  useCards,
} from '@/lib/hooks';
import {
  BookOpen,
  Users,
  Globe,
  Star,
  ChevronLeft,
  Sparkles,
  Flame,
  Clock,
  Layers,
  Award,
  Gamepad2,
  Newspaper,
  Compass,
  ArrowRight,
  Shield,
  Feather,
} from 'lucide-react';
import { useAppStore } from '@/stores/useAppStore';

import magicLibraryBg from '@assets/generated_images/magic_library_clouds.png';
import heroCharactersImg from '@assets/generated_images/hero_characters.png';

export default function Home() {
  const { readingProgress } = useAppStore();
  const { data: comics = [] } = useComics();
  const { data: characters = [] } = useCharacters();
  const { data: worlds = [] } = useWorlds();
  const { data: series = [] } = useSeries();
  const { data: stories = [] } = useStories();
  const { data: newsArticles = [] } = useNews();
  const { data: timelineEvents = [] } = useTimeline();
  const { data: cardGameCards = [] } = useCards();

  // Events & Carnivals for Cinematic Banner
  const [activeEvents, setActiveEvents] = useState<any[]>([]);

  useEffect(() => {
    api.getEvents({ status: 'active' }).then((data) => {
      setActiveEvents(Array.isArray(data) ? data : []);
    }).catch(() => {});
  }, []);

  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 800], [0, 160]);
  const heroOpacity = useTransform(scrollY, [0, 450], [1, 0.1]);

  const featuredComic = comics.find((c) => c.isFeatured) || comics[0];
  const latestComics = comics.slice(0, 4);
  const selectedComics = comics.filter((c) => c.classification === 'hekayaty_selected').slice(0, 3);
  const topCharacters = characters.slice(0, 6);
  const latestNews = newsArticles.slice(0, 3);

  // Continue reading item (if available)
  const lastReadProgress = readingProgress.length > 0 ? readingProgress[0] : null;
  const lastReadComic = lastReadProgress ? comics.find((c) => c.id === lastReadProgress.comicId) : null;

  return (
    <div className="w-full overflow-hidden font-arabic notranslate" dir="rtl" translate="no">
      <SEOHead
        title="الرئيسية | عوالم خيالية لا تنتهي"
        description="الوجهة الترفيهية الأدبية الأولى لاكتشاف وقراءة أضخم الأكوان القصصية العربية المترابطة، الروايات، والكوميكس الأصلي بمؤثرات وتجربة قراءة غامرة."
        canonicalUrl="https://hekayaty.com/"
        ogType="website"
      />
      {/* 1. CINEMATIC HERO SECTION */}
      <section className="relative min-h-[calc(100vh-5rem)] flex items-center justify-center overflow-hidden py-12 sm:py-24">
        <motion.div
          className="absolute inset-0 z-0 bg-midnight-navy"
          style={{ y: heroY, opacity: heroOpacity }}
        >
          <img
            src={magicLibraryBg}
            alt="مملكة الكتب السحرية فوق السحاب"
            className="w-full h-full object-contain sm:object-cover object-top"
          />
          {/* Subtle bottom gradient to blend seamlessly into the content */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent sm:hidden" />
        </motion.div>

        <div className="relative z-10 max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/30 text-[#E1C58B] text-xs font-semibold shadow-2xl"
          >
            <Sparkles className="w-4 h-4 text-[#C5A15B]" />
            <span>كل قصة بوابة، وكل بطل حكاية، وكل عالم بداية لشيء أعظم.</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-[1.15] drop-shadow-[0_4px_24px_rgba(0,0,0,1)]"
          >
            هنا تبدأ الحكايات…{' '}
            <span className="text-[#E1C58B] [text-shadow:_0_4px_24px_rgba(0,0,0,1),_0_0_12px_rgba(0,0,0,0.95)]">
              ولا تنتهي العوالم.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-base sm:text-xl text-white max-w-2xl mx-auto leading-relaxed drop-shadow-[0_3px_14px_rgba(0,0,0,1)] font-semibold"
          >
            اكتشف عوالم من الخيال، وعِش حكايات الأبطال، واستكشف قصصًا مترابطة تأخذك إلى ما وراء حدود الخيال.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-4 pt-4"
          >
            <Link
              href="/comics"
              className="py-3.5 px-8 rounded-2xl bg-[#087C7B] hover:bg-[#075B5C] text-[#F7F1E6] font-bold text-sm shadow-[0_0_35px_rgba(8,124,123,0.8)] hover:scale-105 transition-all flex items-center gap-2 border border-white/30 backdrop-blur-sm"
            >
              <BookOpen className="w-4 h-4" />
              <span>ابدأ القراءة الآن</span>
            </Link>

            <Link
              href="/characters"
              className="py-3.5 px-8 rounded-2xl bg-black/60 hover:bg-black/80 text-white font-semibold text-sm border border-white/40 hover:border-[#C5A15B] backdrop-blur-md transition-all flex items-center gap-2 shadow-2xl hover:scale-105"
            >
              <Users className="w-4 h-4 text-[#C5A15B]" />
              <span>استكشف سجل الأبطال</span>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* 1.5 DYNAMIC CINEMATIC EVENT & CARNIVAL BANNER */}
      {activeEvents.length > 0 && (
        <CinematicEventBanner events={activeEvents} />
      )}

      {/* 1.8 DYNAMIC DAILY MYSTERY EXPERIENCE */}
      <DailyMysterySection />

      {/* 2. CONTINUE READING BANNER (If user has progress) */}
      {lastReadComic && lastReadProgress && (
        <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 -mt-6 mb-12 relative z-20">
          <div className="glass-panel p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
            <div className="flex items-center gap-4">
              <img
                src={lastReadComic.coverImage}
                alt={lastReadComic.titleAr}
                className="w-12 h-16 object-cover rounded-lg border border-[#D8C5A8] dark:border-white/10 shrink-0"
              />
              <div>
                <span className="text-[11px] font-bold text-[#087C7B] dark:text-[#E1C58B] flex items-center gap-1">
                  <Clock className="w-3 h-3" /> متابعة القراءة
                </span>
                <h4 className="text-sm font-bold text-[#2A1F17] dark:text-white">{lastReadComic.titleAr}</h4>
                <p className="text-xs text-[#604735] dark:text-zinc-400">
                  توقفت عند الصفحة {lastReadProgress.lastPage} من {lastReadProgress.totalPages}
                </p>
              </div>
            </div>

            <Link
              href={`/comics/${lastReadComic.id}/read`}
              className="px-5 py-2.5 rounded-xl bg-[#087C7B] dark:bg-[#C5A15B] text-[#F7F1E6] dark:text-[#111C2B] font-bold text-xs hover:brightness-110 transition-all flex items-center gap-1.5 shrink-0"
            >
              <span>استئناف القراءة</span>
              <ChevronLeft className="w-4 h-4" />
            </Link>
          </div>
        </section>
      )}

      {/* 3. FEATURED RELEASE SPOTLIGHT */}
      {featuredComic && (
        <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="glass-panel rounded-3xl overflow-hidden p-6 sm:p-10 relative">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Cover Column */}
              <div className="lg:col-span-5 flex justify-center">
                <div className="relative aspect-[2/3] w-64 sm:w-80 rounded-2xl overflow-hidden shadow-xl border border-[#D8C5A8] dark:border-[#C5A15B]/40 group">
                  <img
                    src={featuredComic.coverImage}
                    alt={featuredComic.titleAr}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute top-3.5 right-3.5 px-3 py-1 rounded-full text-xs font-bold bg-[#087C7B] dark:bg-[#C5A15B] text-[#F7F1E6] dark:text-[#111C2B] shadow-md">
                    إصدار الأسبوع المميز
                  </div>
                </div>
              </div>

              {/* Info Column */}
              <div className="lg:col-span-7 space-y-5">
                <div className="flex items-center gap-2.5">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#087C7B]/10 dark:bg-[#C5A15B]/15 text-[#087C7B] dark:text-[#E1C58B] border border-[#087C7B]/30 dark:border-[#C5A15B]/30">
                    العدد #{featuredComic.issueNumber}
                  </span>
                  <span className="text-xs text-[#604735] dark:text-zinc-400">
                    بقلم: {featuredComic.writer} • رسوم: {featuredComic.artist}
                  </span>
                </div>

                <h2 className="text-2xl sm:text-4xl font-bold text-[#2A1F17] dark:text-white leading-snug">
                  {featuredComic.titleAr}
                </h2>

                <p className="text-sm sm:text-base text-[#604735] dark:text-zinc-300 leading-relaxed">
                  {featuredComic.synopsisAr}
                </p>

                <div className="flex flex-wrap gap-2 pt-1">
                  {(featuredComic.genresAr || []).map((g, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-lg bg-[#EFE5D4] dark:bg-white/5 text-xs text-[#604735] dark:text-zinc-300 border border-[#D8C5A8] dark:border-white/5"
                    >
                      {g}
                    </span>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-4 pt-3">
                  <Link
                    href={`/comics/${featuredComic.id}/read`}
                    className="py-3 px-6 rounded-xl bg-[#087C7B] hover:bg-[#075B5C] text-[#F7F1E6] font-bold text-xs flex items-center gap-2 transition-all shadow-md"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>اقرأ الآن</span>
                  </Link>

                  <Link
                    href={`/comics/${featuredComic.id}`}
                    className="py-3 px-6 rounded-xl bg-[#EFE5D4] dark:bg-white/5 hover:bg-[#087C7B]/10 dark:hover:bg-white/10 text-[#2A1F17] dark:text-white font-semibold text-xs border border-[#D8C5A8] dark:border-white/10 transition-all flex items-center gap-1.5"
                  >
                    <span>عرض التفاصيل والتقييمات</span>
                    <ChevronLeft className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 4. LATEST COMICS RELEASES */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#2A1F17] dark:text-white flex items-center gap-2">
              <Flame className="w-6 h-6 text-[#087C7B] dark:text-[#C5A15B]" />
              <span>أحدث أعداد الكوميكس</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#604735] dark:text-zinc-400 mt-1">
              إصدارات متجددة ترسم ملاحم الأبطال في عوالم زلامار ونوفا قديم والمارد
            </p>
          </div>
          <Link href="/comics" className="text-xs text-[#087C7B] dark:text-[#E1C58B] hover:underline flex items-center gap-1 font-semibold">
            <span>كل المكتبة</span>
            <ChevronLeft className="w-4 h-4" />
          </Link>
        </div>

        {latestComics.length === 0 ? (
          <div className="glass-panel rounded-3xl p-10 text-center border border-[#D8C5A8] dark:border-white/10 max-w-xl mx-auto shadow-sm">
            <BookOpen className="w-12 h-12 mx-auto mb-3 text-[#087C7B]/40 dark:text-[#C5A15B]/40" />
            <h3 className="text-base font-bold text-[#2A1F17] dark:text-white mb-1">لا توجد أعداد كوميكس منشورة حالياً</h3>
            <p className="text-xs text-[#604735] dark:text-zinc-400">
              ترقبوا قريباً أولى إصدارات الكوميكس والروايات البصرية فور نشرها.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {latestComics.map((comic) => (
              <Link
                key={comic.id}
                href={`/comics/${comic.id}`}
                className="group rounded-3xl overflow-hidden bg-[#FAF5ED] dark:bg-zinc-950 border border-[#D8C5A8] dark:border-white/10 hover:border-[#087C7B] dark:hover:border-[#C5A15B]/50 p-3.5 transition-all flex flex-col justify-between shadow-md"
              >
                <div>
                  <div className="relative aspect-[2/3] rounded-2xl overflow-hidden mb-3 bg-[#EFE5D4] dark:bg-zinc-900">
                    <img
                      src={comic.coverImage}
                      alt={comic.titleAr}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EFE5D4]/90 dark:bg-black/70 backdrop-blur-md text-[#087C7B] dark:text-[#E1C58B] border border-[#D8C5A8] dark:border-transparent">
                      العدد #{comic.issueNumber}
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-[#2A1F17] dark:text-white group-hover:text-[#087C7B] dark:group-hover:text-[#E1C58B] transition-colors truncate mb-1">
                    {comic.titleAr}
                  </h3>
                  <p className="text-xs text-[#604735] dark:text-zinc-400 line-clamp-2 leading-relaxed mb-2">
                    {comic.synopsisAr}
                  </p>
                </div>

                <div className="flex items-center justify-between text-[11px] pt-2 border-t border-[#D8C5A8]/50 dark:border-white/5 text-[#604735] dark:text-zinc-400">
                  <span>{comic.year}</span>
                  <span className="text-[#087C7B] dark:text-[#C5A15B] font-semibold">{comic.rating} ★</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* 5. SERIES SPOTLIGHT */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#2A1F17] dark:text-white flex items-center gap-2">
              <Layers className="w-6 h-6 text-[#087C7B] dark:text-[#C5A15B]" />
              <span>سلاسل حكاياتي الملحمية</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#604735] dark:text-zinc-400 mt-1">
              مجموعات قصصية تتبع مسارات درامية متكاملة
            </p>
          </div>
        </div>

        {series.length === 0 ? (
          <div className="glass-panel rounded-3xl p-10 text-center border border-[#D8C5A8] dark:border-white/10 max-w-xl mx-auto shadow-sm">
            <Layers className="w-12 h-12 mx-auto mb-3 text-[#087C7B]/40 dark:text-[#C5A15B]/40" />
            <h3 className="text-base font-bold text-[#2A1F17] dark:text-white mb-1">لا توجد سلاسل ملحمية منشورة حالياً</h3>
            <p className="text-xs text-[#604735] dark:text-zinc-400">
              سيتم إدراج السلاسل القصصية المترابطة فور اعتمادها ونشرها.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {series.map((s) => (
              <Link
                key={s.id}
                href={`/series/${s.id}`}
                className="glass-panel p-4 rounded-3xl border border-[#D8C5A8] dark:border-white/10 hover:border-[#087C7B] dark:hover:border-[#C5A15B]/50 transition-all flex flex-col justify-between group shadow-md"
              >
                <div>
                  <div className="aspect-[16/10] rounded-2xl overflow-hidden mb-3 bg-[#EFE5D4] dark:bg-zinc-900">
                    <img
                      src={s.coverImage}
                      alt={s.titleAr}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="flex justify-between items-center text-[11px] text-[#604735] dark:text-zinc-400 mb-1">
                    <span className="text-[#087C7B] dark:text-[#E1C58B] font-semibold">
                      {s.status === 'ongoing' ? 'مستمرة' : 'مكتملة'}
                    </span>
                    <span>{s.issueCount} أعداد</span>
                  </div>
                  <h3 className="text-base font-bold text-[#2A1F17] dark:text-white group-hover:text-[#087C7B] dark:group-hover:text-[#E1C58B] transition-colors mb-1">
                    {s.titleAr}
                  </h3>
                  <p className="text-xs text-[#604735] dark:text-zinc-400 line-clamp-2 leading-relaxed">
                    {s.descriptionAr}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-[#D8C5A8]/50 dark:border-white/5 flex items-center justify-between text-xs text-[#087C7B] dark:text-[#E1C58B] font-semibold">
                  <span>تصفح أعداد السلسلة</span>
                  <ChevronLeft className="w-3.5 h-3.5" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* 6. HEKAYATY SELECTED SPOTLIGHT */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-[#087C7B]/10 via-[#FAF5ED] to-[#EFE5D4] dark:from-[#123B40] dark:via-[#172538] dark:to-[#111C2B] border border-[#087C7B]/30 dark:border-[#119B98]/30 shadow-lg transition-colors">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#087C7B]/15 text-[#087C7B] dark:text-[#119B98] border border-[#087C7B]/30 inline-block">
                مختارات تحريرية من المبدعين
              </span>
              <h2 className="text-2xl sm:text-4xl font-bold text-[#2A1F17] dark:text-white">
                ركن <span className="teal-gradient">حكاياتي المختارة</span>
              </h2>
              <p className="text-xs sm:text-sm text-[#604735] dark:text-zinc-300 max-w-xl leading-relaxed">
                أعمال استثنائية لمشاركي برامج حكاياتي تم اعتمادها تحريرياً لتنضم إلى منظومة الكون
                القصصي برعاية فنية كاملة.
              </p>
            </div>

            <Link
              href="/selected"
              className="py-2.5 px-5 rounded-xl bg-[#087C7B] text-[#F7F1E6] font-bold text-xs hover:bg-[#075B5C] transition-colors flex items-center gap-1.5 shrink-0 shadow-md"
            >
              <span>استكشف حكاياتي المختارة</span>
              <ChevronLeft className="w-4 h-4" />
            </Link>
          </div>

          {selectedComics.length === 0 ? (
            <div className="glass-panel rounded-2xl p-8 text-center border border-[#087C7B]/20">
              <Sparkles className="w-10 h-10 mx-auto mb-2 text-[#087C7B] dark:text-[#119B98]" />
              <h4 className="text-sm font-bold text-[#2A1F17] dark:text-white mb-1">لا توجد أعمال مختارة معتمدة حالياً</h4>
              <p className="text-xs text-[#604735] dark:text-zinc-400 max-w-md mx-auto mb-3">
                برنامج حكاياتي المختارة يرحب بمشاركات المبدعين والكتّاب المستقلين.
              </p>
              <Link href="/editorial" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#087C7B] text-[#F7F1E6] text-xs font-bold hover:bg-[#075B5C]">
                تقديم عملك للمراجعة
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {selectedComics.map((comic) => (
                <Link
                  key={comic.id}
                  href={`/comics/${comic.id}`}
                  className="glass-panel p-3.5 rounded-2xl border border-[#D8C5A8] dark:border-white/10 hover:border-[#087C7B] dark:hover:border-[#119B98]/50 transition-all group flex flex-col justify-between"
                >
                  <div>
                    <div className="aspect-[2/3] rounded-xl overflow-hidden mb-3 bg-[#EFE5D4] dark:bg-zinc-900">
                      <img
                        src={comic.coverImage}
                        alt={comic.titleAr}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <h4 className="text-sm font-bold text-[#2A1F17] dark:text-white group-hover:text-[#087C7B] dark:group-hover:text-[#119B98] transition-colors mb-1 truncate">
                      {comic.titleAr}
                    </h4>
                    <p className="text-xs text-[#604735] dark:text-zinc-400 line-clamp-2 leading-relaxed mb-2">
                      {comic.synopsisAr}
                    </p>
                  </div>
                  <span className="text-[11px] text-[#087C7B] dark:text-[#119B98] block pt-2 border-t border-[#D8C5A8]/50 dark:border-white/5 font-semibold">
                    المبدع: {comic.createdBy}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 7. HEROES & CHARACTERS GRID */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#2A1F17] dark:text-white flex items-center gap-2">
              <Users className="w-6 h-6 text-[#087C7B] dark:text-[#C5A15B]" />
              <span>أبطال وكيانات الكون</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#604735] dark:text-zinc-400 mt-1">
              تعرف على الفرسان، السحرة الفلكيين، وسادة الظلال
            </p>
          </div>
          <Link href="/characters" className="text-xs text-[#087C7B] dark:text-[#E1C58B] hover:underline flex items-center gap-1 font-semibold">
            <span>كل الشخصيات</span>
            <ChevronLeft className="w-4 h-4" />
          </Link>
        </div>

        {topCharacters.length === 0 ? (
          <div className="glass-panel rounded-3xl p-10 text-center border border-[#D8C5A8] dark:border-white/10 max-w-xl mx-auto shadow-sm">
            <Users className="w-12 h-12 mx-auto mb-3 text-[#087C7B]/40 dark:text-[#C5A15B]/40" />
            <h3 className="text-base font-bold text-[#2A1F17] dark:text-white mb-1">لا توجد شخصيات مسجلة حالياً</h3>
            <p className="text-xs text-[#604735] dark:text-zinc-400">
              سيتم إدراج سجل الأبطال والشخصيات فور إضافتها في قاعدة البيانات.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {topCharacters.map((char: any) => {
              const charImg = char.image || char.imageUrl || char.image_url || char.avatar_url || '/assets/generated_images/zayed.jpg';
              const charName = char.nameAr || char.name_ar || char.name || 'بطل أسطوري';
              const charAlias = char.aliasAr || char.alias_ar || char.alias || char.title || 'سجل الأبطال';
              const rating = char.powerRating || char.stats?.powerRating || 85;
              const alignment = char.alignment || char.role || 'hero';

              return (
                <Link
                  key={char.id}
                  href={`/characters/${char.id}`}
                  className="glass-panel rounded-3xl overflow-hidden border border-[#D8C5A8] dark:border-white/10 hover:border-[#087C7B] dark:hover:border-[#C5A15B] p-5 transition-all flex flex-col items-center text-center group hover:-translate-y-1 hover:shadow-xl hover:shadow-[#087C7B]/10 dark:hover:shadow-[#C5A15B]/10 relative bg-gradient-to-b from-white/40 to-white/10 dark:from-white/[0.04] dark:to-transparent"
                >
                  {/* Large Cinematic Hero Portrait / Icon */}
                  <div className="w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-2xl overflow-hidden mb-4 border-2 border-[#D8C5A8] dark:border-[#C5A15B]/30 group-hover:border-[#087C7B] dark:group-hover:border-[#C5A15B] transition-all shadow-md group-hover:shadow-lg relative bg-zinc-950">
                    <img
                      src={charImg}
                      alt={charName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/assets/generated_images/zayed.jpg';
                      }}
                    />
                    {/* Power rating sticker */}
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/80 backdrop-blur-md border border-[#C5A15B]/50 text-white text-[10px] font-mono font-bold flex items-center gap-1 shadow">
                      <span className="text-amber-400">⚡</span>
                      <span>{rating}</span>
                    </div>
                    {/* Alignment Badge */}
                    <div className={`absolute bottom-2 right-2 px-2 py-0.5 rounded-md text-[9px] font-bold backdrop-blur-md ${
                      alignment === 'hero' ? 'bg-emerald-600/80 text-white' :
                      alignment === 'villain' ? 'bg-rose-600/80 text-white' :
                      'bg-amber-600/80 text-white'
                    }`}>
                      {alignment === 'hero' ? 'بطل' : alignment === 'villain' ? 'شرير' : 'غامض'}
                    </div>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-[#2A1F17] dark:text-white group-hover:text-[#087C7B] dark:group-hover:text-[#E1C58B] transition-colors truncate w-full font-arabic">
                    {charName}
                  </h3>
                  <span className="text-xs text-[#087C7B] dark:text-[#C5A15B] truncate w-full font-semibold mt-0.5">
                    {charAlias}
                  </span>
                  {char.bioAr && (
                    <p className="text-[11px] text-[#604735] dark:text-zinc-400 line-clamp-2 mt-2 leading-relaxed font-arabic">
                      {char.bioAr}
                    </p>
                  )}
                  <div className="mt-3 w-full pt-2 border-t border-[#D8C5A8]/50 dark:border-white/5 flex items-center justify-center gap-1 text-[11px] text-[#087C7B] dark:text-[#E1C58B] font-bold group-hover:gap-2 transition-all">
                    <span>استكشف السجل</span>
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* 8. WORLDS ATLAS */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#2A1F17] dark:text-white flex items-center gap-2">
              <Globe className="w-6 h-6 text-[#087C7B] dark:text-[#C5A15B]" />
              <span>أطلس الأبعاد والعوالم</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#604735] dark:text-zinc-400 mt-1">
              خمسة أبعاد كونية تتشابك فيها المصائر والحروب
            </p>
          </div>
          <Link href="/worlds" className="text-xs text-[#087C7B] dark:text-[#E1C58B] hover:underline flex items-center gap-1 font-semibold">
            <span>استعراض الأطلس</span>
            <ChevronLeft className="w-4 h-4" />
          </Link>
        </div>

        {worlds.length === 0 ? (
          <div className="glass-panel rounded-3xl p-10 text-center border border-[#D8C5A8] dark:border-white/10 max-w-xl mx-auto shadow-sm">
            <Globe className="w-12 h-12 mx-auto mb-3 text-[#087C7B]/40 dark:text-[#C5A15B]/40" />
            <h3 className="text-base font-bold text-[#2A1F17] dark:text-white mb-1">أطلس الأبعاد قيد التجهيز</h3>
            <p className="text-xs text-[#604735] dark:text-zinc-400">
              سيتم فتح بوابات العوالم والأبعاد فور توثيقها في أطلس حكاياتي.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {worlds.map((world) => (
              <Link
                key={world.id}
                href={`/worlds/${world.id}`}
                className="relative aspect-[4/5] rounded-3xl overflow-hidden border border-[#D8C5A8] dark:border-white/10 hover:border-[#087C7B] dark:hover:border-[#C5A15B]/50 transition-all group shadow-md flex flex-col justify-end p-5"
              >
                <img
                  src={world.image}
                  alt={world.nameAr}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#111C2B] via-[#111C2B]/50 to-transparent" />

                <div className="relative z-10 space-y-1">
                  <span className="text-[10px] text-[#E1C58B] font-semibold block">
                    {world.nameEn}
                  </span>
                  <h3 className="text-lg font-bold text-white group-hover:text-[#E1C58B] transition-colors">
                    {world.nameAr}
                  </h3>
                  <p className="text-[11px] text-[#F3EBDD]/80 line-clamp-2 leading-relaxed">
                    {world.descriptionAr}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* 9. UNIVERSE LORE & TIMELINE TEASER */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Timeline Box */}
          <div className="glass-panel p-8 rounded-3xl border border-[#D8C5A8] dark:border-white/10 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#087C7B]/10 dark:bg-[#C5A15B]/15 text-[#087C7B] dark:text-[#E1C58B] border border-[#087C7B]/30 dark:border-[#C5A15B]/30 inline-flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> سجل الوقائع
              </span>
              <h3 className="text-2xl font-bold text-[#2A1F17] dark:text-white">الخط الزمني الشامل</h3>
              <p className="text-xs sm:text-sm text-[#604735] dark:text-zinc-300 leading-relaxed">
                تتبع الأحداث الكبرى منذ الكسوف الأول وتصدع الفضاء، وصولاً إلى استيقاظ الدرع الشمسي
                وثورة الاندماج البلوري في سيرا برايم.
              </p>
            </div>
            <Link
              href="/timeline"
              className="py-2.5 px-5 rounded-xl bg-[#EFE5D4] dark:bg-white/5 hover:bg-[#087C7B] dark:hover:bg-[#C5A15B] text-[#2A1F17] hover:text-[#F7F1E6] dark:text-white dark:hover:text-[#111C2B] font-semibold text-xs border border-[#D8C5A8] dark:border-white/10 transition-all flex items-center justify-between"
            >
              <span>استعراض الخط الزمني</span>
              <ChevronLeft className="w-4 h-4" />
            </Link>
          </div>

          {/* Encyclopedia Box */}
          <div className="glass-panel p-8 rounded-3xl border border-[#D8C5A8] dark:border-white/10 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#087C7B]/10 dark:bg-[#C5A15B]/15 text-[#087C7B] dark:text-[#E1C58B] border border-[#087C7B]/30 dark:border-[#C5A15B]/30 inline-flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5" /> الأسرار والعتاد
              </span>
              <h3 className="text-2xl font-bold text-[#2A1F17] dark:text-white">الموسوعة والأسرار</h3>
              <p className="text-xs sm:text-sm text-[#604735] dark:text-zinc-300 leading-relaxed">
                سجل موثق لكل قطعة أثرية خارقة، منظمة عسكرية، ومادة بلورية تؤثر في توازن قوى مجرة
                حكاياتي.
              </p>
            </div>
            <Link
              href="/encyclopedia"
              className="py-2.5 px-5 rounded-xl bg-[#EFE5D4] dark:bg-white/5 hover:bg-[#087C7B] dark:hover:bg-[#C5A15B] text-[#2A1F17] hover:text-[#F7F1E6] dark:text-white dark:hover:text-[#111C2B] font-semibold text-xs border border-[#D8C5A8] dark:border-white/10 transition-all flex items-center justify-between"
            >
              <span>دخول الموسوعة الكونية</span>
              <ChevronLeft className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 10. CARD GAME PREVIEW */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-[#D8C5A8] dark:border-[#C5A15B]/30 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#087C7B]/10 dark:bg-[#C5A15B]/15 text-[#087C7B] dark:text-[#E1C58B] border border-[#087C7B]/30 dark:border-[#C5A15B]/30 inline-flex items-center gap-1.5">
              <Gamepad2 className="w-4 h-4" /> لعبة بطاقات تكتيكية
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold text-[#2A1F17] dark:text-white">
              اختر بطاقات أبطالك لخوض المعارك القادمة
            </h3>
            <p className="text-xs sm:text-sm text-[#604735] dark:text-zinc-300 leading-relaxed">
              استكشف قدرات الهجوم والدفاع والطاقة السحرية لشخصيات حكاياتي في تجربة بصرية وبطاقات
              نادرة وجبارة.
            </p>
          </div>

          <Link
            href="/card-game"
            className="py-3 px-6 rounded-xl bg-[#087C7B] dark:bg-[#C5A15B] text-[#F7F1E6] dark:text-[#111C2B] font-bold text-xs hover:brightness-110 transition-all flex items-center gap-2 shrink-0 shadow-md"
          >
            <span>استعراض معرض البطاقات</span>
            <ChevronLeft className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* 11. LATEST NEWS */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#2A1F17] dark:text-white flex items-center gap-2">
              <Newspaper className="w-6 h-6 text-[#087C7B] dark:text-[#C5A15B]" />
              <span>آخر الأخبار والإعلانات</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#604735] dark:text-zinc-400 mt-1">
              متابعة الإصدارات، فعاليات المبدعين، وأحدث المقالات
            </p>
          </div>
          <Link href="/news" className="text-xs text-[#087C7B] dark:text-[#E1C58B] hover:underline flex items-center gap-1 font-semibold">
            <span>كل الأخبار</span>
            <ChevronLeft className="w-4 h-4" />
          </Link>
        </div>

        {latestNews.length === 0 ? (
          <div className="glass-panel rounded-3xl p-10 text-center border border-[#D8C5A8] dark:border-white/10 max-w-xl mx-auto shadow-sm">
            <Newspaper className="w-12 h-12 mx-auto mb-3 text-[#087C7B]/40 dark:text-[#C5A15B]/40" />
            <h3 className="text-base font-bold text-[#2A1F17] dark:text-white mb-1">لا توجد أخبار منشورة حالياً</h3>
            <p className="text-xs text-[#604735] dark:text-zinc-400">
              تابعنا باستمرار للاطلاع على أحدث الإعلانات والبيانات الصحفية والفعاليات.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {latestNews.map((news) => (
              <Link
                key={news.id}
                href={`/news/${news.id}`}
                className="glass-panel rounded-3xl overflow-hidden border border-[#D8C5A8] dark:border-white/10 hover:border-[#087C7B] dark:hover:border-[#C5A15B]/40 transition-all flex flex-col justify-between group shadow-md"
              >
                <div>
                  <div className="aspect-[16/9] overflow-hidden bg-[#EFE5D4] dark:bg-zinc-900">
                    <img
                      src={news.image}
                      alt={news.titleAr}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-5 space-y-2">
                    <span className="text-[11px] text-[#087C7B] dark:text-[#E1C58B] font-semibold">{news.date}</span>
                    <h4 className="text-base font-bold text-[#2A1F17] dark:text-white group-hover:text-[#087C7B] dark:group-hover:text-[#E1C58B] transition-colors leading-snug">
                      {news.titleAr}
                    </h4>
                    <p className="text-xs text-[#604735] dark:text-zinc-400 line-clamp-2 leading-relaxed">
                      {news.summaryAr}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0 text-xs text-[#087C7B] dark:text-[#E1C58B] font-semibold flex items-center gap-1">
                  <span>قراءة المقال</span>
                  <ChevronLeft className="w-3.5 h-3.5" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* 12. COMMUNITY & CREATOR CTA */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="glass-panel p-8 sm:p-14 rounded-3xl border border-[#D8C5A8] dark:border-white/10 max-w-3xl mx-auto space-y-5">
          <Feather className="w-10 h-10 text-[#087C7B] dark:text-[#C5A15B] mx-auto" />
          <h2 className="text-2xl sm:text-4xl font-bold text-[#2A1F17] dark:text-white">
            انضم إلى مجتمع قراء ومبدعي حكاياتي
          </h2>
          <p className="text-sm text-[#604735] dark:text-zinc-300 leading-relaxed">
            عالم حكاياتي يجمع بين شغف القراءة ورعاية الإبداع الأدبي والقصصي. شارك بنظرياتك ورسوماتك،
            أو قدّم عملك لينضم إلى قسم حكاياتي المختارة.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/community"
              className="py-3 px-6 rounded-xl bg-[#087C7B] hover:bg-[#075B5C] text-[#F7F1E6] font-bold text-xs transition-all shadow-md"
            >
              دخول مجتمع القراء
            </Link>
            <Link
              href="/selected"
              className="py-3 px-6 rounded-xl bg-[#EFE5D4] dark:bg-white/5 hover:bg-[#087C7B]/10 text-[#2A1F17] dark:text-white font-semibold text-xs border border-[#D8C5A8] dark:border-white/10 transition-all"
            >
              تعرف على حكاياتي المختارة
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
