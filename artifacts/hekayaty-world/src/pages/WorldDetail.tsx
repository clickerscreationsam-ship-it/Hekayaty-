import React, { useState } from 'react';
import { useRoute, Link } from 'wouter';
import { useWorld, useCharacters, useComics, useTimeline } from '@/lib/hooks';
import { motion } from 'framer-motion';
import {
  Globe,
  MapPin,
  Shield,
  BookOpen,
  Users,
  Clock,
  Compass,
  ChevronLeft,
  Building,
  Flag,
  Share2,
} from 'lucide-react';
import { useAppStore } from '@/stores/useAppStore';
import { useToast } from '@/hooks/use-toast';
import { SEOHead } from '@/components/common/SEOHead';
import { SocialShareModal } from '@/components/common/SocialShareModal';

export default function WorldDetail() {
  const [, params] = useRoute('/worlds/:id');
  const worldId = params?.id || '';
  const { data: world } = useWorld(worldId);
  const { data: characters = [] } = useCharacters();
  const { data: comics = [] } = useComics();
  const { data: timelineEvents = [] } = useTimeline();
  const { addToFavorites, isInFavorites, removeFromFavorites } = useAppStore();
  const { toast } = useToast();
  const [shareOpen, setShareOpen] = useState(false);

  if (!world) {
    return (
      <div className="min-h-screen py-20 px-4 text-center font-arabic" dir="rtl">
        <h2 className="text-2xl font-bold text-[#2A1F17] dark:text-white mb-2">العالم غير موجود</h2>
        <p className="text-sm text-[#604735] dark:text-zinc-400 mb-6">ربما تم تغيير الاسم أو أن المعرف غير دقيق.</p>
        <Link
          href="/worlds"
          className="px-6 py-2.5 rounded-xl bg-[#087C7B] hover:bg-[#075B5C] text-[#F7F1E6] font-semibold text-sm"
        >
          العودة لأطلس العوالم
        </Link>
      </div>
    );
  }

  const residentCharacters = characters.filter((c) => world.characterIds?.includes(c.id));
  const worldComics = comics.filter((c) => world.comicIds?.includes(c.id));
  const worldEvents = timelineEvents.filter((t) => world.timelineEventIds?.includes(t.id));

  const isFav = isInFavorites(world.id, 'world');

  const toggleFav = () => {
    if (isFav) {
      removeFromFavorites(world.id, 'world');
      toast({ title: 'تمت إزالة العالم من المفضلة' });
    } else {
      addToFavorites({ id: world.id, type: 'world' });
      toast({ title: 'تمت إضافة العالم إلى المفضلة' });
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto font-arabic notranslate" dir="rtl" translate="no">
      <SEOHead
        title={`عالم ${world.nameAr}`}
        description={world.descriptionAr || `تعرف على عالم ${world.nameAr} ومناخه وسكانه في كون حكاياتي`}
        ogImage={world.image}
        canonicalUrl={`/worlds/${world.id}`}
        ogType="article"
      />
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-[#604735] dark:text-zinc-400 mb-6">
        <Link href="/" className="hover:text-[#087C7B] dark:hover:text-white transition-colors">
          الرئيسية
        </Link>
        <ChevronLeft className="w-3.5 h-3.5" />
        <Link href="/worlds" className="hover:text-[#087C7B] dark:hover:text-white transition-colors">
          أطلس العوالم
        </Link>
        <ChevronLeft className="w-3.5 h-3.5" />
        <span className="text-[#087C7B] dark:text-[#E1C58B] font-semibold">{world.nameAr}</span>
      </div>

      {/* Cinematic Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-[#D8C5A8] dark:border-[#C5A15B]/30 mb-12 shadow-xl">
        <div className="relative h-[340px] sm:h-[450px]">
          <img
            src={world.image}
            alt={world.nameAr}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#111C2B] via-[#111C2B]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#111C2B]/80 via-transparent to-transparent" />

          {/* Banner Overlay Info */}
          <div className="absolute bottom-8 right-8 left-8 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div className="max-w-2xl">
              <div className="flex flex-wrap items-center gap-2.5 mb-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#087C7B] dark:bg-[#C5A15B] text-[#F7F1E6] dark:text-[#111C2B]">
                  عالم {world.nameAr}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-black/60 backdrop-blur-md text-zinc-300 border border-white/10">
                  {world.nameEn}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-black/60 backdrop-blur-md text-[#E1C58B] border border-[#C5A15B]/30">
                  المناخ: {world.climateAr}
                </span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-bold text-white mb-2">
                {world.nameAr}
              </h1>
              <p className="text-sm sm:text-base text-zinc-300 line-clamp-2 leading-relaxed">
                {world.descriptionAr}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setShareOpen(true)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold backdrop-blur-md border border-white/20 bg-black/60 text-white hover:border-[#087C7B] dark:hover:border-[#C5A15B] transition-all flex items-center gap-1.5"
                title="مشاركة هذا العالم"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>مشاركة</span>
              </button>
              <button
                type="button"
                onClick={toggleFav}
                className={`px-4 py-2.5 rounded-xl text-xs font-semibold backdrop-blur-md border transition-all ${
                  isFav
                    ? 'bg-red-500/20 text-red-400 border-red-500/40'
                    : 'bg-black/60 text-white border-white/20 hover:border-[#087C7B] dark:hover:border-[#C5A15B]'
                }`}
              >
                {isFav ? '♥ في المفضلة' : '♡ أضف العالم للمفضلة'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <SocialShareModal
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        title={`عالم ${world.nameAr} | حكاياتي`}
        description={world.descriptionAr}
        url={typeof window !== 'undefined' ? window.location.href : `https://hekayaty.com/worlds/${world.id}`}
        imageUrl={world.image}
        contentType="world"
        contentId={world.id}
      />

      {/* Main Dossier Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* Left 2 Cols: Details & Locations */}
        <div className="lg:col-span-2 space-y-8">
          {/* History & Lore */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-4">
            <h3 className="text-lg font-bold text-[#2A1F17] dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#087C7B] dark:text-[#C5A15B]" />
              <span>التاريخ والأصل الكوزمي</span>
            </h3>
            <p className="text-sm sm:text-base text-[#604735] dark:text-zinc-300 leading-relaxed">
              {world.historyAr}
            </p>
          </div>

          {/* Notable Locations */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-5">
            <h3 className="text-lg font-bold text-[#2A1F17] dark:text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#087C7B] dark:text-[#C5A15B]" />
              <span>المعالم الجغرافية والمدن البارزة ({world.notableLocations.length})</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {world.notableLocations.map((loc, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-[#EFE5D4]/80 dark:bg-white/[0.02] border border-[#D8C5A8] dark:border-white/5 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-[#087C7B] dark:text-[#E1C58B]">{loc.nameAr}</h4>
                    <span className="text-[11px] text-[#604735] dark:text-zinc-500">{loc.nameEn}</span>
                  </div>
                  <p className="text-xs text-[#604735] dark:text-zinc-400 leading-relaxed">{loc.descriptionAr}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Organizations / Factions */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-5">
            <h3 className="text-lg font-bold text-[#2A1F17] dark:text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#087C7B] dark:text-[#C5A15B]" />
              <span>الفصائل والمنظمات الحاكمة</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {world.organizations.map((org, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-[#EFE5D4]/80 dark:bg-white/[0.02] border border-[#D8C5A8] dark:border-white/5 space-y-1.5"
                >
                  <h4 className="text-sm font-bold text-[#2A1F17] dark:text-white">{org.nameAr}</h4>
                  <p className="text-xs text-[#604735] dark:text-zinc-400 leading-relaxed">{org.descriptionAr}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Ruler, Quick Meta, Resident Characters */}
        <div className="space-y-6">
          {/* Ruler & Governance */}
          <div className="glass-panel p-6 rounded-3xl space-y-4">
            <h4 className="text-xs font-bold text-[#604735] dark:text-zinc-400 uppercase tracking-wider flex items-center gap-2">
              <Flag className="w-4 h-4 text-[#087C7B] dark:text-[#C5A15B]" />
              <span>نظام الحكم والقيادة</span>
            </h4>
            <div className="p-3.5 rounded-2xl bg-[#EFE5D4]/80 dark:bg-white/[0.03] border border-[#D8C5A8] dark:border-white/5">
              <span className="text-xs text-[#604735] dark:text-zinc-400 block mb-0.5">الحاكم الحالي:</span>
              <span className="text-base font-bold text-[#087C7B] dark:text-[#E1C58B]">{world.rulerAr}</span>
            </div>
          </div>

          {/* Resident Heroes & Characters */}
          <div className="glass-panel p-6 rounded-3xl space-y-4">
            <h4 className="text-xs font-bold text-[#604735] dark:text-zinc-400 uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-[#087C7B] dark:text-[#C5A15B]" />
              <span>أبرز قاطني هذا العالم ({residentCharacters.length})</span>
            </h4>
            <div className="space-y-2.5">
              {residentCharacters.map((char) => (
                <Link
                  key={char.id}
                  href={`/characters/${char.id}`}
                  className="p-3 rounded-2xl bg-[#EFE5D4]/70 dark:bg-white/[0.02] hover:bg-[#EFE5D4] dark:hover:bg-white/[0.06] border border-[#D8C5A8] dark:border-white/5 hover:border-[#087C7B] dark:hover:border-[#C5A15B]/40 flex items-center gap-3 transition-all group"
                >
                  <img
                    src={char.image}
                    alt={char.nameAr}
                    className="w-10 h-10 rounded-full object-cover border border-[#D8C5A8] dark:border-white/10 group-hover:border-[#087C7B] dark:group-hover:border-[#C5A15B]"
                  />
                  <div className="overflow-hidden">
                    <h5 className="text-sm font-bold text-[#2A1F17] dark:text-white group-hover:text-[#087C7B] dark:group-hover:text-[#E1C58B] truncate">
                      {char.nameAr}
                    </h5>
                    <span className="text-[11px] text-[#604735] dark:text-zinc-400">{char.aliasAr}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Connected Comics */}
          {worldComics.length > 0 && (
            <div className="glass-panel p-6 rounded-3xl space-y-4">
              <h4 className="text-xs font-bold text-[#604735] dark:text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#087C7B] dark:text-[#C5A15B]" />
                <span>قصص تدور في هذا العالم ({worldComics.length})</span>
              </h4>
              <div className="space-y-2.5">
                {worldComics.map((comic) => (
                  <Link
                    key={comic.id}
                    href={`/comics/${comic.id}`}
                    className="p-2.5 rounded-2xl bg-[#EFE5D4]/70 dark:bg-white/[0.02] hover:bg-[#EFE5D4] dark:hover:bg-white/[0.06] border border-[#D8C5A8] dark:border-white/5 hover:border-[#087C7B] dark:hover:border-[#C5A15B]/40 flex items-center gap-3 transition-all group"
                  >
                    <img
                      src={comic.coverImage}
                      alt={comic.titleAr}
                      className="w-10 h-14 object-cover rounded-lg border border-[#D8C5A8] dark:border-white/10"
                    />
                    <div className="overflow-hidden">
                      <h5 className="text-xs font-bold text-[#2A1F17] dark:text-white group-hover:text-[#087C7B] dark:group-hover:text-[#E1C58B] truncate">
                        {comic.titleAr}
                      </h5>
                      <span className="text-[10px] text-[#087C7B] dark:text-[#E1C58B]">العدد #{comic.issueNumber}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* World Historical Events */}
      {worldEvents.length > 0 && (
        <div className="mb-12">
          <h3 className="text-xl font-bold text-[#2A1F17] dark:text-white mb-6 flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#087C7B] dark:text-[#C5A15B]" />
            <span>محطات تاريخية كبرى شهدها العالم</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {worldEvents.map((ev) => (
              <div
                key={ev.id}
                className="p-4 rounded-2xl bg-[#EFE5D4]/80 dark:bg-white/[0.02] border border-[#D8C5A8] dark:border-white/5 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#087C7B] dark:text-[#E1C58B] font-semibold">{ev.year}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-[#604735] dark:text-zinc-400">
                    تأثير {ev.impact === 'legendary' ? 'أسطوري' : 'رئيسي'}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-[#2A1F17] dark:text-white">{ev.titleAr}</h4>
                <p className="text-xs text-[#604735] dark:text-zinc-400 leading-relaxed">{ev.descriptionAr}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
