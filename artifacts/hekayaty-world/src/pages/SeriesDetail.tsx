import React from 'react';
import { useRoute, Link } from 'wouter';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, Globe, Users, Layers } from 'lucide-react';
import { useSeries, useComics, useCharacters, useWorlds } from '@/lib/hooks';
import type { Comic, Character, World, Series } from '@/types';

function getTitleAr(comic: Comic): string {
  return (comic as any).titleAr || (comic as any).title || '';
}

function getSeriesId(comic: Comic): string {
  return (comic as any).seriesId || (comic as any).series || '';
}

function getSeriesName(comic: Comic): string {
  return (comic as any).seriesTitle || (comic as any).series || '';
}

function getSeriesTitleAr(s: any): string {
  return (s as any).titleAr || (s as any).name || s.id;
}

function getSeriesDescAr(s: any): string {
  return (s as any).descriptionAr || (s as any).description || '';
}

function getSeriesStatus(s: any): string {
  const st = (s as any).status;
  if (st === 'ongoing') return 'مستمر';
  if (st === 'completed') return 'مكتمل';
  if (st === 'upcoming') return 'قادم';
  return 'مستمر';
}

function getStatusColor(s: any): string {
  const st = (s as any).status;
  if (st === 'completed') return 'bg-deep-teal/15 text-deep-teal border-deep-teal/30 dark:bg-blue-600/20 dark:text-blue-300 dark:border-blue-500/30';
  if (st === 'upcoming') return 'bg-purple-600/15 text-purple-700 dark:text-purple-300 border-purple-500/30';
  return 'bg-emerald-600/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30';
}

function getSeriesCover(s: any): string {
  return (s as any).coverImage || '';
}

function classificationLabel(s: any): string {
  const cls = (s as any).classification;
  if (cls === 'original') return 'حكاياتي الأصلية';
  if (cls === 'hekayaty_selected') return 'حكاياتي المختارة';
  if (cls === 'official_collaboration') return 'تعاون رسمي';
  return 'حكاياتي الأصلية';
}

function classificationColor(s: any): string {
  const cls = (s as any).classification;
  if (cls === 'hekayaty_selected') return 'bg-rich-turquoise/15 text-deep-teal dark:text-rich-turquoise border-rich-turquoise/40';
  if (cls === 'official_collaboration') return 'bg-purple-600/15 text-purple-700 dark:text-purple-300 border-purple-500/30';
  return 'bg-deep-teal/15 text-deep-teal dark:bg-antique-gold/20 dark:text-antique-gold border-deep-teal/30 dark:border-antique-gold/30';
}

function getCharacterName(c: Character): string {
  return (c as any).nameAr || (c as any).arabicName || (c as any).name || '';
}

function getWorldName(w: World): string {
  return (w as any).nameAr || (w as any).arabicName || (w as any).name || '';
}

// ── Build series map from comics ──────────────────────────────────────────────

interface SeriesEntry {
  id: string;
  name: string;
  [key: string]: any;
}

function buildSeriesFromComics(comicsList: Comic[] = []): SeriesEntry[] {
  const map = new Map<string, SeriesEntry>();
  comicsList.forEach((c) => {
    const key = getSeriesId(c) || getSeriesName(c);
    if (!map.has(key)) {
      map.set(key, {
        id: key,
        name: getSeriesName(c),
        titleAr: getSeriesName(c),
        coverImage: c.coverImage,
        worldId: c.worldId,
      });
    }
  });
  return Array.from(map.values());
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function SeriesDetail() {
  const [, params] = useRoute('/series/:id');
  const seriesId = params?.id;
  const { data: allSeries = [] } = useSeries();
  const { data: comics = [] } = useComics();
  const { data: characters = [] } = useCharacters();
  const { data: worlds = [] } = useWorlds();

  const seriesFromComics = buildSeriesFromComics(comics);
  const combinedList = allSeries.length > 0 ? allSeries : seriesFromComics;

  const series = combinedList.find((s) => s.id === seriesId);
  const seriesAlt = !series
    ? combinedList.find((s) => s.id === decodeURIComponent(seriesId || ''))
    : null;

  const thisSeries = series || seriesAlt;

  if (!thisSeries) {
    return (
      <div className="min-h-screen flex items-center justify-center text-foreground font-arabic" dir="rtl">
        <div className="text-center">
          <Layers className="w-16 h-16 mx-auto mb-4 text-foreground/20" />
          <p className="text-xl mb-6">السلسلة غير موجودة</p>
          <Link href="/comics">
            <button className="px-6 py-3 bg-deep-teal text-white dark:bg-antique-gold dark:text-midnight-navy rounded-xl font-bold">
              العودة إلى المكتبة
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const titleAr = getSeriesTitleAr(thisSeries);
  const descAr = getSeriesDescAr(thisSeries);
  const statusLabel = getSeriesStatus(thisSeries);
  const statusColor = getStatusColor(thisSeries);
  const coverImg = getSeriesCover(thisSeries);
  const clsLabel = classificationLabel(thisSeries);
  const clsColor = classificationColor(thisSeries);

  const coverStyle = coverImg.startsWith('linear-gradient') || !coverImg
    ? { background: coverImg || 'linear-gradient(135deg,#087C7B,#111C2B)' }
    : { backgroundImage: `url(${coverImg})` };

  const seriesComics = comics
    .filter((c) => {
      const sid = getSeriesId(c) || getSeriesName(c);
      return sid === thisSeries.id || getSeriesName(c) === (thisSeries as any).name;
    })
    .sort((a, b) => a.issueNumber - b.issueNumber);

  const characterIds = new Set<string>();
  seriesComics.forEach((c) => {
    const ids: string[] = (c as any).characterIds || (c as any).characters || [];
    ids.forEach((id) => characterIds.add(id));
  });
  const seriesCharacters = characters.filter((c) => characterIds.has(c.id));

  const worldId = (thisSeries as any).worldId || seriesComics[0]?.worldId;
  const world = worlds.find((w) => w.id === worldId);

  return (
    <div className="min-h-screen pb-24" dir="rtl">
      {/* Ambient header */}
      <div className="relative h-72 md:h-96 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center scale-110" style={coverStyle} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-background/60 to-background" />

        {/* Back */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
          <Link href="/comics">
            <button className="flex items-center gap-2 text-foreground/70 hover:text-deep-teal dark:hover:text-antique-gold transition-colors font-arabic">
              <ArrowRight className="w-4 h-4" />
              العودة إلى المكتبة
            </button>
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-10">

        {/* ── Series header card ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="glass-card p-6 md:p-8 rounded-3xl border border-soft-sand/50 dark:border-white/10 mb-12 flex flex-col md:flex-row gap-8 shadow-xl"
        >
          {/* Cover thumbnail */}
          <div
            className="w-32 md:w-44 shrink-0 aspect-[2/3] rounded-2xl overflow-hidden border border-soft-sand/50 dark:border-white/10 self-start mx-auto md:mx-0 shadow-lg"
            style={coverStyle}
          />

          {/* Info */}
          <div className="flex-1 text-right">
            {/* Badges */}
            <div className="flex items-center gap-3 mb-4 flex-wrap flex-row-reverse">
              <span className={`px-3 py-1 rounded-full text-xs font-bold border font-arabic ${statusColor}`}>
                {statusLabel}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold border font-arabic ${clsColor}`}>
                {clsLabel}
              </span>
              <span className="px-3 py-1 rounded-full text-xs text-foreground/50 border border-soft-sand/50 dark:border-white/10 font-arabic bg-soft-cream/40 dark:bg-white/5">
                {seriesComics.length} إصدار
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl font-cinzel font-bold text-foreground mb-4 leading-tight">
              {titleAr}
            </h1>

            {descAr && (
              <p className="text-foreground/75 font-arabic leading-relaxed mb-6 max-w-2xl">{descAr}</p>
            )}

            {/* World link */}
            {world && (
              <Link href={`/worlds/${world.id}`}>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-soft-cream/60 dark:bg-white/5 border border-soft-sand/50 dark:border-white/10 rounded-full hover:border-deep-teal/50 dark:hover:border-antique-gold/40 transition-colors cursor-pointer">
                  <span className="text-sm text-foreground/80 font-arabic">{getWorldName(world)}</span>
                  <Globe className="w-4 h-4 text-deep-teal dark:text-antique-gold" />
                </div>
              </Link>
            )}
          </div>
        </motion.div>

        {/* ── Issues grid ── */}
        <Section title="جميع الإصدارات" icon={<BookOpen className="w-5 h-5 text-deep-teal dark:text-antique-gold" />} delay={0.1}>
          {seriesComics.length === 0 ? (
            <div className="text-center py-16 text-foreground/40 font-arabic">
              <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-20" />
              لا توجد إصدارات حتى الآن
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
              {seriesComics.map((comic, i) => (
                <motion.div
                  key={comic.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 + 0.2 }}
                >
                  <Link href={`/comics/${comic.id}`}>
                    <div className="group cursor-pointer">
                      <div className="relative aspect-[2/3] rounded-xl overflow-hidden border border-soft-sand/50 dark:border-white/10 group-hover:border-deep-teal/50 dark:group-hover:border-antique-gold/50 transition-all shadow-md">
                        <div
                          className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                          style={
                            comic.coverImage.startsWith('linear-gradient')
                              ? { background: comic.coverImage }
                              : { backgroundImage: `url(${comic.coverImage})` }
                          }
                        />
                        <div className="absolute top-2 right-2 bg-midnight-navy/80 dark:bg-black/80 px-2 py-0.5 rounded text-xs text-warm-ivory font-bold border border-soft-sand/30 dark:border-white/10">
                          #{comic.issueNumber}
                        </div>
                      </div>
                      <p className="mt-2 text-sm text-foreground/80 group-hover:text-deep-teal dark:group-hover:text-antique-gold transition-colors line-clamp-2 text-right font-arabic">
                        {getTitleAr(comic)}
                      </p>
                      <p className="text-xs text-foreground/50 text-right">{comic.year}</p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </Section>

        {/* ── Characters ── */}
        {seriesCharacters.length > 0 && (
          <Section title="شخصيات السلسلة" icon={<Users className="w-5 h-5 text-deep-teal dark:text-antique-gold" />} delay={0.3}>
            <div className="flex flex-wrap gap-3 flex-row-reverse">
              {seriesCharacters.map((char) => {
                const img = (char as any).image || '';
                const imgStyle = img.startsWith('linear-gradient')
                  ? { background: img }
                  : { backgroundImage: `url(${img})` };
                return (
                  <Link key={char.id} href={`/characters/${char.id}`}>
                    <div className="flex items-center gap-3 bg-soft-cream/60 dark:bg-white/5 border border-soft-sand/50 dark:border-white/10 hover:border-deep-teal/50 dark:hover:border-antique-gold/50 rounded-full pr-1 pl-4 py-1 cursor-pointer transition-colors group">
                      <span className="text-sm font-bold text-foreground group-hover:text-deep-teal dark:group-hover:text-antique-gold transition-colors font-arabic">
                        {getCharacterName(char)}
                      </span>
                      <div
                        className="w-9 h-9 rounded-full bg-cover bg-center border-2 border-soft-sand/40 dark:border-white/10 group-hover:border-deep-teal dark:group-hover:border-antique-gold transition-colors"
                        style={imgStyle}
                      />
                    </div>
                  </Link>
                );
              })}
            </div>
          </Section>
        )}

        {/* ── World ── */}
        {world && (
          <Section title="عالم السلسلة" icon={<Globe className="w-5 h-5 text-deep-teal dark:text-antique-gold" />} delay={0.4}>
            <Link href={`/worlds/${world.id}`}>
              <motion.div
                whileHover={{ scale: 1.01 }}
                className="glass-card p-6 rounded-2xl border border-soft-sand/50 dark:border-white/10 hover:border-deep-teal/40 dark:hover:border-antique-gold/40 transition-colors cursor-pointer flex items-center gap-6"
              >
                <div
                  className="w-20 h-20 rounded-xl bg-cover bg-center border border-soft-sand/50 dark:border-white/10 shrink-0"
                  style={
                    (world as any).image?.startsWith('linear-gradient')
                      ? { background: (world as any).image }
                      : { backgroundImage: `url(${(world as any).image})` }
                  }
                />
                <div className="text-right flex-1">
                  <h3 className="text-lg font-cinzel font-bold text-foreground mb-1">{getWorldName(world)}</h3>
                  <p className="text-foreground/60 text-sm font-arabic line-clamp-2">
                    {(world as any).descriptionAr || (world as any).description || ''}
                  </p>
                </div>
              </motion.div>
            </Link>
          </Section>
        )}
      </div>
    </div>
  );
}

// ── Section wrapper ───────────────────────────────────────────────────────────

function Section({
  title,
  icon,
  delay = 0,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  delay?: number;
  children: React.ReactNode;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="mb-16"
      dir="rtl"
    >
      <div className="flex items-center gap-3 mb-6 flex-row-reverse">
        <div className="w-1.5 h-7 bg-deep-teal dark:bg-antique-gold rounded-full" />
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="text-xl font-cinzel font-bold text-foreground">{title}</h2>
        </div>
      </div>
      {children}
    </motion.section>
  );
}
