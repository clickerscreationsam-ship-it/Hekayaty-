import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'wouter';
import { Search, BookOpen, Star, ChevronDown, SlidersHorizontal, X, FileText } from 'lucide-react';
import { useComics } from '@/lib/hooks';
import { SEOHead } from '@/components/common/SEOHead';
import type { Comic } from '@/types';

const GENRES = ['الكل', 'أكشن', 'خيال', 'خيال علمي', 'رعب', 'دراما', 'مغامرة'];
const CLASSIFICATIONS = ['الكل', 'حكاياتي الأصلية', 'حكاياتي المختارة', 'تعاون رسمي'];
const SORTS = [
  { value: 'newest', label: 'الأحدث' },
  { value: 'oldest', label: 'الأقدم' },
  { value: 'rating', label: 'الأعلى تقييمًا' },
  { value: 'reads', label: 'الأكثر قراءة' },
];

function getRatingStars(rating: number) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return { full, half, empty: 5 - full - (half ? 1 : 0) };
}

function classificationLabel(comic: Comic): string {
  const cls = (comic as any).classification;
  if (cls === 'original') return 'حكاياتي الأصلية';
  if (cls === 'hekayaty_selected') return 'حكاياتي المختارة';
  if (cls === 'official_collaboration') return 'تعاون رسمي';
  return 'حكاياتي الأصلية';
}

function classificationColor(comic: Comic): string {
  const cls = (comic as any).classification;
  if (cls === 'hekayaty_selected') return 'bg-rich-turquoise/15 text-deep-teal dark:text-rich-turquoise border border-rich-turquoise/40';
  if (cls === 'official_collaboration') return 'bg-purple-600/15 text-purple-700 dark:text-purple-300 border border-purple-500/30';
  return 'bg-deep-teal/15 text-deep-teal dark:bg-antique-gold/20 dark:text-antique-gold border border-deep-teal/30 dark:border-antique-gold/30';
}

function getSeriesName(comic: Comic): string {
  return (comic as any).seriesTitle || (comic as any).series || '';
}

function getGenresAr(comic: Comic): string[] {
  if ((comic as any).genresAr) return (comic as any).genresAr as string[];
  const map: Record<string, string> = {
    Action: 'أكشن', Fantasy: 'خيال', 'Sci-Fi': 'خيال علمي',
    Horror: 'رعب', Drama: 'دراما', Adventure: 'مغامرة',
    Magic: 'خيال', Thriller: 'أكشن', Cyberpunk: 'خيال علمي',
  };
  return ((comic as any).genre || []).map((g: string) => map[g] || g);
}

function getTitleAr(comic: Comic): string {
  return (comic as any).titleAr || (comic as any).title || '';
}

// group comics by series name
function groupBySeries(list: Comic[]): { series: string; items: Comic[] }[] {
  const map = new Map<string, Comic[]>();
  for (const c of list) {
    const key = getSeriesName(c) || 'بدون سلسلة';
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(c);
  }
  return Array.from(map.entries()).map(([series, items]) => ({ series, items }));
}

// ── Comic Card ────────────────────────────────────────────────────────────────

function ComicCard({ comic, index }: { comic: Comic; index: number }) {
  const stars = getRatingStars(comic.rating);
  const titleAr = getTitleAr(comic);
  const seriesName = getSeriesName(comic);
  const clsLabel = classificationLabel(comic);
  const clsColor = classificationColor(comic);

  const coverStyle = comic.coverImage.startsWith('linear-gradient')
    ? { background: comic.coverImage }
    : { backgroundImage: `url(${comic.coverImage})` };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
      className="group"
    >
      <Link href={`/comics/${comic.id}`}>
        <div className="cursor-pointer">
          {/* Cover */}
          <div className="relative aspect-[2/3] rounded-xl overflow-hidden border border-soft-sand/50 dark:border-white/10 group-hover:border-deep-teal/60 dark:group-hover:border-antique-gold/60 transition-all duration-300 shadow-md group-hover:shadow-xl">
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
              style={coverStyle}
            />
            {/* gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Year badge */}
            <div className="absolute top-2 right-2 bg-midnight-navy/80 dark:bg-black/80 backdrop-blur-md px-2 py-1 rounded text-xs font-bold text-warm-ivory border border-soft-sand/30 dark:border-white/10">
              {comic.year}
            </div>

            {/* Classification badge */}
            <div className={`absolute top-2 left-2 px-2 py-1 rounded text-xs font-bold backdrop-blur-md ${clsColor}`}>
              {clsLabel}
            </div>

            {/* Read now overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
              <button className="w-full py-2 bg-deep-teal text-white font-bold rounded-lg flex items-center justify-center gap-2 text-sm hover:bg-deep-teal/90 dark:bg-antique-gold dark:text-midnight-navy dark:hover:bg-champagne-gold transition-colors shadow-lg">
                <BookOpen className="w-4 h-4" />
                اقرأ الآن
              </button>
            </div>
          </div>

          {/* Info below */}
          <div className="mt-3 space-y-1 text-right">
            <h3 className="font-bold text-foreground text-sm leading-tight group-hover:text-deep-teal dark:group-hover:text-antique-gold transition-colors line-clamp-2 font-arabic">
              {titleAr}
            </h3>
            <div className="flex items-center justify-between text-xs text-foreground/60">
              <span className="text-deep-teal dark:text-antique-gold font-semibold">#{comic.issueNumber}</span>
              <span className="truncate max-w-[70%]">{seriesName}</span>
            </div>
            {/* Stars */}
            <div className="flex items-center gap-0.5 justify-end">
              {Array.from({ length: stars.full }).map((_, i) => (
                <Star key={`f${i}`} className="w-3 h-3 text-antique-gold fill-antique-gold" />
              ))}
              {stars.half && <Star key="h" className="w-3 h-3 text-antique-gold fill-antique-gold/50" />}
              {Array.from({ length: stars.empty }).map((_, i) => (
                <Star key={`e${i}`} className="w-3 h-3 text-soft-sand/50 dark:text-white/20" />
              ))}
              <span className="text-xs text-foreground/50 mr-1">{comic.rating}</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function Comics() {
  const { data: comics = [] } = useComics();
  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState('الكل');
  const [classification, setClassification] = useState('الكل');
  const [sort, setSort] = useState('newest');
  const [worldFilter, setWorldFilter] = useState('الكل');
  const [showFilters, setShowFilters] = useState(false);

  // Collect unique worlds from comics
  const worldNames = useMemo(() => {
    const names = new Set<string>();
    comics.forEach((c) => {
      if ((c as any).worldNameAr) names.add((c as any).worldNameAr);
      else if (c.worldId) names.add(c.worldId);
    });
    return ['الكل', ...Array.from(names)];
  }, []);

  const filtered = useMemo(() => {
    let list = [...comics];

    // search
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((c) => {
        const titleAr = getTitleAr(c).toLowerCase();
        const titleEn = ((c as any).title || '').toLowerCase();
        const seriesName = getSeriesName(c).toLowerCase();
        return titleAr.includes(q) || titleEn.includes(q) || seriesName.includes(q);
      });
    }

    // genre
    if (genre !== 'الكل') {
      list = list.filter((c) => getGenresAr(c).includes(genre));
    }

    // classification
    if (classification !== 'الكل') {
      list = list.filter((c) => classificationLabel(c) === classification);
    }

    // world
    if (worldFilter !== 'الكل') {
      list = list.filter((c) => {
        const wn = (c as any).worldNameAr || c.worldId;
        return wn === worldFilter;
      });
    }

    // sort
    list.sort((a, b) => {
      if (sort === 'newest') return b.year - a.year;
      if (sort === 'oldest') return a.year - b.year;
      if (sort === 'rating') return b.rating - a.rating;
      return 0;
    });

    return list;
  }, [search, genre, classification, sort, worldFilter]);

  const grouped = useMemo(() => groupBySeries(filtered), [filtered]);

  const hasActiveFilters = genre !== 'الكل' || classification !== 'الكل' || worldFilter !== 'الكل';

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 notranslate" dir="rtl" translate="no">
      <SEOHead
        title="مكتبة الكوميكس والقصص المصورة"
        description="استكشف أكبر مكتبة للقصص المصورة والمانجا العربية، واقرأ فصول الملاحم الأسطورية بجودة فائقة."
        canonicalUrl="/comics"
        ogType="website"
      />
      <div className="max-w-7xl mx-auto">

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-right"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-deep-teal/10 dark:bg-antique-gold/10 border border-deep-teal/20 dark:border-antique-gold/30 text-deep-teal dark:text-antique-gold text-xs font-semibold mb-3">
            <BookOpen className="w-3.5 h-3.5" />
            <span>السرد المصور والروايات البصرية</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-4xl md:text-6xl font-cinzel font-bold mb-4">
                <span className="text-deep-teal dark:gold-gradient">مكتبة الكوميكس</span>
              </h1>
              <p className="text-lg text-foreground/70 font-arabic max-w-2xl leading-relaxed">
                استكشف القصص الملحمية التي تُشكّل كون حكاياتي — اقرأ الإصدارات فورًا أو أضفها إلى مجموعتك الأدبية.
              </p>
            </div>
            <Link
              href="/reader"
              className="self-start sm:self-auto inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-antique-gold/15 hover:bg-antique-gold/25 text-antique-gold border border-antique-gold/30 text-xs font-bold transition-all shadow-md group"
            >
              <FileText className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span>القارئ الذكي (رفع PDF أو قراءة حرة)</span>
            </Link>
          </div>
        </motion.div>

        {/* ── Search + Filter Bar ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-4 sm:p-5 rounded-2xl mb-8 space-y-4 border border-soft-sand/50 dark:border-white/10"
        >
          {/* Top row: search + filter toggle */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40" />
              <input
                type="text"
                placeholder="ابحث بالعنوان أو السلسلة..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-soft-cream/50 dark:bg-black/50 border border-soft-sand/60 dark:border-white/10 rounded-full py-3 pr-11 pl-4 text-foreground placeholder:text-foreground/40 focus:border-deep-teal dark:focus:border-antique-gold/50 outline-none transition-colors font-arabic text-right"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Sort */}
            <div className="relative">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="bg-soft-cream/50 dark:bg-black/50 border border-soft-sand/60 dark:border-white/10 rounded-full px-5 py-3 text-foreground outline-none focus:border-deep-teal dark:focus:border-antique-gold/50 cursor-pointer appearance-none pr-10 font-arabic text-right"
              >
                {SORTS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40 pointer-events-none" />
            </div>

            {/* Filter toggle */}
            <button
              onClick={() => setShowFilters((v) => !v)}
              className={`flex items-center gap-2 px-5 py-3 rounded-full border transition-colors font-arabic ${
                showFilters || hasActiveFilters
                  ? 'border-deep-teal bg-deep-teal/10 text-deep-teal dark:border-antique-gold dark:bg-antique-gold/10 dark:text-antique-gold'
                  : 'border-soft-sand/60 dark:border-white/10 text-foreground/70 hover:border-deep-teal/40 dark:hover:border-white/30'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              فلترة
              {hasActiveFilters && <span className="w-2 h-2 bg-deep-teal dark:bg-antique-gold rounded-full" />}
            </button>
          </div>

          {/* Expanded filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden space-y-4 pt-3 border-t border-soft-sand/40 dark:border-white/5"
              >
                {/* Genre */}
                <div>
                  <span className="text-xs text-foreground/60 font-arabic mb-2 block font-medium">التصنيف الأدبي</span>
                  <div className="flex flex-wrap gap-2">
                    {GENRES.map((g) => (
                      <button
                        key={g}
                        onClick={() => setGenre(g)}
                        className={`px-4 py-1.5 rounded-full text-sm font-arabic transition-colors ${
                          genre === g
                            ? 'bg-deep-teal text-white dark:bg-antique-gold dark:text-midnight-navy font-bold shadow-sm'
                            : 'bg-soft-cream/60 dark:bg-white/5 text-foreground/70 dark:text-white/60 hover:bg-soft-cream dark:hover:bg-white/10 border border-soft-sand/40 dark:border-white/10'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Classification */}
                <div>
                  <span className="text-xs text-foreground/60 font-arabic mb-2 block font-medium">نوع الإصدار</span>
                  <div className="flex flex-wrap gap-2">
                    {CLASSIFICATIONS.map((c) => (
                      <button
                        key={c}
                        onClick={() => setClassification(c)}
                        className={`px-4 py-1.5 rounded-full text-sm font-arabic transition-colors ${
                          classification === c
                            ? 'bg-deep-teal text-white dark:bg-antique-gold dark:text-midnight-navy font-bold shadow-sm'
                            : 'bg-soft-cream/60 dark:bg-white/5 text-foreground/70 dark:text-white/60 hover:bg-soft-cream dark:hover:bg-white/10 border border-soft-sand/40 dark:border-white/10'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                {/* World filter */}
                <div>
                  <span className="text-xs text-foreground/60 font-arabic mb-2 block font-medium">العالم</span>
                  <div className="flex flex-wrap gap-2">
                    {worldNames.map((w) => (
                      <button
                        key={w}
                        onClick={() => setWorldFilter(w)}
                        className={`px-4 py-1.5 rounded-full text-sm font-arabic transition-colors ${
                          worldFilter === w
                            ? 'bg-deep-teal text-white dark:bg-antique-gold dark:text-midnight-navy font-bold shadow-sm'
                            : 'bg-soft-cream/60 dark:bg-white/5 text-foreground/70 dark:text-white/60 hover:bg-soft-cream dark:hover:bg-white/10 border border-soft-sand/40 dark:border-white/10'
                        }`}
                      >
                        {w}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ── Results ── */}
        {filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-32"
          >
            <BookOpen className="w-16 h-16 mx-auto mb-6 text-foreground/20" />
            <h3 className="text-xl font-cinzel text-foreground/70 mb-2">
              {comics.length === 0 ? 'لا توجد أعداد كوميكس منشورة حالياً' : 'لا توجد نتائج مطابقة'}
            </h3>
            <p className="text-foreground/50 font-arabic text-sm">
              {comics.length === 0
                ? 'سيتم إدراج الإصدارات فور نشرها في قاعدة البيانات.'
                : 'جرّب تعديل كلمات البحث أو الفلاتر'}
            </p>
          </motion.div>
        ) : (
          <div className="space-y-16">
            {grouped.map(({ series, items }, gIdx) => (
              <motion.section
                key={series}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: gIdx * 0.1 }}
              >
                {/* Series header */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent to-deep-teal/20 dark:to-antique-gold/20" />
                  <div className="text-right">
                    <h2 className="text-lg font-cinzel font-bold text-foreground">{series}</h2>
                    <p className="text-xs text-foreground/50 font-arabic">{items.length} إصدار</p>
                  </div>
                  <div className="w-1.5 h-7 bg-deep-teal dark:bg-antique-gold rounded-full" />
                </div>

                {/* Comics row */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
                  {items.map((comic, i) => (
                    <ComicCard key={comic.id} comic={comic} index={i} />
                  ))}
                </div>
              </motion.section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
