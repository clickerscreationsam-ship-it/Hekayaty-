import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/useAuthStore';
import { ShieldCheck, Upload, Clock, CheckCircle2, XCircle, ArrowRight, Copy, Check, AlertTriangle, RefreshCw, Smartphone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function SubscriptionPaymentPage() {
  const [, setLocation] = useLocation();
  const { user } = useAuthStore();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [subData, setSubData] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);

  // Form states
  const [proofImage, setProofImage] = useState<string>('');
  const [transactionRef, setTransactionRef] = useState<string>('');
  const [transferAmount, setTransferAmount] = useState<string>('');
  const [userNotes, setUserNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user) {
      setLocation('/login?redirect=/subscribe/payment');
      return;
    }
    loadData();
  }, [user]);

  async function loadData() {
    setLoading(true);
    try {
      const [mySub, instapaySettings] = await Promise.all([
        api.getMySubscription(),
        api.getSubscriptionSettings(),
      ]);
      setSubData(mySub);
      setSettings(instapaySettings);
      if (mySub?.activePaymentRequest?.priceEgp) {
        setTransferAmount(String(mySub.activePaymentRequest.priceEgp));
      }
    } catch {
      // Handled
    } finally {
      setLoading(false);
    }
  }

  function handleCopy(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: 'تم النسخ', description: text });
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'نوع الملف غير صالح',
        description: 'يرجى اختيار صورة لقطة شاشة للإيصال (PNG أو JPG)',
        variant: 'destructive',
      });
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      toast({
        title: 'حجم الصورة كبير جداً',
        description: 'الحد الأقصى لحجم الصورة هو 8 ميغابايت',
        variant: 'destructive',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setProofImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
  }

  async function handleSubmitProof(e: React.FormEvent) {
    e.preventDefault();
    if (!proofImage) {
      toast({
        title: 'إيصال التحويل مطلوب',
        description: 'يرجى إرفاق لقطة شاشة لإيصال التحويل البنكي.',
        variant: 'destructive',
      });
      return;
    }

    if (!transactionRef.trim()) {
      toast({
        title: 'رقم المرجع مطلوب',
        description: 'يرجى كتابة رقم العملية أو المرجع (Transaction Reference) الموضح في إيصال التحويل.',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    try {
      const reqId = subData.activePaymentRequest.id;
      const res = await api.submitSubscriptionProof(reqId, {
        proofImageUrl: proofImage,
        transactionReference: transactionRef.trim(),
        transferAmount: Number(transferAmount) || subData.activePaymentRequest.priceEgp,
        userNotes: userNotes.trim() || undefined,
      });

      if (res.success) {
        toast({
          title: 'تم إرسال الإثبات بنجاح',
          description: 'طلبك الآن قيد المراجعة الإدارية وسنقوم بتفعيل اشتراكك فور التحقق من وصول التحويل.',
        });
        await loadData();
      }
    } catch (err: any) {
      toast({
        title: 'فشل إرسال الإثبات',
        description: err.message || 'حدث خطأ أثناء رفع بيانات التحويل.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCancelRequest() {
    if (!confirm('هل أنت متأكد من رغبتك في إلغاء طلب الاشتراك الحالي؟')) return;

    setCancelling(true);
    try {
      const reqId = subData.activePaymentRequest.id;
      const res = await api.cancelSubscriptionPaymentRequest(reqId);
      if (res.success) {
        toast({ title: 'تم إلغاء الطلب', description: 'يمكنك الآن اختيار باقة جديدة في أي وقت.' });
        setLocation('/subscribe');
      }
    } catch (err: any) {
      toast({ title: 'خطأ', description: err.message, variant: 'destructive' });
    } finally {
      setCancelling(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07090E] text-white flex items-center justify-center font-arabic gap-3">
        <RefreshCw className="w-6 h-6 animate-spin text-[#D4AF37]" />
        <span>جاري تحميل بيانات الدفع...</span>
      </div>
    );
  }

  const req = subData?.activePaymentRequest;

  // If no active request, redirect to plans
  if (!req) {
    return (
      <div className="min-h-screen bg-[#07090E] text-white pt-32 pb-20 font-arabic text-center px-4">
        <div className="max-w-md mx-auto p-8 rounded-3xl bg-zinc-900/60 border border-zinc-800">
          <Clock className="w-12 h-12 text-[#D4AF37] mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">لا يوجد طلب اشتراك نشط حالياً</h2>
          <p className="text-zinc-400 text-xs sm:text-sm mb-6">
            يرجى اختيار باقة الاشتراك المناسبة لك للبدء في إجراءات التحويل عبر إنستاباي.
          </p>
          <Link
            href="/subscribe"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-[#D4AF37] text-black font-bold text-sm hover:brightness-110 transition"
          >
            <span>استعراض باقات الاشتراك</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  const isUnderReview = req.status === 'under_review';
  const isPending = req.status === 'pending_payment';

  return (
    <div className="min-h-screen bg-[#07090E] text-white pt-24 pb-20 font-arabic relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/subscribe" className="flex items-center gap-2 text-xs text-zinc-400 hover:text-white transition">
            <ArrowRight className="w-4 h-4" />
            <span>العودة للباقات</span>
          </Link>
          <span className="text-xs text-zinc-500">مرجع الطلب: {req.reference}</span>
        </div>

        {/* Status Banner */}
        <div className="mb-8 p-6 rounded-3xl bg-gradient-to-r from-zinc-900 via-zinc-900/80 to-zinc-900 border border-zinc-800">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs text-zinc-400 block mb-1">الباقة المحددة:</span>
              <h2 className="text-2xl font-black text-white">{req.planNameAr}</h2>
              <div className="flex items-center gap-3 mt-2 text-xs text-zinc-400">
                <span>المبلغ المطلوب: <strong className="text-white font-bold">{req.priceEgp} جنيه مصري</strong></span>
                <span>•</span>
                <span>المدة: <strong className="text-white font-bold">{req.durationDays} يوماً</strong></span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isPending && (
                <span className="px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  <span>بانتظار إثبات التحويل</span>
                </span>
              )}
              {isUnderReview && (
                <span className="px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold flex items-center gap-1.5 animate-pulse">
                  <ShieldCheck className="w-4 h-4" />
                  <span>قيد المراجعة الإدارية</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Main Grid: Transfer details on Right, Proof Form on Left */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* InstaPay Transfer Instructions */}
          <div className="p-6 sm:p-8 rounded-3xl bg-zinc-950/70 border border-zinc-800/80 space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-zinc-800">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">بيانات التحويل عبر إنستاباي</h3>
                <span className="text-xs text-zinc-400">InstaPay Payment Details</span>
              </div>
            </div>

            {/* Address box */}
            <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2">
              <span className="text-xs text-zinc-400 block">عنوان الدفع اللحظي (IPA / Username):</span>
              <div className="flex items-center justify-between gap-2">
                <code className="text-sm sm:text-base font-mono font-bold text-amber-300">
                  {settings?.instapayAddress || 'hekayaty@instapay'}
                </code>
                <button
                  type="button"
                  onClick={() => handleCopy(settings?.instapayAddress || 'hekayaty@instapay')}
                  className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition"
                  title="نسخ عنوان الدفع"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Recipient Details */}
            <div className="space-y-3 text-xs sm:text-sm text-zinc-300">
              <div className="flex justify-between py-2 border-b border-zinc-900">
                <span className="text-zinc-500">اسم المستلم:</span>
                <span className="font-semibold">{settings?.recipientName || 'منصة حكاياتي للنشر الرقمي'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-zinc-900">
                <span className="text-zinc-500">المبلغ الدقيق:</span>
                <span className="font-bold text-emerald-400">{req.priceEgp} جنيه مصري</span>
              </div>
              <div className="flex justify-between py-2 border-b border-zinc-900">
                <span className="text-zinc-500">رقم الهاتف المرتبط:</span>
                <span className="font-mono">{settings?.phoneNumber || '01023456789'}</span>
              </div>
            </div>

            {/* Step-by-step instructions */}
            <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800/60 text-xs text-zinc-400 space-y-2 leading-relaxed">
              <h4 className="font-bold text-zinc-300 mb-1">خطوات إتمام الدفع:</h4>
              <p>1. افتح تطبيق إنستاباي واختر "إرسال نقود".</p>
              <p>2. أدخل عنوان إنستاباي أعلاه، وتأكد من مطابقة اسم المستلم.</p>
              <p>3. حول مبلغ <strong>{req.priceEgp} ج.م</strong> بالتمام.</p>
              <p>4. التقط لقطة شاشة للإيصال وانسخ "رقم العملية / المرجع".</p>
            </div>
          </div>

          {/* Proof Submission or Under Review Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-zinc-950/70 border border-zinc-800/80">
            {isUnderReview ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mx-auto animate-pulse">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white">إثبات التحويل قيد المراجعة</h3>
                <p className="text-xs sm:text-sm text-zinc-400 max-w-sm mx-auto leading-relaxed">
                  تم استلام إيصال التحويل برقم المرجع <strong className="text-white font-mono">{req.transactionReference}</strong>. يقوم فريق إدارة حكاياتي بمطابقة الإيداع البنكي لتفعيل العضوية في أقرب وقت.
                </p>

                <div className="mt-6 pt-6 border-t border-zinc-800 text-xs text-zinc-500">
                  تتراوح مدة المراجعة بين دقائق معدودة وساعتين كحد أقصى خلال ساعات العمل. ستصلك إشعارات داخل التطبيق فور الاعتماد.
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitProof} className="space-y-5">
                <div className="pb-3 border-b border-zinc-800">
                  <h3 className="text-base font-bold text-white">رفع إثبات التحويل</h3>
                  <span className="text-xs text-zinc-400">أدخل بيانات التحويل لتأكيد الطلب</span>
                </div>

                {/* Screenshot Upload */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-2">
                    صورة إيصال التحويل (لقطة الشاشة) *
                  </label>
                  <label className="border-2 border-dashed border-zinc-800 hover:border-zinc-700 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition bg-zinc-900/40 hover:bg-zinc-900/70 min-h-[140px] text-center">
                    {proofImage ? (
                      <div className="relative w-full h-32 rounded-xl overflow-hidden">
                        <img src={proofImage} alt="إيصال التحويل" className="w-full h-full object-contain" />
                        <span className="absolute bottom-1 right-1 bg-black/80 px-2 py-0.5 rounded text-[10px] text-emerald-400">
                          تم تحديد الصورة (انقر للتغيير)
                        </span>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-6 h-6 text-zinc-500" />
                        <span className="text-xs text-zinc-300 font-bold">انقر لاختيار لقطة شاشة الإيصال</span>
                        <span className="text-[10px] text-zinc-500">صيغة PNG أو JPG (حجم أقصى 8MB)</span>
                      </>
                    )}
                    <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                  </label>
                </div>

                {/* Transaction Reference Number */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    رقم العملية / المرجع البنكي (Transaction Reference) *
                  </label>
                  <input
                    type="text"
                    required
                    value={transactionRef}
                    onChange={(e) => setTransactionRef(e.target.value)}
                    placeholder="مثال: 123456789012 أو رمز المرجع الموضح في الإيصال"
                    className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs sm:text-sm focus:outline-none focus:border-[#D4AF37] transition font-mono"
                  />
                </div>

                {/* Transfer Amount Confirmation */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    المبلغ المحول بالجنيه (EGP)
                  </label>
                  <input
                    type="number"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs sm:text-sm focus:outline-none focus:border-[#D4AF37] transition"
                  />
                </div>

                {/* Optional Notes */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    ملاحظات إضافية (اختياري)
                  </label>
                  <input
                    type="text"
                    value={userNotes}
                    onChange={(e) => setUserNotes(e.target.value)}
                    placeholder="أي ملاحظة تود توضيحها للإدارة حول التحويل..."
                    className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs sm:text-sm focus:outline-none focus:border-[#D4AF37] transition"
                  />
                </div>

                {/* Actions */}
                <div className="pt-2 flex flex-col gap-3">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-[#D4AF37] text-black font-bold text-sm hover:brightness-110 transition flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(212,175,55,0.3)]"
                  >
                    {submitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>جاري إرسال الإثبات...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>تأكيد وإرسال إثبات التحويل</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleCancelRequest}
                    disabled={cancelling}
                    className="w-full py-2.5 rounded-xl bg-transparent hover:bg-zinc-900 text-zinc-500 hover:text-rose-400 text-xs font-medium transition"
                  >
                    {cancelling ? 'جاري الإلغاء...' : 'إلغاء طلب الاشتراك'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
