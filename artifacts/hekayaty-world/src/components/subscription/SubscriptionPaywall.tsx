import React from 'react';
import { Link } from 'wouter';
import { Lock, Sparkles, ArrowLeft, KeyRound } from 'lucide-react';

interface SubscriptionPaywallProps {
  title?: string;
  description?: string;
  returnUrl?: string;
}

export const SubscriptionPaywall: React.FC<SubscriptionPaywallProps> = ({
  title = 'هذا المحتوى متاح حصرياً لأعضاء حكاياتي بلس',
  description = 'استمتع بقراءة غير محدودة لكافة الروايات المصورة، الفصول الخاصة، وأعداد الكوميكس بدقة سينمائية كاملة.',
  returnUrl,
}) => {
  return (
    <div className="relative rounded-3xl p-8 sm:p-12 bg-gradient-to-b from-zinc-900/90 via-[#07090E] to-black border-2 border-[#D4AF37]/40 text-center font-arabic shadow-[0_0_50px_rgba(212,175,55,0.15)] my-8 overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-[#D4AF37]/15 blur-3xl pointer-events-none rounded-full" />

      <div className="relative z-10 max-w-lg mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] mx-auto mb-6 shadow-[0_0_20px_rgba(212,175,55,0.3)]">
          <Lock className="w-8 h-8" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] text-[11px] font-bold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>محتوى المشتركين الحصري</span>
        </div>

        <h3 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-[#D4AF37] to-amber-500 mb-3">
          {title}
        </h3>

        <p className="text-xs sm:text-sm text-zinc-400 mb-8 leading-relaxed">
          {description}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href={`/subscribe${returnUrl ? `?redirect=${encodeURIComponent(returnUrl)}` : ''}`}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-[#D4AF37] text-black font-black text-sm hover:brightness-110 transition flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(212,175,55,0.4)]"
          >
            <span>اشترك الآن (99 ج.م / شهر)</span>
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <Link
            href="/subscribe/redeem"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs sm:text-sm font-bold border border-zinc-700 transition flex items-center justify-center gap-2"
          >
            <KeyRound className="w-4 h-4 text-[#D4AF37]" />
            <span>تفعيل كود هدية</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
