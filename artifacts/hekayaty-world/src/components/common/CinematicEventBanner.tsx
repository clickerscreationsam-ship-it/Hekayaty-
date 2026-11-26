import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'wouter';
import { Sparkles, Calendar, MapPin, ChevronRight, ChevronLeft, Flame, Trophy, Users, ArrowUpRight } from 'lucide-react';

interface EventItem {
  id: string;
  slug?: string;
  title_ar: string;
  title_en?: string;
  description_ar?: string;
  image_url?: string;
  mobile_image_url?: string;
  event_type?: string;
  status?: string;
  theme?: string;
  theme_color?: string;
  start_date?: string;
  end_date?: string;
  location?: string;
  is_featured?: boolean;
  countdown_enabled?: boolean;
  custom_cta_label?: string;
  custom_cta_url?: string;
}

interface Props {
  events: EventItem[];
}

export function CinematicEventBanner({ events }: Props) {
  // Only display active or voting_open events that are featured or active
  const activeEvents = events.filter(
    (e) => e.status === 'active' || e.status === 'voting_open' || e.status === 'registration_open'
  );

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (activeEvents.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeEvents.length);
    }, 9000);
    return () => clearInterval(interval);
  }, [activeEvents.length]);

  if (!activeEvents || activeEvents.length === 0) {
    return null;
  }

  const current = activeEvents[currentIndex] || activeEvents[0];
  const targetDate = current.end_date || current.start_date;

  // Countdown timer hook/logic
  function useCountdown(dateStr?: string) {
    const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    });

    useEffect(() => {
      if (!dateStr) return;
      const target = new Date(dateStr).getTime();

      const update = () => {
        const now = new Date().getTime();
        const diff = Math.max(0, target - now);

        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((diff % (1000 * 60)) / 1000),
        });
      };

      update();
      const interval = setInterval(update, 1000);
      return () => clearInterval(interval);
    }, [dateStr]);

    return timeLeft;
  }

  const countdown = useCountdown(targetDate);
  const themeAccent = current.theme_color || '#C5A15B';

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % activeEvents.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + activeEvents.length) % activeEvents.length);

  return (
    <section className="relative w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 my-8 font-arabic notranslate" dir="rtl" translate="no">
      <div className="relative rounded-3xl overflow-hidden border border-[#C5A15B]/30 shadow-[0_15px_60px_rgba(0,0,0,0.85)] bg-[#0B1220]">
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id || current.slug || currentIndex}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.7 }}
            className="relative min-h-[460px] sm:min-h-[520px] flex flex-col justify-end p-6 sm:p-10 lg:p-14 overflow-hidden"
          >
            {/* Background Images: Desktop + Mobile */}
            <div className="absolute inset-0 z-0">
              <picture>
                {current.mobile_image_url && (
                  <source media="(max-width: 640px)" srcSet={current.mobile_image_url} />
                )}
                <img
                  src={current.image_url || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1600&q=80'}
                  alt={current.title_ar}
                  className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-1000"
                />
              </picture>

              {/* Cinematic Multilayered Darkening Overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#090E18] via-[#090E18]/85 to-transparent sm:via-[#090E18]/70" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#090E18] via-[#090E18]/80 to-transparent" />
              <div
                className="absolute inset-0 opacity-20 pointer-events-none mix-blend-color-dodge"
                style={{
                  background: `radial-gradient(circle at 20% 40%, ${themeAccent} 0%, transparent 70%)`,
                }}
              />
            </div>

            {/* Top Status & Controls Bar */}
            <div className="relative z-10 flex items-center justify-between gap-4 mb-auto pb-6">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black shadow-lg"
                  style={{
                    backgroundColor: `${themeAccent}25`,
                    color: themeAccent,
                    border: `1px solid ${themeAccent}60`,
                  }}
                >
                  <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                  <span>احتفال رسمي جارٍ الآن</span>
                </span>

                <span className="bg-black/60 backdrop-blur-md border border-white/15 px-3 py-1 rounded-full text-zinc-300 text-xs font-bold flex items-center gap-1.5">
                  <Flame className="w-3 h-3 text-amber-400" />
                  <span>{current.event_type === 'carnival' ? 'كرنفال سنوي' : 'فعالية خاصة'}</span>
                </span>
              </div>

              {/* Slider Dots / Controls */}
              {activeEvents.length > 1 && (
                <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                  <button
                    onClick={prevSlide}
                    className="p-1 hover:text-[#C5A15B] text-zinc-400 transition-colors"
                    aria-label="Previous event"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <span className="text-[11px] font-mono text-zinc-400 px-1">
                    {currentIndex + 1} / {activeEvents.length}
                  </span>
                  <button
                    onClick={nextSlide}
                    className="p-1 hover:text-[#C5A15B] text-zinc-400 transition-colors"
                    aria-label="Next event"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Main Content Info */}
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
              <div className="lg:col-span-8 space-y-4">
                {current.theme && (
                  <p
                    className="text-xs sm:text-sm font-bold tracking-wide uppercase flex items-center gap-2"
                    style={{ color: themeAccent }}
                  >
                    <Trophy className="w-4 h-4 shrink-0" />
                    <span>الهوية: {current.theme}</span>
                  </p>
                )}

                <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white leading-tight drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)]">
                  {current.title_ar}
                </h2>

                {current.description_ar && (
                  <p className="text-zinc-300 text-sm sm:text-base leading-relaxed line-clamp-2 sm:line-clamp-3 max-w-2xl drop-shadow-md">
                    {current.description_ar}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-zinc-400 pt-1">
                  {current.location && (
                    <span className="flex items-center gap-1.5 bg-black/40 px-3 py-1 rounded-lg border border-white/10">
                      <MapPin className="w-3.5 h-3.5 text-[#087C7B]" />
                      <span>{current.location}</span>
                    </span>
                  )}
                  {current.start_date && (
                    <span className="flex items-center gap-1.5 bg-black/40 px-3 py-1 rounded-lg border border-white/10">
                      <Calendar className="w-3.5 h-3.5 text-amber-400" />
                      <span>
                        {new Date(current.start_date).toLocaleDateString('ar-EG', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </span>
                    </span>
                  )}
                </div>

                {/* Call-to-action buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-3">
                  <Link
                    href={current.custom_cta_url || `/events/${current.slug || current.id}`}
                    className="px-6 py-3.5 rounded-2xl font-black text-sm text-black flex items-center gap-2 shadow-[0_0_30px_rgba(197,161,91,0.5)] hover:scale-105 transition-all"
                    style={{
                      background: `linear-gradient(135deg, ${themeAccent}, #F0DEB4)`,
                    }}
                  >
                    <span>{current.custom_cta_label || 'استكشف الفعالية والأنشطة'}</span>
                    <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                  </Link>

                  <Link
                    href={`/events/${current.slug || current.id}`}
                    className="px-5 py-3.5 rounded-2xl bg-black/60 hover:bg-black/90 text-white font-bold text-sm border border-white/20 hover:border-[#C5A15B] transition-all flex items-center gap-2 backdrop-blur-md"
                  >
                    <Users className="w-4 h-4 text-[#C5A15B]" />
                    <span>المسابقات والتصويت الحي</span>
                  </Link>
                </div>
              </div>

              {/* Countdown Column */}
              {current.countdown_enabled !== false && targetDate && (
                <div className="lg:col-span-4 bg-black/60 backdrop-blur-xl border border-white/15 rounded-2xl p-5 sm:p-6 text-center space-y-3 shadow-2xl">
                  <span className="text-xs font-bold text-zinc-400 block">
                    الوقت المتبقي لختام الفعالية
                  </span>
                  <div className="grid grid-cols-4 gap-2 text-white">
                    <div className="bg-[#121B2D]/80 rounded-xl p-2 border border-white/10">
                      <span className="block text-xl sm:text-2xl font-black text-[#E1C58B]">
                        {countdown.days}
                      </span>
                      <span className="text-[10px] text-zinc-400 font-bold">يوم</span>
                    </div>
                    <div className="bg-[#121B2D]/80 rounded-xl p-2 border border-white/10">
                      <span className="block text-xl sm:text-2xl font-black text-[#E1C58B]">
                        {countdown.hours}
                      </span>
                      <span className="text-[10px] text-zinc-400 font-bold">ساعة</span>
                    </div>
                    <div className="bg-[#121B2D]/80 rounded-xl p-2 border border-white/10">
                      <span className="block text-xl sm:text-2xl font-black text-[#E1C58B]">
                        {countdown.minutes}
                      </span>
                      <span className="text-[10px] text-zinc-400 font-bold">دقيقة</span>
                    </div>
                    <div className="bg-[#121B2D]/80 rounded-xl p-2 border border-white/10">
                      <span className="block text-xl sm:text-2xl font-black text-[#E1C58B]">
                        {countdown.seconds}
                      </span>
                      <span className="text-[10px] text-zinc-400 font-bold">ثانية</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    شارك وقدم أعمالك وصوت قبل انتهاء الجولات الرسمية.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
