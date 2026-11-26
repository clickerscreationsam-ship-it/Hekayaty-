import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { api } from '@/lib/api';
import {
  Layers,
  BookOpen,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Play,
  Flame,
  Star,
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
    <section className="relative py-16 px-4 sm:px-6 lg:px-8 max-w-[1440px] mx-auto font-arabic notranslate" dir="rtl" translate="no">
      {/* Decorative ambient gradient */}
      <div className="absolute top-1/2 right-1/4 w-[450px] h-[450px] bg-[#C5A15B]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="space-y-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-800/80 pb-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C5A15B]/20 text-[#E1C58B] text-xs font-bold border border-[#C5A15B]/40">
              <Layers className="w-3.5 h-3.5" />
              <span>سلاسل حكاياتي والمواسم (Hekayaty Series)</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white">
              ملاحم الروايات والقصص المصورة المتسلسلة
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-xl">
              سلاسل حصرية تنشر فصولها أسبوعياً بمواسم ومجلدات متتابعة. تتبع أبطالك المفضلين واقرأ بأسلوب سينمائي غامر.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
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
                  className={`px-3 py-1.5 rounded-xl transition-all ${
                    activeFormat === f.key
                      ? 'bg-[#C5A15B] text-black font-black shadow'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <Link href="/series">
              <button className="px-4 py-2.5 rounded-2xl bg-[#087C7B]/20 hover:bg-[#087C7B]/30 border border-[#087C7B]/40 text-teal-300 text-xs font-bold flex items-center gap-1.5 transition-all">
                <span>استكشاف السلاسل</span>
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            </Link>
          </div>
        </div>

        {/* Featured Spotlight Card */}
        {featured && (
          <div className="relative rounded-3xl overflow-hidden border border-[#C5A15B]/40 shadow-2xl bg-[#0B1220]">
            <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
              {/* Info Column */}
              <div className="lg:col-span-7 p-6 sm:p-10 space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#C5A15B] text-black">
                    سلسلة الأسبوع
                  </span>
                  <span className="text-xs text-[#E1C58B] bg-black/60 px-2.5 py-0.5 rounded-full border border-white/10">
                    {featured.genre}
                  </span>
                  <span className="text-xs text-zinc-400 font-mono">
                    {featured.seasons_count || 1} مواسم • {featured.episodes_count || 0} فصول
                  </span>
                </div>

                <h3 className="text-2xl sm:text-4xl font-black text-white leading-tight">
                  {featured.title_ar}
                </h3>

                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed line-clamp-3">
                  {featured.short_description_ar || featured.description_ar}
                </p>

                <div className="flex items-center gap-4 text-xs text-zinc-400 font-mono pt-1">
                  <span>الكاتب: {featured.author_name || 'حكاياتي'}</span>
                  <span>•</span>
                  <span>التقييم: ★ {featured.rating || 4.9}</span>
                  {featured.release_day_time && (
                    <span className="text-amber-300">📅 {featured.release_day_time}</span>
                  )}
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <Link href={`/series/${featured.slug || featured.id}`}>
                    <button className="px-6 py-2.5 rounded-xl bg-[#C5A15B] hover:bg-[#E5C77D] text-black font-black text-xs shadow-lg flex items-center gap-2 transition-all">
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>بدء القراءة</span>
                    </button>
                  </Link>

                  <Link href={`/series/${featured.slug || featured.id}`}>
                    <button className="px-4 py-2.5 rounded-xl bg-black/40 hover:bg-black/60 border border-white/15 text-white text-xs font-bold transition-all">
                      تفاصيل السلسلة والمواسم
                    </button>
                  </Link>
                </div>
              </div>

              {/* Artwork Column */}
              <div className="lg:col-span-5 h-64 lg:h-80 relative overflow-hidden">
                <img
                  src={featured.banner_image_url || featured.cover_image_url}
                  alt={featured.title_ar}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-[#0B1220] via-[#0B1220]/20 to-transparent" />
              </div>
            </div>
          </div>
        )}

        {/* Series Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filtered.slice(0, 4).map((s) => (
            <Link key={s.id} href={`/series/${s.slug || s.id}`} className="group block">
              <div className="bg-[#0B1220] border border-white/10 group-hover:border-[#C5A15B]/50 rounded-2xl overflow-hidden transition-all duration-300 shadow-xl flex flex-col justify-between h-full group-hover:-translate-y-1">
                <div>
                  <div className="relative aspect-[16/10] overflow-hidden bg-black/60">
                    <img
                      src={s.cover_image_url}
                      alt={s.title_ar}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B1220] via-transparent to-transparent" />

                    <div className="absolute top-2.5 right-2.5 flex items-center gap-1">
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-black/80 backdrop-blur text-amber-300 border border-white/10">
                        {s.format === 'novel' ? 'رواية' : s.format === 'comic' ? 'كوميكس' : 'هجين'}
                      </span>
                      {s.is_original && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-[#C5A15B] text-black">
                          أصلي
                        </span>
                      )}
                    </div>

                    <span className="absolute bottom-2 right-2 text-[10px] text-zinc-300 font-mono bg-black/60 px-2 py-0.5 rounded">
                      {s.episodes_count || 0} فصول
                    </span>
                  </div>

                  <div className="p-4 space-y-1">
                    <span className="text-[10px] text-[#C5A15B] font-bold block">{s.genre}</span>
                    <h4 className="font-bold text-sm text-white group-hover:text-[#E1C58B] transition-colors truncate">
                      {s.title_ar}
                    </h4>
                    <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                      {s.short_description_ar || s.description_ar}
                    </p>
                  </div>
                </div>

                <div className="p-4 pt-0 border-t border-white/5 flex items-center justify-between text-[11px] font-bold text-zinc-400">
                  <span>{s.author_name || 'حكاياتي'}</span>
                  <span className="text-[#C5A15B] flex items-center gap-0.5 group-hover:translate-x-[-2px] transition-transform">
                    <span>استكشاف</span>
                    <ChevronLeft className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
