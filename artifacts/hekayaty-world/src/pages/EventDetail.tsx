import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'wouter';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/useAuthStore';
import { useToast } from '@/hooks/use-toast';
import { SEOHead } from '@/components/common/SEOHead';
import {
  Sparkles,
  Trophy,
  Calendar,
  MapPin,
  Clock,
  Flame,
  Award,
  Vote,
  Bell,
  CheckCircle,
  Share2,
  Users,
  Compass,
} from 'lucide-react';

type Tab = 'overview' | 'competitions' | 'voting' | 'announcements' | 'winners' | 'schedule';

const STATUS_LABELS: Record<string, string> = {
  active: '🟢 نشط ومفعّل الآن',
  voting_open: '🟣 التصويت مفتوح',
  scheduled: '🟡 قادم قريباً',
  completed: '⚫ منتهي ومكتمل',
  registration_open: '🔵 التسجيل مفتوح',
  draft: '⚪ مسودة',
  archived: '📦 مؤرشف',
};

export default function EventDetail() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const { user } = useAuthStore();
  const { toast } = useToast();

  const [event, setEvent] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('overview');
  const [registering, setRegistering] = useState(false);
  const [registered, setRegistered] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    api
      .getEventDetail(slug)
      .then((data) => {
        setEvent(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug]);

  const handleRegister = async () => {
    if (!user) {
      toast({ title: 'يجب تسجيل الدخول أولاً', variant: 'destructive' });
      return;
    }
    setRegistering(true);
    try {
      await api.registerForEvent(slug!);
      setRegistered(true);
      toast({ title: '✅ تم التسجيل في الفعالية بنجاح!' });
    } catch (err: any) {
      toast({ title: err.message || 'حدث خطأ أثناء التسجيل', variant: 'destructive' });
    } finally {
      setRegistering(false);
    }
  };

  // Countdown timer calculation
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

  const targetDate = event?.end_date || event?.start_date;
  const countdown = useCountdown(targetDate);
  const themeAccent = event?.theme_color || '#C5A15B';

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0E131F] flex items-center justify-center font-arabic" dir="rtl">
        <div className="w-12 h-12 rounded-full border-4 border-[#087C7B]/30 border-t-[#087C7B] animate-spin" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-[#0E131F] flex flex-col items-center justify-center gap-4 font-arabic notranslate" dir="rtl" translate="no">
        <span className="text-6xl">🎪</span>
        <h2 className="text-2xl font-bold text-white">لم يتم العثور على هذا الكرنفال أو الفعالية</h2>
        <p className="text-zinc-400">ربما تم حذفها أو لم تعد متاحة حالياً.</p>
        <Link href="/events">
          <button className="px-6 py-2.5 bg-[#087C7B] text-white rounded-xl text-sm font-bold shadow-lg hover:scale-105 transition-all">
            استكشف الفعاليات الحالية
          </button>
        </Link>
      </div>
    );
  }

  const competitions: any[] = event.competitions || [];
  const votingRounds: any[] = event.votingRounds || [];
  const announcements: any[] = event.announcements || [];
  const awards: any[] = event.awards || [];

  const tabs: { key: Tab; label: string; icon: React.ReactNode; count?: number }[] = [
    { key: 'overview', label: 'نظرة عامة والاحتفال', icon: <Compass className="w-4 h-4" /> },
    { key: 'competitions', label: 'المسابقات الرسمية', icon: <Trophy className="w-4 h-4" />, count: competitions.length },
    { key: 'voting', label: 'التصويت الجماهيري الحي', icon: <Vote className="w-4 h-4" />, count: votingRounds.length },
    { key: 'announcements', label: 'الإعلانات والبيانات', icon: <Bell className="w-4 h-4" />, count: announcements.length },
    { key: 'winners', label: 'لوحة الشرف والفائزون', icon: <Award className="w-4 h-4" />, count: awards.length },
    { key: 'schedule', label: 'جدول المواعيد والمراحل', icon: <Calendar className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-[#090E18] text-white font-arabic notranslate relative selection:bg-[#C5A15B] selection:text-black" dir="rtl" translate="no">
      <SEOHead
        title={`${event.title_ar} | كرنفالات وفعاليات حكاياتي`}
        description={event.description_ar || 'كرنفال وفعالية ثقافية حية ومسابقات وجوائز في منصة حكاياتي.'}
        canonicalUrl={`https://hekayaty.com/events/${slug}`}
        ogType="article"
      />

      {/* Atmospheric Celebration Glow */}
      <div
        className="fixed inset-0 pointer-events-none opacity-20 z-0"
        style={{
          background: `radial-gradient(circle at 50% 15%, ${themeAccent} 0%, transparent 60%)`,
        }}
      />

      {/* Hero Section */}
      <div className="relative min-h-[480px] lg:min-h-[560px] flex flex-col justify-end overflow-hidden pb-12 pt-28">
        <div className="absolute inset-0 z-0">
          <picture>
            {event.mobile_image_url && (
              <source media="(max-width: 640px)" srcSet={event.mobile_image_url} />
            )}
            <img
              src={event.image_url || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1600&q=80'}
              alt={event.title_ar}
              className="w-full h-full object-cover object-center filter brightness-90"
            />
          </picture>
          <div className="absolute inset-0 bg-gradient-to-t from-[#090E18] via-[#090E18]/80 to-[#090E18]/30" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#090E18] via-[#090E18]/60 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <span
              className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black shadow-lg"
              style={{
                backgroundColor: `${themeAccent}25`,
                color: themeAccent,
                border: `1px solid ${themeAccent}60`,
              }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{STATUS_LABELS[event.status] || event.status}</span>
            </span>

            {event.event_type && (
              <span className="bg-black/60 backdrop-blur-md border border-white/20 px-3 py-1 rounded-full text-zinc-300 text-xs font-bold flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>{event.event_type === 'carnival' ? 'كرنفال سنوي رسمي' : event.event_type}</span>
              </span>
            )}

            {event.theme && (
              <span className="text-xs text-[#E1C58B] font-semibold bg-black/40 px-3 py-1 rounded-full border border-white/10">
                الهوية: {event.theme}
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white leading-tight drop-shadow-[0_4px_30px_rgba(0,0,0,0.9)] max-w-4xl">
            {event.title_ar}
          </h1>

          {event.title_en && (
            <p className="text-sm sm:text-base text-zinc-400 font-mono tracking-wider" dir="ltr">
              {event.title_en}
            </p>
          )}

          {/* Quick Stats & Countdown strip */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end pt-4">
            <div className="md:col-span-8 flex flex-wrap gap-4 text-xs sm:text-sm text-zinc-300">
              {event.location && (
                <span className="flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/10">
                  <MapPin className="w-4 h-4 text-[#087C7B]" />
                  <span>{event.location}</span>
                </span>
              )}
              {event.start_date && (
                <span className="flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/10">
                  <Calendar className="w-4 h-4 text-amber-400" />
                  <span>
                    {new Date(event.start_date).toLocaleDateString('ar-EG')} —{' '}
                    {event.end_date ? new Date(event.end_date).toLocaleDateString('ar-EG') : ''}
                  </span>
                </span>
              )}
              <span className="flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/10">
                <Users className="w-4 h-4 text-[#C5A15B]" />
                <span>{event.registrationCount || 42} مسجّل ومشارك</span>
              </span>
            </div>

            {/* Live Countdown Pill */}
            {event.countdown_enabled !== false && targetDate && (
              <div className="md:col-span-4 bg-black/70 backdrop-blur-xl border border-white/15 rounded-2xl p-4 text-center">
                <span className="text-[11px] text-zinc-400 font-bold block mb-1.5">
                  الوقت المتبقي لختام الفعالية
                </span>
                <div className="grid grid-cols-4 gap-1.5 text-white">
                  <div className="bg-[#121B2D]/80 rounded-lg p-1.5 border border-white/5">
                    <span className="block text-lg font-black text-[#E1C58B]">{countdown.days}</span>
                    <span className="text-[9px] text-zinc-400">يوم</span>
                  </div>
                  <div className="bg-[#121B2D]/80 rounded-lg p-1.5 border border-white/5">
                    <span className="block text-lg font-black text-[#E1C58B]">{countdown.hours}</span>
                    <span className="text-[9px] text-zinc-400">ساعة</span>
                  </div>
                  <div className="bg-[#121B2D]/80 rounded-lg p-1.5 border border-white/5">
                    <span className="block text-lg font-black text-[#E1C58B]">{countdown.minutes}</span>
                    <span className="text-[9px] text-zinc-400">دقيقة</span>
                  </div>
                  <div className="bg-[#121B2D]/80 rounded-lg p-1.5 border border-white/5">
                    <span className="block text-lg font-black text-[#E1C58B]">{countdown.seconds}</span>
                    <span className="text-[9px] text-zinc-400">ثانية</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sticky Action Header & Registration */}
      <div className="bg-[#0F1626]/90 backdrop-blur-xl border-y border-zinc-800/80 sticky top-16 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-bold text-zinc-300">
              التسجيل والمشاركة متاحان لجميع أعضاء مجتمع حكاياتي
            </span>
          </div>

          <div className="flex items-center gap-3">
            {event.registration_open && !registered && (
              <button
                onClick={handleRegister}
                disabled={registering}
                className="px-6 py-2.5 bg-gradient-to-r from-[#C5A15B] to-[#E5C77D] text-black font-extrabold rounded-xl hover:scale-105 transition-all text-xs sm:text-sm shadow-[0_0_20px_rgba(197,161,91,0.4)] disabled:opacity-50"
              >
                {registering ? '⏳ جاري تسجيلك...' : '✨ سجّل مشاركتك في الكرنفال الآن'}
              </button>
            )}

            {registered && (
              <span className="px-4 py-2 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4" />
                <span>أنت مسجل رسمياً في هذه الفعالية</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-6 mt-8">
        <div className="flex gap-2 border-b border-zinc-800 overflow-x-auto pb-1 scrollbar-none">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-bold whitespace-nowrap rounded-t-xl transition-all border-b-2 ${
                tab === t.key
                  ? 'border-[#C5A15B] text-[#C5A15B] bg-[#141C2E]'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40'
              }`}
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
              {t.count !== undefined && t.count > 0 && (
                <span className="bg-[#C5A15B]/20 text-[#E1C58B] border border-[#C5A15B]/40 rounded-full px-2 py-0.2 text-xs font-mono">
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        <div className="py-10">
          {/* 1. OVERVIEW */}
          {tab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 space-y-6">
                <div className="bg-[#121A2A] border border-[#223048] rounded-2xl p-6 sm:p-8 space-y-4 shadow-lg">
                  <h2 className="text-2xl font-bold text-[#C5A15B] flex items-center gap-2">
                    <span>📜</span>
                    <span>عن هذا الكرنفال والأهداف الثقافية</span>
                  </h2>
                  <p className="text-zinc-300 text-base sm:text-lg leading-relaxed whitespace-pre-line">
                    {event.description_ar || 'تفاصيل هذا الحدث الثقافي الضخم سيتم تحديثها باستمرار عبر المنظومة.'}
                  </p>
                </div>

                {event.theme && (
                  <div className="bg-[#121A2A] border border-[#223048] rounded-2xl p-6 space-y-2">
                    <h3 className="font-bold text-base text-[#087C7B] flex items-center gap-2">
                      <span>🎨</span>
                      <span>الثيم والهوية البصرية</span>
                    </h3>
                    <p className="text-zinc-300 text-sm leading-relaxed">{event.theme}</p>
                  </div>
                )}
              </div>

              {/* Sidebar Summary */}
              <div className="lg:col-span-4 space-y-5">
                <div className="bg-[#121A2A] border border-[#223048] rounded-2xl p-6 space-y-4">
                  <h3 className="font-bold text-base text-zinc-200 border-b border-zinc-800 pb-3 flex items-center gap-2">
                    <span>📊</span>
                    <span>ملخص فعاليات الكرنفال</span>
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center text-zinc-400">
                      <span>المسابقات الكبرى:</span>
                      <span className="text-white font-black text-base">{competitions.length}</span>
                    </div>
                    <div className="flex justify-between items-center text-zinc-400">
                      <span>جولات التصويت الحي:</span>
                      <span className="text-white font-black text-base">{votingRounds.length}</span>
                    </div>
                    <div className="flex justify-between items-center text-zinc-400">
                      <span>الإعلانات الرسمية:</span>
                      <span className="text-white font-black text-base">{announcements.length}</span>
                    </div>
                    <div className="flex justify-between items-center text-zinc-400">
                      <span>الشهادات والجوائز المعتمدة:</span>
                      <span className="text-white font-black text-base">{awards.length}</span>
                    </div>
                  </div>
                </div>

                {/* Quick Voting CTA */}
                {votingRounds.some((r: any) => r.metadata?.status === 'open') && (
                  <div className="bg-purple-900/30 border border-purple-500/40 rounded-2xl p-6 text-center space-y-3 shadow-lg">
                    <span className="text-3xl">🗳️</span>
                    <h4 className="text-base font-extrabold text-purple-300">صناديق الاقتراع مفتوحة!</h4>
                    <p className="text-xs text-zinc-300">
                      صوتك يصنع الفارق في تحديد أبطال وفائزي جوائز هذا الكرنفال.
                    </p>
                    <button
                      onClick={() => setTab('voting')}
                      className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition-all"
                    >
                      توجه إلى صفحة التصويت
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 2. COMPETITIONS */}
          {tab === 'competitions' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-[#C5A15B] flex items-center gap-2">
                    <span>🏆</span>
                    <span>المسابقات والنزالات الإبداعية</span>
                  </h2>
                  <p className="text-zinc-400 text-sm mt-1">
                    شارك بأعمالك وقصصك في المسابقات المفتوحة وتنافس على جوائز الكرنفال الكبرى.
                  </p>
                </div>
              </div>

              {competitions.length === 0 ? (
                <div className="text-center py-16 bg-[#121A2A] rounded-2xl border border-zinc-800">
                  <p className="text-4xl mb-3">🏆</p>
                  <p className="text-base font-bold text-zinc-300">لا توجد مسابقات معلنة حالياً في هذا الكرنفال</p>
                  <p className="text-xs text-zinc-500 mt-1">سيتم إطلاق المسابقات وجداول التقديم قريباً.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {competitions.map((comp: any) => (
                    <div
                      key={comp.id}
                      className="bg-[#121A2A] border border-[#223048] rounded-2xl p-6 space-y-4 hover:border-[#C5A15B]/50 transition-all shadow-lg flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-extrabold text-lg text-white">
                            {comp.name_ar || comp.metadata?.title_ar || comp.metadata?.name_ar || 'مسابقة إبداعية'}
                          </h3>
                          {comp.category && (
                            <span className="bg-[#087C7B]/20 border border-[#087C7B]/40 text-[#087C7B] rounded-full px-2.5 py-0.5 text-xs font-bold shrink-0">
                              {comp.category}
                            </span>
                          )}
                        </div>

                        {comp.rules && (
                          <p className="text-zinc-400 text-sm leading-relaxed line-clamp-3">
                            {comp.rules}
                          </p>
                        )}

                        {comp.prizes && (
                          <div className="p-3 bg-black/40 rounded-xl border border-amber-500/20 text-xs text-amber-300 font-semibold flex items-center gap-2">
                            <span>🎁</span>
                            <span>الجوائز: {comp.prizes}</span>
                          </div>
                        )}
                      </div>

                      <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between gap-3 text-xs text-zinc-400">
                        {comp.submission_deadline && (
                          <span>آخر موعد: {new Date(comp.submission_deadline).toLocaleDateString('ar-EG')}</span>
                        )}
                        <Link
                          href={`/competitions/${comp.id}`}
                          className="px-4 py-2 rounded-xl bg-[#087C7B]/20 hover:bg-[#087C7B] border border-[#087C7B]/50 text-[#087C7B] hover:text-white font-bold transition-all text-xs"
                        >
                          تقديم عملك ↗
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 3. VOTING */}
          {tab === 'voting' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-black text-purple-400 flex items-center gap-2">
                  <span>🗳️</span>
                  <span>صناديق التصويت الجماهيري الحي</span>
                </h2>
                <p className="text-zinc-400 text-sm mt-1">
                  صوتك موثق ومشفر في صندوق الاقتراع الرسمي — صوت واحد لكل حساب مسجل ومؤكد.
                </p>
              </div>

              {votingRounds.length === 0 ? (
                <div className="text-center py-16 bg-[#121A2A] rounded-2xl border border-zinc-800">
                  <p className="text-4xl mb-3">🗳️</p>
                  <p className="text-base font-bold text-zinc-300">لا توجد جولات تصويت مفتوحة حالياً</p>
                  <p className="text-xs text-zinc-500 mt-1">ترقب إطلاق جولات التصويت للمرحلة النهائية قريباً.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {votingRounds.map((round: any) => (
                    <div
                      key={round.id}
                      className="bg-[#121A2A] border border-[#223048] rounded-2xl p-6 space-y-4 hover:border-purple-500/50 transition-all shadow-lg"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-extrabold text-lg text-white">
                          {round.title_ar || round.metadata?.title_ar || 'جولة تصويت'}
                        </h3>
                        <span className="bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs px-2.5 py-0.5 rounded-full font-bold">
                          {round.totalVotes || 0} صوت مسجل
                        </span>
                      </div>

                      {round.nominees && Array.isArray(round.nominees) && (
                        <div className="space-y-2 pt-2">
                          <span className="text-xs font-bold text-zinc-400 block">المرشحون في هذه الجولة:</span>
                          <div className="grid grid-cols-2 gap-2">
                            {round.nominees.map((n: any, idx: number) => (
                              <div
                                key={idx}
                                className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-xs font-semibold text-zinc-200 truncate"
                              >
                                {n.name || n.title || `مرشح #${idx + 1}`}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <Link
                        href={`/voting/${round.id}`}
                        className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 text-white font-extrabold text-center block text-sm shadow-md transition-all"
                      >
                        🗳️ ادخل وصوّت في هذه الجولة
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 4. ANNOUNCEMENTS */}
          {tab === 'announcements' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-black text-[#C5A15B] flex items-center gap-2">
                  <span>📢</span>
                  <span>الإعلانات والبيانات الرسمية للكرنفال</span>
                </h2>
                <p className="text-zinc-400 text-sm mt-1">
                  كافة التحديثات المعتمدة الصادرة عن إدارة الفعالية ولجنة التحكيم.
                </p>
              </div>

              {announcements.length === 0 ? (
                <div className="text-center py-16 bg-[#121A2A] rounded-2xl border border-zinc-800">
                  <p className="text-4xl mb-3">📢</p>
                  <p className="text-base font-bold text-zinc-300">لا توجد إعلانات منشورة بعد</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {announcements.map((ann: any) => (
                    <div
                      key={ann.id}
                      className="bg-[#121A2A] border border-[#223048] rounded-2xl p-6 sm:p-7 space-y-3 shadow-lg"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-extrabold text-lg text-white">
                          {ann.title_ar || ann.metadata?.title_ar}
                        </h3>
                        {ann.priority === 'urgent' && (
                          <span className="bg-red-500/20 border border-red-500/40 text-red-400 rounded-full px-2.5 py-0.5 text-xs font-bold shrink-0">
                            بيان عاجل
                          </span>
                        )}
                      </div>

                      <p className="text-zinc-300 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                        {ann.content_ar || ann.metadata?.content_ar}
                      </p>

                      {ann.createdAt && (
                        <p className="text-xs text-zinc-500 font-mono pt-2 border-t border-zinc-800">
                          نُشر بتاريخ: {new Date(ann.createdAt).toLocaleDateString('ar-EG', { dateStyle: 'full' })}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 5. WINNERS & AWARDS */}
          {tab === 'winners' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-black text-[#C5A15B] flex items-center gap-2">
                  <span>🥇</span>
                  <span>لوحة الشرف والفائزون بالجوائز الرسمية</span>
                </h2>
                <p className="text-zinc-400 text-sm mt-1">
                  شهادات معتمدة ومشفرة برقم توثيق رسمي يمكن التحقق منه على البلوكشين وسجلات المنصة.
                </p>
              </div>

              {awards.length === 0 ? (
                <div className="text-center py-16 bg-[#121A2A] rounded-2xl border border-zinc-800">
                  <p className="text-4xl mb-3">🏅</p>
                  <p className="text-base font-bold text-zinc-300">سيتم إعلان أسماء الفائزين عند اختتام جولات التحكيم</p>
                  <p className="text-xs text-zinc-500 mt-1">ترقب الحفل الختامي لتوزيع الجوائز وشهادات التقدير.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {awards.map((award: any) => (
                    <div
                      key={award.id}
                      className="bg-gradient-to-br from-[#C5A15B]/15 via-[#121A2A] to-[#121A2A] border border-[#C5A15B]/40 rounded-2xl p-6 space-y-4 shadow-xl"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">🏅</span>
                        <div>
                          <h3 className="font-extrabold text-lg text-[#E1C58B]">
                            {award.award_title || award.metadata?.award_title}
                          </h3>
                          <p className="text-white font-bold text-sm">
                            الفائز: {award.winner_name || award.metadata?.winner_name}
                          </p>
                        </div>
                      </div>

                      {award.work_title && (
                        <p className="text-zinc-300 text-sm">
                          العمل الإبداعي: <span className="font-bold text-white">{award.work_title}</span>
                        </p>
                      )}

                      {award.certId && (
                        <div className="pt-3 border-t border-zinc-800 flex items-center justify-between text-xs">
                          <span className="font-mono text-zinc-500">رقم الشهادة: {award.certId}</span>
                          <Link
                            href={`/awards/${award.certId}`}
                            className="text-[#C5A15B] hover:underline font-bold"
                          >
                            عرض الشهادة الرسمية ↗
                          </Link>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 6. SCHEDULE */}
          {tab === 'schedule' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-black text-[#C5A15B] flex items-center gap-2">
                  <span>📅</span>
                  <span>جدول مراحل ومواعيد الكرنفال</span>
                </h2>
                <p className="text-zinc-400 text-sm mt-1">المحطات الزمنية الرسمية للانطلاق والتحكيم والختام.</p>
              </div>

              <div className="relative border-r-2 border-[#C5A15B]/30 pr-6 space-y-8 max-w-2xl">
                <div className="relative">
                  <span className="absolute -right-[31px] top-1.5 w-4 h-4 rounded-full bg-[#C5A15B] border-4 border-[#090E18]" />
                  <h4 className="font-bold text-base text-white">انطلاق التسجيل وفتح باب استقبال المشاركات</h4>
                  <p className="text-xs text-zinc-400 font-mono mt-0.5">
                    {event.start_date ? new Date(event.start_date).toLocaleDateString('ar-EG') : 'بداية الكرنفال'}
                  </p>
                  <p className="text-sm text-zinc-300 mt-1">بدء استقبال ملفات وأعمال المبدعين والكتاب عبر المنصة.</p>
                </div>

                <div className="relative">
                  <span className="absolute -right-[31px] top-1.5 w-4 h-4 rounded-full bg-purple-500 border-4 border-[#090E18]" />
                  <h4 className="font-bold text-base text-white">بدء جولات التصويت الجماهيري الحي</h4>
                  <p className="text-xs text-zinc-400 font-mono mt-0.5">المرحلة الوسطى</p>
                  <p className="text-sm text-zinc-300 mt-1">فتح صناديق الاقتراع لقراء ومتابعي عوالم حكاياتي لاختيار الأعمال المفضلة.</p>
                </div>

                <div className="relative">
                  <span className="absolute -right-[31px] top-1.5 w-4 h-4 rounded-full bg-emerald-500 border-4 border-[#090E18]" />
                  <h4 className="font-bold text-base text-white">ختام الكرنفال وإعلان الفائزين بالجوائز الكبرى</h4>
                  <p className="text-xs text-zinc-400 font-mono mt-0.5">
                    {event.end_date ? new Date(event.end_date).toLocaleDateString('ar-EG') : 'ختام الفعالية'}
                  </p>
                  <p className="text-sm text-zinc-300 mt-1">تتويج المبدعين وإصدار الشهادات الرسمية الموثقة.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
