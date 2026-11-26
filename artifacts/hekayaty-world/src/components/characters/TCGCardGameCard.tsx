import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap,
  Shield,
  Swords,
  Sparkles,
  Eye,
  Flame,
  RotateCw,
  Maximize2,
  Minimize2,
  Star,
  Award,
  Crown,
  Heart,
  Share2,
  Compass,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import type { Character, World } from '@/types';

interface TCGCardProps {
  character: Character;
  world?: World;
  onShare?: () => void;
  interactive?: boolean;
  className?: string;
}

export function TCGCardGameCard({
  character,
  world,
  onShare,
  interactive = true,
  className = '',
}: TCGCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isHoloActive, setIsHoloActive] = useState(true);
  const [isZoomed, setIsZoomed] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // 3D Tilt & Holographic cursor tracking
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || !interactive || isFlipped) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rX = ((y - centerY) / centerY) * -12; // tilt degrees
    const rY = ((x - centerX) / centerX) * 12;

    setRotateX(rX);
    setRotateY(rY);
    setGlare({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 0.65,
    });
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setGlare((prev) => ({ ...prev, opacity: 0 }));
  };

  // Derive card stats
  const powerRating = Number(character.powerRating ?? character.stats?.powerRating ?? 90);
  const stats = character.stats || {
    strength: 94,
    durability: 85,
    speed: 84,
    magic: 90,
    intelligence: 88,
    combat: 100,
  };

  // Energy / Mana cost calculation (e.g. 5-7 gems)
  const manaCost = Math.min(10, Math.max(3, Math.round(powerRating / 10)));

  // Rarity config
  const rarity: 'mythic' | 'legendary' | 'epic' | 'rare' =
    powerRating >= 95 ? 'mythic' :
    powerRating >= 85 ? 'legendary' :
    powerRating >= 70 ? 'epic' : 'rare';

  const rarityMeta = {
    mythic: {
      nameAr: 'ميثيك خارق',
      frameBorder: 'border-[#ff4d4d]',
      frameGlow: 'shadow-[0_0_50px_rgba(255,77,77,0.5),0_0_100px_rgba(255,100,0,0.3)]',
      gemColor: '#ff3333',
      gemGradient: 'from-red-600 via-orange-500 to-amber-400',
      tagColor: 'text-red-300',
      badgeBg: 'bg-red-950/80 border-red-500/50',
    },
    legendary: {
      nameAr: 'أسطوري فائق',
      frameBorder: 'border-[#f5c253]',
      frameGlow: 'shadow-[0_0_50px_rgba(245,194,83,0.55),0_0_100px_rgba(218,165,32,0.35)]',
      gemColor: '#f5c253',
      gemGradient: 'from-amber-300 via-yellow-500 to-amber-700',
      tagColor: 'text-amber-300',
      badgeBg: 'bg-amber-950/80 border-amber-500/50',
    },
    epic: {
      nameAr: 'ملحمي ملكي',
      frameBorder: 'border-[#b854ff]',
      frameGlow: 'shadow-[0_0_45px_rgba(184,84,255,0.45),0_0_80px_rgba(130,40,250,0.3)]',
      gemColor: '#b854ff',
      gemGradient: 'from-fuchsia-400 via-purple-600 to-indigo-800',
      tagColor: 'text-purple-300',
      badgeBg: 'bg-purple-950/80 border-purple-500/50',
    },
    rare: {
      nameAr: 'نادر تكتيكي',
      frameBorder: 'border-[#00e1d9]',
      frameGlow: 'shadow-[0_0_40px_rgba(0,225,217,0.4),0_0_70px_rgba(0,180,210,0.25)]',
      gemColor: '#00e1d9',
      gemGradient: 'from-cyan-300 via-teal-500 to-emerald-700',
      tagColor: 'text-cyan-300',
      badgeBg: 'bg-teal-950/80 border-teal-500/50',
    },
  }[rarity];

  // Card Moves Generation
  const rawPowers = character.powersAr && character.powersAr.length > 0
    ? character.powersAr
    : ['تحكم بالطاقة الكوزمية', 'طيران فائق السرعة'];

  const moves = [
    {
      name: rawPowers[0] || 'الضربة الكوزمية',
      type: 'هجوم أساسي',
      cost: Math.max(2, Math.round(manaCost * 0.4)),
      dmg: Math.round(powerRating * 1.3),
      desc: 'يطلق دفقاً كوزمياً مركّزاً يخترق حواجز الخصم ويسبب ضرراً مباشراً.',
      icon: Zap,
      color: 'text-amber-400',
      badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    },
    {
      name: rawPowers[1] || 'المناورة الفائقة',
      type: rawPowers.length > 1 ? 'قدرة خاصة' : 'تعزيز تكتيكي',
      cost: Math.max(1, Math.round(manaCost * 0.3)),
      dmg: rawPowers.length > 1 ? Math.round(powerRating * 0.95) : 0,
      effect: rawPowers.length > 1 ? 'اختراق جوي' : '+40% مناورة وتفادي',
      desc: 'تحليق أسرع من الصوت لتفادي الضربات الجوية وإعادة التموضع الهجومي.',
      icon: Flame,
      color: 'text-orange-400',
      badge: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
    },
  ];

  // Passive trait
  const passive = {
    title: 'القدرة الكامنة: عزم الأبطال',
    desc: 'عند انخفاض نقاط الصمود إلى أقل من 35%، تتضاعف صلابة الدروع وترتفع سرعة الشحن بنسبة +50%.',
  };

  // Card serial & edition
  const cardIdFormatted = character.id.replace('char_', '').slice(-4) || '2027';

  return (
    <div className={`relative flex flex-col items-center ${className}`} dir="rtl">
      {/* ── CARD GAME INTERACTIVE CONTAINER ── */}
      <div
        className="perspective-[1400px] w-full max-w-[380px] select-none cursor-pointer"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <motion.div
          ref={cardRef}
          animate={{
            rotateX: isFlipped ? 0 : rotateX,
            rotateY: isFlipped ? 180 : rotateY,
            scale: isZoomed ? 1.05 : 1,
          }}
          transition={{
            type: 'spring',
            stiffness: 260,
            damping: 24,
          }}
          style={{ transformStyle: 'preserve-3d' }}
          className={`relative w-full rounded-[26px] p-2.5 sm:p-3 transition-shadow duration-300 ${rarityMeta.frameGlow}`}
        >
          {/* ══════════════════════════════════════════════════════════════════
              CARD FRONT SIDE
             ══════════════════════════════════════════════════════════════════ */}
          <div
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(0deg)',
              background: 'radial-gradient(circle at 50% 20%, #161f36 0%, #0a0e1a 60%, #04070e 100%)',
            }}
            className={`relative rounded-[22px] border-[3px] ${rarityMeta.frameBorder} overflow-hidden shadow-2xl`}
          >
            {/* Ornate Gold Filigree Corner Accents */}
            <div className="absolute top-1 right-1 w-5 h-5 border-t-2 border-r-2 border-amber-400/90 pointer-events-none z-30" />
            <div className="absolute top-1 left-1 w-5 h-5 border-t-2 border-l-2 border-amber-400/90 pointer-events-none z-30" />
            <div className="absolute bottom-1 right-1 w-5 h-5 border-b-2 border-r-2 border-amber-400/90 pointer-events-none z-30" />
            <div className="absolute bottom-1 left-1 w-5 h-5 border-b-2 border-l-2 border-amber-400/90 pointer-events-none z-30" />

            {/* Holographic Prismatic Foil Sheen Layer */}
            {isHoloActive && (
              <div
                className="absolute inset-0 pointer-events-none z-20 mix-blend-color-dodge transition-opacity duration-300"
                style={{
                  opacity: glare.opacity,
                  background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255,215,0,0.65) 0%, rgba(255,0,128,0.35) 30%, rgba(0,255,255,0.3) 60%, transparent 80%)`,
                }}
              />
            )}

            {/* Shimmer Rainbow Diagonal Prism Grid */}
            {isHoloActive && (
              <div
                className="absolute inset-0 pointer-events-none z-10 opacity-15 mix-blend-overlay"
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(135deg, transparent, transparent 6px, rgba(255,255,255,0.4) 6px, rgba(255,255,255,0.4) 7px)',
                }}
              />
            )}

            {/* ── CARD TOP HEADER BAR ── */}
            <div className="relative px-3 pt-2.5 pb-2 border-b border-amber-500/40 bg-gradient-to-r from-amber-950/60 via-slate-900/90 to-amber-950/60 flex items-center justify-between gap-2 z-10">
              {/* Character Name & Class */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-base sm:text-lg font-black text-amber-200 tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] truncate">
                    {character.nameAr}
                  </h3>
                  <span className="text-[10px] text-amber-400/80 font-mono">★★★★★</span>
                </div>
                <div className="flex items-center gap-1.5 text-[9px] text-zinc-300">
                  <span className="font-semibold text-amber-300/90">{character.aliasAr || 'بطل أسطوري'}</span>
                  <span>•</span>
                  <span className="text-zinc-400">
                    {character.alignment === 'hero' ? 'تحالف النور' : character.alignment === 'villain' ? 'قوى الظلام' : 'كيان محايد'}
                  </span>
                </div>
              </div>

              {/* Energy / Mana Cost Orb (TCG Style) */}
              <div className="relative flex items-center justify-center shrink-0">
                <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br ${rarityMeta.gemGradient} p-[2px] shadow-[0_0_15px_rgba(245,194,83,0.7)] flex items-center justify-center`}>
                  <div className="w-full h-full rounded-full bg-black/90 flex flex-col items-center justify-center">
                    <span className="text-[8px] text-amber-400 leading-none font-bold">MANA</span>
                    <span className="text-sm font-black text-white leading-none">{manaCost}</span>
                  </div>
                </div>
                <div className="absolute -bottom-1 -left-1 px-1.5 py-0.2 rounded-full bg-amber-500 text-black text-[8px] font-black shadow">
                  ⚡{powerRating}
                </div>
              </div>
            </div>

            {/* ── CARD ARTWORK WINDOW ── */}
            <div className="relative mx-2.5 mt-2 rounded-xl overflow-hidden border-2 border-amber-500/60 shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] bg-black/80 aspect-[4/3] sm:aspect-[16/11]">
              <img
                src={character.image}
                alt={character.nameAr}
                className="w-full h-full object-cover object-top filter contrast-105 saturate-110 transform transition-transform duration-700 hover:scale-105"
              />
              {/* Card Art Inner Framing Shadows */}
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/85 via-transparent to-black/30" />

              {/* Card Rarity Ribbon Top Right */}
              <div className="absolute top-2 right-2">
                <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider backdrop-blur-md border ${rarityMeta.badgeBg} ${rarityMeta.tagColor} shadow-md`}>
                  ◆ {rarityMeta.nameAr}
                </span>
              </div>

              {/* Universe / World Origin Bottom Right */}
              <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/75 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/15">
                <Compass className="w-3 h-3 text-amber-400" />
                <span className="text-[9px] font-bold text-zinc-200">
                  {world?.nameAr || 'عوالم حكاياتي'}
                </span>
              </div>

              {/* Classification Tag Bottom Left */}
              <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/75 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/15">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                <span className="text-[9px] font-bold text-cyan-300">
                  {character.classification === 'original' ? 'شخصية أصلية' : 'مختارة'}
                </span>
              </div>
            </div>

            {/* ── COMBAT ATTRIBUTE GEMS BAR (TCG STATS) ── */}
            <div className="mx-2.5 my-2 p-1.5 rounded-xl bg-black/70 border border-amber-500/30 grid grid-cols-5 gap-1 text-center shadow-inner">
              <div className="flex flex-col items-center py-0.5 rounded-lg bg-red-950/40 border border-red-500/30">
                <div className="flex items-center gap-0.5 text-red-400">
                  <Swords className="w-3 h-3" />
                  <span className="text-[8px] font-bold">هجوم</span>
                </div>
                <span className="text-xs font-black text-red-300 leading-tight">{stats.strength}</span>
              </div>

              <div className="flex flex-col items-center py-0.5 rounded-lg bg-blue-950/40 border border-blue-500/30">
                <div className="flex items-center gap-0.5 text-blue-400">
                  <Shield className="w-3 h-3" />
                  <span className="text-[8px] font-bold">دفاع</span>
                </div>
                <span className="text-xs font-black text-blue-300 leading-tight">{stats.durability}</span>
              </div>

              <div className="flex flex-col items-center py-0.5 rounded-lg bg-yellow-950/40 border border-yellow-500/30">
                <div className="flex items-center gap-0.5 text-yellow-400">
                  <Zap className="w-3 h-3" />
                  <span className="text-[8px] font-bold">سرعة</span>
                </div>
                <span className="text-xs font-black text-yellow-300 leading-tight">{stats.speed}</span>
              </div>

              <div className="flex flex-col items-center py-0.5 rounded-lg bg-purple-950/40 border border-purple-500/30">
                <div className="flex items-center gap-0.5 text-purple-400">
                  <Sparkles className="w-3 h-3" />
                  <span className="text-[8px] font-bold">طاقة</span>
                </div>
                <span className="text-xs font-black text-purple-300 leading-tight">{stats.magic}</span>
              </div>

              <div className="flex flex-col items-center py-0.5 rounded-lg bg-cyan-950/40 border border-cyan-500/30">
                <div className="flex items-center gap-0.5 text-cyan-400">
                  <Eye className="w-3 h-3" />
                  <span className="text-[8px] font-bold">تكتيك</span>
                </div>
                <span className="text-xs font-black text-cyan-300 leading-tight">{stats.intelligence}</span>
              </div>
            </div>

            {/* ── CARD POWERS & MOVES (TCG ACTION BOX) ── */}
            <div className="mx-2.5 mb-2 space-y-1.5">
              {moves.map((m, idx) => {
                const MoveIcon = m.icon;
                return (
                  <div
                    key={idx}
                    className="p-2 rounded-xl bg-slate-900/80 border border-white/10 hover:border-amber-400/40 transition-colors shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-1.5 mb-0.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className={`px-1.5 py-0.2 rounded text-[8px] font-black border ${m.badge}`}>
                          ⚡ {m.cost}
                        </span>
                        <h4 className="text-xs font-black text-zinc-100 flex items-center gap-1 truncate">
                          <MoveIcon className={`w-3 h-3 ${m.color} shrink-0`} />
                          <span>{m.name}</span>
                        </h4>
                      </div>
                      <div className="shrink-0 text-left">
                        {m.dmg > 0 ? (
                          <span className="text-[11px] font-black text-amber-300 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-500/30">
                            {m.dmg} DMG
                          </span>
                        ) : (
                          <span className="text-[9px] font-bold text-teal-300 bg-teal-950/60 px-1.5 py-0.5 rounded border border-teal-500/30">
                            {m.effect}
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-[10px] text-zinc-300 leading-snug line-clamp-2">
                      {m.desc}
                    </p>
                  </div>
                );
              })}

              {/* Passive Battle Trait */}
              <div className="p-1.5 rounded-xl bg-purple-950/30 border border-purple-500/30 flex items-start gap-1.5">
                <Crown className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                <div className="text-[9px] text-purple-200 leading-tight">
                  <strong className="text-purple-300 block mb-0.5">{passive.title}</strong>
                  <span className="text-zinc-300">{passive.desc}</span>
                </div>
              </div>
            </div>

            {/* ── CARD FOOTER & COLLECTOR SPECS ── */}
            <div className="px-3 py-1.5 bg-gradient-to-r from-amber-950/70 via-slate-950 to-amber-950/70 border-t border-amber-500/30 flex items-center justify-between text-[9px] font-mono text-zinc-400">
              <div className="flex items-center gap-1 text-amber-400 font-bold">
                <Star className="w-2.5 h-2.5 fill-current" />
                <span>1ST EDITION</span>
                <span>•</span>
                <span>#{cardIdFormatted}</span>
              </div>

              {/* Holographic Seal Stamp */}
              <div className="flex items-center gap-1 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/30 text-amber-300">
                <Award className="w-2.5 h-2.5 text-amber-400" />
                <span className="text-[8px] font-black uppercase">HEKAYATY TCG</span>
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════════════
              CARD BACK SIDE (3D FLIP)
             ══════════════════════════════════════════════════════════════════ */}
          <div
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              background: 'radial-gradient(circle at 50% 50%, #1e1435 0%, #0c081d 55%, #05030b 100%)',
            }}
            className={`absolute inset-0 m-2.5 sm:m-3 rounded-[22px] border-[3px] border-amber-400/80 overflow-hidden shadow-2xl flex flex-col justify-between p-6 text-center`}
          >
            {/* Mystic Runes Ambient Texture */}
            <div
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(#c5a15b 1px, transparent 1px)',
                backgroundSize: '16px 16px',
              }}
            />

            <div className="relative z-10 flex items-center justify-between text-xs font-mono text-amber-400/70">
              <span>HEKAYATY UNIVERSE</span>
              <span>بطاقات الأبطال</span>
            </div>

            {/* Central Mystical Seal */}
            <div className="relative z-10 my-auto flex flex-col items-center justify-center">
              <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-amber-400/80 p-2 shadow-[0_0_35px_rgba(245,194,83,0.5)] flex items-center justify-center">
                <div className="w-full h-full rounded-full border-2 border-dashed border-amber-300/60 flex items-center justify-center">
                  <div className="text-center">
                    <span className="text-3xl sm:text-4xl block mb-1">🔮</span>
                    <span className="text-xs font-black text-amber-200 tracking-widest font-cinzel">
                      HEKAYATY
                    </span>
                    <span className="text-[9px] text-amber-400/80 block mt-0.5">
                      TCG 2027
                    </span>
                  </div>
                </div>
              </div>
              <h4 className="text-sm font-bold text-amber-300 mt-4 tracking-wide">
                سجل أبطال حكاياتي التكتيكي
              </h4>
              <p className="text-[10px] text-zinc-400 max-w-[220px] mt-1 leading-relaxed">
                بطاقة أصلية معتمدة قابلة للتداول وخوض غمار معارك الأكوان التكتيكية.
              </p>
            </div>

            <div className="relative z-10 flex items-center justify-between text-[9px] font-mono text-amber-400/60 border-t border-amber-500/20 pt-2">
              <span>AUTORIZED COLLECTIBLE</span>
              <span>© 2027 HEKAYATY WORLD</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── INTERACTIVE CONTROLS BAR UNDER CARD ── */}
      <div className="mt-4 flex items-center gap-2 justify-center flex-wrap z-20">
        <button
          type="button"
          onClick={() => setIsFlipped((prev) => !prev)}
          className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-black/75 hover:bg-black text-amber-300 border border-amber-400/40 hover:border-amber-400 shadow-md flex items-center gap-1.5 transition-all active:scale-95"
        >
          <RotateCw className="w-3.5 h-3.5" />
          <span>{isFlipped ? 'مشاهدة وجه البطاقة' : 'قلب البطاقة (الظهر)'}</span>
        </button>

        <button
          type="button"
          onClick={() => setIsHoloActive((prev) => !prev)}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all active:scale-95 flex items-center gap-1.5 shadow-md ${
            isHoloActive
              ? 'bg-amber-500/25 text-amber-300 border-amber-500/60 shadow-[0_0_15px_rgba(245,194,83,0.3)]'
              : 'bg-black/60 text-zinc-400 border-white/15 hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{isHoloActive ? 'بريق هولوجرام نشط' : 'تفعيل الهولوجرام'}</span>
        </button>

        {onShare && (
          <button
            type="button"
            onClick={onShare}
            className="p-2 rounded-xl bg-black/60 hover:bg-black text-zinc-200 border border-white/15 hover:border-amber-400 shadow-md transition-all active:scale-95"
            title="مشاركة البطاقة"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <p className="text-[10px] text-zinc-400/80 mt-2 font-mono flex items-center gap-1">
        <span>✦ حرّك الفأرة لاستعراض التأثير ثلاثي الأبعاد واللمعان الهولوجرافي</span>
      </p>
    </div>
  );
}
