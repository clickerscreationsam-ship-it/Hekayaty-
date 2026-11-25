import React from 'react';
import { useRoute, Link } from 'wouter';
import { useEncyclopediaById, useEncyclopedia, useCharacters, useWorlds } from '@/lib/hooks';
import { BookMarked, Globe, Users, ChevronLeft, Tag, Sparkles } from 'lucide-react';

export default function EncyclopediaDetail() {
  const [, params] = useRoute('/encyclopedia/:id');
  const entryId = params?.id || '';
  const { data: entry } = useEncyclopediaById(entryId);
  const { data: encyclopediaEntries = [] } = useEncyclopedia();
  const { data: characters = [] } = useCharacters();
  const { data: worlds = [] } = useWorlds();

  if (!entry) {
    return (
      <div className="min-h-screen py-20 px-4 text-center font-arabic" dir="rtl">
        <h2 className="text-2xl font-bold text-foreground mb-2">المادة التوثيقية غير موجودة</h2>
        <p className="text-sm text-foreground/50 mb-6">ربما تم نقل المدخل أو أن المعرف غير دقيق.</p>
        <Link
          href="/encyclopedia"
          className="px-6 py-2.5 rounded-xl bg-deep-teal text-white dark:bg-antique-gold dark:text-midnight-navy font-semibold text-sm"
        >
          العودة للموسوعة
        </Link>
      </div>
    );
  }

  const relatedChars = characters.filter((c) => entry.relatedCharacterIds?.includes(c.id));
  const relatedWorlds = worlds.filter((w) => entry.relatedWorldIds?.includes(w.id));
  const relatedEntries = encyclopediaEntries.filter((e) =>
    entry.relatedEntryIds?.includes(e.id)
  );

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-[1000px] mx-auto font-arabic" dir="rtl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-foreground/60 mb-6">
        <Link href="/" className="hover:text-deep-teal dark:hover:text-antique-gold transition-colors">
          الرئيسية
        </Link>
        <ChevronLeft className="w-3.5 h-3.5" />
        <Link href="/encyclopedia" className="hover:text-deep-teal dark:hover:text-antique-gold transition-colors">
          الموسوعة الكونية
        </Link>
        <ChevronLeft className="w-3.5 h-3.5" />
        <span className="text-deep-teal dark:text-antique-gold font-semibold">{entry.titleAr}</span>
      </div>

      <div className="glass-panel p-6 sm:p-10 rounded-3xl border border-soft-sand/50 dark:border-white/10 space-y-8 shadow-xl">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2.5 mb-3">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-deep-teal/15 text-deep-teal dark:bg-antique-gold/15 dark:text-antique-gold border border-deep-teal/20 dark:border-antique-gold/30">
              تصنيف: {entry.category}
            </span>
            <span className="text-xs text-foreground/50 font-mono">{entry.titleEn}</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold text-foreground font-cinzel mb-2">
            {entry.titleAr}
          </h1>
        </div>

        {/* Image if available */}
        {entry.image && (
          <div className="rounded-2xl overflow-hidden border border-soft-sand/50 dark:border-white/10 max-h-[400px] shadow-sm">
            <img
              src={entry.image}
              alt={entry.titleAr}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-deep-teal dark:text-antique-gold uppercase tracking-wider flex items-center gap-2 font-cinzel">
            <BookMarked className="w-4 h-4" />
            <span>التوثيق والتحليل الكوزمي</span>
          </h3>
          <p className="text-base sm:text-lg text-foreground/85 leading-relaxed font-normal">
            {entry.descriptionAr}
          </p>
        </div>

        {/* Tags */}
        <div>
          <h4 className="text-xs font-semibold text-foreground/60 mb-2 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-deep-teal dark:text-antique-gold" />
            <span>الوسوم المرتبطة:</span>
          </h4>
          <div className="flex flex-wrap gap-2">
            {entry.tags.map((t, idx) => (
              <span
                key={idx}
                className="px-3 py-1 rounded-lg bg-soft-cream/60 dark:bg-white/[0.04] text-xs text-foreground/75 dark:text-zinc-300 border border-soft-sand/40 dark:border-white/10"
              >
                #{t}
              </span>
            ))}
          </div>
        </div>

        {/* Connected Entities */}
        {(relatedChars.length > 0 || relatedWorlds.length > 0) && (
          <div className="pt-6 border-t border-soft-sand/40 dark:border-white/10 space-y-4">
            <h3 className="text-base font-bold text-foreground font-cinzel">عناصر كونية متصلة بالمدخل</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {relatedChars.map((c) => (
                <Link
                  key={c.id}
                  href={`/characters/${c.id}`}
                  className="p-3 rounded-2xl bg-soft-cream/60 dark:bg-white/[0.02] hover:bg-soft-cream dark:hover:bg-white/[0.06] border border-soft-sand/40 dark:border-white/5 hover:border-deep-teal/40 dark:hover:border-antique-gold/30 flex items-center gap-3 transition-all"
                >
                  <img
                    src={c.image}
                    alt={c.nameAr}
                    className="w-10 h-10 rounded-full object-cover border border-deep-teal/30 dark:border-antique-gold/30"
                  />
                  <div>
                    <h5 className="text-xs font-bold text-foreground">{c.nameAr}</h5>
                    <span className="text-[10px] text-foreground/60">{c.aliasAr}</span>
                  </div>
                </Link>
              ))}

              {relatedWorlds.map((w) => (
                <Link
                  key={w.id}
                  href={`/worlds/${w.id}`}
                  className="p-3 rounded-2xl bg-soft-cream/60 dark:bg-white/[0.02] hover:bg-soft-cream dark:hover:bg-white/[0.06] border border-soft-sand/40 dark:border-white/5 hover:border-deep-teal/40 dark:hover:border-antique-gold/30 flex items-center gap-3 transition-all"
                >
                  <img
                    src={w.image}
                    alt={w.nameAr}
                    className="w-10 h-10 rounded-lg object-cover border border-soft-sand/50 dark:border-white/10"
                  />
                  <div>
                    <h5 className="text-xs font-bold text-foreground">عالم {w.nameAr}</h5>
                    <span className="text-[10px] text-foreground/60">{w.climateAr}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Related Entries */}
        {relatedEntries.length > 0 && (
          <div className="pt-6 border-t border-soft-sand/40 dark:border-white/10 space-y-3">
            <h4 className="text-sm font-bold text-foreground/80 font-cinzel">مواد توثيقية ذات صلة</h4>
            <div className="space-y-2">
              {relatedEntries.map((re) => (
                <Link
                  key={re.id}
                  href={`/encyclopedia/${re.id}`}
                  className="p-3 rounded-xl bg-soft-cream/60 dark:bg-white/[0.02] hover:bg-soft-cream dark:hover:bg-white/[0.05] border border-soft-sand/40 dark:border-white/5 flex items-center justify-between text-xs transition-colors"
                >
                  <span className="font-semibold text-foreground">{re.titleAr}</span>
                  <ChevronLeft className="w-4 h-4 text-foreground/50" />
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
