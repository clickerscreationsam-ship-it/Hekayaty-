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
  Heart,
  Flame,
  Swords,
  Scroll,
} from 'lucide-react';
import { useAppStore } from '@/stores/useAppStore';
import { useToast } from '@/hooks/use-toast';
import { SEOHead } from '@/components/common/SEOHead';
import { SocialShareModal } from '@/components/common/SocialShareModal';
import { getCharacterRarity } from '@/components/characters/LegendaryCharacterCard';

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
      <div className="min-h-screen py-24 px-4 text-center font-arabic bg-[#070B12] text-white" dir="rtl">
        <span className="text-6xl mb-4 block">🔮</span>
        <h2 className="text-2xl font-bold mb-2">الشخصية غير موجودة</h2>
        <p className="text-sm text-zinc-400 mb-6">ربما تم حذفها أو أن الرابط غير صحيح.</p>
        <Link
          href="/characters"
          className="px-6 py-2.5 rounded-xl bg-[#C5A15B] text-black font-bold text-sm shadow-lg hover:scale-105 transition-all"
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

  const rarity = getCharacterRarity(character);
  const rawRating = character.powerRating ?? character.stats?.powerRating ?? 60;
  const ratingNum = Number(rawRating);

  const ratingColor =
    ratingNum >= 95 ? '#ef4444' :
    ratingNum >= 85 ? '#C5A15B' :
    ratingNum >= 70 ? '#a855f7' : '#087C7B';

  const statLabels: Record<string, string> = {
    strength: 'القوة الجسدية والضربات',
    speed: 'السرعة والمناورة والتحليق',
    durability: 'الصلابة والدروع والتحمل',
    intelligence: 'الذكاء والتخطيط التكتيكي',
    magic: 'السحر والطاقة الكوزمية',
    combat: 'مهارات النزال والمواجهة',
  };

  return (
    <div className="relative min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-[1440px] mx-auto font-arabic notranslate text-white bg-[#070B12] overflow-hidden" dir="rtl" translate="no">
      <SEOHead
        title={`${character.nameAr} (${character.aliasAr || character.nameEn}) | بطاقة البطل وسجل القوة`}
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

      {/* ─────────────────────────────────────────────────────────────────────────────
          1. IMMERSIVE FULL-PAGE ARTWORK BACKGROUND
          ───────────────────────────────────────────────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <img
          src={character.image}
          alt={character.nameAr}
          className="w-full h-full object-cover object-top filter brightness-[0.35] contrast-110 saturate-125"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#070B12] via-[#070B12]/85 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#070B12] via-[#070B12]/60 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-transparent via-[#070B12]/50 to-[#070B12]" />
      </div>

      <div className="relative z-10 space-y-8">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <Link href="/" className="hover:text-white transition-colors">
            الرئيسية
          </Link>
          <ChevronLeft className="w-3.5 h-3.5" />
          <Link href="/characters" className="hover:text-white transition-colors">
            سجل الشخصيات
          </Link>
          <ChevronLeft className="w-3.5 h-3.5" />
          <span className="text-[#E1C58B] font-bold">{character.nameAr}</span>
        </div>

        {/* ─────────────────────────────────────────────────────────────────────────────
            2. HERO SECTION: CINEMATIC SPLIT SHOWCASE
            ───────────────────────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Right Column (RTL): Large Unobscured Character Artwork Portrait */}
          <div className="lg:col-span-5 space-y-4">
            <div className="relative rounded-3xl overflow-hidden border-2 border-[#C5A15B]/50 shadow-[0_0_50px_rgba(197,161,91,0.35)] bg-black/80 aspect-[4/5] group">
              <img
                src={character.image}
                alt={character.nameAr}
                className="w-full h-full object-cover object-top transform group-hover:scale-105 transition-transform duration-700"
              />

              {/* Minimal soft shadow at the bottom for controls */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#070B12] via-transparent to-transparent opacity-90" />

              {/* Top Badges */}
              <div className="absolute top-4 right-4 left-4 flex items-center justify-between pointer-events-none">
                <span className="px-3.5 py-1 rounded-full text-xs font-black bg-black/70 backdrop-blur-md border border-[#C5A15B]/50 text-[#E1C58B] shadow-xl">
                  {character.aliasAr || character.nameAr}
                </span>

                <div
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-black/80 border shadow-xl"
                  style={{ borderColor: ratingColor, color: ratingColor }}
                >
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  <span>مؤشر القوة {ratingNum}</span>
                </div>
              </div>

              {/* Floating Action Buttons */}
              <div className="absolute bottom-4 right-4 left-4 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShareOpen(true)}
                    className="p-2.5 rounded-xl text-xs font-bold backdrop-blur-md border bg-black/70 text-white border-white/20 hover:border-[#C5A15B] transition-all shadow-lg flex items-center gap-1.5"
                    title="مشاركة البطل"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>مشاركة</span>
                  </button>

                  <button
                    type="button"
                    onClick={toggleFavorite}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold backdrop-blur-md border transition-all shadow-lg flex items-center gap-1.5 ${
                      isFav
                        ? 'bg-red-500/20 text-red-400 border-red-500/40'
                        : 'bg-black/70 text-white border-white/20 hover:border-[#C5A15B]'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
                    <span>{isFav ? 'في المفضلة' : 'إضافة للمفضلة'}</span>
                  </button>
                </div>

                {world && (
                  <Link
                    href={`/worlds/${world.id}`}
                    className="px-3 py-2 rounded-xl text-xs font-bold bg-black/70 backdrop-blur-md text-[#E1C58B] border border-white/20 hover:border-[#C5A15B] flex items-center gap-1.5"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>{world.nameAr}</span>
                  </Link>
                )}
              </div>
            </div>

            {/* Overall Power Level Meter Card */}
            <div className="bg-[#0D1524]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-5 space-y-3 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-300 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[#C5A15B]" />
                  <span>المستوى الكوزمي العام</span>
                </span>
                <span className="text-2xl font-black" style={{ color: ratingColor }}>
                  {ratingNum}<span className="text-xs text-zinc-500 font-normal">/100</span>
                </span>
              </div>

              <div className="h-3 w-full bg-black/60 rounded-full overflow-hidden p-0.5 border border-white/10">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${ratingNum}%` }}
                  transition={{ duration: 1.2, ease: 'easeOut' }}
                  className="h-full rounded-full"
                  style={{ background: `linear-gradient(to left, ${ratingColor}, ${ratingColor}88)` }}
                />
              </div>

              {/* Individual Stats Bars */}
              {character.stats && (
                <div className="space-y-2.5 pt-3 border-t border-white/10">
                  {Object.entries(character.stats)
                    .filter(([k]) => k !== 'powerRating')
                    .map(([statKey, val]) => (
                      <div key={statKey}>
                        <div className="flex justify-between text-xs mb-1 font-medium">
                          <span className="text-zinc-400">{statLabels[statKey] || statKey}</span>
                          <span className="text-[#E1C58B] font-bold font-mono">{val}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-black/60 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${val}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                            className="h-full bg-gradient-to-l from-[#C5A15B] to-[#087C7B] rounded-full"
                          />
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>

          {/* Left Column (RTL): Dossier & Rich Lore Content */}
          <div className="lg:col-span-7 space-y-6">
            {/* Identity Header */}
            <div className="bg-[#0D1524]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="px-3 py-1 rounded-full text-xs font-black bg-[#C5A15B]/20 text-[#E1C58B] border border-[#C5A15B]/40">
                  {character.classification === 'original'
                    ? 'شخصية أصلية'
                    : character.classification === 'hekayaty_selected'
                    ? 'حكاياتي المختارة'
                    : 'تعاون رسمي'}
                </span>

                <span className="px-3 py-1 rounded-full text-xs font-black bg-black/60 text-zinc-300 border border-white/15">
                  {character.alignment === 'hero'
                    ? '🛡️ بطل حليف'
                    : character.alignment === 'villain'
                    ? '⚔️ خصم وشرير'
                    : '🔮 كيان غامض'}
                </span>

                <span className="px-3 py-1 rounded-full text-xs font-black uppercase" style={{ color: ratingColor }}>
                  فئة {rarity}
                </span>
              </div>

              <div>
                <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight drop-shadow-md">
                  {character.nameAr}
                </h1>
                {character.nameEn && (
                  <p className="text-base text-zinc-400 font-mono mt-1" dir="ltr">
                    {character.nameEn}
                  </p>
                )}
              </div>

              {/* Bio Text */}
              <div className="pt-2 border-t border-white/10">
                <h3 className="text-sm font-bold text-[#C5A15B] mb-2 flex items-center gap-2">
                  <Scroll className="w-4 h-4" />
                  <span>السيرة الذاتية</span>
                </h3>
                <p className="text-zinc-200 text-base leading-relaxed whitespace-pre-line">
                  {character.bioAr || 'شخصية محورية في صياغة أحداث ووقائع هذا العالم.'}
                </p>
              </div>

              {/* Origin Story */}
              {character.originAr && (
                <div className="pt-4 border-t border-white/10 space-y-2">
                  <h3 className="text-sm font-bold text-teal-400 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    <span>قصة البداية والأصل الكوزمي</span>
                  </h3>
                  <p className="text-zinc-300 text-sm sm:text-base leading-relaxed whitespace-pre-line bg-black/40 p-4 rounded-2xl border border-white/5">
                    {character.originAr}
                  </p>
                </div>
              )}
            </div>

            {/* Powers and Abilities Showcase */}
            {character.powersAr && character.powersAr.length > 0 && (
              <div className="bg-[#0D1524]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
                <h3 className="text-lg font-black text-white flex items-center gap-2 border-b border-white/10 pb-3">
                  <Zap className="w-5 h-5 text-amber-400" />
                  <span>القدرات والخوارق ({character.powersAr.length})</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {character.powersAr.map((power, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-black/50 border border-white/10 hover:border-[#C5A15B]/50 transition-all flex items-center gap-3 shadow-md"
                    >
                      <span className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center font-bold text-xs shrink-0">
                        ⚡
                      </span>
                      <span className="text-sm font-bold text-zinc-100">{power}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Weaknesses and Affiliations */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {character.weaknessesAr && character.weaknessesAr.length > 0 && (
                <div className="bg-[#0D1524]/90 backdrop-blur-xl border border-red-500/20 rounded-2xl p-5 space-y-3">
                  <h4 className="text-xs font-bold text-red-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    <span>نقاط الضعف والتحديات</span>
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {character.weaknessesAr.map((w, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg bg-red-950/40 border border-red-500/30 text-xs text-red-300 font-semibold">
                        {w}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {character.affiliationsAr && character.affiliationsAr.length > 0 && (
                <div className="bg-[#0D1524]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-5 space-y-3">
                  <h4 className="text-xs font-bold text-teal-400 flex items-center gap-1.5">
                    <Users className="w-4 h-4" />
                    <span>الانتماءات والتحالفات</span>
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {character.affiliationsAr.map((a, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg bg-teal-950/40 border border-teal-500/30 text-xs text-teal-300 font-semibold">
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Connected Comics and Stories */}
            {relatedComics.length > 0 && (
              <div className="bg-[#0D1524]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-6 space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#C5A15B]" />
                  <span>الظهور في القصص المصورة</span>
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {relatedComics.map((comic) => (
                    <Link
                      key={comic.id}
                      href={`/comics/${comic.id}`}
                      className="group/comic block p-2 rounded-xl bg-black/40 border border-white/5 hover:border-[#C5A15B] transition-all"
                    >
                      <img
                        src={comic.coverImage}
                        alt={comic.titleAr}
                        className="w-full aspect-[2/3] object-cover rounded-lg mb-2"
                      />
                      <h5 className="text-xs font-bold text-zinc-200 group-hover/comic:text-[#E1C58B] truncate">
                        {comic.titleAr}
                      </h5>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
