import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'wouter';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/useAuthStore';
import { useToast } from '@/hooks/use-toast';

export default function CompetitionDetail() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const { user } = useAuthStore();
  const { toast } = useToast();

  const [competition, setCompetition] = useState<any | null>(null);
  const [eventSlug, setEventSlug] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    title: '',
    description: '',
    work_url: '',
  });

  useEffect(() => {
    if (!slug) return;
    api.getEvents().then(async events => {
      for (const ev of (events as any[])) {
        const event = ev as any;
        try {
          const detail = await api.getEventDetail(event.slug || event.id);
          if (!detail) continue;
          const comp = (detail.competitions || []).find(
            (c: any) => c.metadata?.compId === slug || c.resource_id === slug
          );
          if (comp) {
            setCompetition(comp);
            setEventSlug(event.slug || event.id);
            break;
          }
        } catch {}
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: 'يجب تسجيل الدخول أولاً', variant: 'destructive' });
      return;
    }
    if (!form.title.trim()) {
      toast({ title: 'عنوان العمل مطلوب', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      const compId = competition?.metadata?.compId || slug;
      await api.submitCompetitionEntry(eventSlug, compId, form);
      setSubmitted(true);
      toast({ title: '✅ تم تقديم عملك في المسابقة بنجاح!' });
    } catch (err: any) {
      toast({ title: err.message || 'حدث خطأ أثناء التقديم', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0E131F] flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-[#087C7B]/30 border-t-[#087C7B] animate-spin" />
      </div>
    );
  }

  if (!competition) {
    return (
      <div className="min-h-screen bg-[#0E131F] flex flex-col items-center justify-center gap-4 font-arabic" dir="rtl">
        <span className="text-5xl">🏆</span>
        <p className="text-zinc-400">لم يتم العثور على هذه المسابقة</p>
        <Link href="/events">
          <button className="px-4 py-2 bg-[#087C7B] text-white rounded-lg text-sm">العودة للفعاليات</button>
        </Link>
      </div>
    );
  }

  const meta = competition.metadata || {};

  return (
    <div className="min-h-screen bg-[#0E131F] text-white font-arabic" dir="rtl">
      {/* Hero */}
      <div className="bg-gradient-to-b from-[#087C7B]/20 to-[#0E131F] border-b border-[#087C7B]/20 py-16 px-6 text-center">
        <div className="inline-flex items-center gap-2 bg-[#087C7B]/20 border border-[#087C7B]/40 rounded-full px-4 py-1 text-[#087C7B] text-sm mb-4">
          🏆 مسابقة رسمية — حكاياتي
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-2">{meta.title_ar || slug}</h1>
        {meta.category && (
          <span className="inline-block bg-[#C5A15B]/20 border border-[#C5A15B]/40 text-[#C5A15B] rounded-full px-3 py-1 text-sm">
            {meta.category}
          </span>
        )}
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-5 gap-8">
        {/* Info */}
        <div className="md:col-span-2 space-y-5">
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 space-y-3">
            <h3 className="font-bold text-[#C5A15B]">📋 تفاصيل المسابقة</h3>
            {meta.description_ar && <p className="text-zinc-400 text-sm leading-relaxed">{meta.description_ar}</p>}
            {meta.start_date && (
              <div className="text-sm">
                <span className="text-zinc-500">بداية التقديم: </span>
                <span className="text-zinc-200">{new Date(meta.start_date).toLocaleDateString('ar-EG')}</span>
              </div>
            )}
            {meta.end_date && (
              <div className="text-sm">
                <span className="text-zinc-500">آخر موعد: </span>
                <span className="text-zinc-200">{new Date(meta.end_date).toLocaleDateString('ar-EG')}</span>
              </div>
            )}
            {meta.prizes && (
              <div>
                <p className="text-zinc-500 text-sm mb-1">الجوائز:</p>
                <p className="text-[#C5A15B] text-sm font-bold">{meta.prizes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Submission Form */}
        <div className="md:col-span-3">
          {submitted ? (
            <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-8 text-center space-y-3">
              <div className="text-5xl">🎉</div>
              <h2 className="text-xl font-bold text-green-400">تم تقديم عملك بنجاح!</h2>
              <p className="text-zinc-400 text-sm">سيتم مراجعة عملك من قِبل لجنة التحكيم. ترقب نتائج الكرنفال.</p>
              <Link href="/events">
                <button className="mt-3 px-5 py-2.5 bg-[#087C7B] text-white rounded-xl font-bold">
                  استكشف المزيد
                </button>
              </Link>
            </div>
          ) : (
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-5 text-[#C5A15B]">📤 تقديم العمل</h3>
              {!user && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3 mb-5 text-yellow-300 text-sm text-center">
                  ⚠️ يجب <Link href="/login"><span className="underline font-bold cursor-pointer">تسجيل الدخول</span></Link> أولاً للتقديم
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-zinc-400 mb-1.5">عنوان العمل *</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    placeholder="اكتب عنوان عملك هنا"
                    required
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#087C7B]"
                  />
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-1.5">وصف العمل / الملخص</label>
                  <textarea
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="صف عملك باختصار..."
                    rows={4}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#087C7B] resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-1.5">رابط العمل (اختياري)</label>
                  <input
                    type="url"
                    value={form.work_url}
                    onChange={e => setForm(f => ({ ...f, work_url: e.target.value }))}
                    placeholder="https://..."
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#087C7B]"
                    dir="ltr"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting || !user}
                  className="w-full py-3 bg-gradient-to-r from-[#087C7B] to-teal-600 hover:from-teal-600 hover:to-[#087C7B] text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? '⏳ جاري الإرسال...' : '🚀 أرسل عملك للمسابقة'}
                </button>
                <p className="text-zinc-500 text-xs text-center">لكل مستخدم تقديم واحد فقط في هذه المسابقة.</p>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
