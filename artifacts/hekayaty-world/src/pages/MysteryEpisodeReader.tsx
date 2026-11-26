import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'wouter';
import { motion } from 'framer-motion';
import { SEOHead } from '@/components/common/SEOHead';
import { SocialShareModal } from '@/components/common/SocialShareModal';
import { api } from '@/lib/api';
import {
  Key,
  Clock,
  Calendar,
  Share2,
  Heart,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  ArrowRight,
  Sparkles,
  Layers,
  CheckCircle,
} from 'lucide-react';

export default function MysteryEpisodeReader() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const [episode, setEpisode] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'huge'>('normal');
  const [liked, setLiked] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    api
      .getMysteryEpisodeDetail(slug)
      .then((data) => {
        setEpisode(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug]);

  const handleLike = async () => {
    if (liked || !episode) return;
    setLiked(true);
    try {
      await api.likeMysteryEpisode(episode.id);
    } catch {}
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070B14] flex items-center justify-center font-arabic" dir="rtl">
        <div className="w-12 h-12 rounded-full border-4 border-[#C5A15B]/30 border-t-[#C5A15B] animate-spin" />
      </div>
    );
  }

  if (!episode) {
    return (
      <div className="min-h-screen bg-[#070B14] flex flex-col items-center justify-center gap-4 text-white font-arabic p-4" dir="rtl">
        <Key className="w-16 h-16 text-[#C5A15B]" />
        <h2 className="text-2xl font-bold">الحلقة غير موجودة أو لم تنشر بعد</h2>
        <p className="text-zinc-400 text-sm">تأكد من رقم الحلقة أو تصفح الأرشيف الكامل.</p>
        <Link href="/mystery">
          <button className="px-6 py-2.5 rounded-xl bg-[#C5A15B] text-black font-bold text-sm">
            العودة لأرشيف الألغاز
          </button>
        </Link>
      </div>
    );
  }

  const fontClass =
    fontSize === 'huge' ? 'text-2xl leading-[2.4]' :
    fontSize === 'large' ? 'text-xl leading-[2.2]' :
    'text-lg leading-[2.0]';

  return (
    <div className="min-h-screen bg-[#070B14] text-white font-arabic notranslate relative" dir="rtl" translate="no">
      <SEOHead
        title={`${episode.title_ar} | لغز حكاياتي اليومي`}
        description={episode.short_description_ar || episode.content_ar?.slice(0, 150)}
        ogImage={episode.cover_image_url}
        ogType="article"
      />

      <SocialShareModal
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        title={episode.title_ar}
        description={episode.short_description_ar}
        imageUrl={episode.cover_image_url}
      />

      {/* Hero Header */}
      <div className="relative min-h-[420px] flex flex-col justify-end overflow-hidden pb-10 pt-24">
        <div className="absolute inset-0 z-0">
          <img
            src={episode.cover_image_url || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80'}
            alt={episode.title_ar}
            className="w-full h-full object-cover object-center filter brightness-[0.4] contrast-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#070B14] via-[#070B14]/80 to-transparent" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 w-full space-y-4">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <Link href="/" className="hover:text-white transition-colors">
              الرئيسية
            </Link>
            <ChevronLeft className="w-3.5 h-3.5" />
            <Link href="/mystery" className="hover:text-white transition-colors">
              لغز حكاياتي
            </Link>
            <ChevronLeft className="w-3.5 h-3.5" />
            <span className="text-[#E1C58B] font-bold">الحلقة #{episode.episode_number}</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="px-3.5 py-1 rounded-full text-xs font-black bg-[#C5A15B] text-black shadow-lg">
              الحلقة #{episode.episode_number}
            </span>
            <span className="text-xs text-[#E1C58B] font-semibold bg-black/60 px-3 py-1 rounded-full border border-white/10">
              {episode.series_title_ar || 'لغز حكاياتي'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white leading-tight drop-shadow-md">
            {episode.title_ar}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400 font-mono pt-2">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>{episode.reading_time_minutes || 3} دقائق قراءة</span>
            </span>
            {episode.publication_date && (
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#087C7B]" />
                <span>{new Date(episode.publication_date).toLocaleDateString('ar-EG', { dateStyle: 'full' })}</span>
              </span>
            )}
            {episode.author_name && (
              <span>بقلم: {episode.author_name}</span>
            )}
          </div>
        </div>
      </div>

      {/* Reading Controls Toolbar */}
      <div className="sticky top-16 z-30 bg-[#0C1220]/90 backdrop-blur-xl border-y border-white/10 py-3 shadow-md">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-4">
          {/* Font Size Adjusters */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-zinc-400 font-bold hidden sm:inline">حجم الخط:</span>
            <button
              onClick={() => setFontSize('normal')}
              className={`px-2.5 py-1 rounded-lg border text-xs font-bold transition-all ${
                fontSize === 'normal'
                  ? 'bg-[#C5A15B] text-black border-[#C5A15B]'
                  : 'bg-black/40 text-zinc-300 border-white/10 hover:border-white/20'
              }`}
            >
              عادي
            </button>
            <button
              onClick={() => setFontSize('large')}
              className={`px-2.5 py-1 rounded-lg border text-xs font-bold transition-all ${
                fontSize === 'large'
                  ? 'bg-[#C5A15B] text-black border-[#C5A15B]'
                  : 'bg-black/40 text-zinc-300 border-white/10 hover:border-white/20'
              }`}
            >
              كبير
            </button>
            <button
              onClick={() => setFontSize('huge')}
              className={`px-2.5 py-1 rounded-lg border text-xs font-bold transition-all ${
                fontSize === 'huge'
                  ? 'bg-[#C5A15B] text-black border-[#C5A15B]'
                  : 'bg-black/40 text-zinc-300 border-white/10 hover:border-white/20'
              }`}
            >
              ضخم
            </button>
          </div>

          {/* Social Share & Like */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleLike}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
                liked
                  ? 'bg-red-500/20 text-red-400 border-red-500/40'
                  : 'bg-black/40 text-zinc-300 border-white/15 hover:border-white/30'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${liked ? 'fill-current' : ''}`} />
              <span>{liked ? 'أعجبك' : 'إعجاب'}</span>
            </button>

            <button
              onClick={() => setShareOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-black/40 border border-white/15 text-zinc-300 hover:text-white hover:border-white/30 text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>مشاركة</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Narrative Reading Area */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-8">
        {/* Clues Box */}
        {episode.clues && episode.clues.length > 0 && (
          <div className="p-4 sm:p-5 rounded-2xl bg-[#0F172A] border border-[#C5A15B]/30 shadow-lg space-y-2">
            <span className="text-xs font-bold text-[#E1C58B] flex items-center gap-1.5">
              <Key className="w-4 h-4 text-amber-400" />
              <span>القرائن والمفاتيح في هذه الحلقة:</span>
            </span>
            <div className="flex flex-wrap gap-2 pt-1">
              {episode.clues.map((c: string, i: number) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-xl bg-black/50 border border-white/10 text-xs font-bold text-amber-200"
                >
                  🔍 {c}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Narrative Prose */}
        <article
          className={`text-zinc-200 whitespace-pre-line tracking-wide font-normal selection:bg-[#C5A15B] selection:text-black ${fontClass}`}
        >
          {episode.content_ar}
        </article>

        {/* Episode Footer & Navigation */}
        <div className="pt-12 border-t border-zinc-800 space-y-8">
          <div className="bg-[#0F172A] p-6 rounded-3xl border border-white/10 text-center space-y-3">
            <span className="text-3xl">✨</span>
            <h4 className="text-lg font-black text-white">انتهت الحلقة #{episode.episode_number}</h4>
            <p className="text-xs text-zinc-400 max-w-md mx-auto">
              ترقب الحلقة القادمة غداً عبر منصة حكاياتي مع اكتشاف سر ومفتاح جديد في اللغز.
            </p>
          </div>

          {/* Prev / Next Episode Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {episode.prevEpisode ? (
              <Link
                href={`/mystery/${episode.prevEpisode.slug || episode.prevEpisode.id}`}
                className="p-4 rounded-2xl bg-black/40 border border-white/10 hover:border-[#C5A15B] transition-all flex items-center justify-between group"
              >
                <div>
                  <span className="text-[10px] text-zinc-500 font-bold block">الحلقة السابقة</span>
                  <h5 className="text-sm font-bold text-white group-hover:text-[#E1C58B] truncate">
                    {episode.prevEpisode.title_ar}
                  </h5>
                </div>
                <ChevronRight className="w-5 h-5 text-zinc-400 group-hover:text-[#C5A15B] group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : <div />}

            {episode.nextEpisode ? (
              <Link
                href={`/mystery/${episode.nextEpisode.slug || episode.nextEpisode.id}`}
                className="p-4 rounded-2xl bg-black/40 border border-white/10 hover:border-[#C5A15B] transition-all flex items-center justify-between group sm:text-left"
              >
                <div>
                  <span className="text-[10px] text-zinc-500 font-bold block">الحلقة التالية</span>
                  <h5 className="text-sm font-bold text-white group-hover:text-[#E1C58B] truncate">
                    {episode.nextEpisode.title_ar}
                  </h5>
                </div>
                <ChevronLeft className="w-5 h-5 text-zinc-400 group-hover:text-[#C5A15B] group-hover:-translate-x-1 transition-transform" />
              </Link>
            ) : <div />}
          </div>
        </div>
      </div>
    </div>
  );
}
