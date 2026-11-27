import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { api } from '@/lib/api';
import {
  Layers,
  Play,
  Star,
  ChevronLeft,
  BookOpen,
  Flame,
} from 'lucide-react';

export function HekayatySeriesSection() {
  const [featured, setFeatured] = useState<any | null>(null);
  const [seriesList, setSeriesList] = useState<any[]>([]);
  const [activeFormat, setActiveFormat] = useState<'all' | 'novel' | 'comic' | 'original'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getSeriesPlatformFeatured(),
      api.getSeriesPlatformList({ limit: 8 }),
    ])
      .then(([hero, list]) => {
        setFeatured(hero);
        setSeriesList(Array.isArray(list) ? list : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading || seriesList.length === 0) return null;

  const filtered = seriesList.filter((s) => {
    if (activeFormat === 'novel') return s.format === 'novel' || s.format === 'hybrid';
    if (activeFormat === 'comic') return s.format === 'comic' || s.format === 'hybrid';
    if (activeFormat === 'original') return s.is_original;
    return true;
  });

  return (
    /* Solid dark section — no transparency bleeding from parent hero */
    <section
      className="relative bg-[#060C18] py-20 px-4 sm:px-6 lg:px-8 font-arabic notranslate"
      dir="rtl"
      translate="no"
    >
      {/* Subtle ambient glows — teal + gold, very soft */}
      <div className="absolute top-0 right-0 w-[700px] h-[500px] bg-[#C5A15B]/5 rounded-full blur-[180px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[400px] bg-[#087C7B]/6 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-[1440px] mx-auto space-y-10 relative z-10">

        {/* ─── Section Header ─── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/8 pb-8">
          <div className="space-y-3">

            {/* Badge */}
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#C5A15B]/15 text-[#C5A15B] text-xs font-black border border-[#C5A15B]/30">
              <Layers className="w-3.5 h-3.5" />
              <span>Hekayaty Series — سلاسل حكاياتي</span>
            </div>

            {/* Main Heading — solid bright white, very readable on dark bg */}
            <h2 className="text-3xl sm:text-5xl font-black leading-tight tracking-tight text-white drop-shadow-sm">
              ملاحم الروايات والقصص المصورة المتسلسلة
            </h2>

            <p className="text-sm text-zinc-400 max-w-xl leading-relaxed">
              سلاسل حصرية تنشر فصولها أسبوعياً بمواسم ومجلدات متتابعة. تتبع أبطالك المفضلين واقرأ بأسلوب سينمائي غامر.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            {/* Filter pills */}
            <div className="flex items-center gap-1 bg-[#0F172A] p-1 rounded-2xl border border-white/10 text-xs font-bold">
              {[
                { key: 'all', label: 'الكل' },
                { key: 'original', label: 'أصلية' },
                { key: 'novel', label: 'روايات' },
                { key: 'comic', label: 'كوميكس' },
              ].map((f) => (
                <button
                  key={f.key}
                  onClick={() => setActiveFormat(f.key as any)}
                  className={`px-3.5 py-1.5 rounded-xl transition-all ${
                    activeFormat === f.key
                      ? 'bg-gradient-to-br from-[#C5A15B] to-[#E5C77D] text-black font-black shadow-md shadow-[#C5A15B]/30'
                      : 'text-zinc-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <Link href="/series">
              <button className="px-5 py-2.5 rounded-2xl bg-[#087C7B]/20 hover:bg-[#087C7B]/40 border border-[#087C7B]/50 text-teal-200 text-xs font-bold flex items-center gap-1.5 transition-all">
                <span>استكشاف السلاسل</span>
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            </Link>
          </div>
        </div>

        {/* ─── Featured Hero Card ─── */}
        {featured && (
          <div className="relative rounded-3xl overflow-hidden border border-[#C5A15B]/25 shadow-2xl shadow-black/50 bg-[#040A14] group">

            {/* Full-bleed background cover */}
            <div className="absolute inset-0 w-full h-full">
              <img
                src={featured.banner_image_url || featured.cover_image_url}
                alt={featured.title_ar}
                className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
              />
              {/* Strong gradient — text always readable */}
              <div className="absolute inset-0 bg-gradient-to-l from-[#040A14]/98 via-[#040A14]/80 to-[#040A14]/30" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#040A14]/95 via-transparent to-transparent" />
            </div>

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 min-h-[380px] lg:min-h-[420px]">

              {/* Info */}
              <div className="lg:col-span-6 p-8 sm:p-12 flex flex-col justify-center space-y-5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-[11px] font-black bg-gradient-to-br from-[#C5A15B] to-[#E5C77D] text-black shadow-md">
                    ✦ سلسلة الأسبوع
                  </span>
                  <span className="text-xs text-[#E1C58B] bg-black/60 px-3 py-1 rounded-full border border-[#C5A15B]/30 backdrop-blur-sm">
                    {featured.genre}
                  </span>
                  <span className="text-xs text-zinc-400 font-mono bg-black/40 px-2.5 py-1 rounded-full backdrop-blur-sm">
                    {featured.seasons_count || 1} مواسم • {featured.episodes_count || 0} فصول
                  </span>
                </div>

                <h3 className="text-3xl sm:text-5xl font-black text-white leading-tight drop-shadow-xl">
                  {featured.title_ar}
                </h3>

                <p className="text-sm text-zinc-200 leading-relaxed line-clamp-3 max-w-lg">
                  {featured.short_description_ar || featured.description_ar}
                </p>

                <div className="flex items-center gap-4 text-xs text-zinc-400 font-mono">
                  <span className="text-zinc-300">الكاتب: {featured.author_name || 'حكاياتي'}</span>
                  <span className="flex items-center gap-0.5 text-amber-400 font-bold">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    {featured.rating || 4.9}
                  </span>
                  {featured.release_day_time && (
                    <span className="text-amber-300">📅 {featured.release_day_time}</span>
                  )}
                </div>

                <div className="flex items-center gap-3 pt-1 flex-wrap">
                  <Link href={`/series/${featured.slug || featured.id}`}>
                    <button className="px-7 py-3 rounded-xl bg-gradient-to-br from-[#C5A15B] to-[#E5C77D] hover:from-[#E5C77D] hover:to-[#FFD700] text-black font-black text-sm shadow-xl shadow-[#C5A15B]/30 flex items-center gap-2 transition-all">
                      <Play className="w-4 h-4 fill-current" />
                      بدء القراءة
                    </button>
                  </Link>
                  <Link href={`/series/${featured.slug || featured.id}`}>
                    <button className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white text-sm font-bold transition-all">
                      تفاصيل السلسلة والمواسم
                    </button>
                  </Link>
                </div>
              </div>

              {/* Artwork column */}
              <div className="hidden lg:flex lg:col-span-6 items-center justify-end pr-8 pb-8 pt-8">
                <div className="relative w-56 h-80 rounded-2xl overflow-hidden shadow-2xl shadow-black/70 ring-2 ring-[#C5A15B]/40 group-hover:ring-[#C5A15B]/70 transition-all duration-500">
                  <img
                    src={featured.cover_image_url}
                    alt={featured.title_ar}
                    className="w-full h-full object-cover object-top"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-br from-white/10 to-transparent" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── Series Cards Grid ─── */}
        {filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filtered.slice(0, 4).map((s) => (
              <Link key={s.id} href={`/series/${s.slug || s.id}`} className="group block">
                <div className="bg-[#07101F] border border-white/8 group-hover:border-[#C5A15B]/60 rounded-2xl overflow-hidden transition-all duration-300 shadow-xl shadow-black/40 group-hover:shadow-2xl group-hover:shadow-[#C5A15B]/10 group-hover:-translate-y-2 flex flex-col h-full">

                  {/* Cover — poster ratio */}
                  <div className="relative w-full overflow-hidden bg-black/80" style={{ aspectRatio: '3/4' }}>
                    <img
                      src={s.cover_image_url}
                      alt={s.title_ar}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#07101F] via-[#07101F]/10 to-transparent" />

                    {/* Top badges */}
                    <div className="absolute top-3 right-3 flex items-center gap-1.5 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-black/80 backdrop-blur-sm text-amber-300 border border-white/10">
                        {s.format === 'novel' ? '📖 رواية' : s.format === 'comic' ? '🎨 كوميكس' : '✨ هجين'}
                      </span>
                      {s.is_original && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-gradient-to-br from-[#C5A15B] to-[#E5C77D] text-black shadow-sm">
                          أصلي
                        </span>
                      )}
                    </div>

                    {/* Episode count */}
                    <span className="absolute bottom-3 left-3 text-[11px] text-zinc-200 font-mono bg-black/70 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-white/10">
                      <BookOpen className="w-3 h-3 inline ml-1 opacity-70" />
                      {s.episodes_count || 0} فصول
                    </span>

                    {/* Status */}
                    {s.status === 'ongoing' && (
                      <span className="absolute bottom-3 right-3 flex items-center gap-1 text-[10px] font-black text-emerald-300 bg-black/70 backdrop-blur-sm px-2 py-1 rounded-lg border border-emerald-500/30">
                        <Flame className="w-3 h-3 text-orange-400" />
                        مستمرة
                      </span>
                    )}
                  </div>

                  {/* Text info */}
                  <div className="p-5 space-y-2 flex-1 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <span className="text-[11px] text-[#C5A15B] font-bold tracking-wide uppercase block">
                        {s.genre}
                      </span>
                      <h4 className="font-black text-base text-white group-hover:text-[#E1C58B] transition-colors leading-snug">
                        {s.title_ar}
                      </h4>
                      <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                        {s.short_description_ar || s.description_ar}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs font-bold text-zinc-500">
                      <span className="text-zinc-400">{s.author_name || 'حكاياتي'}</span>
                      <span className="text-[#C5A15B] flex items-center gap-0.5 group-hover:translate-x-[-3px] transition-transform">
                        <span>استكشاف</span>
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
