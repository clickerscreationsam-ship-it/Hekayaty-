import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { SEOHead } from '@/components/common/SEOHead';
import { api } from '@/lib/api';
import { Key, Sparkles, Clock, Calendar, Search, BookOpen, ArrowUpRight, Flame, Shield, ChevronLeft } from 'lucide-react';

export default function Mystery() {
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api
      .getMysteryEpisodes()
      .then((data) => {
        setEpisodes(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = episodes.filter((ep) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      ep.title_ar?.toLowerCase().includes(q) ||
      ep.title_en?.toLowerCase().includes(q) ||
      ep.short_description_ar?.toLowerCase().includes(q) ||
      ep.content_ar?.toLowerCase().includes(q) ||
      (ep.clues && ep.clues.some((c: string) => c.toLowerCase().includes(q)))
    );
  });

  const latest = episodes[0];

  return (
    <div className="min-h-screen bg-[#070B14] text-white font-arabic notranslate relative overflow-hidden" dir="rtl" translate="no">
      <SEOHead
        title="لغز حكاياتي اليومي | Mystery of Hekayaty"
        description="سلسلة ألغاز يومية مشوقة في عوالم حكاياتي، كل يوم حلقة جديدة تكشف سراً غامضاً جديداً."
        canonicalUrl="https://hekayaty.com/mystery"
        ogType="website"
      />

      {/* Atmospheric Background Lighting */}
      <div className="fixed inset-0 pointer-events-none opacity-20 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-600/30 via-purple-900/20 to-transparent" />

      {/* Hero Section */}
      <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#C5A15B]/20 border border-[#C5A15B]/40 text-[#E1C58B] text-xs font-bold shadow-lg">
            <Key className="w-4 h-4" />
            <span>السلسلة اليومية الحصرية | Daily Mystery</span>
          </div>

          <h1 className="text-3xl sm:text-6xl font-black text-white leading-tight drop-shadow-md">
            لغز حكاياتي: أسرار المخطوطة الغارقة
          </h1>

          <p className="text-base sm:text-lg text-zinc-300 font-medium leading-relaxed">
            "كل يوم حكاية... وكل حلقة تكشف سرًا جديدًا." تتبع خيوط الغموض اليومية وشارك مع المحققين والقراء في حل رموز الأكوان.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-xl mx-auto mt-8 relative">
          <Search className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="ابحث في أرشيف الحلقات، العناوين، أو القرائن..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pr-12 pl-4 py-3.5 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/15 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-[#C5A15B] shadow-2xl transition-all"
          />
        </div>
      </div>

      {/* Episodes Grid */}
      <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-8">
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <span>📜</span>
            <span>جميع الحلقات المنشورة ({filtered.length})</span>
          </h2>
          <span className="text-xs text-[#E1C58B] font-mono">تحديث يومي مستمر</span>
        </div>

        {loading ? (
          <div className="py-24 flex justify-center">
            <div className="w-10 h-10 rounded-full border-4 border-[#C5A15B]/30 border-t-[#C5A15B] animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-[#0B101D] rounded-3xl border border-zinc-800 max-w-md mx-auto p-8">
            <Key className="w-12 h-12 text-[#C5A15B]/40 mx-auto mb-3" />
            <h3 className="font-bold text-lg text-white mb-1">لا توجد حلقات مطابقة للبحث</h3>
            <p className="text-xs text-zinc-400">جرّب البحث بكلمات أخرى أو مسح صندوق البحث.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((ep) => (
              <motion.div
                key={ep.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="group relative rounded-3xl overflow-hidden border border-white/10 hover:border-[#C5A15B]/60 bg-[#0D1526]/90 backdrop-blur-xl transition-all shadow-xl hover:shadow-[0_10px_40px_rgba(197,161,91,0.25)] flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-[16/10] overflow-hidden bg-black/60">
                    <img
                      src={ep.cover_image_url || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80'}
                      alt={ep.title_ar}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 filter brightness-95 group-hover:brightness-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0D1526] via-transparent to-transparent" />

                    <div className="absolute top-3 right-3 flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full text-xs font-black bg-black/70 backdrop-blur-md text-[#E1C58B] border border-[#C5A15B]/40 shadow-md">
                        الحلقة #{ep.episode_number}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 space-y-3">
                    <h3 className="text-lg font-black text-white group-hover:text-[#E1C58B] transition-colors leading-snug line-clamp-2">
                      {ep.title_ar}
                    </h3>

                    <p className="text-xs text-zinc-300 leading-relaxed line-clamp-3">
                      {ep.short_description_ar || ep.content_ar}
                    </p>

                    {ep.clues && ep.clues.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {ep.clues.slice(0, 3).map((clue: string, idx: number) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-black/40 border border-white/5 text-[10px] text-amber-300 font-semibold"
                          >
                            🔑 {clue}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-6 pt-0">
                  <div className="flex items-center justify-between text-xs text-zinc-400 font-mono py-3 border-t border-white/5 mb-3">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>{ep.reading_time_minutes || 3} دقائق</span>
                    </span>
                    {ep.publication_date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-[#087C7B]" />
                        <span>{new Date(ep.publication_date).toLocaleDateString('ar-EG')}</span>
                      </span>
                    )}
                  </div>

                  <Link
                    href={`/mystery/${ep.slug || ep.id}`}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#C5A15B] to-[#E5C77D] text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-md hover:scale-102 transition-all"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>اقرأ الحلقة الآن</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
