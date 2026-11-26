import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/useAuthStore';
import { ShieldCheck, Sparkles, Check, Gift, Clock, CreditCard, ArrowLeft, ArrowRight, AlertCircle, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function SubscriptionPlansPage() {
  const [, setLocation] = useLocation();
  const { user } = useAuthStore();
  const { toast } = useToast();

  const [plans, setPlans] = useState<any[]>([]);
  const [subStatus, setSubStatus] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, [user]);

  async function loadData() {
    setLoading(true);
    try {
      const [fetchedPlans, fetchedSettings, mySub] = await Promise.all([
        api.getSubscriptionPlans(),
        api.getSubscriptionSettings(),
        user ? api.getMySubscription() : null,
      ]);
      setPlans(fetchedPlans);
      setSettings(fetchedSettings);
      setSubStatus(mySub);
      if (fetchedPlans.length > 0) {
        setSelectedPlan(fetchedPlans.find((p: any) => p.isFeatured) || fetchedPlans[0]);
      }
    } catch {
      // Fallback loaded
    } finally {
      setLoading(false);
    }
  }

  async function handleSelectPlan(plan: any) {
    if (!user) {
      toast({
        title: 'تسجيل الدخول مطلوب',
        description: 'يرجى تسجيل الدخول أو إنشاء حساب لاختيار باقة الاشتراك',
      });
      setLocation('/login?redirect=/subscribe');
      return;
    }

    // Check if user already has an active pending payment request
    if (subStatus?.activePaymentRequest) {
      toast({
        title: 'لديك طلب اشتراك قيد المتابعة',
        description: 'لديك طلب بالفعل قيد الانتظار أو المراجعة. سيتم نقلك لمتابعة الطلب.',
      });
      setLocation('/subscribe/payment');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.createSubscriptionPaymentRequest(plan.id);
      if (res.success) {
        toast({
          title: 'تم إنشاء طلب الاشتراك',
          description: 'يرجى استكمال التحويل عبر إنستاباي ورفع إيصال التحويل لتفعيل العضوية.',
        });
        setLocation('/subscribe/payment');
      }
    } catch (err: any) {
      toast({
        title: 'تعذر إنشاء الطلب',
        description: err.message || 'حدث خطأ أثناء محاولة إنشاء طلب الاشتراك.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#07090E] text-white pt-24 pb-20 font-arabic relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-[#D4AF37]/5 blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute top-1/2 right-10 w-[400px] h-[400px] bg-[#008080]/5 blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-bold mb-4 shadow-[0_0_15px_rgba(212,175,55,0.2)]">
            <Sparkles className="w-4 h-4" />
            <span>عضوية حكاياتي بلس الحصرية</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-[#D4AF37] to-amber-500 mb-6 leading-tight">
            عالم كامل من الأساطير... باشتراك واحد
          </h1>
          <p className="text-zinc-400 text-base sm:text-lg leading-relaxed">
            افتح الأبواب المغلقة واستمتع بقراءة غير محدودة لجميع أعداد الكوميكس، الروايات المصورة، وسلاسل الغموض والرعب الحصرية بدقة سينمائية فائقة وبدون أي إعلانات.
          </p>

          {/* Already Subscribed Notice */}
          {subStatus?.isSubscriber && (
            <div className="mt-6 p-4 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center gap-3 text-right max-w-xl mx-auto">
              <ShieldCheck className="w-6 h-6 text-[#D4AF37] shrink-0" />
              <div className="text-xs sm:text-sm">
                <span className="font-bold text-[#D4AF37]">أنت مشترك حالياً! </span>
                <span>
                  متبقي في اشتراكك <strong>{subStatus.remainingDays} يوماً</strong>. عند اختيار باقة جديدة، سيتم جدولة الأيام الجديدة لتضاف تلقائياً بعد انتهاء اشتراكك الحالي دون فقدان أي يوم!
                </span>
              </div>
            </div>
          )}

          {/* Active Payment Request Notice */}
          {subStatus?.activePaymentRequest && (
            <div className="mt-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3 text-right max-w-xl mx-auto">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-amber-400 shrink-0" />
                <div className="text-xs sm:text-sm">
                  <span className="font-bold text-amber-300">لديك طلب اشتراك قيد المتابعة: </span>
                  <span className="text-zinc-300">
                    {subStatus.activePaymentRequest.status === 'under_review' ? 'قيد المراجعة الإدارية' : 'بانتظار إثبات التحويل'}
                  </span>
                </div>
              </div>
              <Link
                href="/subscribe/payment"
                className="px-3 py-1.5 rounded-lg bg-amber-500 text-black text-xs font-bold hover:bg-amber-400 transition"
              >
                متابعة الطلب
              </Link>
            </div>
          )}
        </div>

        {/* Plans Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20 text-zinc-400 gap-3">
            <RefreshCw className="w-6 h-6 animate-spin text-[#D4AF37]" />
            <span>جاري استدعاء باقات العضوية...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch mb-16">
            {plans.map((plan) => {
              const isSelected = selectedPlan?.id === plan.id;
              const isFeatured = plan.isFeatured;

              return (
                <div
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan)}
                  className={`relative rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 cursor-pointer ${
                    isFeatured
                      ? 'bg-gradient-to-b from-zinc-900/90 via-zinc-900/60 to-black border-2 border-[#D4AF37] shadow-[0_0_35px_rgba(212,175,55,0.25)] scale-105 z-10'
                      : 'bg-zinc-950/70 border border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900/50'
                  }`}
                >
                  {isFeatured && (
                    <div className="absolute -top-4 right-1/2 translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-amber-500 to-[#D4AF37] text-black text-xs font-black shadow-lg">
                      الأكثر شعبية والقيمة الأفضل
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-white">{plan.nameAr}</h3>
                      <span className="px-3 py-1 rounded-full bg-zinc-800/80 text-zinc-300 text-xs font-semibold">
                        {plan.durationDays} يوماً
                      </span>
                    </div>

                    <p className="text-xs text-zinc-400 mb-6 min-h-[36px]">
                      {plan.descriptionAr}
                    </p>

                    {/* Price Tag */}
                    <div className="flex items-baseline gap-2 mb-6 pb-6 border-b border-zinc-800">
                      <span className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-100 to-amber-200">
                        {plan.priceEgp}
                      </span>
                      <span className="text-zinc-400 font-bold text-sm">جنيه مصري</span>
                      <span className="text-zinc-500 text-xs mr-auto">/ {plan.durationDays} يوم</span>
                    </div>

                    {/* Features list */}
                    <ul className="space-y-3 mb-8">
                      {(plan.features || []).map((feat: string, i: number) => (
                        <li key={i} className="flex items-start gap-3 text-xs sm:text-sm text-zinc-300">
                          <Check className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectPlan(plan);
                      }}
                      disabled={submitting}
                      className={`w-full py-4 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                        isFeatured
                          ? 'bg-gradient-to-r from-amber-500 to-[#D4AF37] text-black hover:brightness-110 shadow-[0_0_20px_rgba(212,175,55,0.4)]'
                          : 'bg-zinc-800 text-white hover:bg-zinc-700'
                      }`}
                    >
                      {submitting && selectedPlan?.id === plan.id ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>جاري التجهيز...</span>
                        </>
                      ) : (
                        <>
                          <span>اشترك الآن بـ {plan.priceEgp} ج.م</span>
                          <ArrowLeft className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Code Redemption Banner */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-zinc-900/80 via-zinc-900/50 to-zinc-900/80 border border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-right">
            <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] shrink-0">
              <Gift className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-white mb-1">لديك كود هدية أو قسيمة اشتراك؟</h4>
              <p className="text-xs text-zinc-400">
                إذا حصلت على كود عضوية ترويجي أو قسيمة مسابقة، يمكنك تفعيلها فوراً لتبدأ رحلتك.
              </p>
            </div>
          </div>
          <Link
            href="/subscribe/redeem"
            className="px-6 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs sm:text-sm font-bold border border-zinc-700 transition shrink-0"
          >
            تفعيل كود الاشتراك
          </Link>
        </div>

        {/* InstaPay Transfer Info Notice */}
        <div className="mt-12 text-center text-xs text-zinc-500 max-w-2xl mx-auto space-y-2">
          <p>
            • يتم سداد الاشتراكات في مصر عبر التحويل المباشر لخدمة <strong>إنستاباي (InstaPay)</strong> المعتمدة من البنك المركزي المصري.
          </p>
          <p>
            • بعد اختيار الباقة، ستحصل على بيانات الحساب والـ QR Code لرفع إيصال التحويل ورقم العملية لتفعيل عضويتك فوراً.
          </p>
        </div>
      </div>
    </div>
  );
}
