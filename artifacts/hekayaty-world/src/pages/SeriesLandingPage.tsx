import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'wouter';
import { motion } from 'framer-motion';
import { SEOHead } from '@/components/common/SEOHead';
import { SocialShareModal } from '@/components/common/SocialShareModal';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores/useAuthStore';
import {
  Layers,
  BookOpen,
  Play,
  Heart,
  Bookmark,
  Share2,
  Clock,
  Calendar,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Globe,
  Users,
  Eye,
  CheckCircle2,
  Lock,
} from 'lucide-react';

export default function SeriesLandingPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug || '';
  const { toast } = useToast();
  const { isAuthenticated } = useAuthStore();

  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSeasonId, setActiveSeasonId] = useState<string>('all');
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    api
      .getSeriesPlatformDetail(slug)
      .then((res) => {
        setData(res);
        if (res?.seasons?.length > 0) {
          setActiveSeasonId(res.seasons[0].id);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug]);

  const handleToggleFollow = async () => {
    if (!data?.series) return;
    if (!isAuthenticated) {
      toast({ title: 'يرجى تسجيل الدخول لمتابعة السلسلة وتلقي تنبيهات الفصول الجديدة.' });
      return;
    }
    try {
      const res = await api.toggleFollowSeries(data.series.id);
      setIsFollowing(res.following);
      toast({ title: res.message });
    } catch {}
  };

  const handleToggleFavorite = async () => {
    if (!data?.series) return;
    if (!isAuthenticated) {
      toast({ title: 'يرجى تسجيل الدخول لإضافة السلسلة إلى مفضلتك.' });
      return;
    }
    try {
      const res = await api.toggleFavoriteSeries(data.series.id);
      setIsFavorited(res.favorited);
      toast({ title: res.message });
    } catch {}
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070B14] flex items-center justify-center font-arabic" dir="rtl">
        <div className="w-12 h-12 rounded-full border-4 border-[#C5A15B]/30 border-t-[#C5A15B] animate-spin" />
      </div>
    );
  }

  if (!data || !data.series) {
    return (
      <div className="min-h-screen bg-[#070B14] flex flex-col items-center justify-center gap-4 text-white font-arabic p-4" dir="rtl">
        <Layers className="w-16 h-16 text-[#C5A15B]" />
        <h2 className="text-2xl font-bold">السلسلة غير موجودة</h2>
        <p className="text-zinc-400 text-sm">ربما تم تغيير المعرف أو لم تنشر بعد.</p>
        <Link href="/series">
          <button className="px-6 py-2.5 rounded-xl bg-[#C5A15B] text-black font-bold text-sm">
            العودة لفهرس السلاسل
          </button>
        </Link>
      </div>
    );
  }

  const { series, seasons = [], episodes = [], related_series = [], first_episode, latest_episode } = data;

  // Filter episodes by season
  const displayedEpisodes =
    activeSeasonId === 'all'
      ? episodes
      : episodes.filter((ep: any) => ep.season_id === activeSeasonId);

  return (
    <div className="min-h-screen bg-[#070B14] text-white font-arabic notranslate relative" dir="rtl" translate="no">
      <SEOHead
        title={`${series.title_ar} | سلاسل حكاياتي`}
        description={series.short_description_ar || series.description_ar}
        ogImage={series.cover_image_url}
        ogType="article"
      />

      <SocialShareModal
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        title={series.title_ar}
        description={series.short_description_ar}
        imageUrl={series.cover_image_url}
      />

      {/* ── 1. CINEMATIC HERO BANNER ────────────────────────────────────────── */}
      <div className="relative min-h-[520px] flex flex-col justify-end overflow-hidden pb-12 pt-28">
        <div className="absolute inset-0 z-0">
          <img
            src={series.banner_image_url || series.cover_image_url}
            alt={series.title_ar}
            className="w-full h-full object-cover object-center filter brightness-[0.35] contrast-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#070B14] via-[#070B14]/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#070B14]/90 via-[#070B14]/40 to-transparent" />
        </div>

        <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <Link href="/" className="hover:text-white transition-colors">الرئيسية</Link>
            <ChevronLeft className="w-3.5 h-3.5" />
            <Link href="/series" className="hover:text-white transition-colors">السلاسل</Link>
            <ChevronLeft className="w-3.5 h-3.5" />
            <span className="text-[#E1C58B] font-bold">{series.title_ar}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            {/* Poster Thumbnail */}
            <div className="lg:col-span-3 shrink-0">
              <div className="rounded-3xl overflow-hidden border-2 border-[#C5A15B]/50 shadow-2xl aspect-[3/4] max-w-[260px] mx-auto lg:mx-0 bg-black/60">
                <img src={series.cover_image_url} alt={series.title_ar} className="w-full h-full object-cover" />
              </div>
            </div>

            {/* Title & Metadata Details */}
            <div className="lg:col-span-9 space-y-4">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="px-3 py-1 rounded-full text-xs font-black bg-[#C5A15B] text-black">
                  {series.classification === 'original' ? '👑 إنتاج أصلي حصري' : '⭐ حكاياتي المختارة'}
                </span>

                <span className="px-3 py-1 rounded-full text-xs font-black bg-black/60 text-[#E1C58B] border border-white/10">
                  {series.format === 'novel' ? 'روايات متسلسلة' : series.format === 'comic' ? 'كوميكس مصور' : 'هجين روائي وكوميكس'}
                </span>

                <span className="px-3 py-1 rounded-full text-xs font-bold bg-black/60 text-zinc-300 border border-white/10">
                  {series.status === 'ongoing' ? '🟢 مستمرة النشر' : series.status === 'completed' ? '🔵 سلسلة مكتملة' : '🟡 قادمة'}
                </span>

                <span className="text-xs text-zinc-400 font-mono">
                  {seasons.length} مواسم • {episodes.length} فصول
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight drop-shadow-md">
                {series.title_ar}
              </h1>

              {series.title_en && (
                <p className="text-sm text-zinc-400 font-mono" dir="ltr">
                  {series.title_en}
                </p>
              )}

              <p className="text-sm sm:text-base text-zinc-200 leading-relaxed max-w-3xl">
                {series.short_description_ar || series.description_ar}
              </p>

              {/* Creator credits & schedule strip */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400 border-t border-white/10 pt-3">
                {series.author_name && (
                  <span>بقلم: <strong className="text-white">{series.author_name}</strong></span>
                )}
                {series.artist_name && (
                  <span>رسوم: <strong className="text-white">{series.artist_name}</strong></span>
                )}
                {series.publisher_name && (
                  <span>الناشر: <strong className="text-white">{series.publisher_name}</strong></span>
                )}
                {series.release_day_time && (
                  <span className="text-amber-300 font-mono">📅 {series.release_day_time}</span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                {first_episode && (
                  <Link href={`/series/${series.slug}/read/${first_episode.id}`}>
                    <button className="px-6 py-3 rounded-2xl bg-[#C5A15B] hover:bg-[#E5C77D] text-black font-black text-sm shadow-xl flex items-center gap-2 hover:scale-105 transition-all">
                      <Play className="w-4 h-4 fill-current" />
                      <span>ابدأ القراءة من الفصل 1</span>
                    </button>
                  </Link>
                )}

                {latest_episode && (
                  <Link href={`/series/${series.slug}/read/${latest_episode.id}`}>
                    <button className="px-5 py-3 rounded-2xl bg-[#087C7B] hover:bg-[#0AA3A2] text-white font-bold text-xs shadow-lg flex items-center gap-1.5 transition-all">
                      <span>آخر فصل صادر (#{latest_episode.episode_number})</span>
                    </button>
                  </Link>
                )}

                <button
                  onClick={handleToggleFollow}
                  className={`px-4 py-3 rounded-2xl border text-xs font-bold flex items-center gap-2 transition-all ${
                    isFollowing
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-black/60 text-white border-white/20 hover:border-[#C5A15B]'
                  }`}
                >
                  <Bookmark className={`w-4 h-4 ${isFollowing ? 'fill-current' : ''}`} />
                  <span>{isFollowing ? 'تتابع هذه السلسلة' : 'متابعة السلسلة'}</span>
                </button>

                <button
                  onClick={handleToggleFavorite}
                  className={`p-3 rounded-2xl border text-xs font-bold transition-all ${
                    isFavorited
                      ? 'bg-red-500/20 text-red-400 border-red-500/40'
                      : 'bg-black/60 text-white border-white/20 hover:border-red-400'
                  }`}
                  title="إضافة للمفضلة"
                >
                  <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
                </button>

                <button
                  onClick={() => setShareOpen(true)}
                  className="p-3 rounded-2xl bg-black/60 border border-white/20 text-white hover:border-[#C5A15B] text-xs font-bold transition-all"
                  title="مشاركة"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. SEASONS & CHAPTERS LIBRARY ──────────────────────────────────── */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* Season Switcher Tabs */}
        {seasons.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-xl font-black text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#C5A15B]" />
                <span>فهرس ومواسم السلسلة</span>
              </h3>
              <span className="text-xs text-zinc-400 font-mono">
                {displayedEpisodes.length} فصول متاحة
              </span>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              <button
                onClick={() => setActiveSeasonId('all')}
                className={`px-4 py-2 rounded-2xl text-xs font-bold shrink-0 transition-all ${
                  activeSeasonId === 'all'
                    ? 'bg-[#C5A15B] text-black shadow-md'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                }`}
              >
                جميع المواسم ({episodes.length})
              </button>

              {seasons.map((sea: any) => {
                const count = episodes.filter((e: any) => e.season_id === sea.id).length;
                return (
                  <button
                    key={sea.id}
                    onClick={() => setActiveSeasonId(sea.id)}
                    className={`px-4 py-2 rounded-2xl text-xs font-bold shrink-0 transition-all ${
                      activeSeasonId === sea.id
                        ? 'bg-[#087C7B] text-white shadow-md'
                        : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                    }`}
                  >
                    {sea.title_ar} ({count})
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Episodes Grid Cards */}
        {displayedEpisodes.length === 0 ? (
          <div className="py-16 text-center text-zinc-500 bg-[#0B1220] rounded-3xl border border-white/5">
            <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-30 text-[#C5A15B]" />
            <h4 className="text-base font-bold text-white mb-1">لا توجد فصول منشورة في هذا الموسم بعد</h4>
            <p className="text-xs text-zinc-500">ترقب موعد الإصدار القادم وفق جدول النشر.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayedEpisodes.map((ep: any) => (
              <Link
                key={ep.id}
                href={`/series/${series.slug}/read/${ep.id}`}
                className="group block"
              >
                <div className="bg-[#0B1220] border border-white/10 group-hover:border-[#C5A15B]/50 rounded-2xl p-4 transition-all duration-300 shadow-lg flex items-center justify-between gap-3 group-hover:-translate-y-0.5">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-10 h-10 rounded-xl bg-black/60 border border-white/10 text-[#E1C58B] flex items-center justify-center font-black text-sm shrink-0 font-mono shadow">
                      #{ep.episode_number}
                    </span>

                    <div className="min-w-0 space-y-0.5">
                      <h4 className="font-bold text-sm text-white group-hover:text-[#E1C58B] transition-colors truncate">
                        {ep.title_ar}
                      </h4>
                      <div className="flex items-center gap-2.5 text-[11px] text-zinc-400 font-mono">
                        <span>{ep.content_type === 'comic' ? '🖼️ مصور' : '📖 روائي'}</span>
                        <span>•</span>
                        <span>{ep.reading_time_minutes || 5} دقائق</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-2 rounded-xl bg-black/40 text-[#C5A15B] group-hover:bg-[#C5A15B] group-hover:text-black transition-all shrink-0">
                    <ChevronLeft className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* ── 3. RELATED SERIES RECOMMENDATIONS ──────────────────────────────── */}
        {related_series.length > 0 && (
          <div className="space-y-4 pt-10 border-t border-zinc-800">
            <h3 className="text-xl font-black text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#C5A15B]" />
              <span>سلاسل أخرى قد تنال إعجابك</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {related_series.map((rel: any) => (
                <Link key={rel.id} href={`/series/${rel.slug || rel.id}`} className="group block">
                  <div className="bg-[#0B1220] border border-white/10 group-hover:border-[#C5A15B]/40 rounded-2xl overflow-hidden transition-all shadow-md">
                    <div className="aspect-[16/10] overflow-hidden bg-black/60">
                      <img src={rel.cover_image_url} alt={rel.title_ar} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    </div>
                    <div className="p-3.5 space-y-1">
                      <span className="text-[10px] text-[#C5A15B] font-bold block">{rel.genre}</span>
                      <h5 className="font-bold text-sm text-white group-hover:text-[#E1C58B] truncate">{rel.title_ar}</h5>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
