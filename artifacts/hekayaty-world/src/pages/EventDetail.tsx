import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'wouter';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/useAuthStore';
import { useToast } from '@/hooks/use-toast';

type Tab = 'overview' | 'competitions' | 'voting' | 'announcements' | 'winners';

const STATUS_LABELS: Record<string, string> = {
  active: 'نشط',
  voting_open: 'التصويت مفتوح',
  scheduled: 'قادم قريباً',
  completed: 'منتهي',
  registration_open: 'التسجيل مفتوح',
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
    api.getEventDetail(slug).then(data => {
      setEvent(data);
      setLoading(false);
    }).catch(() => setLoading(false));
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0E131F] flex items-center justify-center" dir="rtl">
        <div className="w-12 h-12 rounded-full border-4 border-[#087C7B]/30 border-t-[#087C7B] animate-spin" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-[#0E131F] flex flex-col items-center justify-center gap-4 font-arabic" dir="rtl">
        <span className="text-5xl">🎪</span>
        <p className="text-zinc-400">لم يتم العثور على هذه الفعالية</p>
        <Link href="/events">
          <button className="px-4 py-2 bg-[#087C7B] text-white rounded-lg text-sm">العودة للفعاليات</button>
        </Link>
      </div>
    );
  }

  const competitions: any[] = event.competitions || [];
  const votingRounds: any[] = event.votingRounds || [];
  const announcements: any[] = event.announcements || [];
  const awards: any[] = event.awards || [];

  const tabs: { key: Tab; label: string; icon: string; count?: number }[] = [
    { key: 'overview', label: 'نظرة عامة', icon: '📋' },
    { key: 'competitions', label: 'المسابقات', icon: '🏆', count: competitions.length },
    { key: 'voting', label: 'التصويت', icon: '🗳️', count: votingRounds.length },
    { key: 'announcements', label: 'الإعلانات', icon: '📢', count: announcements.length },
    { key: 'winners', label: 'الفائزون', icon: '🥇', count: awards.length },
  ];

  return (
    <div className="min-h-screen bg-[#0E131F] text-white font-arabic" dir="rtl">
      {/* Hero */}
      <div className="relative h-[380px] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${event.image_url || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1600&q=80'}')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-[#0E131F]" />
        <div className="relative z-10 h-full flex flex-col justify-end px-6 pb-8 max-w-6xl mx-auto">
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="bg-[#087C7B]/30 border border-[#087C7B]/50 text-[#087C7B] rounded-full px-3 py-0.5 text-xs font-bold">
              {STATUS_LABELS[event.status] || event.status}
            </span>
            {event.event_type && (
              <span className="bg-[#C5A15B]/20 border border-[#C5A15B]/40 text-[#C5A15B] rounded-full px-3 py-0.5 text-xs font-bold">
                {event.event_type}
              </span>
            )}
          </div>
          <h1 className="text-3xl md:text-5xl font-bold drop-shadow-lg">{event.title_ar}</h1>
          {event.theme && <p className="text-[#C5A15B] mt-1 text-sm">{event.theme}</p>}
        </div>
      </div>

      {/* Action Bar */}
      <div className="bg-zinc-900/80 border-b border-zinc-800 sticky top-16 z-20">
        <div className="max-w-6xl mx-auto px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-4 text-sm text-zinc-400">
            {event.location && <span>📍 {event.location}</span>}
            {event.start_date && <span>🗓️ {new Date(event.start_date).toLocaleDateString('ar-EG')} — {event.end_date ? new Date(event.end_date).toLocaleDateString('ar-EG') : ''}</span>}
          </div>
          {event.registration_open && !registered && (
            <button
              onClick={handleRegister}
              disabled={registering}
              className="px-5 py-2 bg-gradient-to-r from-[#C5A15B] to-[#D4AF37] text-black font-bold rounded-xl hover:opacity-90 transition-all text-sm disabled:opacity-50"
            >
              {registering ? '⏳ جاري التسجيل...' : '✨ سجّل مشاركتك الآن'}
            </button>
          )}
          {registered && (
            <span className="px-4 py-2 bg-green-500/20 border border-green-500/50 text-green-400 rounded-xl text-sm font-bold">
              ✅ تم تسجيلك في هذه الفعالية
            </span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-6xl mx-auto px-6 mt-6">
        <div className="flex gap-1 border-b border-zinc-800 overflow-x-auto">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold whitespace-nowrap border-b-2 transition-all ${
                tab === t.key
                  ? 'border-[#C5A15B] text-[#C5A15B]'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {t.icon} {t.label}
              {t.count !== undefined && t.count > 0 && (
                <span className="bg-zinc-700 text-zinc-300 rounded-full px-1.5 py-0.5 text-xs">{t.count}</span>
              )}
            </button>
          ))}
        </div>

        <div className="py-8">
          {tab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-6">
                <div>
                  <h2 className="text-xl font-bold mb-3 text-[#C5A15B]">عن الفعالية</h2>
                  <p className="text-zinc-300 leading-relaxed">{event.description_ar || 'لا يوجد وصف متاح.'}</p>
                </div>
                {event.theme && (
                  <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4">
                    <h3 className="font-bold text-[#087C7B] mb-1">🎨 الثيم والهوية البصرية</h3>
                    <p className="text-zinc-400 text-sm">{event.theme}</p>
                  </div>
                )}
              </div>
              <div className="space-y-4">
                <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 space-y-3 text-sm">
                  <h3 className="font-bold text-zinc-200 mb-2">📊 ملخص الفعالية</h3>
                  <div className="flex justify-between text-zinc-400">
                    <span>المسابقات:</span>
                    <span className="text-white font-bold">{competitions.length}</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>جولات التصويت:</span>
                    <span className="text-white font-bold">{votingRounds.length}</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>الفائزون:</span>
                    <span className="text-white font-bold">{awards.length}</span>
                  </div>
                </div>
                {votingRounds.some((r: any) => r.metadata?.status === 'open') && (
                  <div className="bg-purple-900/30 border border-purple-500/40 rounded-xl p-4 text-center">
                    <p className="text-purple-300 font-bold text-sm mb-2">🗳️ التصويت مفتوح الآن!</p>
                    <button onClick={() => setTab('voting')} className="text-xs text-purple-400 underline">
                      شارك في التصويت
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {tab === 'competitions' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-[#C5A15B]">🏆 المسابقات</h2>
              {competitions.length === 0 ? (
                <p className="text-zinc-500 py-8 text-center">لا توجد مسابقات مسجلة بعد.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {competitions.map((comp: any) => (
                    <div key={comp.id} className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 space-y-2">
                      <h3 className="font-bold text-lg">{comp.metadata?.title_ar || comp.resource_id}</h3>
                      <p className="text-zinc-400 text-sm">{comp.metadata?.description_ar}</p>
                      {comp.metadata?.category && (
                        <span className="inline-block bg-[#087C7B]/20 border border-[#087C7B]/40 text-[#087C7B] rounded-full px-2 py-0.5 text-xs">
                          {comp.metadata.category}
                        </span>
                      )}
                      <Link href={`/competitions/${comp.metadata?.compId || comp.resource_id}`}>
                        <button className="mt-2 w-full text-sm py-2 bg-[#087C7B]/20 hover:bg-[#087C7B] border border-[#087C7B]/50 text-[#087C7B] hover:text-white rounded-lg transition-all font-bold">
                          عرض التفاصيل والتقديم
                        </button>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'voting' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-[#C5A15B]">🗳️ جولات التصويت</h2>
              {votingRounds.length === 0 ? (
                <p className="text-zinc-500 py-8 text-center">لا توجد جولات تصويت مفتوحة.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {votingRounds.map((round: any) => (
                    <div key={round.id} className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold">{round.metadata?.title_ar || 'جولة تصويت'}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${
                          round.metadata?.status === 'open'
                            ? 'bg-green-500/20 border-green-500/40 text-green-400'
                            : 'bg-zinc-700/40 border-zinc-600 text-zinc-400'
                        }`}>
                          {round.metadata?.status === 'open' ? 'مفتوح' : 'مغلق'}
                        </span>
                      </div>
                      {round.metadata?.status === 'open' && (
                        <Link href={`/voting/${round.metadata?.roundId || round.resource_id}`}>
                          <button className="w-full py-2 bg-purple-600/20 hover:bg-purple-600 border border-purple-500/50 text-purple-300 hover:text-white rounded-lg transition-all text-sm font-bold">
                            🗳️ صوّت الآن
                          </button>
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'announcements' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-[#C5A15B]">📢 الإعلانات الرسمية</h2>
              {announcements.length === 0 ? (
                <p className="text-zinc-500 py-8 text-center">لا توجد إعلانات حتى الآن.</p>
              ) : (
                <div className="space-y-3">
                  {announcements.map((ann: any) => (
                    <div key={ann.id} className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-bold mb-1">{ann.metadata?.title_ar}</h3>
                          <p className="text-zinc-400 text-sm leading-relaxed">{ann.metadata?.content_ar}</p>
                        </div>
                        {ann.metadata?.priority === 'urgent' && (
                          <span className="bg-red-500/20 border border-red-500/40 text-red-400 rounded-full px-2 py-0.5 text-xs font-bold whitespace-nowrap">
                            عاجل
                          </span>
                        )}
                      </div>
                      {ann.created_at && (
                        <p className="text-zinc-600 text-xs mt-3">
                          {new Date(ann.created_at).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'winners' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-[#C5A15B]">🥇 الفائزون والجوائز</h2>
              {awards.length === 0 ? (
                <p className="text-zinc-500 py-8 text-center">لم يتم إعلان الفائزين بعد.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {awards.map((award: any) => (
                    <div key={award.id} className="bg-gradient-to-br from-[#C5A15B]/10 to-zinc-900/60 border border-[#C5A15B]/30 rounded-xl p-5 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">🏅</span>
                        <div>
                          <h3 className="font-bold text-[#C5A15B]">{award.metadata?.award_title}</h3>
                          <p className="text-zinc-300 text-sm">{award.metadata?.winner_name}</p>
                        </div>
                      </div>
                      {award.metadata?.work_title && (
                        <p className="text-zinc-400 text-sm">العمل: {award.metadata.work_title}</p>
                      )}
                      {award.metadata?.certId && (
                        <Link href={`/awards/${award.metadata.certId}`}>
                          <button className="text-xs text-[#C5A15B] underline mt-1">عرض الشهادة</button>
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
