import React, { useState } from 'react';
import { useRoute, Link } from 'wouter';
import { useCharacter, useCharacters, useWorlds, useComics, useTimeline } from '@/lib/hooks';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Shield,
  Zap,
  Globe,
  BookOpen,
  Award,
  ChevronLeft,
  AlertTriangle,
  Users,
  Clock,
  Sparkles,
  Activity,
  Share2,
} from 'lucide-react';
import { useAppStore } from '@/stores/useAppStore';
import { useToast } from '@/hooks/use-toast';
import { SEOHead } from '@/components/common/SEOHead';
import { SocialShareModal } from '@/components/common/SocialShareModal';

export default function CharacterDetail() {
  const [, params] = useRoute('/characters/:id');
  const characterId = params?.id || '';
  const { data: character } = useCharacter(characterId);
  const { data: characters = [] } = useCharacters();
  const { data: worlds = [] } = useWorlds();
  const { data: comics = [] } = useComics();
  const { data: timelineEvents = [] } = useTimeline();
  const { addToFavorites, isInFavorites, removeFromFavorites } = useAppStore();
  const { toast } = useToast();
  const [shareOpen, setShareOpen] = useState(false);

  if (!character) {
    return (
      <div className="min-h-screen py-20 px-4 text-center font-arabic" dir="rtl">
        <h2 className="text-2xl font-bold text-[#2A1F17] dark:text-white mb-2">الشخصية غير موجودة</h2>
        <p className="text-sm text-[#604735] dark:text-zinc-400 mb-6">ربما تم حذفها أو أن الرابط غير صحيح.</p>
        <Link
          href="/characters"
          className="px-6 py-2.5 rounded-xl bg-[#087C7B] hover:bg-[#075B5C] text-[#F7F1E6] font-semibold text-sm"
        >
          العودة لسجل الشخصيات
        </Link>
      </div>
    );
  }

  const world = worlds.find((w) => w.id === character.worldId);
  const relatedComics = comics.filter((c) => character.comicIds?.includes(c.id));
  const relatedChars = characters.filter((c) => character.relatedCharacterIds?.includes(c.id));
  const events = timelineEvents.filter((t) => character.timelineEventIds?.includes(t.id));

  const isFav = isInFavorites(character.id, 'character');

  const toggleFavorite = () => {
    if (isFav) {
      removeFromFavorites(character.id, 'character');
      toast({ title: 'تمت الإزالة من المفضلة' });
    } else {
      addToFavorites({ id: character.id, type: 'character' });
      toast({ title: 'تمت الإضافة إلى مفضلتك' });
    }
  };

  const statLabels: Record<string, string> = {
    strength: 'القوة الجسدية',
    speed: 'السرعة والمناورة',
    durability: 'الصلابة والتحمل',
    intelligence: 'الذكاء والتكتيك',
    magic: 'السحر والطاقة',
    combat: 'مهارة القتال',
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto font-arabic notranslate" dir="rtl" translate="no">
      <SEOHead
        title={`${character.nameAr} (${character.aliasAr})`}
        description={character.bioAr || `سجل شخصية ${character.nameAr} في الأكوان القصصية`}
        ogImage={character.image}
        ogType="profile"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Person',
          name: character.nameAr,
          alternateName: character.aliasAr,
          image: character.image,
          description: character.bioAr,
        }}
      />

      <SocialShareModal
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        title={`${character.nameAr} — ${character.aliasAr}`}
        description={character.bioAr}
        imageUrl={character.image}
        contentType="character"
        contentId={character.id}
      />
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-[#604735] dark:text-zinc-400 mb-8">
        <Link href="/" className="hover:text-[#087C7B] dark:hover:text-white transition-colors">
          الرئيسية
        </Link>
        <ChevronLeft className="w-3.5 h-3.5" />
        <Link href="/characters" className="hover:text-[#087C7B] dark:hover:text-white transition-colors">
          الشخصيات
        </Link>
        <ChevronLeft className="w-3.5 h-3.5" />
        <span className="text-[#087C7B] dark:text-[#E1C58B] font-semibold">{character.nameAr}</span>
      </div>

      {/* Hero Banner Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
        {/* Left Column: Portrait */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="relative rounded-3xl overflow-hidden border border-[#D8C5A8] dark:border-[#C5A15B]/30 bg-[#EFE5D4] dark:bg-zinc-950 aspect-[3/4] shadow-xl">
            <img
              src={character.image}
              alt={character.nameAr}
              className="w-full h-full object-cover object-top"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#111C2B] via-transparent to-transparent opacity-80" />

            <div className="absolute bottom-4 right-4 left-4 flex items-center justify-between">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#087C7B] dark:bg-[#C5A15B] text-[#F7F1E6] dark:text-[#111C2B]">
                {character.aliasAr}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShareOpen(true)}
                  className="p-1.5 rounded-xl text-xs font-semibold backdrop-blur-md border bg-black/60 text-white border-white/20 hover:border-[#087C7B] dark:hover:border-[#C5A15B] transition-all"
                  title="مشاركة البطل"
                  aria-label="مشاركة البطل"
                >
                  <Share2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={toggleFavorite}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold backdrop-blur-md border transition-all ${
                    isFav
                      ? 'bg-red-500/20 text-red-400 border-red-500/40'
                      : 'bg-black/60 text-white border-white/20 hover:border-[#087C7B] dark:hover:border-[#C5A15B]'
                  }`}
                >
                  {isFav ? '♥ في المفضلة' : '♡ أضف للمفضلة'}
                </button>
              </div>
            </div>
          </div>

          {/* Quick stats grid */}
          <div className="glass-panel p-5 rounded-2xl space-y-3">
            <h4 className="text-sm font-bold text-[#2A1F17] dark:text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#087C7B] dark:text-[#C5A15B]" />
              <span>مؤشرات القوة القتالية</span>
            </h4>

            {/* Cinematic Power Rating Meter */}
            {(() => {
              const rawRating = character.powerRating ?? character.stats?.powerRating;
              if (rawRating !== undefined && rawRating !== null) {
                const rating = Number(rawRating);
                const ratingColor =
                  rating >= 90 ? '#ef4444' :
                  rating >= 70 ? '#f97316' :
                  rating >= 50 ? '#C5A15B' : '#087C7B';
                return (
                  <div className="p-3 rounded-xl bg-gradient-to-r from-[#0B1320] to-[#162235] border border-[#C5A15B]/30 mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-[#C5A15B]" />
                        تقييم القوة الإجمالي
                      </span>
                      <span className="text-2xl font-black" style={{ color: ratingColor }}>
                        {rating}<span className="text-sm text-zinc-500 font-normal">/100</span>
                      </span>
                    </div>
                    <div className="h-2.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${rating}%` }}
                        transition={{ duration: 1.2, ease: 'easeOut' }}
                        className="h-full rounded-full"
                        style={{ background: `linear-gradient(to left, ${ratingColor}, ${ratingColor}88)` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-zinc-500 mt-1">
                      <span>ضعيف</span>
                      <span className="text-zinc-400 font-semibold">
                        {rating >= 90 ? '🔴 كوني / أسطوري' :
                         rating >= 70 ? '🟠 قوة عالية' :
                         rating >= 50 ? '🟡 متوسط' : '🔵 عادي'}
                      </span>
                      <span>كوني</span>
                    </div>
                  </div>
                );
              }
              return null;
            })()}

            <div className="space-y-2.5">
              {Object.entries(character.stats).filter(([k]) => k !== 'powerRating').map(([statKey, val]) => (
                <div key={statKey}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[#604735] dark:text-zinc-400">{statLabels[statKey] || statKey}</span>
                    <span className="text-[#087C7B] dark:text-[#E1C58B] font-semibold">{val}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-[#D8C5A8]/40 dark:bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${val}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className="h-full bg-gradient-to-l from-[#087C7B] to-[#119B98] dark:from-[#C5A15B] dark:to-[#927849] rounded-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Bio & Dossier */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-6">
            {/* Header info */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#087C7B]/10 dark:bg-[#C5A15B]/15 text-[#087C7B] dark:text-[#E1C58B] border border-[#087C7B]/30 dark:border-[#C5A15B]/30">
                  {character.classification === 'original'
                    ? 'شخصية أصلية'
                    : character.classification === 'hekayaty_selected'
                    ? 'حكاياتي المختارة'
                    : 'تعاون رسمي'}
                </span>
                {world && (
                  <Link
                    href={`/worlds/${world.id}`}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#EFE5D4] dark:bg-white/5 text-[#2A1F17] dark:text-zinc-300 hover:text-[#087C7B] dark:hover:text-white border border-[#D8C5A8] dark:border-white/10"
                  >
                    <Globe className="w-3.5 h-3.5 text-[#087C7B] dark:text-[#C5A15B]" />
                    <span>عالم {world.nameAr}</span>
                  </Link>
                )}
              </div>
              <h1 className="text-3xl sm:text-5xl font-bold text-[#2A1F17] dark:text-white mb-1">
                {character.nameAr}
              </h1>
              <p className="text-base text-[#087C7B] dark:text-[#E1C58B] font-semibold">{character.nameEn}</p>
            </div>

            {/* Biography */}
            <div>
              <h3 className="text-sm font-bold text-[#2A1F17] dark:text-zinc-300 mb-2">السيرة الذاتية</h3>
              <p className="text-sm sm:text-base text-[#604735] dark:text-zinc-300 leading-relaxed">
                {character.bioAr}
              </p>
            </div>

            {/* Origin Story */}
            <div className="p-4 rounded-2xl bg-[#EFE5D4]/70 dark:bg-white/[0.02] border border-[#D8C5A8] dark:border-white/5">
              <h3 className="text-sm font-bold text-[#087C7B] dark:text-[#E1C58B] mb-1.5 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                <span>قصة البداية والأصل</span>
              </h3>
              <p className="text-xs sm:text-sm text-[#604735] dark:text-zinc-300 leading-relaxed">
                {character.originAr}
              </p>
            </div>

            {/* Powers and Weaknesses */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-[#087C7B]/5 dark:bg-emerald-500/[0.03] border border-[#087C7B]/20 dark:border-emerald-500/20">
                <h4 className="text-xs font-bold text-[#087C7B] dark:text-emerald-400 mb-2.5 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" />
                  <span>القدرات والخوارق</span>
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {character.powersAr.map((p, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-[#087C7B]/10 dark:bg-emerald-500/10 text-[#087C7B] dark:text-emerald-300 text-xs border border-[#087C7B]/20 dark:border-emerald-500/20"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-red-500/[0.03] border border-red-500/20">
                <h4 className="text-xs font-bold text-red-600 dark:text-red-400 mb-2.5 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>نقاط الضعف والتحديات</span>
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {character.weaknessesAr.map((w, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-red-500/10 text-red-700 dark:text-red-300 text-xs border border-red-500/20"
                    >
                      {w}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Affiliations & Metadata */}
            <div className="pt-4 border-t border-[#D8C5A8]/50 dark:border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs text-[#604735] dark:text-zinc-400">
              <div>
                <span className="font-semibold text-[#2A1F17] dark:text-zinc-300">الانتماءات: </span>
                <span>{character.affiliationsAr.join(' • ')}</span>
              </div>
              {character.firstAppearance && (
                <div>
                  <span className="font-semibold text-[#2A1F17] dark:text-zinc-300">أول ظهور: </span>
                  <span className="text-[#087C7B] dark:text-[#E1C58B] font-bold">{character.firstAppearance}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Related Comics Section */}
      {relatedComics.length > 0 && (
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-[#2A1F17] dark:text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#087C7B] dark:text-[#C5A15B]" />
              <span>إصدارات ظهرت فيها الشخصية ({relatedComics.length})</span>
            </h3>
            <Link href="/comics" className="text-xs text-[#087C7B] dark:text-[#E1C58B] hover:underline font-semibold">
              عرض كل الكوميكس ←
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {relatedComics.map((comic) => (
              <Link
                key={comic.id}
                href={`/comics/${comic.id}`}
                className="group rounded-2xl overflow-hidden bg-[#FAF5ED] dark:bg-zinc-950 border border-[#D8C5A8] dark:border-white/10 hover:border-[#087C7B] dark:hover:border-[#C5A15B]/50 p-3 transition-all shadow-sm"
              >
                <div className="aspect-[2/3] rounded-xl overflow-hidden mb-2.5 bg-[#EFE5D4] dark:bg-zinc-900">
                  <img
                    src={comic.coverImage}
                    alt={comic.titleAr}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <h4 className="text-xs font-bold text-[#2A1F17] dark:text-white group-hover:text-[#087C7B] dark:group-hover:text-[#E1C58B] transition-colors truncate">
                  {comic.titleAr}
                </h4>
                <span className="text-[10px] text-[#604735] dark:text-zinc-400">العدد #{comic.issueNumber}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Related Characters */}
      {relatedChars.length > 0 && (
        <div className="mb-12">
          <h3 className="text-xl font-bold text-[#2A1F17] dark:text-white mb-6 flex items-center gap-2">
            <Users className="w-5 h-5 text-[#087C7B] dark:text-[#C5A15B]" />
            <span>شخصيات ذات صلة</span>
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {relatedChars.map((rc) => (
              <Link
                key={rc.id}
                href={`/characters/${rc.id}`}
                className="p-3.5 rounded-2xl bg-[#FAF5ED] dark:bg-zinc-950 border border-[#D8C5A8] dark:border-white/10 hover:border-[#087C7B] dark:hover:border-[#C5A15B]/40 flex items-center gap-3 transition-all group shadow-sm"
              >
                <img
                  src={rc.image}
                  alt={rc.nameAr}
                  className="w-12 h-12 rounded-full object-cover shrink-0 border border-[#D8C5A8] dark:border-white/10 group-hover:border-[#087C7B] dark:group-hover:border-[#C5A15B]"
                />
                <div className="overflow-hidden">
                  <h4 className="text-sm font-bold text-[#2A1F17] dark:text-white group-hover:text-[#087C7B] dark:group-hover:text-[#E1C58B] truncate">
                    {rc.nameAr}
                  </h4>
                  <span className="text-xs text-[#604735] dark:text-zinc-400">{rc.aliasAr}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Timeline Events */}
      {events.length > 0 && (
        <div className="mb-12">
          <h3 className="text-xl font-bold text-[#2A1F17] dark:text-white mb-6 flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#087C7B] dark:text-[#C5A15B]" />
            <span>محطات تاريخية شاركت فيها الشخصية</span>
          </h3>
          <div className="space-y-3">
            {events.map((ev) => (
              <div
                key={ev.id}
                className="p-4 rounded-2xl bg-[#EFE5D4]/70 dark:bg-white/[0.02] border border-[#D8C5A8] dark:border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div>
                  <span className="text-xs text-[#087C7B] dark:text-[#E1C58B] font-semibold">{ev.year}</span>
                  <h4 className="text-sm font-bold text-[#2A1F17] dark:text-white mt-0.5">{ev.titleAr}</h4>
                  <p className="text-xs text-[#604735] dark:text-zinc-400 mt-1">{ev.descriptionAr}</p>
                </div>
                <Link
                  href="/timeline"
                  className="text-xs text-[#087C7B] dark:text-[#E1C58B] hover:underline shrink-0 font-medium"
                >
                  عرض في الخط الزمني ←
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
