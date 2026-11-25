import React from 'react';
import { Link } from 'wouter';
import { Compass, ChevronLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div
      dir="rtl"
      className="min-h-[75vh] flex flex-col items-center justify-center text-center px-4 font-arabic"
    >
      <div className="w-16 h-16 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] mb-6 shadow-[0_0_30px_rgba(212,175,55,0.2)]">
        <Compass className="w-8 h-8 animate-spin" style={{ animationDuration: '10s' }} />
      </div>

      <h1 className="text-7xl sm:text-9xl font-bold font-cinzel gold-gradient mb-2">404</h1>
      <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
        إحداثيات بُعد غير موجود في الكون
      </h2>
      <p className="text-sm text-zinc-400 max-w-md leading-relaxed mb-8">
        يبدو أن المسار الذي تحاول الوصول إليه يقع خارج نطاق الأبعاد الخمسة المعروفة في سجلات
        حكاياتي.
      </p>

      <Link
        href="/"
        className="py-3 px-8 rounded-2xl bg-[#D4AF37] text-black font-bold text-sm hover:brightness-110 transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(212,175,55,0.3)]"
      >
        <span>العودة إلى البوابة الرئيسية</span>
        <ChevronLeft className="w-4 h-4" />
      </Link>
    </div>
  );
}
