import React, { useState } from 'react';
import { useCards, useCharacters, useWorlds } from '@/lib/hooks';
import { motion } from 'framer-motion';
import {
  Gamepad2,
  Shield,
  Zap,
  Sparkles,
  Search,
  Filter,
  Layers,
  Info,
  ChevronLeft,
} from 'lucide-react';

export default function CardGame() {
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [rarityFilter, setRarityFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const { data: cardGameCards = [] } = useCards();
  const { data: characters = [] } = useCharacters();
  const { data: worlds = [] } = useWorlds();

  const filteredCards = cardGameCards.filter((card) => {
    const matchesType = typeFilter === 'all' || card.type === typeFilter;
    const matchesRarity = rarityFilter === 'all' || card.rarity === rarityFilter;
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      card.nameAr.toLowerCase().includes(q) ||
      card.nameEn.toLowerCase().includes(q) ||
      card.abilityAr.toLowerCase().includes(q);

    return matchesType && matchesRarity && matchesSearch;
  });

  const getRarityBadge = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return {
          label: 'أسطوري',
          style: 'bg-antique-gold/20 text-antique-gold border-antique-gold/50 shadow-sm',
        };
      case 'epic':
        return {
          label: 'ملحمي',
          style: 'bg-purple-600/15 text-purple-700 dark:text-purple-300 border-purple-500/40',
        };
      case 'rare':
        return {
          label: 'نادر',
          style: 'bg-deep-teal/15 text-deep-teal dark:text-rich-turquoise border-deep-teal/40 dark:border-rich-turquoise/40',
        };
      default:
        return {
          label: 'شائع',
          style: 'bg-soft-cream dark:bg-zinc-700/30 text-foreground/70 dark:text-zinc-300 border-soft-sand/60 dark:border-zinc-600/50',
        };
    }
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto font-arabic" dir="rtl">
      {/* Header */}
      <div className="mb-10 text-right">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-deep-teal/10 dark:bg-antique-gold/10 border border-deep-teal/20 dark:border-antique-gold/30 text-deep-teal dark:text-antique-gold text-xs font-semibold mb-3">
          <Gamepad2 className="w-3.5 h-3.5" />
          <span>لعبة بطاقات حكاياتي التكتيكية — معاينة أولى</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold text-foreground mb-4 font-cinzel">
          بطاقات أبطال <span className="text-deep-teal dark:gold-gradient">الكون التكتيكية</span>
        </h1>
        <p className="text-base text-foreground/70 max-w-2xl leading-relaxed">
          استكشف بطاقات المعارك المصممة لأبطال وأسلحة وأحداث عوالم حكاياتي. تعرف على نقاط الهجوم
          والدفاع والقدرات الخارقة لكل بطاقة.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-5 rounded-3xl border border-soft-sand/50 dark:border-white/10 mb-10 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Types */}
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'كافة البطاقات' },
              { key: 'hero', label: 'أبطال' },
              { key: 'villain', label: 'أشرار' },
              { key: 'artifact', label: 'قطع وأسلحة' },
            ].map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setTypeFilter(item.key)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  typeFilter === item.key
                    ? 'bg-deep-teal text-white dark:bg-antique-gold dark:text-midnight-navy font-bold shadow-md'
                    : 'bg-soft-cream/60 dark:bg-white/[0.03] text-foreground/70 dark:text-zinc-300 hover:text-foreground dark:hover:text-white border border-soft-sand/40 dark:border-white/5'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث بالاسم أو القدرة..."
              className="w-full pr-10 pl-4 py-2.5 rounded-xl bg-soft-cream/50 dark:bg-black/40 border border-soft-sand/60 dark:border-white/10 text-foreground placeholder:text-foreground/40 text-xs sm:text-sm focus:outline-none focus:border-deep-teal dark:focus:border-antique-gold/60"
            />
          </div>
        </div>

        {/* Rarities */}
        <div className="pt-2 border-t border-soft-sand/40 dark:border-white/5 flex flex-wrap items-center gap-3 text-xs">
          <span className="text-foreground/50 font-semibold">مستوى الندرة:</span>
          {[
            { key: 'all', label: 'الكل' },
            { key: 'legendary', label: 'أسطوري' },
            { key: 'epic', label: 'ملحمي' },
            { key: 'rare', label: 'نادر' },
          ].map((r) => (
            <button
              key={r.key}
              type="button"
              onClick={() => setRarityFilter(r.key)}
              className={`px-3 py-1 rounded-lg transition-colors ${
                rarityFilter === r.key
                  ? 'text-deep-teal bg-deep-teal/15 dark:text-antique-gold dark:bg-antique-gold/15 font-bold'
                  : 'text-foreground/60 dark:text-zinc-400 hover:text-foreground dark:hover:text-white'
              }`}
            >
              {r.label}
            </button>
          ))}
          <span className="mr-auto text-foreground/60">
            معروض <strong className="text-deep-teal dark:text-antique-gold">{filteredCards.length}</strong> بطاقة
          </span>
        </div>
      </div>

      {/* Cards Grid */}
      {filteredCards.length === 0 ? (
        <div className="glass-panel rounded-3xl p-16 text-center border border-soft-sand/50 dark:border-white/10 max-w-xl mx-auto shadow-sm">
          <Gamepad2 className="w-16 h-16 mx-auto mb-4 text-deep-teal/40 dark:text-antique-gold/40" />
          <h3 className="text-lg font-bold text-foreground mb-2">معرض البطاقات التكتيكية قيد التجهيز</h3>
          <p className="text-xs sm:text-sm text-foreground/60 leading-relaxed">
            سيتم إدراج بطاقات الأبطال والقدرات التكتيكية فور إطلاقها في المنصة.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredCards.map((card) => {
          const rarity = getRarityBadge(card.rarity);

          return (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ y: -6 }}
              transition={{ duration: 0.2 }}
              className="relative rounded-3xl overflow-hidden glass-card border-2 border-soft-sand/60 dark:border-white/10 hover:border-deep-teal dark:hover:border-antique-gold/70 p-4 transition-all duration-300 shadow-md hover:shadow-xl flex flex-col justify-between group"
            >
              <div>
                {/* Header & Rarity */}
                <div className="flex items-center justify-between mb-3">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${rarity.style}`}>
                    {rarity.label}
                  </span>
                  <span className="text-[11px] text-foreground/60 font-medium">
                    {card.type === 'hero' ? 'بطل' : card.type === 'villain' ? 'شرير' : 'عتاد أثري'}
                  </span>
                </div>

                {/* Card Illustration */}
                <div className="relative aspect-square rounded-2xl overflow-hidden mb-3.5 border border-soft-sand/50 dark:border-white/10 bg-soft-cream/30 dark:bg-black shadow-inner">
                  <img
                    src={card.image}
                    alt={card.nameAr}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                  {/* Battle Stats Pills inside art */}
                  <div className="absolute bottom-2.5 right-2.5 left-2.5 flex items-center justify-around bg-midnight-navy/80 dark:bg-black/70 backdrop-blur-md py-1.5 px-2 rounded-xl border border-soft-sand/30 dark:border-white/10 text-xs font-bold text-warm-ivory">
                    {card.attack !== undefined && (
                      <span className="text-red-400 flex items-center gap-1">
                        ⚔ {card.attack}
                      </span>
                    )}
                    {card.defense !== undefined && (
                      <span className="text-sky-400 flex items-center gap-1">
                        🛡 {card.defense}
                      </span>
                    )}
                    {card.magic !== undefined && (
                      <span className="text-purple-400 flex items-center gap-1">
                        ✦ {card.magic}
                      </span>
                    )}
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-base font-bold text-foreground font-cinzel group-hover:text-deep-teal dark:group-hover:text-antique-gold transition-colors mb-1">
                  {card.nameAr}
                </h3>
                <span className="text-[10px] text-foreground/40 block mb-2">{card.nameEn}</span>

                {/* Ability Box */}
                <div className="p-3 rounded-xl bg-soft-cream/80 dark:bg-white/[0.03] border border-soft-sand/40 dark:border-white/5 space-y-1 mb-2">
                  <span className="text-[10px] font-bold text-deep-teal dark:text-antique-gold block font-cinzel">
                    القدرة التكتيكية:
                  </span>
                  <p className="text-xs text-foreground/75 leading-relaxed">{card.abilityAr}</p>
                </div>

                {/* Flavor Text */}
                {card.flavorTextAr && (
                  <p className="text-[10px] text-foreground/50 italic text-center px-1">
                    "{card.flavorTextAr}"
                  </p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
      )}

      {/* Info Callout */}
      <div className="glass-panel p-6 rounded-3xl border border-soft-sand/50 dark:border-white/10 mt-14 max-w-2xl mx-auto text-center space-y-2 shadow-sm">
        <h4 className="text-sm font-bold text-foreground flex items-center justify-center gap-2 font-cinzel">
          <Info className="w-4 h-4 text-deep-teal dark:text-antique-gold" />
          <span>مرحلة التطوير النموذجية</span>
        </h4>
        <p className="text-xs text-foreground/70 leading-relaxed">
          هذه الصفحة مخصصة لمعاينة بطاقات أبطال حكاياتي وقدراتها التكتيكية في نسختها البصرية الأولى.
          سيتم فتح طور اللعب التفاعلي الكامل قريباً.
        </p>
      </div>
    </div>
  );
}
