import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'wouter';
import {
  User,
  BookOpen,
  Bookmark,
  Heart,
  Clock,
  Award,
  ChevronLeft,
  Trash2,
  Sparkles,
  LogIn,
  LogOut,
  UserCheck,
  Shield,
  KeyRound,
  PenTool,
  Building2,
  Settings,
  CheckCircle2,
  AlertCircle,
  FolderHeart,
  Plus,
  Upload,
  Bell,
  FileText,
  RefreshCw,
  Camera,
  Crown,
  CreditCard,
  Ticket,
  Calendar,
} from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';
import { useAppStore } from '@/stores/useAppStore';
import { useComics, useCharacters, useWorlds } from '@/lib/hooks';
import { api } from '@/lib/api';

const CLOUDINARY_CLOUD = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'x2f63nf1';

export default function Profile() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, logout, updateProfile, changePassword, deactivateAccount } = useAuthStore();
  const { readingProgress, favorites, collections, removeFromFavorites, removeFromCollection } = useAppStore();

  const { data: comics = [] } = useComics();
  const { data: characters = [] } = useCharacters();
  const { data: worlds = [] } = useWorlds();

  const isWriter = user?.role === 'writer' || user?.role === 'publishing_house';
  const isAdmin = user?.role === 'admin';

  const [activeTab, setActiveTab] = useState<'reading' | 'favorites' | 'collections' | 'submissions' | 'notifications' | 'membership' | 'settings'>('reading');

  // Subscription / Membership State
  const [subscriptionData, setSubscriptionData] = useState<{
    hasActiveSubscription: boolean;
    isAdminBypass: boolean;
    daysRemaining: number;
    activeSubscription: any;
    queuedSubscriptions: any[];
    history: any[];
    recentPaymentRequests: any[];
  } | null>(null);
  const [subLoading, setSubLoading] = useState(false);

  // Profile Edit State
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // Avatar Upload State
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Submissions State
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [newSubmission, setNewSubmission] = useState({ title: '', type: 'story' as 'comic' | 'story', synopsis: '' });
  const [submitting, setSubmitting] = useState(false);

  // Notifications State
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notifLoading, setNotifLoading] = useState(false);

  // Sync user fields when user changes
  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
      setBio(user.bio || '');
      setAvatarUrl(user.avatarUrl || '');
    }
  }, [user]);

  // Load submissions when tab opens
  useEffect(() => {
    if (activeTab === 'submissions' && isAuthenticated) {
      setSubmissionsLoading(true);
      api.getSubmissions().then(d => { setSubmissions(Array.isArray(d) ? d : []); setSubmissionsLoading(false); }).catch(() => setSubmissionsLoading(false));
    }
  }, [activeTab, isAuthenticated]);

  // Load notifications when tab opens
  useEffect(() => {
    if (activeTab === 'notifications' && isAuthenticated) {
      setNotifLoading(true);
      api.getNotifications().then(d => { setNotifications(Array.isArray(d) ? d : []); setNotifLoading(false); }).catch(() => setNotifLoading(false));
    }
  }, [activeTab, isAuthenticated]);

  // Load subscription details when membership tab opens
  useEffect(() => {
    if (activeTab === 'membership' && isAuthenticated) {
      setSubLoading(true);
      api.getMySubscription()
        .then((data) => {
          setSubscriptionData(data);
          setSubLoading(false);
        })
        .catch(() => setSubLoading(false));
    }
  }, [activeTab, isAuthenticated]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        const result = await api.uploadMedia(base64, 'avatars');
        if (result?.url) {
          setAvatarUrl(result.url);
          await updateProfile({ displayName, bio, avatarUrl: result.url });
          setProfileMsg({ type: 'success', text: 'تم تحديث الصورة الشخصية بنجاح!' });
        }
        setUploadingAvatar(false);
      };
      reader.readAsDataURL(file);
    } catch {
      setProfileMsg({ type: 'error', text: 'فشل رفع الصورة. حاول مرة أخرى.' });
      setUploadingAvatar(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMsg(null);
    const res = await updateProfile({ displayName, bio, avatarUrl });
    if (res.success) {
      setProfileMsg({ type: 'success', text: 'تم تحديث بيانات ملفك الشخصي بنجاح!' });
    } else {
      setProfileMsg({ type: 'error', text: res.error || 'فشل تحديث البيانات' });
    }
    setProfileLoading(false);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);
    if (newPassword.length < 8) {
      setPasswordMsg({ type: 'error', text: 'يجب ألا تقل كلمة المرور عن 8 خانات' });
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordMsg({ type: 'error', text: 'كلمتا المرور غير متطابقتين' });
      return;
    }
    setPasswordLoading(true);
    const res = await changePassword({ currentPassword, newPassword });
    if (res.success) {
      setPasswordMsg({ type: 'success', text: 'تم تغيير كلمة المرور بنجاح!' });
      setCurrentPassword(''); setNewPassword(''); setConfirmNewPassword('');
    } else {
      setPasswordMsg({ type: 'error', text: res.error || 'فشل تغيير كلمة المرور' });
    }
    setPasswordLoading(false);
  };

  const handleDeactivate = async () => {
    if (window.confirm('هل أنت متأكد من رغبتك في تعطيل حسابك؟ يمكنك التواصل مع الإدارة لإعادة تنشيطه لاحقاً.')) {
      await deactivateAccount();
      setLocation('/');
    }
  };

  const handleLogout = async () => {
    await logout();
    setLocation('/');
  };

  const handleNewSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubmission.title.trim()) return;
    setSubmitting(true);
    try {
      await api.createSubmission(newSubmission);
      const updated = await api.getSubmissions();
      setSubmissions(Array.isArray(updated) ? updated : []);
      setNewSubmission({ title: '', type: 'story', synopsis: '' });
    } catch {}
    setSubmitting(false);
  };

  const favoriteComics = comics.filter((c) => favorites.some((f) => f.id === c.id && f.type === 'comic'));
  const favoriteChars = characters.filter((ch) => favorites.some((f) => f.id === ch.id && f.type === 'character'));
  const favoriteWorlds = worlds.filter((w) => favorites.some((f) => f.id === w.id && f.type === 'world'));

  const statusBadge = (s: string) => {
    const map: Record<string, string> = {
      pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
      under_review: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
      approved: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
      rejected: 'bg-red-500/20 text-red-400 border-red-500/40',
    };
    const labels: Record<string, string> = { pending: 'قيد الانتظار', under_review: 'قيد المراجعة', approved: 'مقبول', rejected: 'مرفوض' };
    return { cls: map[s] || 'bg-zinc-500/20 text-zinc-400', label: labels[s] || s };
  };

  const displayAvatar = avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.displayName || 'H')}&background=087C7B&color=fff&size=200&font-size=0.4`;

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-[1200px] mx-auto font-arabic" dir="rtl">
      {/* Profile Header */}
      <div className="glass-panel p-6 sm:p-10 rounded-3xl border border-soft-sand/50 dark:border-white/10 mb-10 shadow-xl flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-right">
        {/* Avatar with Upload */}
        <div className="relative shrink-0">
          <div className="w-24 h-24 rounded-3xl overflow-hidden border-2 border-deep-teal dark:border-antique-gold bg-background shadow-md">
            <img src={displayAvatar} alt="Avatar" className="w-full h-full object-cover" />
          </div>
          {isAuthenticated && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
              title="تغيير الصورة الشخصية"
              className="absolute -bottom-1 -left-1 w-7 h-7 rounded-full bg-deep-teal dark:bg-antique-gold text-white dark:text-midnight-navy flex items-center justify-center shadow-md hover:brightness-105 transition-all disabled:opacity-60"
            >
              {uploadingAvatar ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
            </button>
          )}
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-deep-teal text-white dark:bg-antique-gold dark:text-midnight-navy flex items-center justify-center text-xs font-bold shadow-md">
            ★
          </div>
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h1 className="text-2xl font-bold text-foreground font-cinzel">
              {user?.displayName || 'مستكشف حكاياتي'}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-deep-teal/15 text-deep-teal dark:bg-antique-gold/20 dark:text-antique-gold border border-deep-teal/30 dark:border-antique-gold/40">
              {isAdmin ? 'مدير النظام التحريري' : user?.role === 'writer' ? 'كاتب ومبدع معتمد' : user?.role === 'publishing_house' ? 'دار نشر رسمية' : 'قارئ ومستكشف'}
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {isAuthenticated ? 'جلسة موثقة عبر Supabase' : 'وضع التصفح كزائر'}
            </span>
          </div>

          <p className="text-xs text-foreground/60">
            {isAuthenticated ? (
              <span className="flex items-center justify-center sm:justify-start gap-2 text-foreground/75">
                <span>البريد الإلكتروني: {user?.email}</span>
                {user?.bio && <span>• {user.bio}</span>}
              </span>
            ) : (
              'حساب زائر محلي • سجل دخولك لمزامنة سجلات القراءة والمفضلة عبر قاعدة بيانات Supabase السحابية.'
            )}
          </p>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-6 pt-2 text-xs text-foreground/75">
            <span className="flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-deep-teal dark:text-antique-gold" />
              <strong>{readingProgress.length}</strong> أعداد مقروءة
            </span>
            <span className="flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-red-500" />
              <strong>{favorites.length}</strong> في المفضلة
            </span>
            <span className="flex items-center gap-1.5">
              <FolderHeart className="w-4 h-4 text-rich-turquoise" />
              <strong>{collections.length}</strong> مجموعات
            </span>
            {isWriter && (
              <span className="flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-[#C5A15B]" />
                <strong>{submissions.length}</strong> تقديمات
              </span>
            )}
          </div>
        </div>

        {/* Auth Actions */}
        <div className="flex flex-col gap-2 shrink-0">
          {isAuthenticated ? (
            <div className="flex flex-col gap-2">
              {isAdmin ? (
                <Link href="/admin" className="px-4 py-2 rounded-xl bg-gradient-to-r from-deep-teal to-[#119B98] dark:from-antique-gold dark:to-[#927849] text-white dark:text-midnight-navy text-xs font-bold flex items-center justify-center gap-1.5 shadow-md hover:scale-[1.02] transition-transform">
                  <Shield className="w-3.5 h-3.5" />
                  <span>لوحة الإدارة والتحرير</span>
                </Link>
              ) : isWriter ? (
                <Link href="/editorial" className="px-4 py-2 rounded-xl bg-deep-teal text-white dark:bg-antique-gold dark:text-midnight-navy text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm hover:scale-[1.02] transition-transform">
                  <PenTool className="w-3.5 h-3.5" />
                  <span>لوحة التحرير والمبدعين</span>
                </Link>
              ) : null}
              <button type="button" onClick={handleLogout} className="px-4 py-2 rounded-xl border border-red-500/30 text-red-500 hover:bg-red-500/10 text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm">
                <LogOut className="w-3.5 h-3.5" />
                <span>تسجيل الخروج</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-2">
              <Link href="/login" className="px-4 py-2.5 rounded-xl bg-deep-teal text-white dark:bg-antique-gold dark:text-midnight-navy text-xs font-bold flex items-center justify-center gap-1.5 shadow-md hover:scale-[1.02] transition-transform">
                <LogIn className="w-4 h-4" />
                <span>تسجيل الدخول</span>
              </Link>
              <Link href="/register" className="px-4 py-2.5 rounded-xl border border-soft-sand dark:border-white/10 hover:border-deep-teal dark:hover:border-antique-gold text-foreground text-xs font-bold flex items-center justify-center gap-1.5 transition-colors">
                <span>إنشاء حساب</span>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Profile Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 border-b border-soft-sand/40 dark:border-white/10 pb-4">
        {([
          { key: 'reading', icon: Clock, label: `سجل القراءة (${readingProgress.length})` },
          { key: 'favorites', icon: Heart, label: `المفضلة (${favorites.length})` },
          { key: 'collections', icon: FolderHeart, label: `مجموعاتي (${collections.length})` },
          ...(isWriter || isAdmin ? [{ key: 'submissions', icon: FileText, label: 'تقديماتي' }] : []),
          ...(isAuthenticated ? [{ key: 'membership', icon: Crown, label: 'عضويتي واشتراكي' }] : []),
          ...(isAuthenticated ? [{ key: 'notifications', icon: Bell, label: 'الإشعارات' }] : []),
          ...(isAuthenticated ? [{ key: 'settings', icon: Settings, label: 'إعدادات الحساب' }] : []),
        ] as Array<{ key: string; icon: React.ElementType; label: string }>).map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
              activeTab === tab.key
                ? 'bg-deep-teal text-white dark:bg-antique-gold dark:text-midnight-navy font-bold shadow-md'
                : 'bg-soft-cream/60 dark:bg-white/[0.03] text-foreground/70 dark:text-zinc-300 hover:text-foreground'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ══ Tab: Reading Progress ══ */}
      {activeTab === 'reading' && (
        <div className="space-y-4">
          {readingProgress.length === 0 ? (
            <div className="text-center py-16 glass-panel rounded-3xl p-8 border border-soft-sand/50 dark:border-white/10">
              <BookOpen className="w-12 h-12 text-foreground/20 mx-auto mb-3" />
              <h3 className="text-base font-bold text-foreground font-cinzel mb-1">لم تبدأ قراءة أي عدد بعد</h3>
              <p className="text-xs text-foreground/60 mb-6">تصفح مكتبة الكوميكس وابدأ قراءة أعدادك الأولى.</p>
              <Link href="/comics" className="px-6 py-2.5 rounded-xl bg-deep-teal text-white dark:bg-antique-gold dark:text-midnight-navy font-bold text-xs shadow-md">تصفح مكتبة الكوميكس</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {readingProgress.map((prog) => {
                const comic = comics.find((c) => c.id === prog.comicId);
                if (!comic) return null;
                const percent = Math.round((prog.lastPage / prog.totalPages) * 100);
                return (
                  <div key={prog.comicId} className="glass-panel p-4 rounded-2xl border border-soft-sand/50 dark:border-white/10 flex items-center gap-4 group shadow-sm">
                    <img src={comic.coverImage} alt={comic.titleAr} className="w-16 h-24 object-cover rounded-xl border border-soft-sand/40 dark:border-white/10 shrink-0" />
                    <div className="flex-1 space-y-1.5 overflow-hidden">
                      <h4 className="text-sm font-bold text-foreground font-cinzel truncate">{comic.titleAr}</h4>
                      <div className="flex justify-between text-xs text-foreground/60">
                        <span>الصفحة {prog.lastPage} من {prog.totalPages}</span>
                        <span className="text-deep-teal dark:text-antique-gold font-semibold">{percent}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-soft-sand/30 dark:bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-deep-teal dark:bg-antique-gold rounded-full" style={{ width: `${percent}%` }} />
                      </div>
                      <Link href={`/comics/${comic.id}/read`} className="text-xs text-deep-teal dark:text-antique-gold font-semibold hover:underline flex items-center gap-1 pt-1">
                        <span>استئناف القراءة</span>
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ══ Tab: Favorites ══ */}
      {activeTab === 'favorites' && (
        <div className="space-y-6">
          {favorites.length === 0 ? (
            <div className="text-center py-16 glass-panel rounded-3xl p-8 border border-soft-sand/50 dark:border-white/10">
              <Heart className="w-12 h-12 text-foreground/20 mx-auto mb-3" />
              <h3 className="text-base font-bold text-foreground font-cinzel mb-1">قائمة المفضلة فارغة</h3>
              <p className="text-xs text-foreground/60 mb-6">انقر على زر القلب عند تصفح الشخصيات أو الكوميكس أو العوالم.</p>
              <Link href="/discover" className="px-6 py-2.5 rounded-xl bg-deep-teal text-white dark:bg-antique-gold dark:text-midnight-navy font-bold text-xs shadow-md">استكشف الأكوان</Link>
            </div>
          ) : (
            <div className="space-y-6">
              {favoriteComics.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-foreground font-cinzel mb-3">القصص المصورة المفضلة</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {favoriteComics.map((comic) => (
                      <div key={comic.id} className="relative group">
                        <Link href={`/comics/${comic.id}`}>
                          <div className="glass-panel p-3 rounded-2xl border border-soft-sand/50 dark:border-white/10 hover:border-deep-teal/40 dark:hover:border-antique-gold/40 transition-all">
                            <img src={comic.coverImage} alt={comic.titleAr} className="w-full h-40 object-cover rounded-xl mb-2" />
                            <h4 className="text-xs font-bold text-foreground truncate">{comic.titleAr}</h4>
                          </div>
                        </Link>
                        <button type="button" onClick={() => removeFromFavorites(comic.id, 'comic')} className="absolute top-2 left-2 p-1.5 rounded-lg bg-black/60 text-red-400 hover:bg-black/90 transition-all">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {favoriteChars.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-foreground font-cinzel mb-3">الشخصيات المفضلة</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {favoriteChars.map((ch) => (
                      <div key={ch.id} className="relative group">
                        <Link href={`/characters/${ch.id}`}>
                          <div className="glass-panel p-3 rounded-2xl border border-soft-sand/50 dark:border-white/10 hover:border-deep-teal/40 dark:hover:border-antique-gold/40 transition-all flex flex-col items-center gap-2">
                            <img src={ch.image} alt={ch.nameAr} className="w-20 h-28 object-cover rounded-xl" />
                            <h4 className="text-xs font-bold text-foreground text-center truncate w-full">{ch.nameAr}</h4>
                          </div>
                        </Link>
                        <button type="button" onClick={() => removeFromFavorites(ch.id, 'character')} className="absolute top-2 left-2 p-1.5 rounded-lg bg-black/60 text-red-400 hover:bg-black/90 transition-all">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {favoriteWorlds.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-foreground font-cinzel mb-3">العوالم المفضلة</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {favoriteWorlds.map((w) => (
                      <div key={w.id} className="relative group">
                        <Link href={`/worlds/${w.id}`}>
                          <div className="glass-panel p-4 rounded-2xl border border-soft-sand/50 dark:border-white/10 hover:border-deep-teal/40 dark:hover:border-antique-gold/40 transition-all">
                            <h4 className="text-sm font-bold text-foreground font-cinzel">{w.nameAr}</h4>
                            <p className="text-xs text-foreground/60 mt-1 line-clamp-2">{w.descriptionAr}</p>
                          </div>
                        </Link>
                        <button type="button" onClick={() => removeFromFavorites(w.id, 'world')} className="absolute top-2 left-2 p-1.5 rounded-lg bg-black/40 text-red-400 hover:bg-black/80 transition-all">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ══ Tab: Collections ══ */}
      {activeTab === 'collections' && (
        <div className="space-y-6">
          <h3 className="text-sm font-bold text-foreground font-cinzel">مجموعات القراءة المخصصة</h3>
          {collections.length === 0 ? (
            <div className="text-center py-16 glass-panel rounded-3xl p-8 border border-soft-sand/50 dark:border-white/10">
              <FolderHeart className="w-12 h-12 text-foreground/20 mx-auto mb-3" />
              <h3 className="text-base font-bold text-foreground font-cinzel mb-1">لا توجد مجموعات حتى الآن</h3>
              <p className="text-xs text-foreground/60 mb-6">أنشئ قوائم قراءة مخصصة لتصنيف أعمالك المفضلة.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {collections.map((col) => {
                const itemTitle =
                  comics.find((c) => c.id === col.id)?.titleAr ||
                  characters.find((ch) => ch.id === col.id)?.nameAr ||
                  worlds.find((w) => w.id === col.id)?.nameAr ||
                  col.id;
                return (
                  <div key={col.id} className="glass-panel p-5 rounded-2xl border border-soft-sand/50 dark:border-white/10 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-foreground font-cinzel">{itemTitle}</span>
                      <span className="text-xs text-foreground/60 px-2 py-0.5 rounded-full bg-soft-cream dark:bg-white/5 border border-soft-sand dark:border-white/10">{col.type}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ══ Tab: Submissions (Writers/Publishers) ══ */}
      {activeTab === 'submissions' && isAuthenticated && (
        <div className="space-y-6">
          {/* New Submission Form */}
          <div className="glass-panel p-6 rounded-3xl border border-soft-sand/50 dark:border-[#C5A15B]/30 space-y-4">
            <h3 className="text-base font-bold text-foreground font-cinzel flex items-center gap-2">
              <Plus className="w-4 h-4 text-deep-teal dark:text-antique-gold" />
              تقديم عمل إبداعي جديد للمراجعة التحريرية
            </h3>
            <form onSubmit={handleNewSubmission} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-foreground/80 mb-1">عنوان العمل *</label>
                  <input
                    type="text" required
                    value={newSubmission.title}
                    onChange={(e) => setNewSubmission({ ...newSubmission, title: e.target.value })}
                    placeholder="عنوان الرواية أو الكوميكس"
                    className="w-full px-4 py-2.5 rounded-xl bg-soft-cream/80 dark:bg-white/[0.04] border border-soft-sand dark:border-white/10 text-foreground text-sm focus:outline-none focus:border-deep-teal dark:focus:border-antique-gold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-foreground/80 mb-1">نوع العمل</label>
                  <select
                    value={newSubmission.type}
                    onChange={(e) => setNewSubmission({ ...newSubmission, type: e.target.value as 'comic' | 'story' })}
                    className="w-full px-4 py-2.5 rounded-xl bg-soft-cream/80 dark:bg-white/[0.04] border border-soft-sand dark:border-white/10 text-foreground text-sm focus:outline-none focus:border-deep-teal dark:focus:border-antique-gold"
                  >
                    <option value="story">رواية / قصة</option>
                    <option value="comic">قصة مصورة (كوميكس)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-foreground/80 mb-1">الملخص السردي</label>
                <textarea
                  rows={3}
                  value={newSubmission.synopsis}
                  onChange={(e) => setNewSubmission({ ...newSubmission, synopsis: e.target.value })}
                  placeholder="نبذة تعريفية عن أحداث العمل وشخصياته الرئيسية..."
                  className="w-full px-4 py-2.5 rounded-xl bg-soft-cream/80 dark:bg-white/[0.04] border border-soft-sand dark:border-white/10 text-foreground text-sm focus:outline-none focus:border-deep-teal dark:focus:border-antique-gold"
                />
              </div>
              <button type="submit" disabled={submitting} className="px-6 py-2.5 rounded-xl bg-deep-teal text-white dark:bg-antique-gold dark:text-midnight-navy font-bold text-xs shadow-md hover:brightness-105 transition-all disabled:opacity-50">
                {submitting ? 'جاري الإرسال...' : 'إرسال التقديم للمراجعة'}
              </button>
            </form>
          </div>

          {/* Submissions List */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-foreground font-cinzel">تقديماتي السابقة ({submissions.length})</h3>
              <button onClick={() => { setSubmissionsLoading(true); api.getSubmissions().then(d => { setSubmissions(Array.isArray(d) ? d : []); setSubmissionsLoading(false); }).catch(() => setSubmissionsLoading(false)); }} className="text-xs text-deep-teal dark:text-antique-gold flex items-center gap-1 hover:underline">
                <RefreshCw className="w-3 h-3" /> تحديث
              </button>
            </div>

            {submissionsLoading ? (
              <div className="text-center py-10 text-foreground/40 text-sm">جاري تحميل التقديمات...</div>
            ) : submissions.length === 0 ? (
              <div className="text-center py-12 glass-panel rounded-3xl p-8 border border-soft-sand/50 dark:border-white/10">
                <FileText className="w-10 h-10 text-foreground/20 mx-auto mb-3" />
                <p className="text-xs text-foreground/60">لا توجد تقديمات بعد. استخدم النموذج أعلاه لإرسال أول عمل.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {submissions.map((sub: any) => {
                  const { cls, label } = statusBadge(sub.status || 'pending');
                  return (
                    <div key={sub.id} className="glass-panel p-5 rounded-2xl border border-soft-sand/50 dark:border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-bold text-foreground font-cinzel">{sub.title}</h4>
                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${cls}`}>{label}</span>
                          <span className="text-[11px] text-foreground/50 px-2 py-0.5 rounded bg-soft-cream dark:bg-white/5">{sub.type === 'comic' ? 'كوميكس' : 'رواية'}</span>
                        </div>
                        {sub.synopsis && <p className="text-xs text-foreground/60 line-clamp-2">{sub.synopsis}</p>}
                        {sub.admin_feedback && (
                          <div className="mt-1.5 p-2.5 rounded-lg bg-blue-500/5 border border-blue-500/20 text-xs text-blue-600 dark:text-blue-300">
                            💬 ملاحظة المحرر: {sub.admin_feedback}
                          </div>
                        )}
                      </div>
                      <span className="text-[11px] text-foreground/40 shrink-0">
                        {sub.created_at ? new Date(sub.created_at).toLocaleDateString('ar-EG') : ''}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══ Tab: Notifications ══ */}
      {activeTab === 'notifications' && isAuthenticated && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-foreground font-cinzel">مركز الإشعارات</h3>
            <button onClick={() => { setNotifLoading(true); api.getNotifications().then(d => { setNotifications(Array.isArray(d) ? d : []); setNotifLoading(false); }).catch(() => setNotifLoading(false)); }} className="text-xs text-deep-teal dark:text-antique-gold flex items-center gap-1 hover:underline">
              <RefreshCw className="w-3 h-3" /> تحديث
            </button>
          </div>

          {notifLoading ? (
            <div className="text-center py-10 text-foreground/40 text-sm">جاري تحميل الإشعارات...</div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-16 glass-panel rounded-3xl p-8 border border-soft-sand/50 dark:border-white/10">
              <Bell className="w-12 h-12 text-foreground/20 mx-auto mb-3" />
              <h3 className="text-base font-bold text-foreground font-cinzel mb-1">لا توجد إشعارات جديدة</h3>
              <p className="text-xs text-foreground/60">ستظهر هنا إشعارات الأحداث، الموافقات التحريرية، والتحديثات المهمة.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {notifications.map((n: any, idx: number) => (
                <div key={n.id || idx} className={`glass-panel p-4 rounded-2xl border flex items-start gap-3 ${n.is_read ? 'border-soft-sand/40 dark:border-white/5 opacity-70' : 'border-deep-teal/30 dark:border-antique-gold/30 bg-deep-teal/5 dark:bg-antique-gold/5'}`}>
                  <Bell className={`w-4 h-4 mt-0.5 shrink-0 ${n.is_read ? 'text-foreground/30' : 'text-deep-teal dark:text-antique-gold'}`} />
                  <div className="flex-1">
                    <p className="text-sm text-foreground font-semibold">{n.message || n.title}</p>
                    {n.body && <p className="text-xs text-foreground/60 mt-0.5">{n.body}</p>}
                    <span className="text-[11px] text-foreground/40 mt-1 block">
                      {n.created_at ? new Date(n.created_at).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>
                  {!n.is_read && <span className="w-2 h-2 rounded-full bg-deep-teal dark:bg-antique-gold shrink-0 mt-1.5" />}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ══ Tab: Membership & Subscriptions ══ */}
      {activeTab === 'membership' && isAuthenticated && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-foreground font-cinzel flex items-center gap-2">
              <Crown className="w-5 h-5 text-antique-gold" />
              <span>بيانات العضوية والاشتراك المميز</span>
            </h3>
            <button
              onClick={() => {
                setSubLoading(true);
                api.getMySubscription()
                  .then((d) => { setSubscriptionData(d); setSubLoading(false); })
                  .catch(() => setSubLoading(false));
              }}
              className="text-xs text-deep-teal dark:text-antique-gold flex items-center gap-1.5 hover:underline"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${subLoading ? 'animate-spin' : ''}`} />
              <span>تحديث الحالة</span>
            </button>
          </div>

          {subLoading ? (
            <div className="text-center py-16 text-foreground/50 text-sm flex flex-col items-center gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-antique-gold/30 border-t-antique-gold animate-spin" />
              <span>جاري تحميل بيانات العضوية...</span>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Main Subscription Card */}
              <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-soft-sand/50 dark:border-white/10 relative overflow-hidden">
                <div className="absolute -top-12 -left-12 w-48 h-48 bg-antique-gold/10 rounded-full blur-3xl pointer-events-none" />

                {subscriptionData?.isAdminBypass ? (
                  <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold">
                      <Shield className="w-4 h-4" />
                      <span>عضوية مسؤولي المنصة (وصول كامل دائم)</span>
                    </div>
                    <h2 className="text-2xl font-bold text-foreground font-cinzel">وصول فوري وشامل لجميع الأعداد الحصرية</h2>
                    <p className="text-xs sm:text-sm text-foreground/70 max-w-xl leading-relaxed">
                      حسابك يتمتع بصلاحيات الإشراف الإداري على منصة حكاياتي، مما يمنحك وصولاً مباشراً لجميع الروايات المصورة والفصول المحمية دون قيود اشتراك.
                    </p>
                  </div>
                ) : subscriptionData?.hasActiveSubscription ? (
                  <div className="space-y-6">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold">
                        <Sparkles className="w-3.5 h-3.5 text-antique-gold" />
                        <span>اشتراكك نشط وفعال</span>
                      </div>
                      <span className="text-xs text-foreground/60 font-mono">
                        معرّف الاشتراك: #{subscriptionData.activeSubscription?.id}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                      <div className="md:col-span-2 space-y-3">
                        <h2 className="text-xl sm:text-2xl font-black text-foreground font-cinzel">
                          {subscriptionData.activeSubscription?.plan?.name_ar || 'اشتراك حكاياتي بلس الشهري'}
                        </h2>
                        <p className="text-xs text-foreground/70 leading-relaxed">
                          {subscriptionData.activeSubscription?.plan?.description_ar || 'وصول كامل لجميع الروايات المصورة والفصول الحصرية وأعلى دقة عرض.'}
                        </p>

                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-soft-sand/40 dark:border-white/10 text-xs">
                          <div>
                            <span className="text-foreground/50 block mb-1">تاريخ البداية:</span>
                            <span className="font-bold text-foreground">
                              {subscriptionData.activeSubscription?.current_period_start
                                ? new Date(subscriptionData.activeSubscription.current_period_start).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })
                                : '—'}
                            </span>
                          </div>
                          <div>
                            <span className="text-foreground/50 block mb-1">تاريخ الانتهاء:</span>
                            <span className="font-bold text-foreground">
                              {subscriptionData.activeSubscription?.current_period_end
                                ? new Date(subscriptionData.activeSubscription.current_period_end).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })
                                : '—'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Remaining Days Counter */}
                      <div className="p-5 rounded-2xl bg-antique-gold/10 border border-antique-gold/30 flex flex-col items-center justify-center text-center">
                        <Clock className="w-6 h-6 text-antique-gold mb-2" />
                        <span className="text-4xl font-black text-antique-gold font-mono">
                          {subscriptionData.daysRemaining}
                        </span>
                        <span className="text-xs font-bold text-foreground/80 mt-1">
                          {subscriptionData.daysRemaining === 1 ? 'يوم متبقي' : 'أيام متبقية'}
                        </span>
                        <span className="text-[10px] text-foreground/50 mt-1">تجديد تلقائي متسلسل عند التمديد</span>
                      </div>
                    </div>

                    {/* Queued Subscriptions Notice */}
                    {subscriptionData.queuedSubscriptions && subscriptionData.queuedSubscriptions.length > 0 && (
                      <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/25 space-y-2">
                        <div className="flex items-center gap-2 text-xs font-bold text-blue-400">
                          <Calendar className="w-4 h-4" />
                          <span>لديك {subscriptionData.queuedSubscriptions.length} باقة مجدولة في الانتظار (Queue)</span>
                        </div>
                        <p className="text-[11px] text-foreground/75 leading-relaxed">
                          تم حفظ وتأمين أيام اشتراكك الإضافية، وستبدأ الباقات المجدولة تلقائياً فور انتهاء باقتك الحالية دون فقدان أي يوم!
                        </p>
                        <div className="space-y-1.5 pt-1">
                          {subscriptionData.queuedSubscriptions.map((q: any) => (
                            <div key={q.id} className="text-[11px] flex justify-between p-2 rounded-xl bg-black/20 text-foreground/80 font-mono">
                              <span>{q.plan?.name_ar || 'باقة مجدولة'}</span>
                              <span>يبدأ: {new Date(q.current_period_start).toLocaleDateString('ar-EG')} • ينتهي: {new Date(q.current_period_end).toLocaleDateString('ar-EG')}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-6 space-y-4">
                    <div className="w-16 h-16 rounded-3xl bg-antique-gold/10 border border-antique-gold/30 flex items-center justify-center mx-auto text-antique-gold">
                      <Crown className="w-8 h-8" />
                    </div>
                    <div className="space-y-1">
                      <h2 className="text-xl sm:text-2xl font-bold text-foreground font-cinzel">ليس لديك اشتراك نشط حالياً</h2>
                      <p className="text-xs text-foreground/60 max-w-md mx-auto leading-relaxed">
                        انضم لعالم حكاياتي بلس واستمتع بقراءة غير محدودة لجميع الروايات المصورة والفصول الحصرية بـ 99 ج.م فقط شهرياً.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
                      <Link
                        href="/subscribe"
                        className="px-6 py-2.5 rounded-xl bg-deep-teal text-white dark:bg-antique-gold dark:text-midnight-navy font-bold text-xs shadow-md hover:brightness-110 transition-all flex items-center gap-2"
                      >
                        <Crown className="w-4 h-4" />
                        <span>عرض باقات الاشتراك (99 ج.م)</span>
                      </Link>
                      <Link
                        href="/subscribe/redeem"
                        className="px-6 py-2.5 rounded-xl border border-soft-sand dark:border-white/10 hover:border-antique-gold text-foreground font-bold text-xs transition-colors flex items-center gap-2"
                      >
                        <Ticket className="w-4 h-4 text-antique-gold" />
                        <span>شحن كود اشتراك / هدية</span>
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Pending / In-Review Payment Requests */}
              {subscriptionData?.recentPaymentRequests && subscriptionData.recentPaymentRequests.length > 0 && (
                <div className="glass-panel p-5 rounded-3xl border border-soft-sand/50 dark:border-white/10 space-y-3">
                  <h4 className="text-xs font-bold text-foreground font-cinzel flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-antique-gold" />
                    <span>طلبات الدفع والتحويل الأخيرة عبر InstaPay</span>
                  </h4>

                  <div className="space-y-2">
                    {subscriptionData.recentPaymentRequests.map((req: any) => (
                      <div key={req.id} className="p-3.5 rounded-2xl bg-black/5 dark:bg-white/[0.02] border border-soft-sand/40 dark:border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 font-bold text-foreground">
                            <span>{req.plan?.name_ar || 'باقة اشتراك'}</span>
                            <span className="text-foreground/40 font-mono">#{req.id.slice(0, 8)}</span>
                          </div>
                          <div className="text-[11px] text-foreground/60 flex items-center gap-3">
                            <span>المبلغ: {Number(req.amount_egp || 0).toFixed(2)} ج.م</span>
                            {req.transaction_reference && <span>الرقم المرجعي: {req.transaction_reference}</span>}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            req.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                            req.status === 'under_review' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                            req.status === 'rejected' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                            'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          }`}>
                            {req.status === 'approved' ? 'تمت الموافقة وتفعيل الاشتراك' :
                             req.status === 'under_review' ? 'قيد مراجعة الإشعار' :
                             req.status === 'rejected' ? 'تم الرفض' : 'بانتظار إرسال الإشعار'}
                          </span>

                          {req.status === 'pending_payment' && (
                            <Link
                              href={`/subscribe/payment?plan=${req.plan_id}&requestId=${req.id}`}
                              className="px-3 py-1 rounded-xl bg-antique-gold text-midnight-navy font-bold text-[10px] hover:brightness-110"
                            >
                              إرسال الإشعار
                            </Link>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons for active users */}
              {subscriptionData?.hasActiveSubscription && (
                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/subscribe"
                    className="px-5 py-2.5 rounded-xl bg-deep-teal text-white dark:bg-antique-gold dark:text-midnight-navy font-bold text-xs shadow-md hover:brightness-110 transition-all flex items-center gap-2"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>تجديد أو تمديد الباقة الحالية</span>
                  </Link>
                  <Link
                    href="/subscribe/redeem"
                    className="px-5 py-2.5 rounded-xl border border-soft-sand dark:border-white/10 hover:border-antique-gold text-foreground font-bold text-xs transition-colors flex items-center gap-2"
                  >
                    <Ticket className="w-3.5 h-3.5 text-antique-gold" />
                    <span>تفعيل كود هدية</span>
                  </Link>
                </div>
              )}

              {/* Previous Subscription History */}
              {subscriptionData?.history && subscriptionData.history.length > 0 && (
                <div className="glass-panel p-5 rounded-3xl border border-soft-sand/50 dark:border-white/10 space-y-3">
                  <h4 className="text-xs font-bold text-foreground font-cinzel flex items-center gap-2">
                    <Clock className="w-4 h-4 text-foreground/60" />
                    <span>سجل الاشتراكات السابقة</span>
                  </h4>

                  <div className="divide-y divide-soft-sand/40 dark:divide-white/5 text-xs">
                    {subscriptionData.history.map((sub: any) => (
                      <div key={sub.id} className="py-2.5 flex items-center justify-between">
                        <div>
                          <p className="font-bold text-foreground">{sub.plan?.name_ar || 'باقة سابقة'}</p>
                          <span className="text-[11px] text-foreground/50 font-mono">
                            {new Date(sub.current_period_start).toLocaleDateString('ar-EG')} - {new Date(sub.current_period_end).toLocaleDateString('ar-EG')}
                          </span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/5 text-foreground/60">
                          {sub.status === 'expired' ? 'منتهي' : sub.status === 'revoked' ? 'ملغي' : sub.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ══ Tab: Settings ══ */}
      {activeTab === 'settings' && isAuthenticated && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Profile Edit Form */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-soft-sand/50 dark:border-white/10 space-y-5">
            <h3 className="text-base font-bold text-foreground font-cinzel flex items-center gap-2">
              <User className="w-4 h-4 text-deep-teal dark:text-antique-gold" />
              <span>تعديل البيانات الشخصية</span>
            </h3>

            {profileMsg && (
              <div className={`p-3 rounded-2xl text-xs flex items-center gap-2 border ${profileMsg.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400'}`}>
                {profileMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                <span>{profileMsg.text}</span>
              </div>
            )}

            {/* Avatar Upload in Settings */}
            <div>
              <label className="block text-xs font-bold text-foreground/80 mb-2">الصورة الشخصية</label>
              <div className="flex items-center gap-4">
                <img src={displayAvatar} alt="Avatar" className="w-16 h-16 rounded-2xl object-cover border-2 border-deep-teal/30 dark:border-antique-gold/30" />
                <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploadingAvatar} className="px-4 py-2 rounded-xl border border-deep-teal/40 dark:border-antique-gold/40 text-deep-teal dark:text-antique-gold text-xs font-semibold flex items-center gap-2 hover:bg-deep-teal/5 dark:hover:bg-antique-gold/5 transition-all disabled:opacity-50">
                  {uploadingAvatar ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                  {uploadingAvatar ? 'جاري الرفع...' : 'رفع صورة جديدة'}
                </button>
              </div>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-foreground/80 mb-1">الاسم الكامل / المعروض</label>
                <input type="text" required value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-soft-cream/80 dark:bg-white/[0.04] border border-soft-sand dark:border-white/10 text-foreground text-sm focus:outline-none focus:border-deep-teal dark:focus:border-antique-gold" />
              </div>
              <div>
                <label className="block text-xs font-bold text-foreground/80 mb-1">النبذة التعريفية (Bio)</label>
                <textarea rows={3} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="شارك لمحة عن اهتماماتك الأدبية..." className="w-full px-4 py-2.5 rounded-xl bg-soft-cream/80 dark:bg-white/[0.04] border border-soft-sand dark:border-white/10 text-foreground text-sm focus:outline-none focus:border-deep-teal dark:focus:border-antique-gold" />
              </div>
              <button type="submit" disabled={profileLoading} className="px-6 py-2.5 rounded-xl bg-deep-teal text-white dark:bg-antique-gold dark:text-midnight-navy font-bold text-xs shadow-md hover:brightness-105 transition-all disabled:opacity-50">
                {profileLoading ? 'جاري الحفظ...' : 'حفظ التعديلات'}
              </button>
            </form>
          </div>

          {/* Change Password */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-soft-sand/50 dark:border-white/10 space-y-5">
            <h3 className="text-base font-bold text-foreground font-cinzel flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-deep-teal dark:text-antique-gold" />
              <span>تغيير كلمة المرور</span>
            </h3>

            {passwordMsg && (
              <div className={`p-3 rounded-2xl text-xs flex items-center gap-2 border ${passwordMsg.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400'}`}>
                {passwordMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                <span>{passwordMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              {[
                { label: 'كلمة المرور الحالية', val: currentPassword, setter: setCurrentPassword },
                { label: 'كلمة المرور الجديدة', val: newPassword, setter: setNewPassword, placeholder: '8 خانات على الأقل' },
                { label: 'تأكيد كلمة المرور الجديدة', val: confirmNewPassword, setter: setConfirmNewPassword },
              ].map(({ label, val, setter, placeholder }) => (
                <div key={label}>
                  <label className="block text-xs font-bold text-foreground/80 mb-1">{label}</label>
                  <input type="password" required value={val} onChange={(e) => setter(e.target.value)} placeholder={placeholder} dir="ltr"
                    className="w-full px-4 py-2.5 rounded-xl bg-soft-cream/80 dark:bg-white/[0.04] border border-soft-sand dark:border-white/10 text-foreground text-sm focus:outline-none focus:border-deep-teal dark:focus:border-antique-gold" />
                </div>
              ))}
              <button type="submit" disabled={passwordLoading} className="px-6 py-2.5 rounded-xl bg-deep-teal text-white dark:bg-antique-gold dark:text-midnight-navy font-bold text-xs shadow-md hover:brightness-105 transition-all disabled:opacity-50">
                {passwordLoading ? 'جاري التحديث...' : 'تحديث كلمة المرور'}
              </button>
            </form>

            {/* Danger Zone */}
            <div className="pt-6 border-t border-soft-sand/40 dark:border-white/10">
              <h4 className="text-xs font-bold text-red-500 mb-2">منطقة الخطر (تعطيل الحساب)</h4>
              <p className="text-[11px] text-foreground/60 mb-3 leading-relaxed">في حال تعطيل حسابك، سيتم إيقاف صلاحية الوصول الفوري.</p>
              <button type="button" onClick={handleDeactivate} className="px-4 py-2 rounded-xl border border-red-500/40 text-red-500 hover:bg-red-500/10 text-xs font-semibold transition-colors">
                تعطيل حسابي
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
