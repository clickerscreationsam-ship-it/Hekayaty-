import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { SEOHead } from '@/components/common/SEOHead';
import { api } from '@/lib/api';
import {
  Layers,
  BookOpen,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  Flame,
  Star,
  Clock,
  Eye,
  CheckCircle,
  Play,
  Bookmark,
} from 'lucide-react';

export default function SeriesPlatform() {
  const [seriesList, setSeriesList] = useState<any[]>([]);
  const [collections, setCollections] = useState<any | null>(null);
  const [featuredHero, setFeaturedHero] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [formatFilter, setFormatFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.getSeriesPlatformList(),
      api.getSeriesPlatformCollections(),
      api.getSeriesPlatformFeatured(),
    ])
      .then(([allList, col, hero]) => {
        setSeriesList(Array.isArray(allList) ? allList : []);
        setCollections(col);
        setFeaturedHero(hero);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredSeries = seriesList.filter((s) => {
    const matchesSearch =
      !search ||
      s.title_ar?.toLowerCase().includes(search.toLowerCase()) ||
      s.title_en?.toLowerCase().includes(search.toLowerCase()) ||
      s.short_description_ar?.toLowerCase().includes(search.toLowerCase());
    const matchesFormat = formatFilter === 'all' || s.format === formatFilter;
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchesSearch && matchesFormat && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-[#070B14] text-white font-arabic notranslate relative overflow-hidden" dir="rtl" translate="no">
      <SEOHead
        title="سلاسل حكاياتي | ملاحم الروايات والقصص المصورة المتسلسلة"
        description="استكشف سلاسل حكاياتي الأصلية، مواسم الروايات الفانتازية، وأعداد الكوميكس المصورة بمواسم ومجلدات وفصول متسلسلة."
        ogType="website"
      />

      {/* ── Ambient Background Lighting ─────────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-[#C5A15B]/10 rounded-full blur-[140px]" />
        <div className="absolute top-1/3 left-10 w-[500px] h-[500px] bg-[#087C7B]/15 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        {/* ── 1. CINEMATIC FEATURED SERIES HERO ──────────────────────────────── */}
        {featuredHero && (
          <div className="relative rounded-3xl overflow-hidden border border-[#C5A15B]/40 shadow-2xl bg-[#0B1220] min-h-[480px] flex flex-col justify-end p-6 sm:p-10 lg:p-12">
            <div className="absolute inset-0 z-0">
              <img
                src={featuredHero.banner_image_url || featuredHero.cover_image_url}
                alt={featuredHero.title_ar}
                className="w-full h-full object-cover object-center filter brightness-[0.45] contrast-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#070B14] via-[#070B14]/70 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#070B14]/90 via-[#070B14]/40 to-transparent" />
            </div>

            <div className="relative z-10 max-w-3xl space-y-4">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="px-3 py-1 rounded-full text-xs font-black bg-[#C5A15B] text-black shadow-lg">
                  ★ سلسلة الموسم المميزة
                </span>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-black ${
                    featuredHero.format === 'novel'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : featuredHero.format === 'comic'
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      : 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                  }`}
                >
                  {featuredHero.format === 'novel'
                    ? 'روايات متسلسلة'
                    : featuredHero.format === 'comic'
                    ? 'كوميكس مصور'
                    : 'هجين روايات وكوميكس'}
                </span>

                <span className="text-xs text-[#E1C58B] bg-black/60 px-3 py-1 rounded-full border border-white/10">
                  {featuredHero.genre}
                </span>

                <span className="text-xs text-zinc-400 font-mono">
                  {featuredHero.seasons_count || 1} مواسم • {featuredHero.episodes_count || 0} فصول
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white leading-tight drop-shadow-lg">
                {featuredHero.title_ar}
              </h1>

              <p className="text-sm sm:text-base text-zinc-200 leading-relaxed max-w-2xl font-medium">
                {featuredHero.short_description_ar || featuredHero.description_ar}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link href={`/series/${featuredHero.slug || featuredHero.id}`}>
                  <button className="px-7 py-3 rounded-2xl bg-[#C5A15B] hover:bg-[#E5C77D] text-black font-black text-sm shadow-xl flex items-center gap-2 hover:scale-105 transition-all">
                    <Play className="w-4 h-4 fill-current" />
                    <span>ابدأ قراءة السلسلة</span>
                  </button>
                </Link>

                <Link href={`/series/${featuredHero.slug || featuredHero.id}`}>
                  <button className="px-5 py-3 rounded-2xl bg-black/60 hover:bg-black/80 text-white border border-white/20 text-xs font-bold transition-all">
                    استكشاف فصول ومواسم السلسلة
                  </button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* ── 2. FILTER & DISCOVERY TOOLBAR ─────────────────────────────────── */}
        <div className="bg-[#0D1524]/90 backdrop-blur-xl p-4 sm:p-5 rounded-3xl border border-white/10 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="ابحث في سلاسل حكاياتي بالعنوان، التصنيف، أو الكاتب..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pr-10 pl-4 py-2.5 rounded-2xl bg-black/60 border border-white/15 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#C5A15B]"
              />
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-zinc-400 font-bold">الصيغة:</span>
              <div className="flex bg-black/60 p-1 rounded-2xl border border-white/10 text-xs font-bold">
                {[
                  { key: 'all', label: 'الكل' },
                  { key: 'novel', label: 'روايات' },
                  { key: 'comic', label: 'كوميكس' },
                  { key: 'hybrid', label: 'هجين' },
                ].map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setFormatFilter(f.key)}
                    className={`px-3 py-1.5 rounded-xl transition-all ${
                      formatFilter === f.key
                        ? 'bg-[#C5A15B] text-black font-black shadow'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-zinc-400 font-bold">الحالة:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-2xl bg-black/60 border border-white/15 text-xs text-zinc-300 focus:outline-none"
              >
                <option value="all">جميع الحالات</option>
                <option value="ongoing">مستمرة</option>
                <option value="completed">مكتملة</option>
                <option value="upcoming">قادمة</option>
              </select>
            </div>
          </div>
        </div>

        {/* ── 3. FEATURED COLLECTIONS (RAILS) ───────────────────────────────── */}
        {collections && !search && formatFilter === 'all' && (
          <div className="space-y-12">
            {/* Collection 1: Hekayaty Originals */}
            {collections.originals?.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-[#C5A15B]" />
                      <span>سلاسل حكاياتي الأصلية (Hekayaty Originals)</span>
                    </h2>
                    <p className="text-xs text-zinc-400">عوالم حصرية ممتدة صُنعت بأعلى معايير الإنتاج الروائي والفني.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {collections.originals.map((s: any) => (
                    <SeriesCard key={s.id} series={s} />
                  ))}
                </div>
              </div>
            )}

            {/* Collection 2: Popular & Highly Followed */}
            {collections.popular?.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                      <Flame className="w-5 h-5 text-amber-400" />
                      <span>الأكثر متابعة وقراءة</span>
                    </h2>
                    <p className="text-xs text-zinc-400">السلاسل التي تحظى بأعلى تفاعل من مجتمع قراء حكاياتي.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {collections.popular.map((s: any) => (
                    <SeriesCard key={s.id} series={s} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── 4. ALL SEARCH & FILTER RESULTS ─────────────────────────────────── */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#C5A15B]" />
              <span>فهرس السلاسل ({filteredSeries.length})</span>
            </h3>
            <span className="text-xs text-zinc-500 font-mono">تحديث مستمر</span>
          </div>

          {loading ? (
            <div className="py-20 flex justify-center">
              <div className="w-8 h-8 rounded-full border-4 border-[#C5A15B]/30 border-t-[#C5A15B] animate-spin" />
            </div>
          ) : filteredSeries.length === 0 ? (
            <div className="py-20 text-center text-zinc-400 bg-zinc-900/40 rounded-3xl border border-white/5">
              <Layers className="w-12 h-12 mx-auto mb-2 opacity-30 text-amber-400" />
              <h4 className="text-base font-bold text-white mb-1">لا توجد سلاسل مطابقة</h4>
              <p className="text-xs text-zinc-500">جرب تعديل معايير البحث أو تصفية الأنواع.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSeries.map((s) => (
                <SeriesCard key={s.id} series={s} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Sub-component: Series Card ─────────────────────────────────────────────
function SeriesCard({ series }: { series: any }) {
  return (
    <Link href={`/series/${series.slug || series.id}`} className="group block">
      <div className="bg-[#0B1220] border border-white/10 group-hover:border-[#C5A15B]/50 rounded-3xl overflow-hidden transition-all duration-300 shadow-xl flex flex-col justify-between h-full group-hover:-translate-y-1">
        <div>
          {/* Cover Artwork */}
          <div className="relative aspect-[16/10] overflow-hidden bg-black/60">
            <img
              src={series.cover_image_url}
              alt={series.title_ar}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B1220] via-transparent to-transparent" />

            {/* Badges */}
            <div className="absolute top-3 right-3 flex items-center gap-1.5">
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase backdrop-blur-md ${
                  series.format === 'novel'
                    ? 'bg-amber-500/80 text-black'
                    : series.format === 'comic'
                    ? 'bg-purple-600/90 text-white'
                    : 'bg-teal-600/90 text-white'
                }`}
              >
                {series.format === 'novel' ? 'رواية' : series.format === 'comic' ? 'كوميكس' : 'هجين'}
              </span>

              {series.classification === 'original' && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#C5A15B] text-black">
                  حصري
                </span>
              )}
            </div>

            <div className="absolute bottom-3 right-3 left-3 flex items-center justify-between text-[11px] text-zinc-300 font-mono">
              <span className="bg-black/60 backdrop-blur px-2 py-0.5 rounded-md border border-white/10">
                {series.seasons_count || 1} مواسم • {series.episodes_count || 0} فصول
              </span>
              <span className="bg-black/60 backdrop-blur px-2 py-0.5 rounded-md border border-white/10 flex items-center gap-1 text-amber-300">
                ★ {series.rating || 4.9}
              </span>
            </div>
          </div>

          {/* Body Content */}
          <div className="p-5 space-y-2">
            <span className="text-[10px] text-[#C5A15B] font-bold uppercase tracking-wider block">
              {series.genre}
            </span>
            <h4 className="font-black text-white text-lg group-hover:text-[#E1C58B] transition-colors line-clamp-1">
              {series.title_ar}
            </h4>
            <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
              {series.short_description_ar || series.description_ar}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 pt-0 border-t border-white/5 flex items-center justify-between text-xs font-bold text-zinc-400">
          <span>{series.author_name || series.publisher_name || 'حكاياتي'}</span>
          <span className="text-[#C5A15B] flex items-center gap-1 group-hover:translate-x-[-4px] transition-transform">
            <span>استكشاف السلسلة</span>
            <ChevronLeft className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
