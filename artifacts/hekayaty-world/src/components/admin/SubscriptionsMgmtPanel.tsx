import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import {
  Sparkles,
  ShieldCheck,
  CreditCard,
  Clock,
  CheckCircle2,
  XCircle,
  Gift,
  Plus,
  RefreshCw,
  Search,
  Filter,
  Download,
  Eye,
  Trash2,
  Edit,
  AlertTriangle,
  Smartphone,
  Calendar,
  Layers,
  Settings,
  X,
  FileText,
} from 'lucide-react';

interface SubscriptionsMgmtPanelProps {
  toast: any;
}

export function SubscriptionsMgmtPanel({ toast }: SubscriptionsMgmtPanelProps) {
  const [subTab, setSubTab] = useState<'overview' | 'plans' | 'requests' | 'active' | 'codes' | 'settings'>('overview');
  const [loading, setLoading] = useState(true);

  // Data states
  const [overview, setOverview] = useState<any>({});
  const [plans, setPlans] = useState<any[]>([]);
  const [paymentRequests, setPaymentRequests] = useState<any[]>([]);
  const [activeSubscriptions, setActiveSubscriptions] = useState<any[]>([]);
  const [codes, setCodes] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({});

  // Modals & form states
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any | null>(null);
  const [planForm, setPlanForm] = useState({
    nameAr: '',
    nameEn: '',
    descriptionAr: '',
    descriptionEn: '',
    priceEgp: 99,
    durationDays: 30,
    features: '',
    isFeatured: false,
  });

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedReqForReject, setSelectedReqForReject] = useState<any | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const [showProofModal, setShowProofModal] = useState(false);
  const [viewingProofReq, setViewingProofReq] = useState<any | null>(null);

  const [showGrantModal, setShowGrantModal] = useState(false);
  const [grantForm, setGrantForm] = useState({
    userId: '',
    durationDays: 30,
    grantReason: 'مكافأة مسابقة ترويجية',
    internalNote: '',
  });

  const [showCodeModal, setShowCodeModal] = useState(false);
  const [codeForm, setCodeForm] = useState({
    count: 10,
    durationDays: 30,
    batchName: 'حملة ترويجية',
    campaignNotes: '',
    expiresAt: '',
  });

  const [reqFilter, setReqFilter] = useState('all');
  const [reqSearch, setReqSearch] = useState('');
  const [codeSearch, setCodeSearch] = useState('');
  const [codeStatusFilter, setCodeStatusFilter] = useState('all');

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadAllData();
  }, []);

  async function loadAllData() {
    setLoading(true);
    try {
      const [ov, pl, reqs, subs, cds, st] = await Promise.all([
        api.adminGetSubscriptionOverview(),
        api.adminGetSubscriptionPlans(),
        api.adminGetPaymentRequests(),
        api.adminGetActiveSubscriptions(),
        api.adminGetSubscriptionCodes(),
        api.adminGetSubscriptionSettings(),
      ]);
      setOverview(ov || {});
      setPlans(pl || []);
      setPaymentRequests(reqs || []);
      setActiveSubscriptions(subs || []);
      setCodes(cds || []);
      setSettings(st || {});
    } catch (err: any) {
      toast({ title: 'خطأ أثناء تحميل البيانات', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }

  // --- Plan CRUD ---
  async function handleSavePlan(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        nameAr: planForm.nameAr,
        nameEn: planForm.nameEn,
        descriptionAr: planForm.descriptionAr,
        descriptionEn: planForm.descriptionEn,
        priceEgp: Number(planForm.priceEgp),
        durationDays: Number(planForm.durationDays),
        features: planForm.features.split('\n').map((f) => f.trim()).filter(Boolean),
        isFeatured: planForm.isFeatured,
      };

      if (editingPlan) {
        await api.adminUpdateSubscriptionPlan(editingPlan.id, payload);
        toast({ title: 'تم التحديث', description: 'تم تحديث بيانات الباقة بنجاح.' });
      } else {
        await api.adminCreateSubscriptionPlan(payload);
        toast({ title: 'تم الإنشاء', description: 'تم إنشاء باقة الاشتراك الجديدة بنجاح.' });
      }

      setShowPlanModal(false);
      setEditingPlan(null);
      await loadAllData();
    } catch (err: any) {
      toast({ title: 'خطأ', description: err.message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleArchivePlan(id: string) {
    if (!confirm('هل أنت متأكد من رغبتك في أرشفة هذه الباقة؟ لن تظهر للمشتركين الجدد.')) return;
    try {
      await api.adminArchiveSubscriptionPlan(id);
      toast({ title: 'تمت الأرشفة', description: 'تم أرشفة الباقة بنجاح دون حذف سجلاتها.' });
      await loadAllData();
    } catch (err: any) {
      toast({ title: 'خطأ', description: err.message, variant: 'destructive' });
    }
  }

  // --- Payment Request Review ---
  async function handleApproveRequest(reqId: string | number) {
    if (!confirm('هل تحققت من استلام المبلغ في حساب إنستاباي وتريد تفعيل الاشتراك للمستخدم؟')) return;
    setSubmitting(true);
    try {
      const res = await api.adminApprovePaymentRequest(reqId);
      if (res.success) {
        toast({ title: 'تم اعتماد الدفع', description: 'تم تفعيل الاشتراك وإضافته لجدول المستخدم بنجاح.' });
        await loadAllData();
      }
    } catch (err: any) {
      toast({ title: 'خطأ في الاعتماد', description: err.message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRejectRequest(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedReqForReject || !rejectionReason.trim()) return;
    setSubmitting(true);
    try {
      await api.adminRejectPaymentRequest(selectedReqForReject.id, rejectionReason.trim());
      toast({ title: 'تم تسجيل الرفض', description: 'تم إخطار المستخدم بسبب الرفض.' });
      setShowRejectModal(false);
      setSelectedReqForReject(null);
      setRejectionReason('');
      await loadAllData();
    } catch (err: any) {
      toast({ title: 'خطأ', description: err.message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  }

  // --- Manual Grant ---
  async function handleGrantSubscription(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.adminGrantSubscription(
        grantForm.userId.trim(),
        Number(grantForm.durationDays),
        grantForm.grantReason,
        grantForm.internalNote
      );
      toast({ title: 'تم منح الاشتراك', description: 'تم تفعيل الاشتراك المجاني وإضافته لجدول المستخدم بنجاح.' });
      setShowGrantModal(false);
      setGrantForm({ userId: '', durationDays: 30, grantReason: 'مكافأة مسابقة ترويجية', internalNote: '' });
      await loadAllData();
    } catch (err: any) {
      toast({ title: 'خطأ في المنح', description: err.message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  }

  // --- Code Generation ---
  async function handleGenerateCodes(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.adminGenerateSubscriptionCodes({
        count: Number(codeForm.count),
        durationDays: Number(codeForm.durationDays),
        batchName: codeForm.batchName,
        campaignNotes: codeForm.campaignNotes,
        expiresAt: codeForm.expiresAt || undefined,
      });
      if (res.success) {
        toast({ title: 'تم توليد الأكواد', description: `تم إنشاء ${res.count} كود اشتراك مشفر بنجاح.` });
        setShowCodeModal(false);
        await loadAllData();
      }
    } catch (err: any) {
      toast({ title: 'خطأ', description: err.message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleExportCodes() {
    window.open('/api/admin/subscriptions/codes/export', '_blank');
  }

  // --- Settings Update ---
  async function handleUpdateSettings(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.adminUpdateSubscriptionSettings(settings);
      toast({ title: 'تم الحفظ', description: 'تم تحديث بيانات إنستاباي بنجاح.' });
    } catch (err: any) {
      toast({ title: 'خطأ', description: err.message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-8 font-arabic text-right">
      {/* Top Header & Subtabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2 text-[#D4AF37] text-xs font-bold mb-1">
            <Sparkles className="w-4 h-4" />
            <span>منظومة إدارة الاشتراكات المركزية</span>
          </div>
          <h2 className="text-2xl font-black text-white">إدارة عضويات واشتراكات حكاياتي</h2>
        </div>

        {/* Subtabs switcher */}
        <div className="flex flex-wrap gap-1 p-1 rounded-2xl bg-zinc-900 border border-zinc-800">
          {[
            { key: 'overview', label: 'نظرة عامة والمالية', icon: ShieldCheck },
            { key: 'plans', label: 'باقات الاشتراك', icon: Layers },
            { key: 'requests', label: `طلبات الدفع (${overview.underReviewRequests || 0})`, icon: CreditCard },
            { key: 'active', label: 'الاشتراكات والجدولة', icon: Calendar },
            { key: 'codes', label: 'أكواد العضوية', icon: Gift },
            { key: 'settings', label: 'إعدادات إنستاباي', icon: Settings },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setSubTab(tab.key as any)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                subTab === tab.key
                  ? 'bg-gradient-to-r from-amber-500 to-[#D4AF37] text-black shadow-md'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20 text-zinc-400 gap-3">
          <RefreshCw className="w-6 h-6 animate-spin text-[#D4AF37]" />
          <span>جاري تحميل بيانات منظومة الاشتراكات...</span>
        </div>
      ) : (
        <>
          {/* ═══════════════════════════════════════════════════════════════════ */}
          {/* TAB 1: OVERVIEW & REAL FINANCIALS */}
          {/* ═══════════════════════════════════════════════════════════════════ */}
          {subTab === 'overview' && (
            <div className="space-y-6">
              {/* Financial & Membership Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800">
                  <span className="text-xs text-zinc-400 block mb-1">الاشتراكات النشطة حالياً</span>
                  <div className="text-3xl font-black text-emerald-400">{overview.activeSubscriptions || 0}</div>
                  <span className="text-[11px] text-zinc-500 mt-1 block">قارئ يمتلك وصولاً كاملاً</span>
                </div>

                <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800">
                  <span className="text-xs text-zinc-400 block mb-1">الاشتراكات المجدولة (Queue)</span>
                  <div className="text-3xl font-black text-cyan-400">{overview.scheduledSubscriptions || 0}</div>
                  <span className="text-[11px] text-zinc-500 mt-1 block">أيام مضافة تبدأ لاحقاً</span>
                </div>

                <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800">
                  <span className="text-xs text-zinc-400 block mb-1">إيرادات إنستاباي المؤكدة</span>
                  <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-400">
                    {overview.confirmedRevenueEgp || 0} <span className="text-sm font-normal text-zinc-400">ج.م</span>
                  </div>
                  <span className="text-[11px] text-zinc-500 mt-1 block">مدفوعات تم التحقق منها</span>
                </div>

                <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800">
                  <span className="text-xs text-zinc-400 block mb-1">طلبات بانتظار المراجعة</span>
                  <div className="text-3xl font-black text-amber-400 animate-pulse">{overview.underReviewRequests || 0}</div>
                  <span className="text-[11px] text-zinc-500 mt-1 block">تحويلات تتطلب التدقيق</span>
                </div>
              </div>

              {/* Codes & Free Grants Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-zinc-950/70 border border-zinc-800/80">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-zinc-400">إجمالي الأكواد المولدة</span>
                    <Gift className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="text-2xl font-bold text-white">{overview.totalCodes || 0}</div>
                  <div className="flex items-center gap-4 text-xs text-zinc-500 mt-2">
                    <span>مستخدم: <strong className="text-zinc-300">{overview.redeemedCodes || 0}</strong></span>
                    <span>متاح: <strong className="text-emerald-400">{overview.availableCodes || 0}</strong></span>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-zinc-950/70 border border-zinc-800/80">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-zinc-400">الاشتراكات الممنوحة مجاناً</span>
                    <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                  </div>
                  <div className="text-2xl font-bold text-white">{overview.freeGrantsCount || 0}</div>
                  <span className="text-xs text-zinc-500 mt-2 block">منح إدارية للمسابقات والشركاء</span>
                </div>

                <div className="p-5 rounded-2xl bg-zinc-950/70 border border-zinc-800/80">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-zinc-400">الاشتراكات المنتهية / الملغاة</span>
                    <Clock className="w-4 h-4 text-rose-400" />
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {(overview.expiredSubscriptions || 0) + (overview.revokedSubscriptions || 0)}
                  </div>
                  <span className="text-xs text-zinc-500 mt-2 block">حسابات فقدت حق الوصول الحصري</span>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════ */}
          {/* TAB 2: PLANS MANAGEMENT */}
          {/* ═══════════════════════════════════════════════════════════════════ */}
          {subTab === 'plans' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">باقات الاشتراك المعروضة للقراء</h3>
                <button
                  type="button"
                  onClick={() => {
                    setEditingPlan(null);
                    setPlanForm({
                      nameAr: '',
                      nameEn: '',
                      descriptionAr: '',
                      descriptionEn: '',
                      priceEgp: 99,
                      durationDays: 30,
                      features: 'قراءة غير محدودة لجميع الأعداد\nتصفح بدون إعلانات\nشارات حصرية',
                      isFeatured: false,
                    });
                    setShowPlanModal(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-[#D4AF37] text-black text-xs font-bold flex items-center gap-1.5 shadow-md hover:brightness-110 transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة باقة جديدة</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`p-6 rounded-3xl bg-zinc-900 border flex flex-col justify-between ${
                      plan.is_featured ? 'border-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.15)]' : 'border-zinc-800'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-lg font-bold text-white">{plan.name_ar}</span>
                        {plan.is_featured && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500 text-black text-[10px] font-black">
                            مميزة
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-zinc-400 block mb-4">{plan.description_ar}</span>

                      <div className="flex items-baseline gap-2 mb-4 pb-4 border-b border-zinc-800">
                        <span className="text-3xl font-black text-white">{plan.price_egp}</span>
                        <span className="text-xs text-zinc-400">ج.م / {plan.duration_days} يوماً</span>
                      </div>

                      <ul className="space-y-1.5 text-xs text-zinc-300 mb-6">
                        {(Array.isArray(plan.features) ? plan.features : []).map((f: string, i: number) => (
                          <li key={i} className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex items-center gap-2 pt-4 border-t border-zinc-800">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingPlan(plan);
                          setPlanForm({
                            nameAr: plan.name_ar,
                            nameEn: plan.name_en,
                            descriptionAr: plan.description_ar || '',
                            descriptionEn: plan.description_en || '',
                            priceEgp: plan.price_egp,
                            durationDays: plan.duration_days,
                            features: (plan.features || []).join('\n'),
                            isFeatured: plan.is_featured,
                          });
                          setShowPlanModal(true);
                        }}
                        className="flex-1 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-bold transition flex items-center justify-center gap-1.5"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>تعديل</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleArchivePlan(plan.id)}
                        className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition"
                        title="أرشفة الباقة"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════ */}
          {/* TAB 3: PAYMENT REQUESTS REVIEW */}
          {/* ═══════════════════════════════════════════════════════════════════ */}
          {subTab === 'requests' && (
            <div className="space-y-6">
              {/* Filters */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Search className="w-4 h-4 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="ابحث بالمرجع أو البريد أو رقم العملية..."
                    value={reqSearch}
                    onChange={(e) => setReqSearch(e.target.value)}
                    className="px-3 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-xs text-white focus:outline-none w-full sm:w-72"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-400">الحالة:</span>
                  <select
                    value={reqFilter}
                    onChange={(e) => setReqFilter(e.target.value)}
                    className="px-3 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-xs text-white focus:outline-none"
                  >
                    <option value="all">جميع الحالات</option>
                    <option value="under_review">قيد المراجعة</option>
                    <option value="pending_payment">بانتظار الإثبات</option>
                    <option value="approved">معتمد</option>
                    <option value="rejected">مرفوض</option>
                  </select>
                </div>
              </div>

              {/* Requests Table */}
              <div className="rounded-2xl border border-zinc-800 overflow-hidden bg-zinc-950/70">
                <table className="w-full text-right text-xs">
                  <thead className="bg-zinc-900/90 text-zinc-400 border-b border-zinc-800">
                    <tr>
                      <th className="p-4">مرجع الطلب</th>
                      <th className="p-4">المستخدم</th>
                      <th className="p-4">الباقة والمبلغ</th>
                      <th className="p-4">رقم مرجع إنستاباي</th>
                      <th className="p-4">الحالة</th>
                      <th className="p-4">الإثبات والإجراء</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {paymentRequests
                      .filter((r) => {
                        if (reqFilter !== 'all' && r.status !== reqFilter) return false;
                        if (reqSearch) {
                          const q = reqSearch.toLowerCase();
                          return (
                            r.reference.toLowerCase().includes(q) ||
                            r.user_email?.toLowerCase().includes(q) ||
                            r.transaction_reference?.toLowerCase().includes(q)
                          );
                        }
                        return true;
                      })
                      .map((r) => (
                        <tr key={r.id} className="hover:bg-zinc-900/40 transition">
                          <td className="p-4 font-mono font-bold text-white">{r.reference}</td>
                          <td className="p-4">
                            <span className="block font-semibold text-zinc-200">{r.user_name || r.user_email || 'مستخدم'}</span>
                            <span className="text-[10px] text-zinc-500 font-mono">{r.user_id}</span>
                          </td>
                          <td className="p-4">
                            <span className="font-bold text-amber-300">{r.plan_name_ar}</span>
                            <span className="text-zinc-500 block">{r.price_egp} ج.م ({r.duration_days} يوم)</span>
                          </td>
                          <td className="p-4 font-mono text-zinc-300">
                            {r.transaction_reference || <span className="text-zinc-600">لم يُدخل بعد</span>}
                          </td>
                          <td className="p-4">
                            {r.status === 'under_review' && (
                              <span className="px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-[11px] font-bold">
                                قيد المراجعة
                              </span>
                            )}
                            {r.status === 'pending_payment' && (
                              <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[11px] font-bold">
                                بانتظار الإثبات
                              </span>
                            )}
                            {r.status === 'approved' && (
                              <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold">
                                معتمد
                              </span>
                            )}
                            {r.status === 'rejected' && (
                              <span className="px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 text-[11px] font-bold">
                                مرفوض
                              </span>
                            )}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              {r.proof_image_url && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setViewingProofReq(r);
                                    setShowProofModal(true);
                                  }}
                                  className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition"
                                  title="معاينة إيصال التحويل"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                              )}

                              {r.status === 'under_review' && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleApproveRequest(r.id)}
                                    className="px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-[11px] font-bold transition flex items-center gap-1"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>اعتماد وتفعيل</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedReqForReject(r);
                                      setRejectionReason('');
                                      setShowRejectModal(true);
                                    }}
                                    className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-[11px] font-bold transition"
                                  >
                                    رفض
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════ */}
          {/* TAB 4: ACTIVE & SCHEDULED QUEUE */}
          {/* ═══════════════════════════════════════════════════════════════════ */}
          {subTab === 'active' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">الاشتراكات المجدولة والنشطة في النظام</h3>
                <button
                  type="button"
                  onClick={() => setShowGrantModal(true)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-[#D4AF37] text-black text-xs font-bold flex items-center gap-1.5 shadow-md hover:brightness-110 transition"
                >
                  <Gift className="w-4 h-4" />
                  <span>منح اشتراك مجاني لمستخدم</span>
                </button>
              </div>

              <div className="rounded-2xl border border-zinc-800 overflow-hidden bg-zinc-950/70">
                <table className="w-full text-right text-xs">
                  <thead className="bg-zinc-900/90 text-zinc-400 border-b border-zinc-800">
                    <tr>
                      <th className="p-4">كود الاشتراك</th>
                      <th className="p-4">معرف المستخدم</th>
                      <th className="p-4">المدة</th>
                      <th className="p-4">تاريخ البدء والانتهاء</th>
                      <th className="p-4">المصدر</th>
                      <th className="p-4">الحالة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {activeSubscriptions.map((sub) => (
                      <tr key={sub.id} className="hover:bg-zinc-900/40 transition">
                        <td className="p-4 font-mono font-bold text-white">{sub.reference_code}</td>
                        <td className="p-4 font-mono text-zinc-400">{sub.user_id}</td>
                        <td className="p-4 font-bold text-zinc-200">{sub.duration_days} يوماً</td>
                        <td className="p-4 text-zinc-300">
                          <div>من: <span className="font-mono text-zinc-400">{new Date(sub.start_date).toLocaleDateString('ar-EG')}</span></div>
                          <div>إلى: <span className="font-mono text-emerald-400">{new Date(sub.end_date).toLocaleDateString('ar-EG')}</span></div>
                        </td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[10px] font-semibold">
                            {sub.source === 'instapay' ? 'إنستاباي' : sub.source === 'code' ? 'كود هدية' : 'منحة إدارية'}
                          </span>
                        </td>
                        <td className="p-4">
                          {sub.status === 'active' && (
                            <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold">
                              نشط حالياً
                            </span>
                          )}
                          {sub.status === 'scheduled' && (
                            <span className="px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-[11px] font-bold">
                              مجدول في الطابور
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════ */}
          {/* TAB 5: CODES MANAGEMENT */}
          {/* ═══════════════════════════════════════════════════════════════════ */}
          {subTab === 'codes' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowCodeModal(true)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-[#D4AF37] text-black text-xs font-bold flex items-center gap-1.5 shadow-md hover:brightness-110 transition"
                  >
                    <Plus className="w-4 h-4" />
                    <span>توليد حزمة أكواد جديدة</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleExportCodes}
                    className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <Download className="w-4 h-4" />
                    <span>تصدير كملف CSV</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="ابحث برمز الكود..."
                    value={codeSearch}
                    onChange={(e) => setCodeSearch(e.target.value)}
                    className="px-3 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-xs text-white focus:outline-none"
                  />
                  <select
                    value={codeStatusFilter}
                    onChange={(e) => setCodeStatusFilter(e.target.value)}
                    className="px-3 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-xs text-white focus:outline-none"
                  >
                    <option value="all">الكل</option>
                    <option value="available">متاح</option>
                    <option value="redeemed">مستخدم</option>
                    <option value="disabled">معطل</option>
                  </select>
                </div>
              </div>

              <div className="rounded-2xl border border-zinc-800 overflow-hidden bg-zinc-950/70">
                <table className="w-full text-right text-xs">
                  <thead className="bg-zinc-900/90 text-zinc-400 border-b border-zinc-800">
                    <tr>
                      <th className="p-4">كود الاشتراك</th>
                      <th className="p-4">المدة</th>
                      <th className="p-4">تاريخ الإنشاء</th>
                      <th className="p-4">الحالة</th>
                      <th className="p-4">المستخدم المستفيد</th>
                      <th className="p-4">التحكم</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {codes
                      .filter((c) => {
                        if (codeStatusFilter === 'available' && (c.is_redeemed || !c.is_active)) return false;
                        if (codeStatusFilter === 'redeemed' && !c.is_redeemed) return false;
                        if (codeStatusFilter === 'disabled' && c.is_active) return false;
                        if (codeSearch && !c.code.includes(codeSearch.toUpperCase())) return false;
                        return true;
                      })
                      .map((c) => (
                        <tr key={c.id} className="hover:bg-zinc-900/40 transition">
                          <td className="p-4 font-mono font-bold text-amber-300 tracking-wider">{c.code}</td>
                          <td className="p-4 font-semibold text-zinc-200">{c.duration_days} يوماً</td>
                          <td className="p-4 font-mono text-zinc-500">{new Date(c.created_at).toLocaleDateString('ar-EG')}</td>
                          <td className="p-4">
                            {c.is_redeemed ? (
                              <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 text-[10px]">مستخدم</span>
                            ) : c.is_active ? (
                              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px]">
                                متاح للتفعيل
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 text-[10px]">معطل</span>
                            )}
                          </td>
                          <td className="p-4 font-mono text-zinc-400">{c.redeemed_by || '—'}</td>
                          <td className="p-4">
                            {!c.is_redeemed && (
                              <button
                                type="button"
                                onClick={async () => {
                                  await api.adminToggleSubscriptionCode(c.id);
                                  await loadAllData();
                                }}
                                className="text-[11px] font-bold text-zinc-400 hover:text-white underline"
                              >
                                {c.is_active ? 'تعطيل' : 'تفعيل'}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════ */}
          {/* TAB 6: INSTAPAY SETTINGS */}
          {/* ═══════════════════════════════════════════════════════════════════ */}
          {subTab === 'settings' && (
            <div className="max-w-2xl bg-zinc-950/70 border border-zinc-800 p-8 rounded-3xl space-y-6">
              <div className="pb-4 border-b border-zinc-800">
                <h3 className="text-lg font-bold text-white">إعدادات حساب واستقبال تحويلات إنستاباي</h3>
                <span className="text-xs text-zinc-400">تظهر هذه البيانات لجميع المشتركين في صفحة الدفع</span>
              </div>

              <form onSubmit={handleUpdateSettings} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5">عنوان إنستاباي (IPA / Username) *</label>
                  <input
                    type="text"
                    required
                    value={settings.instapay_address || ''}
                    onChange={(e) => setSettings({ ...settings, instapay_address: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white font-mono text-sm focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5">اسم المستلم الرسمي *</label>
                  <input
                    type="text"
                    required
                    value={settings.recipient_name || ''}
                    onChange={(e) => setSettings({ ...settings, recipient_name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-sm focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5">رقم الهاتف المرتبط بالحساب</label>
                  <input
                    type="text"
                    value={settings.phone_number || ''}
                    onChange={(e) => setSettings({ ...settings, phone_number: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white font-mono text-sm focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5">تعليمات التحويل بالعربية</label>
                  <textarea
                    rows={4}
                    value={settings.instructions_ar || ''}
                    onChange={(e) => setSettings({ ...settings, instructions_ar: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs leading-relaxed focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <input
                    type="checkbox"
                    id="enableInstapay"
                    checked={settings.is_enabled !== false}
                    onChange={(e) => setSettings({ ...settings, is_enabled: e.target.checked })}
                    className="w-4 h-4 rounded text-[#D4AF37] focus:ring-[#D4AF37] bg-zinc-900 border-zinc-700"
                  />
                  <label htmlFor="enableInstapay" className="text-xs font-bold text-zinc-200 cursor-pointer">
                    تفعيل استقبال طلبات الاشتراك عبر إنستاباي
                  </label>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-[#D4AF37] text-black font-bold text-xs hover:brightness-110 transition shadow-md"
                  >
                    {submitting ? 'جاري الحفظ...' : 'حفظ إعدادات إنستاباي'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </>
      )}

      {/* ══ MODAL: CREATE / EDIT PLAN ══ */}
      {showPlanModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-4 text-right">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-lg font-bold text-white">
                {editingPlan ? 'تعديل باقة اشتراك' : 'إضافة باقة اشتراك جديدة'}
              </h3>
              <button type="button" onClick={() => setShowPlanModal(false)} className="text-zinc-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePlan} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">اسم الباقة (عربي) *</label>
                <input
                  type="text"
                  required
                  value={planForm.nameAr}
                  onChange={(e) => setPlanForm({ ...planForm, nameAr: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">السعر بالجنيه (EGP) *</label>
                  <input
                    type="number"
                    required
                    value={planForm.priceEgp}
                    onChange={(e) => setPlanForm({ ...planForm, priceEgp: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">المدة بالأيام *</label>
                  <input
                    type="number"
                    required
                    value={planForm.durationDays}
                    onChange={(e) => setPlanForm({ ...planForm, durationDays: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">الوصف التسويقي</label>
                <textarea
                  rows={2}
                  value={planForm.descriptionAr}
                  onChange={(e) => setPlanForm({ ...planForm, descriptionAr: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">المزايا (ميزة في كل سطر)</label>
                <textarea
                  rows={3}
                  value={planForm.features}
                  onChange={(e) => setPlanForm({ ...planForm, features: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-xs font-mono"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="featuredPlan"
                  checked={planForm.isFeatured}
                  onChange={(e) => setPlanForm({ ...planForm, isFeatured: e.target.checked })}
                  className="w-4 h-4 rounded text-[#D4AF37] bg-zinc-800 border-zinc-700"
                />
                <label htmlFor="featuredPlan" className="text-xs text-zinc-300 cursor-pointer">
                  تمييز الباقة كأكثر شعبية (Featured)
                </label>
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-[#D4AF37] text-black font-bold text-xs hover:brightness-110"
                >
                  {submitting ? 'جاري الحفظ...' : 'حفظ الباقة'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowPlanModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-zinc-800 text-zinc-400 text-xs font-bold"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══ MODAL: REJECT PAYMENT REQUEST ══ */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4 text-right">
            <h3 className="text-lg font-bold text-white">رفض طلب الاشتراك</h3>
            <p className="text-xs text-zinc-400">
              يرجى كتابة سبب واضح لرفض الطلب (مثل: لم يصل التحويل للبنك، أو الإيصال غير واضح) ليظهر للمستخدم في حسابه.
            </p>

            <form onSubmit={handleRejectRequest} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">سبب الرفض الإلزامي *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="مثال: تعذر التحقق من وصول المبلغ إلى الحساب البنكي برقم المرجع المذكور..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-xs"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
                >
                  تأكيد الرفض وإخطار المستخدم
                </button>
                <button
                  type="button"
                  onClick={() => setShowRejectModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-zinc-800 text-zinc-400 text-xs font-bold"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══ MODAL: PROOF SCREENSHOT VIEWER ══ */}
      {showProofModal && viewingProofReq && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 max-w-lg w-full space-y-4 text-right">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div>
                <h4 className="text-base font-bold text-white">إيصال تحويل: {viewingProofReq.reference}</h4>
                <span className="text-xs text-zinc-400 font-mono">المرجع: {viewingProofReq.transaction_reference}</span>
              </div>
              <button type="button" onClick={() => setShowProofModal(false)} className="text-zinc-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-auto rounded-xl bg-black p-2 flex items-center justify-center">
              <img src={viewingProofReq.proof_image_url} alt="إيصال التحويل" className="max-w-full max-h-[55vh] object-contain rounded-lg" />
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowProofModal(false)}
                className="px-4 py-2 rounded-xl bg-zinc-800 text-white text-xs font-bold"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ MODAL: GRANT FREE SUBSCRIPTION ══ */}
      {showGrantModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4 text-right">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-lg font-bold text-white">منح اشتراك مجاني لمستخدم</h3>
              <button type="button" onClick={() => setShowGrantModal(false)} className="text-zinc-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGrantSubscription} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">معرف المستخدم (UUID) *</label>
                <input
                  type="text"
                  required
                  placeholder="معرف حساب المستخدم في النظام"
                  value={grantForm.userId}
                  onChange={(e) => setGrantForm({ ...grantForm, userId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">مدة الاشتراك بالأيام *</label>
                <input
                  type="number"
                  required
                  value={grantForm.durationDays}
                  onChange={(e) => setGrantForm({ ...grantForm, durationDays: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">سبب المنح الإداري *</label>
                <select
                  value={grantForm.grantReason}
                  onChange={(e) => setGrantForm({ ...grantForm, grantReason: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-xs"
                >
                  <option value="مكافأة مسابقة ترويجية">مكافأة مسابقة ترويجية</option>
                  <option value="هدية شريك محتوى">هدية شريك محتوى</option>
                  <option value="تعويض قارئ">تعويض قارئ</option>
                  <option value="عضوية شرفية">عضوية شرفية</option>
                  <option value="أخرى">أخرى</option>
                </select>
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-[#D4AF37] text-black font-bold text-xs hover:brightness-110"
                >
                  تأكيد المنح والجدولة
                </button>
                <button
                  type="button"
                  onClick={() => setShowGrantModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-zinc-800 text-zinc-400 text-xs font-bold"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══ MODAL: GENERATE CODES ══ */}
      {showCodeModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4 text-right">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-lg font-bold text-white">توليد حزمة أكواد عضوية</h3>
              <button type="button" onClick={() => setShowCodeModal(false)} className="text-zinc-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGenerateCodes} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">عدد الأكواد *</label>
                  <input
                    type="number"
                    min={1}
                    max={500}
                    required
                    value={codeForm.count}
                    onChange={(e) => setCodeForm({ ...codeForm, count: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">المدة (أيام) *</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={codeForm.durationDays}
                    onChange={(e) => setCodeForm({ ...codeForm, durationDays: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">اسم الحملة / الدفعة *</label>
                <input
                  type="text"
                  required
                  value={codeForm.batchName}
                  onChange={(e) => setCodeForm({ ...codeForm, batchName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">ملاحظات الحملة (اختياري)</label>
                <input
                  type="text"
                  placeholder="مثال: أكواد موزعة في معرض القاهرة الدولي للكتاب"
                  value={codeForm.campaignNotes}
                  onChange={(e) => setCodeForm({ ...codeForm, campaignNotes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-xs"
                />
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-[#D4AF37] text-black font-bold text-xs hover:brightness-110"
                >
                  توليد وحفظ الأكواد
                </button>
                <button
                  type="button"
                  onClick={() => setShowCodeModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-zinc-800 text-zinc-400 text-xs font-bold"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
