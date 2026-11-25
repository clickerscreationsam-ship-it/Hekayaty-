import React, { useState } from 'react';
import { useRoute, Link, useLocation } from 'wouter';
import { motion } from 'framer-motion';
import {
  ArrowRight, BookOpen, Star, Plus, Share2, PenTool,
  ChevronRight, ChevronLeft, Check, Sparkles,
} from 'lucide-react';
import { useComic, useComics, useCharacters, useWorlds } from '@/lib/hooks';
import type { Comic } from '@/types';
import { useAppStore } from '@/stores/useAppStore';
import { useToast } from '@/hooks/use-toast';
import { SEOHead } from '@/components/common/SEOHead';
import { SocialShareModal } from '@/components/common/SocialShareModal';

function getTitleAr(comic: Comic): string {
  return (comic as any).titleAr || (comic as any).title || '';
}

function getSynopsisAr(comic: Comic): string {
  return (comic as any).synopsisAr || (comic as any).synopsis || '';
}

function getSeriesName(comic: Comic): string {
  return (comic as any).seriesTitle || (comic as any).series || '';
}

function getGenresAr(comic: Comic): string[] {
  if ((comic as any).genresAr) return (comic as any).genresAr as string[];
  const map: Record<string, string> = {
    Action: 'أكشن', Fantasy: 'خيال', 'Sci-Fi': 'خيال علمي',
    Horror: 'رعب', Drama: 'دراما', Adventure: 'مغامرة',
    Magic: 'خيال', Thriller: 'أكشن', Cyberpunk: 'خيال علمي',
  };
  return ((comic as any).genre || []).map((g: string) => map[g] || g);
}

function classificationLabel(comic: Comic): string {
  const cls = (comic as any).classification;
  if (cls === 'original') return 'حكاياتي الأصلية';
  if (cls === 'hekayaty_selected') return 'حكاياتي المختارة';
  if (cls === 'official_collaboration') return 'تعاون رسمي';
  return 'حكاياتي الأصلية';
}

function classificationColor(comic: Comic) {
  const cls = (comic as any).classification;
  if (cls === 'hekayaty_selected') return 'bg-rich-turquoise/15 text-deep-teal dark:text-rich-turquoise border-rich-turquoise/40';
  if (cls === 'official_collaboration') return 'bg-purple-600/15 text-purple-700 dark:text-purple-300 border-purple-500/30';
  return 'bg-deep-teal/15 text-deep-teal dark:bg-antique-gold/20 dark:text-antique-gold border-deep-teal/30 dark:border-antique-gold/30';
}

function getCharacterName(char: any): string {
  return (char as any).nameAr || (char as any).arabicName || (char as any).name || '';
}

function getCharacterImage(char: any): string {
  return (char as any).image || '';
}

function getRatingStars(rating: number) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return { full, half, empty: 5 - full - (half ? 1 : 0) };
}

// ── Demo reviews ──────────────────────────────────────────────────────────────

const DEMO_REVIEWS = [
  {
    id: 'r1',
    user: 'أحمد الفارسي',
    rating: 5,
    text: 'قصة رائعة ومثيرة! الرسومات تأسر العيون والحبكة لا تتوقف عن المفاجآت. أحد أفضل الكوميكسات العربية التي قرأتها.',
    date: '2024-04-10',
  },
  {
    id: 'r2',
    user: 'سارة محمود',
    rating: 4,
    text: 'عمل فني رائع. أحببت تطور الشخصيات كثيرًا، وأتمنى أن تكون الحلقات أطول. أنتظر الإصدار القادم بفارغ الصبر.',
    date: '2024-04-15',
  },
  {
    id: 'r3',
    user: 'خالد العمراني',
    rating: 5,
    text: 'مزيج مثالي بين الأسطورة العربية والخيال الحديث. صُنع بحب واضح للتفاصيل. استمروا في هذا العمل الممتاز!',
    date: '2024-04-20',
  },
];

// ── Main Component ────────────────────────────────────────────────────────────

export default function ComicDetail() {
  const [, params] = useRoute('/comics/:id');
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const addToCollection = (useAppStore as any).getState?.()?.addToCollection;

  const [addedToCollection, setAddedToCollection] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const comicId = params?.id || '';
  const { data: comic } = useComic(comicId);
  const { data: comics = [] } = useComics();
  const { data: characters = [] } = useCharacters();
  const { data: worlds = [] } = useWorlds();

  if (!comic) {
    return (
      <div className="min-h-screen flex items-center justify-center text-foreground font-arabic" dir="rtl">
        <div className="text-center">
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-foreground/20" />
          <p className="text-xl">الكوميكس غير موجود</p>
          <Link href="/comics">
            <button className="mt-6 px-6 py-3 bg-deep-teal text-white dark:bg-antique-gold dark:text-midnight-navy rounded-lg font-bold">
              العودة إلى المكتبة
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const titleAr = getTitleAr(comic);
  const synopsisAr = getSynopsisAr(comic);
  const seriesName = getSeriesName(comic);
  const genresAr = getGenresAr(comic);
  const stars = getRatingStars(comic.rating);
  const clsLabel = classificationLabel(comic);
  const clsColor = classificationColor(comic);

  const coverStyle = comic.coverImage.startsWith('linear-gradient')
    ? { background: comic.coverImage }
    : { backgroundImage: `url(${comic.coverImage})` };

  // Characters in this issue
  const comicCharacterIds: string[] = (comic as any).characterIds || (comic as any).characters || [];
  const featuredChars = characters.filter((c) => comicCharacterIds.includes(c.id));

  // More from same series
  const moreSeries = comics
    .filter((c) => getSeriesName(c) === seriesName && c.id !== comic.id)
    .slice(0, 4);

  // Similar recommendations (different series)
  const recommendations = comics
    .filter((c) => getSeriesName(c) !== seriesName && c.id !== comic.id)
    .slice(0, 4);

  // Prev / Next
  const prevIssueId: string | undefined = (comic as any).previousIssueId;
  const nextIssueId: string | undefined = (comic as any).nextIssueId;

  const seriesComics = comics
    .filter((c) => getSeriesName(c) === seriesName)
    .sort((a, b) => a.issueNumber - b.issueNumber);
  const myIndex = seriesComics.findIndex((c) => c.id === comic.id);
  const prevComic = prevIssueId
    ? comics.find((c) => c.id === prevIssueId)
    : seriesComics[myIndex - 1];
  const nextComic = nextIssueId
    ? comics.find((c) => c.id === nextIssueId)
    : seriesComics[myIndex + 1];

  function handleAddToCollection() {
    try {
      const store = useAppStore.getState();
      if ((store as any).addToCollection && comic) {
        (store as any).addToCollection({ id: comic.id, type: 'comic', addedAt: new Date() });
      }
    } catch {}
    setAddedToCollection(true);
    toast({ title: 'تمت الإضافة إلى مجموعتك ✨', description: titleAr });
  }

  function handleShare() {
    setShareOpen(true);
  }

  return (
    <div className="min-h-screen pb-24 font-arabic notranslate" dir="rtl" translate="no">
      {comic && (
        <>
          <SEOHead
            title={titleAr}
            description={synopsisAr || `كوميكس ${titleAr} - ${seriesName}`}
            ogImage={comic.coverImage}
            ogType="book"
            author={(comic as any).writer || 'حكاياتي'}
            jsonLd={{
              '@context': 'https://schema.org',
              '@type': 'Book',
              name: titleAr,
              headline: titleAr,
              image: comic.coverImage,
              description: synopsisAr,
              inLanguage: 'ar',
              author: {
                '@type': 'Person',
                name: (comic as any).writer || 'حكاياتي',
              },
              publisher: {
                '@type': 'Organization',
                name: 'حكاياتي | HEKAYATY',
              },
            }}
          />
          <SocialShareModal
            isOpen={shareOpen}
            onClose={() => setShareOpen(false)}
            title={titleAr}
            description={synopsisAr}
            imageUrl={comic.coverImage}
            contentType="comic"
            contentId={comic.id}
          />
        </>
      )}
      {/* Ambient blurred background */}
      <div className="absolute top-0 left-0 right-0 h-[60vh] opacity-15 dark:opacity-20 pointer-events-none z-0 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center blur-3xl scale-110"
          style={coverStyle}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/60 to-background" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 relative z-10">
        {/* Back link */}
        <Link href="/comics">
          <button className="flex items-center gap-2 text-foreground/60 hover:text-deep-teal dark:hover:text-antique-gold transition-colors mb-10 font-arabic">
            <ArrowRight className="w-4 h-4" />
            العودة إلى المكتبة
          </button>
        </Link>

        {/* ── Main layout: cover + details ── */}
        <div className="flex flex-col md:flex-row gap-12 mb-20">
          {/* Cover */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full md:w-1/3 lg:w-1/4 shrink-0"
          >
            <div
              className="aspect-[2/3] rounded-2xl overflow-hidden border-2 border-soft-sand/60 dark:border-white/10 shadow-[0_15px_45px_rgba(8,124,123,0.15)] dark:shadow-[0_15px_45px_rgba(0,0,0,0.8)] relative"
            >
              <div className="absolute inset-0 bg-cover bg-center" style={coverStyle} />
            </div>

            {/* Issue nav buttons under cover on mobile */}
            <div className="flex gap-2 mt-4 md:hidden">
              {prevComic && (
                <Link href={`/comics/${prevComic.id}`} className="flex-1">
                  <button className="w-full py-2 px-3 bg-soft-cream/70 dark:bg-white/5 border border-soft-sand/50 dark:border-white/10 rounded-lg text-foreground/80 hover:border-deep-teal transition-colors text-sm font-arabic flex items-center justify-center gap-2">
                    <ChevronRight className="w-4 h-4" />
                    السابق
                  </button>
                </Link>
              )}
              {nextComic && (
                <Link href={`/comics/${nextComic.id}`} className="flex-1">
                  <button className="w-full py-2 px-3 bg-soft-cream/70 dark:bg-white/5 border border-soft-sand/50 dark:border-white/10 rounded-lg text-foreground/80 hover:border-deep-teal transition-colors text-sm font-arabic flex items-center justify-center gap-2">
                    التالي
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                </Link>
              )}
            </div>
          </motion.div>

          {/* Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex-1 text-right"
          >
            {/* Series + Issue + Year */}
            <div className="flex items-center gap-3 mb-5 flex-row-reverse flex-wrap">
              {seriesName && (
                <span className="px-3 py-1 bg-soft-cream/80 dark:bg-white/10 rounded-full text-xs font-bold text-foreground border border-soft-sand/50 dark:border-white/10 font-arabic">
                  {seriesName}
                </span>
              )}
              <span className="text-deep-teal dark:text-antique-gold font-bold font-arabic text-sm">عدد #{comic.issueNumber}</span>
              <span className="text-foreground/50 text-sm">{comic.year}</span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${clsColor} font-arabic`}>
                {clsLabel}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-5xl font-cinzel font-bold text-foreground mb-6 leading-tight">
              {titleAr}
            </h1>

            {/* Rating + Genres */}
            <div className="flex items-center gap-6 mb-6 pb-6 border-b border-soft-sand/40 dark:border-white/10 flex-wrap flex-row-reverse">
              <div className="flex items-center gap-2 flex-row-reverse">
                <div className="flex gap-0.5">
                  {Array.from({ length: stars.full }).map((_, i) => (
                    <Star key={`f${i}`} className="w-4 h-4 text-antique-gold fill-antique-gold" />
                  ))}
                  {stars.half && <Star className="w-4 h-4 text-antique-gold fill-antique-gold/50" />}
                  {Array.from({ length: stars.empty }).map((_, i) => (
                    <Star key={`e${i}`} className="w-4 h-4 text-soft-sand/60 dark:text-white/20" />
                  ))}
                </div>
                <span className="text-foreground font-bold">{comic.rating}</span>
              </div>
              <div className="flex gap-2 flex-wrap flex-row-reverse">
                {genresAr.map((g) => (
                  <span key={g} className="px-3 py-1 text-xs border border-soft-sand/60 dark:border-white/20 rounded-full text-foreground/70 dark:text-white/60 font-arabic bg-soft-cream/40 dark:bg-white/5">
                    {g}
                  </span>
                ))}
              </div>
            </div>

            {/* Synopsis */}
            <p className="text-lg text-foreground/80 leading-relaxed mb-8 font-arabic">
              {synopsisAr}
            </p>

            {/* Credits */}
            <div className="grid grid-cols-2 gap-6 mb-8 bg-soft-cream/60 dark:bg-white/5 p-5 rounded-2xl border border-soft-sand/50 dark:border-white/5">
              <div className="text-right">
                <h4 className="text-xs text-foreground/50 dark:text-white/40 uppercase tracking-widest mb-1 flex items-center gap-1 justify-end font-cinzel">
                  الكاتب <PenTool className="w-3 h-3 text-deep-teal dark:text-antique-gold" />
                </h4>
                <p className="text-foreground font-bold font-arabic">{comic.writer}</p>
              </div>
              <div className="text-right">
                <h4 className="text-xs text-foreground/50 dark:text-white/40 uppercase tracking-widest mb-1 flex items-center gap-1 justify-end font-cinzel">
                  الرسام <PenTool className="w-3 h-3 text-deep-teal dark:text-antique-gold" />
                </h4>
                <p className="text-foreground font-bold font-arabic">{comic.artist}</p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-4 mb-12 flex-row-reverse">
              <Link href={`/comics/${comic.id}/read`}>
                <button className="px-8 py-4 bg-deep-teal text-white hover:bg-deep-teal/90 dark:bg-antique-gold dark:text-midnight-navy dark:hover:bg-champagne-gold font-bold rounded-xl transition-colors flex items-center gap-2 shadow-[0_0_25px_rgba(8,124,123,0.3)] dark:shadow-[0_0_25px_rgba(197,161,91,0.3)] font-arabic">
                  <BookOpen className="w-5 h-5" />
                  اقرأ الآن
                </button>
              </Link>
              <Link href={`/comics/${comic.id}/immersive`}>
                <button className="px-6 py-4 bg-soft-cream/60 dark:bg-white/5 border border-soft-sand/60 dark:border-white/10 text-foreground font-bold rounded-xl hover:border-deep-teal transition-colors flex items-center gap-2 font-arabic">
                  <Sparkles className="w-4 h-4 text-antique-gold" />
                  القارئ المتقدم
                </button>
              </Link>
              <button
                onClick={handleAddToCollection}
                className={`px-6 py-4 font-bold rounded-xl border transition-colors flex items-center gap-2 font-arabic ${
                  addedToCollection
                    ? 'bg-deep-teal/15 border-deep-teal/40 text-deep-teal dark:bg-antique-gold/20 dark:text-antique-gold'
                    : 'bg-soft-cream/60 dark:bg-white/5 text-foreground border-soft-sand/60 dark:border-white/10 hover:border-deep-teal/50'
                }`}
              >
                {addedToCollection ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                {addedToCollection ? 'أُضيف إلى مجموعتك' : 'أضف إلى المجموعة'}
              </button>
              <button
                onClick={handleShare}
                className="p-4 bg-soft-cream/60 dark:bg-white/5 text-foreground rounded-xl border border-soft-sand/60 dark:border-white/10 hover:border-deep-teal/50 transition-colors"
                title="مشاركة الرابط"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>

            {/* Prev / Next — desktop */}
            <div className="hidden md:flex gap-4 flex-row-reverse">
              {prevComic && (
                <Link href={`/comics/${prevComic.id}`}>
                  <button className="flex items-center gap-2 px-5 py-3 bg-soft-cream/60 dark:bg-white/5 border border-soft-sand/60 dark:border-white/10 rounded-xl text-foreground/80 hover:border-deep-teal dark:hover:border-antique-gold transition-colors font-arabic text-sm">
                    <ChevronRight className="w-4 h-4" />
                    العدد السابق
                    <span className="text-deep-teal dark:text-antique-gold font-bold">#{prevComic.issueNumber}</span>
                  </button>
                </Link>
              )}
              {nextComic && (
                <Link href={`/comics/${nextComic.id}`}>
                  <button className="flex items-center gap-2 px-5 py-3 bg-soft-cream/60 dark:bg-white/5 border border-soft-sand/60 dark:border-white/10 rounded-xl text-foreground/80 hover:border-deep-teal dark:hover:border-antique-gold transition-colors font-arabic text-sm">
                    <span className="text-deep-teal dark:text-antique-gold font-bold">#{nextComic.issueNumber}</span>
                    العدد التالي
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                </Link>
              )}
            </div>
          </motion.div>
        </div>

        {/* ── Characters Section ── */}
        {featuredChars.length > 0 && (
          <Section title="شخصيات العدد" delay={0.2}>
            <div className="flex flex-wrap gap-3 flex-row-reverse">
              {featuredChars.map((char) => {
                const charImg = getCharacterImage(char);
                const charName = getCharacterName(char);
                const imgStyle = charImg.startsWith('linear-gradient')
                  ? { background: charImg }
                  : { backgroundImage: `url(${charImg})` };
                return (
                  <Link key={char.id} href={`/characters/${char.id}`}>
                    <div className="flex items-center gap-3 bg-soft-cream/60 dark:bg-white/5 border border-soft-sand/50 dark:border-white/10 hover:border-deep-teal/50 dark:hover:border-antique-gold/50 rounded-full pr-1 pl-4 py-1 cursor-pointer transition-colors group">
                      <span className="text-sm font-bold text-foreground group-hover:text-deep-teal dark:group-hover:text-antique-gold transition-colors font-arabic">
                        {charName}
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

        {/* ── More from Series ── */}
        {moreSeries.length > 0 && (
          <Section title="المزيد من السلسلة" delay={0.3}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
              {moreSeries.map((c) => (
                <MiniComicCard key={c.id} comic={c} />
              ))}
            </div>
          </Section>
        )}

        {/* ── Ratings ── */}
        <Section title="تقييمات القراء" subtitle="آراء ومراجعات مجتمع القراء" delay={0.35}>
          <div className="grid gap-4 md:grid-cols-3">
            {DEMO_REVIEWS.map((r) => {
              const rStars = getRatingStars(r.rating);
              return (
                <div key={r.id} className="glass-card p-5 rounded-2xl border border-soft-sand/50 dark:border-white/5 text-right">
                  <div className="flex items-center justify-between mb-3 flex-row-reverse">
                    <div className="flex gap-0.5">
                      {Array.from({ length: rStars.full }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-antique-gold fill-antique-gold" />
                      ))}
                      {Array.from({ length: rStars.empty }).map((_, i) => (
                        <Star key={`e${i}`} className="w-4 h-4 text-soft-sand/60 dark:text-white/20" />
                      ))}
                    </div>
                    <div>
                      <p className="font-bold text-foreground text-sm font-arabic">{r.user}</p>
                      <p className="text-xs text-foreground/50">{r.date}</p>
                    </div>
                  </div>
                  <p className="text-foreground/75 text-sm leading-relaxed font-arabic">{r.text}</p>
                </div>
              );
            })}
          </div>
        </Section>

        {/* ── Recommendations ── */}
        {recommendations.length > 0 && (
          <Section title="توصيات مشابهة" delay={0.4}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
              {recommendations.map((c) => (
                <MiniComicCard key={c.id} comic={c} />
              ))}
            </div>
          </Section>
        )}
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Section({
  title,
  subtitle,
  delay = 0,
  children,
}: {
  title: string;
  subtitle?: string;
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
        <div className="w-1.5 h-6 bg-deep-teal dark:bg-antique-gold rounded-full" />
        <div>
          <h3 className="text-xl font-cinzel font-bold text-foreground">{title}</h3>
          {subtitle && <p className="text-xs text-foreground/50 font-arabic">{subtitle}</p>}
        </div>
      </div>
      {children}
    </motion.section>
  );
}

function MiniComicCard({ comic }: { comic: any }) {
  const coverStyle = comic.coverImage.startsWith('linear-gradient')
    ? { background: comic.coverImage }
    : { backgroundImage: `url(${comic.coverImage})` };
  const titleAr = getTitleAr(comic);

  return (
    <Link href={`/comics/${comic.id}`}>
      <div className="group cursor-pointer">
        <div className="aspect-[2/3] rounded-xl overflow-hidden border border-soft-sand/50 dark:border-white/10 group-hover:border-deep-teal/50 dark:group-hover:border-antique-gold/40 transition-colors mb-2 relative shadow-sm">
          <div className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-500" style={coverStyle} />
        </div>
        <p className="text-sm text-foreground/80 group-hover:text-deep-teal dark:group-hover:text-antique-gold transition-colors line-clamp-2 text-right font-arabic">
          {titleAr}
        </p>
        <p className="text-xs text-foreground/50 text-right font-arabic">عدد #{comic.issueNumber}</p>
      </div>
    </Link>
  );
}
