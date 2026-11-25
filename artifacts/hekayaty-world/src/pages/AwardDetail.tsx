import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'wouter';
import { api } from '@/lib/api';

export default function AwardDetail() {
  const params = useParams<{ certId: string }>();
  const certId = params.certId;

  const [cert, setCert] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!certId) return;
    api.verifyCertificate(certId).then(data => {
      if (data && data.certId) {
        setCert(data);
      } else {
        setNotFound(true);
      }
      setLoading(false);
    }).catch(() => {
      setNotFound(true);
      setLoading(false);
    });
  }, [certId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0E131F] flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-[#C5A15B]/30 border-t-[#C5A15B] animate-spin" />
      </div>
    );
  }

  if (notFound || !cert) {
    return (
      <div className="min-h-screen bg-[#0E131F] flex flex-col items-center justify-center gap-4 font-arabic" dir="rtl">
        <span className="text-5xl">❌</span>
        <p className="text-zinc-400">لم يتم العثور على هذه الشهادة أو رقمها غير صحيح</p>
        <Link href="/awards">
          <button className="px-4 py-2 bg-[#087C7B] text-white rounded-lg text-sm">العودة للجوائز</button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0E131F] text-white font-arabic flex items-center justify-center p-6" dir="rtl">
      <div className="max-w-2xl w-full">
        {/* Certificate Card */}
        <div className="relative bg-gradient-to-br from-[#1a1200] via-zinc-900 to-[#0E131F] border-2 border-[#C5A15B] rounded-3xl p-8 shadow-[0_0_60px_rgba(197,161,91,0.3)] overflow-hidden">
          {/* Decorative corners */}
          <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-[#C5A15B]/50 rounded-tr-lg" />
          <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-[#C5A15B]/50 rounded-tl-lg" />
          <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-[#C5A15B]/50 rounded-br-lg" />
          <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-[#C5A15B]/50 rounded-bl-lg" />

          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-3">🏅</div>
            <div className="inline-flex items-center gap-2 bg-green-500/20 border border-green-500/40 rounded-full px-4 py-1 text-green-400 text-sm font-bold mb-4">
              ✅ شهادة رسمية موثقة — حكاياتي
            </div>
            <h1 className="text-3xl font-bold text-[#C5A15B] mb-2">شهادة تكريم وجائزة</h1>
            <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-[#C5A15B] to-transparent mx-auto" />
          </div>

          {/* Body */}
          <div className="text-center space-y-5">
            <div>
              <p className="text-zinc-400 text-sm mb-1">تُمنح هذه الشهادة إلى</p>
              <h2 className="text-3xl font-bold text-white">{cert.winner_name}</h2>
            </div>

            <div>
              <p className="text-zinc-400 text-sm mb-1">لفوزه/لفوزها بجائزة</p>
              <h3 className="text-2xl font-bold text-[#C5A15B]">{cert.award_title}</h3>
            </div>

            {cert.rank && (
              <div className="bg-[#C5A15B]/10 border border-[#C5A15B]/30 rounded-xl px-5 py-3 inline-block">
                <span className="text-[#C5A15B] font-bold">{cert.rank}</span>
              </div>
            )}

            {cert.work_title && (
              <div>
                <p className="text-zinc-400 text-sm mb-1">عن العمل</p>
                <p className="text-white font-semibold text-lg">«{cert.work_title}»</p>
              </div>
            )}

            {cert.category && (
              <div>
                <p className="text-zinc-400 text-sm mb-1">في فئة</p>
                <p className="text-zinc-200">{cert.category}</p>
              </div>
            )}

            <div className="border-t border-zinc-700/50 pt-5 mt-5">
              <p className="text-zinc-400 text-sm">{cert.issuedDate}</p>
              {cert.officialSeal && (
                <p className="text-zinc-500 text-xs mt-2 italic">{cert.officialSeal}</p>
              )}
            </div>
          </div>

          {/* Certificate ID */}
          <div className="mt-6 bg-zinc-900/60 border border-zinc-800 rounded-xl p-3 text-center">
            <p className="text-zinc-500 text-xs mb-1">رقم الشهادة</p>
            <code className="text-[#C5A15B] font-mono text-sm font-bold">{cert.certId}</code>
          </div>
        </div>

        {/* Notes */}
        {cert.notes && (
          <div className="mt-4 bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 text-sm text-zinc-400">
            <span className="font-bold text-zinc-300">ملاحظات: </span>{cert.notes}
          </div>
        )}

        <div className="mt-6 flex gap-3 justify-center">
          <Link href="/awards">
            <button className="px-5 py-2.5 border border-zinc-700 text-zinc-300 rounded-xl hover:border-zinc-500 transition-all text-sm">
              ← قاعة المجد
            </button>
          </Link>
          <Link href="/events">
            <button className="px-5 py-2.5 bg-[#087C7B] text-white rounded-xl hover:opacity-90 transition-all text-sm font-bold">
              استكشف الفعاليات
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
