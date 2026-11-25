import React, { useState } from 'react';
import { useWorlds, useCharacters, useComics } from '@/lib/hooks';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import {
  Compass,
  Globe,
  ChevronLeft,
  Users,
  BookOpen,
  MapPin,
  Shield,
  Layers,
} from 'lucide-react';

export default function Worlds() {
  const [alignmentFilter, setAlignmentFilter] = useState<'all' | 'light' | 'dark' | 'neutral'>('all');
  const { data: worlds = [] } = useWorlds();
  const { data: characters = [] } = useCharacters();
  const { data: comics = [] } = useComics();

  const filteredWorlds = worlds.filter(
    (w) => alignmentFilter === 'all' || w.alignment === alignmentFilter
  );

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto font-arabic" dir="rtl">
      {/* Header */}
      <div className="mb-12 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#087C7B]/10 dark:bg-[#C5A15B]/10 border border-[#087C7B]/30 dark:border-[#C5A15B]/30 text-[#087C7B] dark:text-[#E1C58B] text-xs font-semibold mb-3">
          <Globe className="w-3.5 h-3.5" />
          <span>أطلس الأبعاد والعوالم الكوزمية</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold text-[#2A1F17] dark:text-white mb-4">
          عوالم <span className="gold-gradient">حكاياتي</span>
        </h1>
        <p className="text-base text-[#604735] dark:text-zinc-400 leading-relaxed">
          يمتد كون حكاياتي عبر أبعاد متداخلة، من إمبراطوريات الصحراء الذهبية إلى المدن الفضائية
          السحيقة وأعماق المحيطات وأبعاد المادة المظلمة.
        </p>

        {/* Alignment Filters */}
        <div className="flex justify-center gap-2 mt-8">
          {[
            { key: 'all', label: 'كافة العوالم' },
            { key: 'light', label: 'عوالم النور' },
            { key: 'neutral', label: 'حواضر محايدة' },
            { key: 'dark', label: 'أبعاد الظلال' },
          ].map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setAlignmentFilter(item.key as any)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                alignmentFilter === item.key
                  ? 'bg-[#087C7B] dark:bg-[#C5A15B] text-[#F7F1E6] dark:text-[#111C2B] shadow-md'
                  : 'bg-[#EFE5D4]/70 dark:bg-white/[0.04] text-[#604735] dark:text-zinc-300 hover:text-[#087C7B] dark:hover:text-white border border-[#D8C5A8] dark:border-white/5'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Worlds List */}
      {filteredWorlds.length === 0 ? (
        <div className="glass-panel rounded-3xl p-16 text-center border border-[#D8C5A8] dark:border-white/10 max-w-xl mx-auto shadow-sm">
          <Globe className="w-16 h-16 mx-auto mb-4 text-[#087C7B]/40 dark:text-[#C5A15B]/40" />
          <h3 className="text-lg font-bold text-[#2A1F17] dark:text-white mb-2">لا توجد عوالم مسجلة حالياً</h3>
          <p className="text-xs sm:text-sm text-[#604735] dark:text-zinc-400">
            سيتم فتح بوابات الأبعاد والعوالم فور توثيقها وإدراجها في قاعدة البيانات.
          </p>
        </div>
      ) : (
        <div className="space-y-16">
          {filteredWorlds.map((world, index) => {
          const worldChars = characters.filter((c) => c.worldId === world.id);
          const worldComics = comics.filter((c) => c.worldId === world.id);
          const isReverse = index % 2 !== 0;

          return (
            <motion.div
              key={world.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5 }}
              className={`glass-panel rounded-3xl p-6 sm:p-8 flex flex-col ${
                isReverse ? 'lg:flex-row-reverse' : 'lg:flex-row'
              } gap-8 items-center transition-all duration-300 shadow-md`}
            >
              {/* World Image Box */}
              <div className="w-full lg:w-1/2">
                <Link href={`/worlds/${world.id}`} className="block group">
                  <div className="relative aspect-[16/10] rounded-2xl overflow-hidden border border-[#D8C5A8] dark:border-white/10 group-hover:border-[#087C7B] dark:group-hover:border-[#C5A15B]/50 shadow-lg">
                    <img
                      src={world.image}
                      alt={world.nameAr}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#111C2B] via-transparent to-transparent opacity-75" />

                    <div className="absolute bottom-4 right-4 left-4 flex items-center justify-between">
                      <span className="text-xs font-semibold px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-[#E1C58B] border border-[#C5A15B]/30">
                        {world.climateAr}
                      </span>
                      <div className="w-10 h-10 rounded-full bg-[#087C7B] dark:bg-[#C5A15B] text-[#F7F1E6] dark:text-[#111C2B] flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all shadow-md">
                        <ChevronLeft className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                </Link>
              </div>

              {/* World Information */}
              <div className="w-full lg:w-1/2 flex flex-col justify-between space-y-5">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#087C7B]/10 dark:bg-[#C5A15B]/15 text-[#087C7B] dark:text-[#E1C58B] border border-[#087C7B]/30 dark:border-[#C5A15B]/30">
                      {world.nameEn}
                    </span>
                    <span className="text-xs text-[#604735] dark:text-zinc-500 font-semibold">
                      الحاكم: {world.rulerAr}
                    </span>
                  </div>

                  <h2 className="text-2xl sm:text-4xl font-bold text-[#2A1F17] dark:text-white mb-3">
                    عالم <span className="gold-gradient">{world.nameAr}</span>
                  </h2>

                  <p className="text-sm sm:text-base text-[#604735] dark:text-zinc-300 leading-relaxed mb-4">
                    {world.descriptionAr}
                  </p>
                </div>

                {/* Notable locations preview */}
                <div>
                  <h4 className="text-xs font-bold text-[#604735] dark:text-zinc-400 mb-2 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#087C7B] dark:text-[#C5A15B]" />
                    <span>أبرز المعالم الجغرافية:</span>
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {world.notableLocations.map((loc, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-[#EFE5D4] dark:bg-white/[0.03] border border-[#D8C5A8] dark:border-white/5 text-xs text-[#2A1F17] dark:text-zinc-300"
                      >
                        {loc.nameAr}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Linked residents & comics */}
                <div className="pt-4 border-t border-[#D8C5A8]/50 dark:border-white/10 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4 text-xs text-[#604735] dark:text-zinc-400">
                    <span className="flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-[#087C7B] dark:text-[#C5A15B]" />
                      <strong>{worldChars.length}</strong> شخصيات مرتبطة
                    </span>
                    <span className="flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-[#087C7B] dark:text-[#C5A15B]" />
                      <strong>{worldComics.length}</strong> أعداد كوميكس
                    </span>
                  </div>

                  <Link
                    href={`/worlds/${world.id}`}
                    className="py-2.5 px-5 rounded-xl bg-[#087C7B] dark:bg-[#C5A15B] hover:bg-[#075B5C] dark:hover:bg-[#B28F4B] text-[#F7F1E6] dark:text-[#111C2B] font-bold text-xs flex items-center gap-2 transition-all shadow-md"
                  >
                    <span>استكشف الملف الكامل للعالم</span>
                    <ChevronLeft className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
      )}
    </div>
  );
}
