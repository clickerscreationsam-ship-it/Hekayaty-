import React, { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export default function Awards() {
  const [events, setEvents] = useState<any[]>([]);
  const [allAwards, setAllAwards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [certSearch, setCertSearch] = useState('');
  const [verifyResult, setVerifyResult] = useState<any | null | 'not_found'>(null);
  const [verifying, setVerifying] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    api.getEvents().then(async data => {
      setEvents(data);
      const awards: any[] = [];
      for (const event of (data as any[])) {
        try {
          const detail = await api.getEventDetail((event as any).slug || (event as any).id);
          if (detail?.awards?.length) {
            awards.push(...detail.awards.map((a: any) => ({ ...a, eventTitle: (event as any).title_ar })));
          }
        } catch {}
      }
      setAllAwards(awards);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleVerify = async () => {
    if (!certSearch.trim()) return;
    setVerifying(true);
    setVerifyResult(null);
    try {
      const result = await api.verifyCertificate(certSearch.trim());
      setVerifyResult(result || 'not_found');
    } catch {
      setVerifyResult('not_found');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0E131F] text-white font-arabic" dir="rtl">
      {/* Hero */}
      <div className="relative bg-gradient-to-b from-[#C5A15B]/20 to-[#0E131F] border-b border-[#C5A15B]/20 py-20 px-6 text-center">
        <div className="text-6xl mb-4">🏆</div>
        <h1 className="text-4xl font-bold mb-3">قاعة المجد — الفائزون والجوائز</h1>
        <p className="text-zinc-400 max-w-xl mx-auto">
          احتفاء بأبرز المبدعين والأعمال الفائزة في فعاليات وكرنفالات حكاياتي الرسمية.
        </p>
      </div>

      {/* Certificate Verification */}
      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="bg-zinc-900/60 border border-[#C5A15B]/30 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-[#C5A15B] mb-4">🔍 التحقق من صحة شهادة جائزة</h2>
          <div className="flex gap-3">
            <input
              type="text"
              value={certSearch}
              onChange={e => setCertSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleVerify()}
              placeholder="أدخل رقم الشهادة (مثال: HKY-ABC123-XY)"
              className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#C5A15B]"
            />
            <button
              onClick={handleVerify}
              disabled={verifying || !certSearch.trim()}
              className="px-5 py-2.5 bg-[#C5A15B] text-black font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 text-sm"
            >
              {verifying ? '⏳' : '🔍 تحقق'}
            </button>
          </div>

          {verifyResult && verifyResult !== 'not_found' && (
            <div className="mt-4 bg-green-500/10 border border-green-500/30 rounded-xl p-4 space-y-1">
              <p className="text-green-400 font-bold">✅ شهادة رسمية موثقة</p>
              <p className="text-zinc-300 text-sm">الفائز: <span className="font-bold">{verifyResult.winner_name}</span></p>
              <p className="text-zinc-300 text-sm">الجائزة: <span className="font-bold">{verifyResult.award_title}</span></p>
              {verifyResult.work_title && <p className="text-zinc-400 text-sm">العمل: {verifyResult.work_title}</p>}
              <Link href={`/awards/${certSearch}`}>
                <button className="mt-2 text-xs text-[#C5A15B] underline">عرض الشهادة الكاملة</button>
              </Link>
            </div>
          )}
          {verifyResult === 'not_found' && (
            <div className="mt-4 bg-red-500/10 border border-red-500/30 rounded-xl p-4">
              <p className="text-red-400 text-sm">❌ لم يتم العثور على شهادة بهذا الرقم. تأكد من رقم الشهادة.</p>
            </div>
          )}
        </div>
      </div>

      {/* Awards Gallery */}
      <div className="max-w-6xl mx-auto px-6 pb-16">
        <h2 className="text-2xl font-bold mb-6 text-[#C5A15B]">🥇 لائحة الشرف</h2>
        {loading && (
          <div className="flex justify-center py-16">
            <div className="w-10 h-10 rounded-full border-4 border-[#C5A15B]/30 border-t-[#C5A15B] animate-spin" />
          </div>
        )}
        {!loading && allAwards.length === 0 && (
          <div className="text-center py-16 text-zinc-500">
            <p className="text-4xl mb-3">🏅</p>
            <p>لم يتم إعلان فائزين بعد. ترقبوا الإعلانات الرسمية!</p>
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {allAwards.map((award: any) => (
            <div
              key={award.id}
              className="bg-gradient-to-br from-[#C5A15B]/10 via-zinc-900/80 to-zinc-900/60 border border-[#C5A15B]/30 rounded-2xl p-6 space-y-3 hover:border-[#C5A15B]/60 hover:shadow-[0_0_20px_rgba(197,161,91,0.15)] transition-all"
            >
              <div className="flex items-center gap-3">
                <span className="text-4xl">🏅</span>
                <div>
                  <h3 className="font-bold text-[#C5A15B] leading-tight">{award.metadata?.award_title}</h3>
                  <p className="text-sm text-zinc-300">{award.metadata?.winner_name}</p>
                </div>
              </div>
              {award.metadata?.category && (
                <span className="inline-block text-xs bg-zinc-800 border border-zinc-700 rounded-full px-2 py-0.5 text-zinc-400">
                  {award.metadata.category}
                </span>
              )}
              {award.metadata?.work_title && (
                <p className="text-zinc-400 text-sm">العمل: {award.metadata.work_title}</p>
              )}
              <p className="text-zinc-500 text-xs">الفعالية: {award.eventTitle}</p>
              {award.metadata?.certId && (
                <Link href={`/awards/${award.metadata.certId}`}>
                  <button className="text-xs text-[#C5A15B] underline">عرض الشهادة الرقمية →</button>
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
