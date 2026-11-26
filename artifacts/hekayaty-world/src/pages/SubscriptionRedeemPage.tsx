import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/useAuthStore';
import { Gift, Sparkles, CheckCircle2, ArrowRight, ArrowLeft, RefreshCw, KeyRound, ShieldCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function SubscriptionRedeemPage() {
  const [, setLocation] = useLocation();
  const { user } = useAuthStore();
  const { toast } = useToast();

  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [redeemedResult, setRedeemedResult] = useState<any>(null);

  async function handleRedeem(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      toast({
        title: 'تسجيل الدخول مطلوب',
        description: 'يرجى تسجيل الدخول أو إنشاء حساب لتفعيل كود الاشتراك.',
      });
      setLocation('/login?redirect=/subscribe/redeem');
      return;
    }

    if (!code.trim()) {
      toast({
        title: 'الكود مطلوب',
        description: 'يرجى إدخال كود الاشتراك المكون من حروف وأرقام.',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.redeemSubscriptionCode(code.trim());
      if (res.success) {
        setRedeemedResult(res);
        toast({
          title: 'تم تفعيل الكود بنجاح!',
          description: res.message,
        });
      }
    } catch (err: any) {
      toast({
        title: 'تعذر تفعيل الكود',
        description: err.message || 'الكود غير صحيح، منتهي الصلاحية، أو تم استخدامه مسبقاً.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#07090E] text-white pt-24 pb-20 font-arabic relative overflow-hidden flex items-center justify-center">
      {/* Glow effects */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-[#D4AF37]/10 blur-[130px] pointer-events-none rounded-full" />

      <div className="max-w-md w-full mx-auto px-4 relative z-10">
        <div className="text-center mb-8">
          <Link href="/subscribe" className="inline-flex items-center gap-2 text-xs text-zinc-400 hover:text-white transition mb-6">
            <ArrowRight className="w-4 h-4" />
            <span>العودة لصفحة الباقات</span>
          </Link>

          <div className="w-16 h-16 rounded-3xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] mx-auto mb-4 shadow-[0_0_25px_rgba(212,175,55,0.2)]">
            <Gift className="w-8 h-8" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-[#D4AF37] to-amber-500 mb-2">
            تفعيل كود العضوية
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            أدخل كود الهدية أو القسيمة الترويجية الخاصة بك لفتح الوصول الشامل لكافة فصول وأعداد حكاياتي.
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-zinc-950/80 border border-zinc-800 shadow-2xl backdrop-blur-md">
          {redeemedResult ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white">مبروك! تم التفعيل بنجاح</h3>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                {redeemedResult.message}
              </p>

              <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-xs text-right space-y-1.5 my-4">
                <div className="flex justify-between">
                  <span className="text-zinc-500">حالة التفعيل:</span>
                  <span className="font-bold text-[#D4AF37]">
                    {redeemedResult.status === 'active' ? 'نشط حالياً' : 'مجدول بعد اشتراكك الحالي'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">ينتهي في:</span>
                  <span className="font-mono text-zinc-300">
                    {new Date(redeemedResult.endDate).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <Link
                  href="/comics"
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-[#D4AF37] text-black font-bold text-sm hover:brightness-110 transition flex items-center justify-center gap-2"
                >
                  <span>ابدأ القراءة الآن</span>
                  <ArrowLeft className="w-4 h-4" />
                </Link>
                <Link
                  href="/profile"
                  className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold transition"
                >
                  استعراض ملف العضوية
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleRedeem} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-2 flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-[#D4AF37]" />
                  <span>رمز كود الاشتراك *</span>
                </label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="مثال: HKY-8A3F-9K2P"
                  className="w-full px-4 py-3.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-center font-mono font-bold tracking-widest text-base focus:outline-none focus:border-[#D4AF37] transition uppercase"
                />
                <span className="text-[11px] text-zinc-500 block mt-1.5 text-right">
                  يتكون الكود من رمز HKY متبوعاً بأرقام وحروف غير حساسة لحالة الأحرف.
                </span>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-[#D4AF37] text-black font-bold text-sm hover:brightness-110 transition flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(212,175,55,0.3)]"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>جاري التحقق من الكود...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>تفعيل الكود وإضافة الأيام</span>
                  </>
                )}
              </button>

              <div className="pt-2 border-t border-zinc-800/80 text-center">
                <Link href="/subscribe" className="text-xs text-[#D4AF37] hover:underline">
                  لا تملك كوداً؟ استعرض باقات الاشتراك عبر إنستاباي
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
