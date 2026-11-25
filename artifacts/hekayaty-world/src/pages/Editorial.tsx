import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import {
  ShieldAlert,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Search,
  Filter,
  Eye,
  Send,
  Sparkles,
  Users,
  Shield,
  PenTool,
  Building2,
  Plus,
  ChevronLeft,
  Lock,
} from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';

interface Submission {
  id: string;
  title: string;
  author: string;
  authorId: string;
  type: 'comic' | 'story';
  submittedDate: string;
  status: 'under_review' | 'approved' | 'revision_requested';
  synopsis: string;
  feedback?: string;
}

export default function Editorial() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const { toast } = useToast();

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [selectedSub, setSelectedSub] = useState<Submission | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [loading, setLoading] = useState(true);

  // New Submission Form Modal
  const [newSubOpen, setNewSubOpen] = useState(false);
  const [subTitle, setSubTitle] = useState('');
  const [subType, setSubType] = useState<'comic' | 'story'>('comic');
  const [subSynopsis, setSubSynopsis] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [subMsg, setSubMsg] = useState('');

  // Admin User Management State
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [activeView, setActiveView] = useState<'submissions' | 'users'>('submissions');
  const [adminLoading, setAdminLoading] = useState(false);

  // Creator Application State (for Readers)
  const [applyType, setApplyType] = useState<'writer' | 'publishing_house'>('writer');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [applyBio, setApplyBio] = useState('');
  const [applyLoading, setApplyLoading] = useState(false);
  const [applySuccess, setApplySuccess] = useState('');
  const [applyError, setApplyError] = useState('');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation('/login?redirect=/editorial');
      return;
    }

    if (isAuthenticated) {
      loadSubmissions();
      if (user?.role === 'admin') {
        loadAdminUsers();
      }
    }
  }, [isAuthenticated, isLoading, user]);

  const loadSubmissions = async () => {
    setLoading(true);
    try {
      const data = await api.getSubmissions();
      setSubmissions(data || []);
      if (data && data.length > 0 && !selectedSub) {
        setSelectedSub(data[0]);
      }
    } catch {
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  };

  const loadAdminUsers = async () => {
    setAdminLoading(true);
    try {
      const data = await api.getAdminUsers();
      setAdminUsers(data || []);
    } catch {
      setAdminUsers([]);
    } finally {
      setAdminLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: Submission['status']) => {
    if (!selectedSub || user?.role !== 'admin') return;

    try {
      await api.updateSubmissionStatus(selectedSub.id, newStatus, feedbackText);
      const updated = { ...selectedSub, status: newStatus, feedback: feedbackText || selectedSub.feedback };
      setSelectedSub(updated);
      setSubmissions((prev) =>
        prev.map((s) => (s.id === selectedSub.id ? updated : s))
      );
      setFeedbackText('');
      toast({ title: 'تم التحديث بنجاح', description: 'تم تحديث حالة العمل التحريري بنجاح.' });
    } catch (err: any) {
      toast({ title: 'خطأ', description: err.message || 'فشل تحديث الحالة', variant: 'destructive' });
    }
  };

  const handleCreateSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subTitle || !subSynopsis) return;

    setSubmitting(true);
    setSubMsg('');
    try {
      const res = await api.createSubmission({
        title: subTitle,
        type: subType,
        synopsis: subSynopsis,
      });

      if (res?.success) {
        setSubMsg('تم إرسال العمل بنجاح إلى هيئة التحرير!');
        setSubTitle('');
        setSubSynopsis('');
        loadSubmissions();
        setTimeout(() => {
          setNewSubOpen(false);
          setSubMsg('');
        }, 1000);
      }
    } catch (err: any) {
      setSubMsg(err.message || 'فشل إرسال العمل');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateRole = async (targetUserId: string, newRole: string) => {
    try {
      await api.updateUserRole(targetUserId, newRole);
      setAdminUsers((prev) =>
        prev.map((u) => (u.id === targetUserId ? { ...u, role: newRole } : u))
      );
      toast({ title: 'تم تغيير الصلاحية', description: `تم تحديث رتبة المستخدم إلى ${newRole}` });
    } catch (err: any) {
      toast({ title: 'خطأ', description: err.message || 'فشل تحديث الصلاحية', variant: 'destructive' });
    }
  };

  const handleApplyCreator = async (e: React.FormEvent) => {
    e.preventDefault();
    setApplyLoading(true);
    setApplyError('');
    setApplySuccess('');

    try {
      const res = await api.applyCreator({
        type: applyType,
        portfolioUrl,
        bio: applyBio,
      });

      if (res?.success) {
        setApplySuccess(res.message);
        setPortfolioUrl('');
        setApplyBio('');
      } else {
        setApplyError(res?.error || 'فشل إرسال الطلب');
      }
    } catch (err: any) {
      setApplyError(err.message || 'خطأ أثناء إرسال الطلب');
    } finally {
      setApplyLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center font-arabic">
        <div className="w-10 h-10 border-4 border-deep-teal/20 border-t-deep-teal dark:border-antique-gold/20 dark:border-t-antique-gold rounded-full animate-spin" />
        <span className="text-xs text-foreground/60 mt-3">جاري التحقق من الصلاحيات التحريرية...</span>
      </div>
    );
  }

  // Reader View: Creator Application & Criteria
  if (user?.role === 'reader') {
    return (
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto font-arabic" dir="rtl">
        <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-soft-sand/60 dark:border-white/10 shadow-xl space-y-6 text-center sm:text-right">
          <div className="flex flex-col sm:flex-row items-center gap-4 border-b border-soft-sand/40 dark:border-white/10 pb-6">
            <div className="w-14 h-14 rounded-2xl bg-deep-teal/15 dark:bg-antique-gold/20 text-deep-teal dark:text-antique-gold flex items-center justify-center shrink-0">
              <PenTool className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground font-cinzel">
                بوابة مبدعي <span className="text-deep-teal dark:text-antique-gold">حكاياتي</span>
              </h1>
              <p className="text-xs sm:text-sm text-foreground/65 mt-1">
                حسابك الحالي مسجل برتبة <strong>قارئ</strong>. يمكنك التقديم هنا للانضمام ككاتب أو رسام معتمد أو دار نشر رسمية.
              </p>
            </div>
          </div>

          {applySuccess ? (
            <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <h3 className="text-base font-bold text-emerald-700 dark:text-emerald-300">تم استلام طلبك بنجاح!</h3>
              <p className="text-xs text-foreground/75 leading-relaxed">{applySuccess}</p>
              <div className="pt-2">
                <Link href="/profile" className="text-xs text-deep-teal dark:text-antique-gold font-bold hover:underline">
                  العودة إلى ملفك الشخصي
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleApplyCreator} className="space-y-4 text-right">
              {applyError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{applyError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-foreground/80 mb-2">نوع الاعتماد المطلوب</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setApplyType('writer')}
                    className={`p-3.5 rounded-2xl border text-right transition-all flex items-center gap-2.5 ${
                      applyType === 'writer'
                        ? 'border-deep-teal bg-deep-teal/10 dark:border-antique-gold dark:bg-antique-gold/15 font-bold text-deep-teal dark:text-antique-gold'
                        : 'border-soft-sand dark:border-white/10 text-foreground/70'
                    }`}
                  >
                    <PenTool className="w-4 h-4" />
                    <span>كاتب / مؤلف / رسام</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setApplyType('publishing_house')}
                    className={`p-3.5 rounded-2xl border text-right transition-all flex items-center gap-2.5 ${
                      applyType === 'publishing_house'
                        ? 'border-deep-teal bg-deep-teal/10 dark:border-antique-gold dark:bg-antique-gold/15 font-bold text-deep-teal dark:text-antique-gold'
                        : 'border-soft-sand dark:border-white/10 text-foreground/70'
                    }`}
                  >
                    <Building2 className="w-4 h-4" />
                    <span>دار نشر رسمية</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground/80 mb-1.5">
                  رابط معرض الأعمال أو الملف التعريفي (Portfolio URL)
                </label>
                <input
                  type="url"
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                  placeholder="https://behance.net/yourprofile أو رابط Drive"
                  dir="ltr"
                  className="w-full px-4 py-2.5 rounded-xl bg-soft-cream/80 dark:bg-white/[0.04] border border-soft-sand dark:border-white/10 text-foreground text-sm focus:outline-none focus:border-deep-teal dark:focus:border-antique-gold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground/80 mb-1.5">
                  نبذة عن خبراتك وأعمالك المنشورة أو أفكار السلاسل المقترحة
                </label>
                <textarea
                  rows={4}
                  required
                  value={applyBio}
                  onChange={(e) => setApplyBio(e.target.value)}
                  placeholder="حدثنا عن خلفيتك الإبداعية، نوع القصص أو الكوميكس التي تنتجها، والعوالم التي تود المشاركة بها..."
                  className="w-full px-4 py-2.5 rounded-xl bg-soft-cream/80 dark:bg-white/[0.04] border border-soft-sand dark:border-white/10 text-foreground text-sm focus:outline-none focus:border-deep-teal dark:focus:border-antique-gold"
                />
              </div>

              <button
                type="submit"
                disabled={applyLoading}
                className="w-full py-3 rounded-2xl bg-deep-teal text-white dark:bg-gradient-to-r dark:from-antique-gold dark:to-muted-gold dark:text-midnight-navy font-bold text-sm shadow-md hover:brightness-105 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {applyLoading ? <span>جاري إرسال الطلب...</span> : <span>إرسال طلب الانضمام لهيئة التحرير</span>}
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: Submission['status']) => {
    switch (status) {
      case 'approved':
        return {
          label: 'معتمد للنشر',
          style: 'bg-emerald-600/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
        };
      case 'under_review':
        return {
          label: 'قيد التدقيق التحريري',
          style: 'bg-antique-gold/20 text-antique-gold border-antique-gold/40',
        };
      case 'revision_requested':
        return {
          label: 'طلب تعديل سردي',
          style: 'bg-purple-600/15 text-purple-700 dark:text-purple-300 border-purple-500/30',
        };
    }
  };

  const filtered = submissions.filter((s) => filter === 'all' || s.status === filter);

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto font-arabic" dir="rtl">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-deep-teal dark:text-antique-gold mb-1">
            <Shield className="w-4 h-4" />
            <span>
              {user?.role === 'admin'
                ? 'لوحة الإدارة والتحرير المركزية'
                : 'لوحة إدارة الأعمال الإبداعية'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold text-foreground font-cinzel">
            منظومة النشر <span className="text-deep-teal dark:text-antique-gold">والتدقيق الفني</span>
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {user?.role === 'admin' && (
            <div className="flex rounded-xl bg-soft-sand/30 dark:bg-white/5 p-1 border border-soft-sand dark:border-white/10 text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveView('submissions')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeView === 'submissions'
                    ? 'bg-deep-teal text-white dark:bg-antique-gold dark:text-midnight-navy shadow-sm'
                    : 'text-foreground/70 hover:text-foreground'
                }`}
              >
                الأعمال التحريرية
              </button>
              <button
                type="button"
                onClick={() => setActiveView('users')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeView === 'users'
                    ? 'bg-deep-teal text-white dark:bg-antique-gold dark:text-midnight-navy shadow-sm'
                    : 'text-foreground/70 hover:text-foreground'
                }`}
              >
                إدارة المستخدمين ({adminUsers.length})
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => setNewSubOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-deep-teal text-white dark:bg-antique-gold dark:text-midnight-navy font-bold text-xs shadow-md flex items-center gap-1.5 hover:scale-[1.02] transition-transform"
          >
            <Plus className="w-4 h-4" />
            <span>تقديم عمل جديد</span>
          </button>
        </div>
      </div>

      {activeView === 'users' && user?.role === 'admin' ? (
        /* Admin Users Management Table */
        <div className="glass-panel p-6 rounded-3xl border border-soft-sand/50 dark:border-white/10 shadow-md">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-base font-bold text-foreground font-cinzel flex items-center gap-2">
              <Users className="w-4 h-4 text-deep-teal dark:text-antique-gold" />
              <span>قائمة المستخدمين والصلاحيات (Supabase Profiles)</span>
            </h3>
            <span className="text-xs text-foreground/60">إجمالي المسجلين: {adminUsers.length}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-soft-sand/40 dark:border-white/10 text-foreground/60">
                  <th className="py-3 px-4">المستخدم</th>
                  <th className="py-3 px-4">البريد الإلكتروني</th>
                  <th className="py-3 px-4">الرتبة الحالية</th>
                  <th className="py-3 px-4">الحالة</th>
                  <th className="py-3 px-4">تعديل الصلاحية</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-soft-sand/30 dark:divide-white/5">
                {adminUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-soft-cream/30 dark:hover:bg-white/[0.02]">
                    <td className="py-3 px-4 font-bold text-foreground">{u.displayName}</td>
                    <td className="py-3 px-4 font-mono text-foreground/75" dir="ltr">{u.email}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-deep-teal/10 text-deep-teal dark:bg-antique-gold/20 dark:text-antique-gold border border-deep-teal/20 dark:border-antique-gold/30">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-[11px] font-medium ${u.isActive ? 'text-emerald-500' : 'text-red-500'}`}>
                        {u.isActive ? 'نشط' : 'معطل'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={u.role}
                        onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                        className="px-2.5 py-1 rounded-lg bg-soft-cream/80 dark:bg-zinc-900 border border-soft-sand dark:border-white/10 text-foreground text-xs focus:outline-none"
                      >
                        <option value="reader">reader (قارئ)</option>
                        <option value="writer">writer (كاتب ومبدع)</option>
                        <option value="publishing_house">publishing_house (دار نشر)</option>
                        <option value="admin">admin (مدير نظام)</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Submissions View */
        <div className="space-y-8">
          {/* Stats Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="glass-panel p-5 rounded-2xl border border-soft-sand/50 dark:border-white/10 shadow-sm">
              <span className="text-xs text-foreground/60 block mb-1">أعمال قيد التدقيق</span>
              <span className="text-2xl font-bold text-antique-gold">
                {submissions.filter((s) => s.status === 'under_review').length}
              </span>
            </div>
            <div className="glass-panel p-5 rounded-2xl border border-soft-sand/50 dark:border-white/10 shadow-sm">
              <span className="text-xs text-foreground/60 block mb-1">أعمال معتمدة للنشر</span>
              <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {submissions.filter((s) => s.status === 'approved').length}
              </span>
            </div>
            <div className="glass-panel p-5 rounded-2xl border border-soft-sand/50 dark:border-white/10 shadow-sm">
              <span className="text-xs text-foreground/60 block mb-1">تتطلب تنقيحاً تحريرياً</span>
              <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {submissions.filter((s) => s.status === 'revision_requested').length}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* List Column */}
            <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-soft-sand/50 dark:border-white/10 space-y-4 shadow-md">
              <div className="flex items-center justify-between pb-3 border-b border-soft-sand/40 dark:border-white/10">
                <h3 className="text-sm font-bold text-foreground font-cinzel">قائمة التقديمات</h3>
                <div className="flex gap-1.5 text-xs">
                  {['all', 'under_review', 'approved', 'revision_requested'].map((tabKey) => (
                    <button
                      key={tabKey}
                      type="button"
                      onClick={() => setFilter(tabKey)}
                      className={`px-3 py-1 rounded-lg transition-colors ${
                        filter === tabKey
                          ? 'bg-deep-teal text-white dark:bg-antique-gold dark:text-midnight-navy font-bold shadow-sm'
                          : 'text-foreground/60 hover:text-foreground bg-soft-cream/60 dark:bg-white/5'
                      }`}
                    >
                      {tabKey === 'all'
                        ? 'الكل'
                        : tabKey === 'approved'
                        ? 'معتمد'
                        : tabKey === 'under_review'
                        ? 'قيد التدقيق'
                        : 'طلب تعديل'}
                    </button>
                  ))}
                </div>
              </div>

              {filtered.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-10 h-10 text-foreground/20 mx-auto mb-2" />
                  <p className="text-xs text-foreground/60">لا توجد أعمال في هذه الفئة حالياً.</p>
                </div>
              ) : (
                <div className="divide-y divide-soft-sand/30 dark:divide-white/5">
                  {filtered.map((item) => {
                    const badge = getStatusBadge(item.status);
                    return (
                      <div
                        key={item.id}
                        onClick={() => setSelectedSub(item)}
                        className={`py-4 px-3 rounded-2xl transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          selectedSub?.id === item.id
                            ? 'bg-deep-teal/10 dark:bg-white/10 border border-deep-teal/40 dark:border-antique-gold/50'
                            : 'hover:bg-soft-cream/40 dark:hover:bg-white/[0.03]'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-foreground font-cinzel">{item.title}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${badge.style}`}>
                              {badge.label}
                            </span>
                          </div>
                          <p className="text-xs text-foreground/60">
                            المؤلف: <strong className="text-foreground">{item.author}</strong> • النوع:{' '}
                            {item.type === 'comic' ? 'كوميكس مصور' : 'نص روائي'} • تاريخ التقديم:{' '}
                            {item.submittedDate}
                          </p>
                        </div>
                        <button
                          type="button"
                          className="text-xs text-deep-teal dark:text-antique-gold font-semibold flex items-center gap-1"
                        >
                          <span>معاينة</span>
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Detail / Action Column */}
            <div className="glass-panel p-6 rounded-3xl border border-soft-sand/50 dark:border-white/10 space-y-6 shadow-md">
              {selectedSub ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-soft-sand/40 dark:border-white/10 pb-3">
                    <h3 className="text-sm font-bold text-foreground font-cinzel">تفاصيل العمل التحريري</h3>
                    <span className="font-mono text-xs text-foreground/50">{selectedSub.id}</span>
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-foreground mb-1">{selectedSub.title}</h4>
                    <p className="text-xs text-foreground/60">
                      المؤلف: {selectedSub.author} | تاريخ التقديم: {selectedSub.submittedDate}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-soft-cream/70 dark:bg-white/[0.02] border border-soft-sand/40 dark:border-white/5">
                    <span className="text-xs font-bold text-foreground/80 block mb-1">الملخص السردي والفكرة:</span>
                    <p className="text-xs text-foreground/75 leading-relaxed">{selectedSub.synopsis}</p>
                  </div>

                  {selectedSub.feedback && (
                    <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-700 dark:text-purple-300">
                      <span className="text-xs font-bold block mb-1">ملاحظات هيئة التحرير:</span>
                      <p className="text-xs leading-relaxed">{selectedSub.feedback}</p>
                    </div>
                  )}

                  {user?.role === 'admin' && (
                    <div className="space-y-3 pt-3 border-t border-soft-sand/40 dark:border-white/10">
                      <span className="text-xs font-bold text-foreground/80 block">إجراء هيئة التحرير (صلاحيات المشرف):</span>
                      <textarea
                        rows={2}
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                        placeholder="أضف ملاحظات توجيهية للمؤلف..."
                        className="w-full px-3 py-2 rounded-xl bg-soft-cream/80 dark:bg-white/[0.04] border border-soft-sand dark:border-white/10 text-xs text-foreground focus:outline-none"
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleStatusChange('approved')}
                          className="flex-1 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-colors shadow-sm"
                        >
                          اعتماد للنشر
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatusChange('revision_requested')}
                          className="flex-1 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 transition-colors shadow-sm"
                        >
                          طلب تنقيح
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-xs text-foreground/50">اختر عملاً من القائمة لمعاينته</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* New Submission Modal */}
      {newSubOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-soft-sand dark:border-white/10 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-soft-sand/40 dark:border-white/10 pb-3">
              <h3 className="text-base font-bold text-foreground font-cinzel">تقديم عمل جديد للتدقيق</h3>
              <button type="button" onClick={() => setNewSubOpen(false)} className="text-foreground/50 hover:text-foreground">
                ✕
              </button>
            </div>

            {subMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs">
                {subMsg}
              </div>
            )}

            <form onSubmit={handleCreateSubmission} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-foreground/80 mb-1">عنوان العمل</label>
                <input
                  type="text"
                  required
                  value={subTitle}
                  onChange={(e) => setSubTitle(e.target.value)}
                  placeholder="مثال: أصداء السديم المفقود"
                  className="w-full px-4 py-2.5 rounded-xl bg-soft-cream/80 dark:bg-white/[0.04] border border-soft-sand dark:border-white/10 text-foreground text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground/80 mb-1">نوع العمل</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSubType('comic')}
                    className={`py-2 rounded-xl text-xs font-bold border transition-colors ${
                      subType === 'comic'
                        ? 'border-deep-teal bg-deep-teal/10 dark:border-antique-gold dark:bg-antique-gold/15 text-deep-teal dark:text-antique-gold'
                        : 'border-soft-sand dark:border-white/10 text-foreground/60'
                    }`}
                  >
                    كوميكس مصور
                  </button>
                  <button
                    type="button"
                    onClick={() => setSubType('story')}
                    className={`py-2 rounded-xl text-xs font-bold border transition-colors ${
                      subType === 'story'
                        ? 'border-deep-teal bg-deep-teal/10 dark:border-antique-gold dark:bg-antique-gold/15 text-deep-teal dark:text-antique-gold'
                        : 'border-soft-sand dark:border-white/10 text-foreground/60'
                    }`}
                  >
                    نص روائي
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground/80 mb-1">ملخص القصة والفكرة التحريرية</label>
                <textarea
                  rows={4}
                  required
                  value={subSynopsis}
                  onChange={(e) => setSubSynopsis(e.target.value)}
                  placeholder="اكتب ملخصاً واضحاً للحبكة، الشخصيات الرئيسية، وكيف يرتبط العمل بعوالم حكاياتي..."
                  className="w-full px-4 py-2.5 rounded-xl bg-soft-cream/80 dark:bg-white/[0.04] border border-soft-sand dark:border-white/10 text-foreground text-sm focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl bg-deep-teal text-white dark:bg-antique-gold dark:text-midnight-navy font-bold text-xs shadow-md disabled:opacity-50"
                >
                  {submitting ? 'جاري الإرسال...' : 'إرسال العمل للمراجعة'}
                </button>
                <button
                  type="button"
                  onClick={() => setNewSubOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-soft-sand dark:border-white/10 text-foreground text-xs"
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
