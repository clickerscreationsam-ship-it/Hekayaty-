import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { Sparkles, Zap, Shield, Globe, Award, ChevronLeft, Flame, Star } from 'lucide-react';
import type { Character, World } from '@/types';

export type CardRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';

export function getCharacterRarity(char: Character): CardRarity {
  const rating = char.powerRating ?? char.stats?.powerRating ?? 0;
  if (rating >= 95) return 'mythic';
  if (rating >= 85) return 'legendary';
  if (rating >= 70) return 'epic';
  if (rating >= 50) return 'rare';
  if (rating >= 30) return 'uncommon';
  return 'common';
}

const RARITY_CONFIG: Record<
  CardRarity,
  {
    nameAr: string;
    badgeCls: string;
    borderCls: string;
    glowCls: string;
    accentColor: string;
    frameBg: string;
  }
> = {
  mythic: {
    nameAr: 'ميثيك أسطوري كوزمي',
    badgeCls: 'bg-gradient-to-r from-red-600 via-pink-600 to-amber-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.7)]',
    borderCls: 'border-red-500/60 hover:border-red-400',
    glowCls: 'shadow-[0_0_35px_rgba(239,68,68,0.35)] hover:shadow-[0_0_55px_rgba(239,68,68,0.6)]',
    accentColor: '#EF4444',
    frameBg: 'from-red-950/40 via-[#0E131F]/90 to-[#0A0D15]',
  },
  legendary: {
    nameAr: 'ليجندري فائق الندرة',
    badgeCls: 'bg-gradient-to-r from-amber-400 via-yellow-500 to-[#C5A15B] text-black font-black shadow-[0_0_15px_rgba(217,119,6,0.6)]',
    borderCls: 'border-[#C5A15B]/70 hover:border-[#F3DEB0]',
    glowCls: 'shadow-[0_0_35px_rgba(197,161,91,0.35)] hover:shadow-[0_0_55px_rgba(197,161,91,0.6)]',
    accentColor: '#C5A15B',
    frameBg: 'from-[#C5A15B]/20 via-[#0E131F]/90 to-[#0A0D15]',
  },
  epic: {
    nameAr: 'ملحمي إيبك',
    badgeCls: 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-[0_0_12px_rgba(168,85,247,0.5)]',
    borderCls: 'border-purple-500/60 hover:border-purple-400',
    glowCls: 'shadow-[0_0_25px_rgba(168,85,247,0.3)] hover:shadow-[0_0_45px_rgba(168,85,247,0.5)]',
    accentColor: '#A855F7',
    frameBg: 'from-purple-950/30 via-[#0E131F]/90 to-[#0A0D15]',
  },
  rare: {
    nameAr: 'نادر راير',
    badgeCls: 'bg-gradient-to-r from-teal-500 to-[#087C7B] text-white shadow-[0_0_10px_rgba(8,124,123,0.4)]',
    borderCls: 'border-[#087C7B]/60 hover:border-teal-400',
    glowCls: 'shadow-[0_0_20px_rgba(8,124,123,0.25)] hover:shadow-[0_0_35px_rgba(8,124,123,0.45)]',
    accentColor: '#087C7B',
    frameBg: 'from-teal-950/20 via-[#0E131F]/90 to-[#0A0D15]',
  },
  uncommon: {
    nameAr: 'غير مألوف',
    badgeCls: 'bg-blue-600/80 text-white',
    borderCls: 'border-blue-500/40 hover:border-blue-400',
    glowCls: 'shadow-[0_0_15px_rgba(59,130,246,0.2)]',
    accentColor: '#3B82F6',
    frameBg: 'from-blue-950/20 via-[#0E131F]/90 to-[#0A0D15]',
  },
  common: {
    nameAr: 'قياسي شائع',
    badgeCls: 'bg-zinc-700/80 text-zinc-200',
    borderCls: 'border-zinc-700 hover:border-zinc-500',
    glowCls: 'shadow-lg',
    accentColor: '#71717A',
    frameBg: 'from-zinc-900/40 via-[#0E131F]/90 to-[#0A0D15]',
  },
};

interface Props {
  character: Character;
  world?: World;
  isSelected?: boolean;
  onSelect?: (char: Character) => void;
  viewMode?: 'grid' | 'showcase' | 'compact';
}

export function LegendaryCharacterCard({
  character,
  world,
  isSelected = false,
  onSelect,
  viewMode = 'grid',
}: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50, opacity: 0 });

  const rarity = getCharacterRarity(character);
  const config = RARITY_CONFIG[rarity];
  const powerRating = character.powerRating ?? character.stats?.powerRating ?? 50;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rX = ((y - centerY) / centerY) * -10;
    const rY = ((x - centerX) / centerX) * 10;

    setRotateX(rX);
    setRotateY(rY);
    setGlarePos({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 0.25,
    });
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setGlarePos((prev) => ({ ...prev, opacity: 0 }));
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={() => onSelect?.(character)}
      style={{
        transformStyle: 'preserve-3d',
        perspective: 1000,
      }}
      animate={{
        rotateX,
        rotateY,
        scale: isSelected ? 1.03 : 1,
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={`group relative rounded-3xl overflow-hidden cursor-pointer transition-all duration-300 font-arabic select-none ${
        config.glowCls
      } ${
        isSelected
          ? 'ring-2 ring-[#C5A15B] shadow-[0_0_40px_rgba(197,161,91,0.6)]'
          : ''
      }`}
    >
      {/* Outer Card Body Frame */}
      <div
        className={`relative h-full flex flex-col justify-between border-2 rounded-3xl bg-gradient-to-b ${config.frameBg} ${config.borderCls} overflow-hidden backdrop-blur-md`}
      >
        {/* Holographic Glare Effect */}
        <div
          className="absolute inset-0 pointer-events-none z-30 transition-opacity duration-300 mix-blend-color-dodge"
          style={{
            opacity: glarePos.opacity,
            background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255,255,255,0.6) 0%, transparent 60%)`,
          }}
        />

        {/* Top Header Foil Strip */}
        <div className="relative z-20 px-4 py-3 flex items-center justify-between gap-2 border-b border-white/10 bg-black/40 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${config.badgeCls}`}
            >
              {config.nameAr}
            </span>
            {world && (
              <span className="text-[11px] text-zinc-400 font-semibold flex items-center gap-1 truncate max-w-[120px]">
                <Globe className="w-3 h-3 text-[#E1C58B] shrink-0" />
                <span className="truncate">{world.nameAr}</span>
              </span>
            )}
          </div>

          {/* Power Number Crest */}
          <div
            className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-black/60 border shadow-md"
            style={{
              borderColor: `${config.accentColor}70`,
              color: config.accentColor,
            }}
          >
            <Zap className="w-3 h-3 fill-current" />
            <span>{powerRating}</span>
          </div>
        </div>

        {/* Main Artwork Container - Large and Prominent */}
        <div className="relative w-full aspect-[4/5] overflow-hidden bg-black/80">
          <img
            src={character.image}
            alt={character.nameAr}
            className="w-full h-full object-cover object-top transform group-hover:scale-108 transition-transform duration-700 filter brightness-95 group-hover:brightness-105"
            loading="lazy"
          />

          {/* Subtle bottom vignette to ensure card text readability without obscuring character */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#090E18] via-[#090E18]/40 to-transparent" />

          {/* Mythic / Legendary Sparkle Particles Accent */}
          {(rarity === 'mythic' || rarity === 'legendary') && (
            <div className="absolute top-3 left-3 pointer-events-none flex items-center gap-1 bg-black/50 px-2 py-0.5 rounded-full border border-amber-400/30">
              <Sparkles className="w-3 h-3 text-amber-300 animate-pulse" />
              <span className="text-[10px] font-bold text-amber-200">بطاقة كوزمية</span>
            </div>
          )}

          {/* Classification Pill */}
          <div className="absolute bottom-3 right-3 z-10">
            <span className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-black/70 backdrop-blur-md text-[#E1C58B] border border-[#C5A15B]/40 shadow-lg">
              {character.aliasAr || character.nameAr}
            </span>
          </div>
        </div>

        {/* Card Footer & Stats Preview */}
        <div className="relative z-20 p-4 space-y-3 bg-[#0B101B]/90 backdrop-blur-md border-t border-white/10">
          <div>
            <div className="flex items-baseline justify-between gap-2">
              <h3 className="text-lg font-black text-white group-hover:text-[#E1C58B] transition-colors leading-tight truncate">
                {character.nameAr}
              </h3>
              <span className="text-[11px] font-mono text-zinc-400 shrink-0" dir="ltr">
                {character.nameEn}
              </span>
            </div>

            <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed mt-1">
              {character.bioAr || 'شخصية وبطل أسطوري مسجل في سجلات عوالم حكاياتي الكوزمية.'}
            </p>
          </div>

          {/* Attribute Stat Bars (Real Data) */}
          {character.stats && (
            <div className="grid grid-cols-3 gap-1.5 pt-1 text-[10px] font-bold">
              <div className="bg-black/40 rounded-lg p-1.5 text-center border border-white/5">
                <span className="block text-zinc-400">القوة</span>
                <span className="text-[#C5A15B] font-mono">{character.stats.strength || 50}%</span>
              </div>
              <div className="bg-black/40 rounded-lg p-1.5 text-center border border-white/5">
                <span className="block text-zinc-400">السرعة</span>
                <span className="text-teal-400 font-mono">{character.stats.speed || 50}%</span>
              </div>
              <div className="bg-black/40 rounded-lg p-1.5 text-center border border-white/5">
                <span className="block text-zinc-400">الذكاء</span>
                <span className="text-purple-400 font-mono">{character.stats.intelligence || 50}%</span>
              </div>
            </div>
          )}

          {/* Action Button: View Full Dossier */}
          <Link
            href={`/characters/${character.id}`}
            onClick={(e) => e.stopPropagation()}
            className="w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md group/btn"
            style={{
              background: `linear-gradient(135deg, ${config.accentColor}25, ${config.accentColor}40)`,
              border: `1px solid ${config.accentColor}60`,
              color: '#FFFFFF',
            }}
          >
            <span>الملف الكوزمي الكامل</span>
            <ChevronLeft className="w-3.5 h-3.5 group-hover/btn:-translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
