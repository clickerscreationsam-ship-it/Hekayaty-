import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { Sparkles, Clock, Calendar, ChevronLeft, BookOpen, Key, Flame, ArrowUpRight, Lock, Eye } from 'lucide-react';
import { api } from '@/lib/api';

export function DailyMysterySection() {
  const [data, setData] = useState<{
    latestEpisode: any | null;
    nextScheduledEpisode: any | null;
    totalPublishedEpisodes: number;
    recentEpisodes: any[];
  }>({
    latestEpisode: null,
    nextScheduledEpisode: null,
    totalPublishedEpisodes: 0,
    recentEpisodes: [],
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getMysteryOverview()
      .then((res) => {
        if (res) setData(res);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const latest = data.latestEpisode;
  const nextEp = data.nextScheduledEpisode;

  // Real countdown timer hook for scheduled next episode
  function useCountdown(dateStr?: string) {
    const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({
      hours: 0,
      minutes: 0,
      seconds: 0,
    });

    useEffect(() => {
      if (!dateStr) return;
      const target = new Date(dateStr).getTime();

      const update = () => {
        const now = new Date().getTime();
        const diff = Math.max(0, target - now);

        setTimeLeft({
          hours: Math.floor(diff / (1000 * 60 * 60)),
          minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((diff % (1000 * 60)) / 1000),
        });
      };

      update();
      const interval = setInterval(update, 1000);
      return () => clearInterval(interval);
    }, [dateStr]);

    return timeLeft;
  }

  const countdown = useCountdown(nextEp?.publication_date);

  if (loading || !latest) {
    return null; // Silent if no episodes published yet
  }

  return (
    <section className="relative w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 my-16 font-arabic notranslate" dir="rtl" translate="no">
      {/* Background Mystery Glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-900/10 via-[#0A0E1A] to-amber-950/10 rounded-3xl -z-10 blur-xl" />

      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#C5A15B]/15 border border-[#C5A15B]/30 text-[#E1C58B] text-xs font-bold shadow-md">
            <Key className="w-3.5 h-3.5" />
            <span>لغز حكاياتي اليومي | Mystery of Hekayaty</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight">
            كل يوم حكاية... وكل حلقة تكشف سرًا جديدًا
          </h2>

          <p className="text-sm text-zinc-400 font-medium">
            سلسلة ألغاز سردية متسلسلة تصدر حلقاتها يومياً. انضم لآلاف القراء في فك شفرة الغموض.
          </p>
        </div>

        <Link
          href="/mystery"
          className="text-xs sm:text-sm font-bold text-[#C5A15B] hover:text-[#F3DEB0] flex items-center gap-1.5 transition-colors shrink-0 group"
        >
          <span>استكشف أرشيف الحلقات الكامل ({data.totalPublishedEpisodes})</span>
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Main Grid: Featured Latest Episode + Sidebar Countdown & Archive */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Latest Featured Episode Showcase (Large Cinematic Card) */}
        <div className="lg:col-span-8">
          <div className="relative rounded-3xl overflow-hidden border-2 border-[#C5A15B]/40 shadow-[0_15px_60px_rgba(0,0,0,0.8)] bg-[#0B101D] group">
            <div className="relative aspect-[16/9] sm:aspect-[21/10] overflow-hidden">
              <img
                src={latest.cover_image_url || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80'}
                alt={latest.title_ar}
                className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-700 filter brightness-90 group-hover:brightness-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B101D] via-[#0B101D]/70 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0B101D] via-[#0B101D]/50 to-transparent" />

              {/* Status & Episode Number Pill */}
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <span className="px-3.5 py-1 rounded-full text-xs font-black bg-gradient-to-r from-[#C5A15B] to-[#E5C77D] text-black shadow-lg">
                  الحلقة الأحدث #{latest.episode_number}
                </span>

                <span className="bg-black/70 backdrop-blur-md px-3 py-1 rounded-full text-zinc-300 text-xs font-bold border border-white/10 flex items-center gap-1.5">
                  <Flame className="w-3 h-3 text-amber-400" />
                  <span>صدرت اليوم</span>
                </span>
              </div>
            </div>

            {/* Content Details */}
            <div className="relative p-6 sm:p-8 space-y-4 -mt-12 sm:-mt-16 z-10 bg-gradient-to-t from-[#0B101D] via-[#0B101D] to-transparent">
              <h3 className="text-xl sm:text-3xl font-black text-white leading-snug group-hover:text-[#E1C58B] transition-colors">
                {latest.title_ar}
              </h3>

              <p className="text-zinc-300 text-sm sm:text-base leading-relaxed line-clamp-3">
                {latest.short_description_ar || latest.content_ar}
              </p>

              {/* Clues Preview */}
              {latest.clues && latest.clues.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                  <span className="text-zinc-400 font-bold flex items-center gap-1">
                    <Key className="w-3.5 h-3.5 text-amber-400" />
                    <span>مفاتيح اللغز:</span>
                  </span>
                  {latest.clues.map((clue: string, i: number) => (
                    <span
                      key={i}
                      className="px-2.5 py-0.5 rounded-lg bg-black/60 border border-white/10 text-amber-200 font-semibold"
                    >
                      {clue}
                    </span>
                  ))}
                </div>
              )}

              {/* Meta & CTA */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-zinc-800">
                <div className="flex items-center gap-4 text-xs text-zinc-400 font-mono">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#087C7B]" />
                    <span>{latest.reading_time_minutes || 3} دقائق قراءة</span>
                  </span>
                  {latest.publication_date && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-amber-400" />
                      <span>{new Date(latest.publication_date).toLocaleDateString('ar-EG')}</span>
                    </span>
                  )}
                </div>

                <Link
                  href={`/mystery/${latest.slug || latest.id}`}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#C5A15B] to-[#E5C77D] hover:from-[#E5C77D] hover:to-[#C5A15B] text-black font-extrabold text-sm flex items-center gap-2 shadow-[0_0_25px_rgba(197,161,91,0.4)] hover:scale-105 transition-all"
                >
                  <BookOpen className="w-4 h-4 stroke-[2.5]" />
                  <span>اكتشف الحلقة واقرأ الآن</span>
                  <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar: Next Episode Countdown + Recent Episodes */}
        <div className="lg:col-span-4 space-y-6">
          {/* Next Episode Countdown Card */}
          {nextEp && (
            <div className="bg-[#101726]/90 backdrop-blur-xl border border-amber-500/30 rounded-3xl p-6 text-center space-y-3 shadow-xl">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                <Clock className="w-3.5 h-3.5" />
                <span>الحلقة القادمة خلال</span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-white pt-1">
                <div className="bg-[#0B101D] p-3 rounded-2xl border border-white/5">
                  <span className="block text-2xl font-black text-[#E1C58B]">{countdown.hours}</span>
                  <span className="text-[10px] text-zinc-400 font-bold">ساعة</span>
                </div>
                <div className="bg-[#0B101D] p-3 rounded-2xl border border-white/5">
                  <span className="block text-2xl font-black text-[#E1C58B]">{countdown.minutes}</span>
                  <span className="text-[10px] text-zinc-400 font-bold">دقيقة</span>
                </div>
                <div className="bg-[#0B101D] p-3 rounded-2xl border border-white/5">
                  <span className="block text-2xl font-black text-[#E1C58B]">{countdown.seconds}</span>
                  <span className="text-[10px] text-zinc-400 font-bold">ثانية</span>
                </div>
              </div>

              <p className="text-xs text-zinc-300 font-semibold line-clamp-1">
                {nextEp.title_ar}
              </p>
            </div>
          )}

          {/* Previous Episodes Mini List */}
          {data.recentEpisodes && data.recentEpisodes.length > 0 && (
            <div className="bg-[#101726]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-6 space-y-4 shadow-xl">
              <h4 className="font-extrabold text-sm text-zinc-200 border-b border-zinc-800 pb-3 flex items-center justify-between">
                <span>الحلقات السابقة المتاحة</span>
                <span className="text-xs text-[#087C7B] font-mono">أرشيف اللغز</span>
              </h4>

              <div className="space-y-3">
                {data.recentEpisodes.slice(0, 3).map((ep) => (
                  <Link
                    key={ep.id}
                    href={`/mystery/${ep.slug || ep.id}`}
                    className="flex items-center gap-3 p-2.5 rounded-2xl bg-black/40 border border-white/5 hover:border-[#C5A15B]/50 transition-all group"
                  >
                    <img
                      src={ep.cover_image_url || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=200&q=80'}
                      alt={ep.title_ar}
                      className="w-14 h-14 object-cover rounded-xl shrink-0 border border-white/10"
                    />
                    <div className="space-y-1 min-w-0">
                      <span className="text-[10px] font-bold text-[#E1C58B] block">
                        الحلقة #{ep.episode_number}
                      </span>
                      <h5 className="text-xs font-bold text-white group-hover:text-[#E1C58B] transition-colors truncate">
                        {ep.title_ar}
                      </h5>
                      <span className="text-[10px] text-zinc-500 font-mono block">
                        {ep.reading_time_minutes || 3} دقائق قراءة
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
