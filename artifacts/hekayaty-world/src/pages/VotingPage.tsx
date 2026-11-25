import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'wouter';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/useAuthStore';
import { useToast } from '@/hooks/use-toast';

export default function VotingPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const { user } = useAuthStore();
  const { toast } = useToast();

  const [round, setRound] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [voted, setVoted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    // Try to load event data to find the voting round
    api.getEvents().then(events => {
      for (const ev of (events as any[])) {
        const event = ev as any;
        api.getEventDetail(event.slug || event.id).then(detail => {
          if (!detail) return;
          const r = (detail.votingRounds || []).find(
            (vr: any) => vr.metadata?.roundId === slug || vr.resource_id === slug
          );
          if (r) {
            setRound({ ...r, eventSlug: event.slug || event.id });
            setLoading(false);
          }
        });
      }
      setTimeout(() => setLoading(false), 3000);
    }).catch(() => setLoading(false));
  }, [slug]);

  const nominees: any[] = round?.metadata?.nominees || [];

  const handleVote = async () => {
    if (!user) {
      toast({ title: 'يجب تسجيل الدخول أولاً لتتمكن من التصويت', variant: 'destructive' });
      return;
    }
    if (!selected) {
      toast({ title: 'الرجاء اختيار مرشح أولاً', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const eventSlug = round?.eventSlug || '';
      const roundId = round?.metadata?.roundId || slug;
      await api.castVote(eventSlug, roundId, selected);
      setVoted(true);
      toast({ title: '✅ تم تسجيل صوتك بنجاح! شكراً لمشاركتك.' });
    } catch (err: any) {
      const msg = err.message || 'حدث خطأ أثناء تسجيل صوتك';
      setError(msg);
      toast({ title: msg, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0E131F] flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-purple-500/30 border-t-purple-500 animate-spin" />
      </div>
    );
  }

  if (!round) {
    return (
      <div className="min-h-screen bg-[#0E131F] flex flex-col items-center justify-center gap-4 font-arabic" dir="rtl">
        <span className="text-5xl">🗳️</span>
        <p className="text-zinc-400">لم يتم العثور على جولة التصويت</p>
        <Link href="/events">
          <button className="px-4 py-2 bg-[#087C7B] text-white rounded-lg text-sm">العودة للفعاليات</button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0E131F] text-white font-arabic" dir="rtl">
      {/* Header */}
      <div className="relative bg-gradient-to-b from-purple-900/40 to-[#0E131F] border-b border-purple-500/20 py-16 px-6 text-center">
        <div className="inline-flex items-center gap-2 bg-purple-500/20 border border-purple-500/40 rounded-full px-4 py-1 text-purple-300 text-sm mb-4">
          🗳️ تصويت رسمي — حكاياتي
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          {round.metadata?.title_ar || 'جولة التصويت'}
        </h1>
        {round.metadata?.status === 'open' ? (
          <span className="inline-block bg-green-500/20 border border-green-500/40 text-green-400 rounded-full px-3 py-1 text-sm font-bold">
            ✅ التصويت مفتوح
          </span>
        ) : (
          <span className="inline-block bg-zinc-700/40 border border-zinc-600 text-zinc-400 rounded-full px-3 py-1 text-sm font-bold">
            ⛔ التصويت مغلق
          </span>
        )}
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10">
        {voted ? (
          <div className="text-center py-16 space-y-4">
            <div className="text-7xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-green-400">تم تسجيل صوتك بنجاح!</h2>
            <p className="text-zinc-400">شكراً لمشاركتك في تصويت حكاياتي الرسمي. النتائج ستُعلن عند إغلاق جولة التصويت.</p>
            <Link href="/events">
              <button className="mt-4 px-6 py-3 bg-[#087C7B] text-white rounded-xl font-bold">
                استكشف المزيد من الفعاليات
              </button>
            </Link>
          </div>
        ) : (
          <>
            {!user && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6 text-yellow-300 text-sm text-center">
                ⚠️ يجب <Link href="/login"><span className="underline font-bold cursor-pointer">تسجيل الدخول</span></Link> أولاً للمشاركة في التصويت
              </div>
            )}

            {round.metadata?.status !== 'open' && (
              <div className="bg-zinc-800/60 border border-zinc-700 rounded-xl p-6 mb-6 text-center text-zinc-400">
                <span className="text-3xl block mb-2">⛔</span>
                التصويت على هذه الجولة مغلق حالياً.
              </div>
            )}

            {nominees.length === 0 ? (
              <p className="text-zinc-500 text-center py-16">لا توجد مرشحات في هذه الجولة.</p>
            ) : (
              <>
                <h2 className="text-xl font-bold mb-6 text-[#C5A15B]">🏅 اختر مرشحك</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                  {nominees.map((n: any) => (
                    <button
                      key={n.id || n.name}
                      onClick={() => round.metadata?.status === 'open' && setSelected(n.id || n.name)}
                      disabled={round.metadata?.status !== 'open'}
                      className={`relative text-right p-4 rounded-xl border-2 transition-all duration-200 ${
                        selected === (n.id || n.name)
                          ? 'border-purple-500 bg-purple-900/30 shadow-[0_0_20px_rgba(168,85,247,0.3)]'
                          : 'border-zinc-700 bg-zinc-900/50 hover:border-zinc-500'
                      } disabled:opacity-60 disabled:cursor-not-allowed`}
                    >
                      {n.image && (
                        <img src={n.image} alt={n.name} className="w-16 h-16 rounded-full object-cover mb-3 border-2 border-zinc-600" />
                      )}
                      {!n.image && (
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/30 to-[#C5A15B]/20 flex items-center justify-center mb-3 text-2xl">
                          🌟
                        </div>
                      )}
                      <h3 className="font-bold text-lg">{n.name}</h3>
                      {n.description && <p className="text-zinc-400 text-sm mt-1">{n.description}</p>}
                      {selected === (n.id || n.name) && (
                        <div className="absolute top-3 left-3 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          ✓
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-3 mb-4 text-sm text-center">
                    {error}
                  </div>
                )}

                {round.metadata?.status === 'open' && (
                  <div className="text-center">
                    <button
                      onClick={handleVote}
                      disabled={!selected || submitting || !user}
                      className="px-10 py-3 bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-500 hover:to-purple-700 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                    >
                      {submitting ? '⏳ جاري التسجيل...' : '🗳️ تأكيد صوتي'}
                    </button>
                    <p className="text-zinc-500 text-xs mt-3">لكل مستخدم صوت واحد فقط. لا يمكن تغييره بعد التأكيد.</p>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
