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
  Star,
  Sword,
  Crown,
  Eye,
  Dna,
  Target,
} from 'lucide-react';
import { useAppStore } from '@/stores/useAppStore';
import { useToast } from '@/hooks/use-toast';
import { SEOHead } from '@/components/common/SEOHead';
import { SocialShareModal } from '@/components/common/SocialShareModal';
import { getCharacterRarity } from '@/components/characters/LegendaryCharacterCard';

// ─── TCG Card Component ────────────────────────────────────────────────────────
function TradingCard({ character, rarity, ratingNum, ratingColor, world }: {
  character: any;
  rarity: string;
  ratingNum: number;
  ratingColor: string;
  world?: any;
}) {
  const rarityGradients: Record<string, string> = {
    mythic:    'from-red-900 via-orange-800 to-amber-700',
    legendary: 'from-amber-900 via-yellow-800 to-amber-600',
    epic:      'from-purple-900 via-violet-800 to-purple-600',
    rare:      'from-teal-900 via-cyan-800 to-teal-600',
    common:    'from-zinc-800 via-zinc-700 to-zinc-600',
  };
  const rarityBorder: Record<string, string> = {
    mythic:    'border-orange-400/80',
    legendary: 'border-amber-400/80',
    epic:      'border-purple-400/80',
    rare:      'border-teal-400/80',
    common:    'border-zinc-400/60',
  };
  const rarityGlow: Record<string, string> = {
    mythic:    'shadow-[0_0_60px_rgba(251,146,60,0.60),0_0_120px_rgba(220,38,38,0.30)]',
    legendary: 'shadow-[0_0_60px_rgba(197,161,91,0.70),0_0_120px_rgba(234,179,8,0.35)]',
    epic:      'shadow-[0_0_60px_rgba(168,85,247,0.60),0_0_120px_rgba(109,40,217,0.35)]',
    rare:      'shadow-[0_0_60px_rgba(20,184,166,0.55),0_0_100px_rgba(8,124,123,0.30)]',
    common:    'shadow-[0_0_30px_rgba(255,255,255,0.15)]',
  };
  const rarityLabel: Record<string, string> = {
    mythic: '✦ ميثيك', legendary: '◆ ليجندري', epic: '◈ ملحمي', rare: '◇ نادر', common: '○ عادي',
  };
  const rarityTextColor: Record<string, string> = {
    mythic: 'text-orange-300', legendary: 'text-amber-300', epic: 'text-purple-300',
    rare: 'text-teal-300', common: 'text-zinc-300',
  };

  const statDefs = [
    { key: 'strength',     icon: Swords,   label: 'القوة',    color: 'text-red-400',    bg: 'bg-red-500/15',    border: 'border-red-500/30' },
    { key: 'speed',        icon: Zap,       label: 'السرعة',   color: 'text-yellow-400', bg: 'bg-yellow-500/15', border: 'border-yellow-500/30' },
    { key: 'durability',   icon: Shield,    label: 'الصلابة',  color: 'text-blue-400',   bg: 'bg-blue-500/15',   border: 'border-blue-500/30' },
    { key: 'intelligence', icon: Eye,       label: 'الذكاء',   color: 'text-cyan-400',   bg: 'bg-cyan-500/15',   border: 'border-cyan-500/30' },
    { key: 'magic',        icon: Sparkles,  label: 'السحر',    color: 'text-purple-400', bg: 'bg-purple-500/15', border: 'border-purple-500/30' },
    { key: 'combat',       icon: Target,    label: 'النزال',   color: 'text-orange-400', bg: 'bg-orange-500/15', border: 'border-orange-500/30' },
  ];

  const hasStats = character.stats && Object.keys(character.stats).some(k => k !== 'powerRating');

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, rotateY: -15 }}
      animate={{ opacity: 1, y: 0, rotateY: 0 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className={`relative mx-auto w-full max-w-[340px] rounded-[22px] border-2 ${rarityBorder[rarity] || rarityBorder.common} ${rarityGlow[rarity] || rarityGlow.common} overflow-hidden select-none`}
      style={{ background: 'linear-gradient(145deg,#0a0e1a,#101828)' }}
    >
      {/* ── Top Header Ribbon ── */}
      <div className={`relative h-10 flex items-center justify-between px-4 bg-gradient-to-r ${rarityGradients[rarity] || rarityGradients.common}`}>
        <span className={`text-[11px] font-black uppercase tracking-widest ${rarityTextColor[rarity] || rarityTextColor.common} drop-shadow`}>
          {rarityLabel[rarity] || '○ بطاقة'}
        </span>
        {world && (
          <span className="text-[10px] font-bold text-white/70 bg-black/40 px-2 py-0.5 rounded-full border border-white/15">
            {world.nameAr}
          </span>
        )}
        <div
          className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-black/60 border"
          style={{ color: ratingColor, borderColor: ratingColor + '60' }}
        >
          {ratingNum}
        </div>
      </div>

      {/* ── Holographic Shimmer Lines ── */}
      <div className="absolute inset-0 pointer-events-none z-10 opacity-10"
        style={{ backgroundImage: 'repeating-linear-gradient(45deg,transparent,transparent 4px,rgba(255,255,255,0.08) 4px,rgba(255,255,255,0.08) 5px)' }}
      />

      {/* ── Character Artwork ── */}
      <div className="relative h-[260px] overflow-hidden">
        <img
          src={character.image}
          alt={character.nameAr}
          className="w-full h-full object-cover object-top transform scale-[1.02]"
        />
        {/* Bottom fade into card body */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e1a] via-[#0a0e1a]/20 to-transparent" />
        {/* Top vignette */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent" />

        {/* Alignment badge */}
        <div className="absolute top-3 right-3">
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black backdrop-blur-md border ${
            character.alignment === 'hero'
              ? 'bg-blue-500/30 text-blue-200 border-blue-400/40'
              : character.alignment === 'villain'
              ? 'bg-red-500/30 text-red-200 border-red-400/40'
              : 'bg-purple-500/30 text-purple-200 border-purple-400/40'
          }`}>
            {character.alignment === 'hero' ? '🛡 بطل' : character.alignment === 'villain' ? '⚔ شرير' : '🔮 غامض'}
          </span>
        </div>

        {/* Power orb bottom-left */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-black/70 backdrop-blur-md border border-white/15 rounded-full px-3 py-1">
          <Zap className="w-3.5 h-3.5" style={{ color: ratingColor }} />
          <span className="text-[11px] font-black" style={{ color: ratingColor }}>{ratingNum}</span>
          <span className="text-[9px] text-zinc-400 font-mono">/100</span>
        </div>
      </div>

      {/* ── Card Name Plate ── */}
      <div className="px-4 pt-3 pb-2 border-b border-white/10">
        <h2 className="text-xl font-black text-white leading-tight tracking-wide drop-shadow">
          {character.nameAr}
        </h2>
        {character.aliasAr && (
          <p className="text-xs text-zinc-400 font-medium mt-0.5">{character.aliasAr}</p>
        )}
        {character.nameEn && (
          <p className="text-[10px] text-zinc-500 font-mono mt-0.5" dir="ltr">{character.nameEn}</p>
        )}
      </div>

      {/* ── Bio / Flavor Text ── */}
      <div className="px-4 py-2.5 border-b border-white/10">
        <p className="text-[11px] text-zinc-300 leading-relaxed italic line-clamp-2">
          {character.bioAr || 'شخصية محورية في أحداث عوالم حكاياتي.'}
        </p>
      </div>

      {/* ── Stats Grid ── */}
      {hasStats && (
        <div className="px-4 py-3 border-b border-white/10">
          <div className="grid grid-cols-3 gap-1.5">
            {statDefs.map(({ key, icon: Icon, label, color, bg, border }) => {
              const val = character.stats?.[key];
              if (val === undefined || val === null) return null;
              return (
                <div key={key} className={`flex flex-col items-center gap-1 rounded-xl p-2 ${bg} border ${border}`}>
                  <Icon className={`w-3.5 h-3.5 ${color}`} />
                  <span className={`text-sm font-black ${color}`}>{val}</span>
                  <span className="text-[9px] text-zinc-400 font-bold leading-none">{label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Powers List ── */}
      {character.powersAr && character.powersAr.length > 0 && (
        <div className="px-4 py-3 border-b border-white/10">
          <div className="flex items-center gap-1.5 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[10px] font-black text-amber-300 uppercase tracking-wider">القدرات الخارقة</span>
          </div>
          <div className="space-y-1">
            {character.powersAr.slice(0, 4).map((p: string, i: number) => (
              <div key={i} className="flex items-center gap-2 text-[11px] text-zinc-200">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                <span className="font-medium">{p}</span>
              </div>
            ))}
            {character.powersAr.length > 4 && (
              <p className="text-[10px] text-zinc-500 pt-0.5">+{character.powersAr.length - 4} قدرات إضافية...</p>
            )}
          </div>
        </div>
      )}

      {/* ── Bottom Footer ── */}
      <div className={`h-8 flex items-center justify-between px-4 bg-gradient-to-r ${rarityGradients[rarity] || rarityGradients.common} opacity-70`}>
        <span className="text-[9px] text-white/60 font-mono uppercase tracking-widest">HEKAYATY WORLD © 2027</span>
        <span className="text-[9px] font-black" style={{ color: ratingColor + 'dd' }}>
          {character.classification === 'original' ? 'ORIGINAL' : character.classification === 'hekayaty_selected' ? 'SELECTED' : 'COLLAB'}
        </span>
      </div>
    </motion.div>
  );
}

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
    magic: 'السحر والطاقة الخارقة',
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
          1. IMMERSIVE FULL-PAGE ARTWORK BACKGROUND — Clear, Vivid, Minimal Overlay
          ───────────────────────────────────────────────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <img
          src={character.image}
          alt={character.nameAr}
          className="w-full h-full object-cover object-top filter brightness-[0.65] contrast-105 saturate-120"
        />
        {/* Only edge-fade gradients — no thick dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#070B12] via-[#070B12]/25 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#070B12]/75 via-transparent to-transparent" />
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
          {/* Right Column (RTL): TCG-Style Character Card */}
          <div className="lg:col-span-5 space-y-6">
            {/* Professional Trading Card */}
            <TradingCard
              character={character}
              rarity={rarity}
              ratingNum={ratingNum}
              ratingColor={ratingColor}
              world={world}
            />

            {/* Action Buttons below the card */}
            <div className="flex items-center gap-3 justify-center flex-wrap">
              <button
                type="button"
                onClick={() => setShareOpen(true)}
                className="px-5 py-2.5 rounded-2xl text-xs font-bold backdrop-blur-md border bg-black/60 text-white border-white/20 hover:border-[#C5A15B] transition-all shadow-lg flex items-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                <span>مشاركة البطاقة</span>
              </button>

              <button
                type="button"
                onClick={toggleFavorite}
                className={`px-5 py-2.5 rounded-2xl text-xs font-bold backdrop-blur-md border transition-all shadow-lg flex items-center gap-2 ${
                  isFav
                    ? 'bg-red-500/20 text-red-400 border-red-500/40'
                    : 'bg-black/60 text-white border-white/20 hover:border-[#C5A15B]'
                }`}
              >
                <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
                <span>{isFav ? 'في المفضلة' : 'إضافة للمفضلة'}</span>
              </button>

              {world && (
                <Link
                  href={`/worlds/${world.id}`}
                  className="px-5 py-2.5 rounded-2xl text-xs font-bold bg-black/60 backdrop-blur-md text-[#E1C58B] border border-white/20 hover:border-[#C5A15B] flex items-center gap-2 transition-all shadow-lg"
                >
                  <Globe className="w-4 h-4" />
                  <span>{world.nameAr}</span>
                </Link>
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
                    <span>قصة البداية وقصة البداية والأصل</span>
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
