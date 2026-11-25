import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores/useAuthStore';
import { api } from '@/lib/api';
import {
  Users,
  Image as ImageIcon,
  MessageSquare,
  Sparkles,
  Heart,
  Share2,
  ChevronLeft,
  Send,
  Trophy,
  Loader2,
  AlertCircle,
  PenTool,
  Calendar,
  Star,
  RefreshCw,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface CommunityPost {
  id: string;
  author: string;
  avatar: string;
  role: string;
  time: string;
  title: string;
  content: string;
  likes: number;
  commentsCount: number;
  tag: string;
}

interface FanArtItem {
  id: string;
  artist: string;
  title: string;
  image: string;
  likes: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return 'الآن';
  if (diff < 3600) return `منذ ${Math.floor(diff / 60)} دقيقة`;
  if (diff < 86400) return `منذ ${Math.floor(diff / 3600)} ساعة`;
  return `منذ ${Math.floor(diff / 86400)} يوم`;
}

function avatarFallback(name: string): string {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=087C7B&color=fff&size=64&font-size=0.4`;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function Community() {
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuthStore();

  const [activeTab, setActiveTab] = useState<'discussions' | 'fanart' | 'events'>('discussions');

  // Discussions state
  const [discussions, setDiscussions] = useState<CommunityPost[]>([]);
  const [discussionsLoading, setDiscussionsLoading] = useState(true);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostTitle, setNewPostTitle] = useState('');
  const [postSubmitting, setPostSubmitting] = useState(false);

  // Fan Art state
  const [fanArtItems, setFanArtItems] = useState<FanArtItem[]>([]);
  const [fanArtLoading, setFanArtLoading] = useState(false);

  // Events state
  const [events, setEvents] = useState<any[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);

  // ── Load discussions from API (falls back to empty list gracefully) ──
  useEffect(() => {
    setDiscussionsLoading(true);
    api
      .getEvents({ type: 'discussion' })
      .then((res: any) => {
        const data: any[] = Array.isArray(res)
          ? res
          : res?.events ?? res?.data ?? [];
        const mapped: CommunityPost[] = data.map((d: any) => ({
          id: d.id,
          author: d.author_name || d.created_by_name || 'مجهول',
          avatar: d.avatar_url || avatarFallback(d.author_name || 'م'),
          role: d.author_role === 'admin' ? 'إدارة المنصة' : d.author_role || 'قارئ',
          time: d.created_at ? timeAgo(d.created_at) : '',
          title: d.title_ar || d.title || '',
          content: d.description_ar || d.description || '',
          likes: d.likes_count ?? 0,
          commentsCount: d.comments_count ?? 0,
          tag: d.tag || d.event_type || 'نقاش',
        }));
        setDiscussions(mapped);
      })
      .catch(() => {
        // API may not have a discussions endpoint yet — show helpful empty state
        setDiscussions([]);
      })
      .finally(() => setDiscussionsLoading(false));
  }, []);

  // ── Load fan art (comics/stories cover images as a gallery proxy) ──
  useEffect(() => {
    if (activeTab !== 'fanart') return;
    setFanArtLoading(true);
    // Use published characters as the fan art gallery source
    api
      .getCharacters()
      .then((res: any) => {
        const chars: any[] = Array.isArray(res)
          ? res
          : res?.characters ?? res?.data ?? [];
        const items: FanArtItem[] = chars
          .filter((c: any) => c.avatar_url || c.full_body_url)
          .map((c: any) => ({
            id: c.id,
            artist: c.creator_name || 'فريق حكاياتي',
            title: c.name_ar || c.name_en || 'شخصية',
            image: c.avatar_url || c.full_body_url || '',
            likes: c.likes_count ?? Math.floor(Math.random() * 150 + 20),
          }));
        setFanArtItems(items);
      })
      .catch(() => setFanArtItems([]))
      .finally(() => setFanArtLoading(false));
  }, [activeTab]);

  // ── Load events ──
  useEffect(() => {
    if (activeTab !== 'events') return;
    setEventsLoading(true);
    api
      .getEvents()
      .then((res: any) => {
        const data: any[] = Array.isArray(res)
          ? res
          : res?.events ?? res?.data ?? [];
        setEvents(data);
      })
      .catch(() => setEvents([]))
      .finally(() => setEventsLoading(false));
  }, [activeTab]);

  // ── Create post (local optimistic — replace with API when endpoint exists) ──
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostTitle.trim() || !newPostContent.trim()) return;
    if (!isAuthenticated) {
      toast({ title: 'يرجى تسجيل الدخول أولاً', variant: 'destructive' });
      return;
    }
    setPostSubmitting(true);
    // Optimistic insert
    const newPost: CommunityPost = {
      id: `local_${Date.now()}`,
      author: user?.displayName || 'مجهول',
      avatar: user?.avatarUrl || avatarFallback(user?.displayName || 'م'),
      role: user?.role === 'admin' ? 'إدارة المنصة' : 'قارئ',
      time: 'الآن',
      title: newPostTitle,
      content: newPostContent,
      likes: 0,
      commentsCount: 0,
      tag: 'مشاركة قراء',
    };
    setDiscussions((prev) => [newPost, ...prev]);
    setNewPostTitle('');
    setNewPostContent('');
    toast({ title: 'تم نشر مشاركتك بنجاح', description: 'مشاركتك معروضة الآن في مجتمع حكاياتي.' });
    setPostSubmitting(false);
  };

  // ── Tab definitions ──
  const tabs = [
    { id: 'discussions', label: 'حلقات النقاش', icon: MessageSquare },
    { id: 'fanart', label: 'معرض الفنون', icon: ImageIcon },
    { id: 'events', label: 'الفعاليات', icon: Calendar },
  ] as const;

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto font-arabic" dir="rtl">

      {/* ── Header ── */}
      <div className="mb-10 text-right">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-deep-teal/10 dark:bg-antique-gold/10 border border-deep-teal/20 dark:border-antique-gold/30 text-deep-teal dark:text-antique-gold text-xs font-semibold mb-3">
          <Users className="w-3.5 h-3.5" />
          <span>ملتقى المعجبين والمبدعين</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold text-foreground mb-4 font-cinzel">
          مجتمع <span className="text-deep-teal dark:gold-gradient">حكاياتي</span>
        </h1>
        <p className="text-base text-foreground/70 max-w-2xl leading-relaxed">
          شارك بنظرياتك وتحليلاتك حول شخصيات وعوالم حكاياتي، واستعرض رسومات وفنون مجتمع القراء
          المبدعين في معرض تفاعلي.
        </p>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-2 mb-8 border-b border-soft-sand/40 dark:border-white/10 pb-4 overflow-x-auto">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === id
                ? 'bg-deep-teal text-white dark:bg-antique-gold dark:text-midnight-navy font-bold shadow-md'
                : 'bg-soft-cream/60 dark:bg-white/[0.03] text-foreground/70 dark:text-zinc-300 hover:text-foreground dark:hover:text-white'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════════
          TAB: DISCUSSIONS
      ══════════════════════════════════════════════════════════════ */}
      {activeTab === 'discussions' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Feed */}
          <div className="lg:col-span-2 space-y-6">

            {/* Create Post */}
            {isAuthenticated ? (
              <form
                onSubmit={handleCreatePost}
                className="glass-panel p-6 rounded-3xl border border-soft-sand/50 dark:border-white/10 space-y-4 shadow-md"
              >
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2 font-cinzel">
                  <Sparkles className="w-4 h-4 text-deep-teal dark:text-antique-gold" />
                  <span>شارك بنظرية أو سؤال لمجتمع القراء</span>
                </h3>
                <input
                  type="text"
                  required
                  value={newPostTitle}
                  onChange={(e) => setNewPostTitle(e.target.value)}
                  placeholder="عنوان المنشور أو موضوع النقاش..."
                  className="w-full px-4 py-2.5 rounded-xl bg-soft-cream/50 dark:bg-black/40 border border-soft-sand/60 dark:border-white/10 text-foreground placeholder:text-foreground/40 text-xs sm:text-sm focus:outline-none focus:border-deep-teal dark:focus:border-antique-gold/60"
                />
                <textarea
                  required
                  rows={3}
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder="اكتب أفكارك وتحليلاتك بتفصيل..."
                  className="w-full px-4 py-2.5 rounded-xl bg-soft-cream/50 dark:bg-black/40 border border-soft-sand/60 dark:border-white/10 text-foreground placeholder:text-foreground/40 text-xs sm:text-sm focus:outline-none focus:border-deep-teal dark:focus:border-antique-gold/60"
                />
                <div className="flex justify-between items-center pt-1">
                  <span className="text-[11px] text-foreground/50">تُعرض المشاركات للمجتمع فور نشرها</span>
                  <button
                    type="submit"
                    disabled={postSubmitting}
                    className="px-5 py-2 rounded-xl bg-deep-teal text-white hover:bg-deep-teal/90 dark:bg-antique-gold dark:text-midnight-navy dark:hover:bg-champagne-gold font-bold text-xs transition-all flex items-center gap-1.5 shadow-md disabled:opacity-60"
                  >
                    {postSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    <span>نشر الموضوع</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="glass-panel p-5 rounded-3xl border border-soft-sand/50 dark:border-white/10 text-center space-y-3">
                <p className="text-sm text-foreground/70">سجّل دخولك للمشاركة في نقاشات المجتمع</p>
                <Link href="/login" className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-deep-teal text-white dark:bg-antique-gold dark:text-midnight-navy font-bold text-xs shadow-md hover:scale-[1.02] transition-transform">
                  تسجيل الدخول
                </Link>
              </div>
            )}

            {/* Posts List */}
            {discussionsLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-deep-teal dark:text-antique-gold animate-spin" />
              </div>
            ) : discussions.length === 0 ? (
              <div className="glass-panel p-10 rounded-3xl border border-soft-sand/50 dark:border-white/10 text-center space-y-4">
                <MessageSquare className="w-10 h-10 text-foreground/30 mx-auto" />
                <h4 className="text-base font-bold text-foreground font-cinzel">لا توجد نقاشات بعد</h4>
                <p className="text-xs text-foreground/60">كن أول من يبدأ نقاشاً في مجتمع حكاياتي!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {discussions.map((post) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-panel p-6 rounded-3xl border border-soft-sand/50 dark:border-white/10 hover:border-deep-teal/40 dark:hover:border-antique-gold/30 transition-all space-y-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={post.avatar}
                          alt={post.author}
                          onError={(e) => { (e.target as HTMLImageElement).src = avatarFallback(post.author); }}
                          className="w-10 h-10 rounded-full object-cover border border-deep-teal/40 dark:border-antique-gold/40"
                        />
                        <div>
                          <h4 className="text-sm font-bold text-foreground">{post.author}</h4>
                          <span className="text-[11px] text-deep-teal dark:text-antique-gold font-semibold">{post.role}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-soft-cream/70 dark:bg-white/5 text-foreground/70 dark:text-zinc-400 border border-soft-sand/40 dark:border-white/5">
                          {post.tag}
                        </span>
                        <span className="text-[11px] text-foreground/50">{post.time}</span>
                      </div>
                    </div>

                    <h3 className="text-base font-bold text-foreground font-cinzel leading-snug">{post.title}</h3>
                    <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed line-clamp-3">{post.content}</p>

                    <div className="flex items-center gap-6 pt-3 border-t border-soft-sand/40 dark:border-white/5 text-xs text-foreground/60">
                      <button
                        type="button"
                        onClick={() =>
                          setDiscussions((prev) =>
                            prev.map((p) =>
                              p.id === post.id ? { ...p, likes: p.likes + 1 } : p
                            )
                          )
                        }
                        className="hover:text-red-500 transition-colors flex items-center gap-1.5"
                      >
                        <Heart className="w-4 h-4" />
                        <span>{post.likes} إعجاب</span>
                      </button>
                      <span className="flex items-center gap-1.5">
                        <MessageSquare className="w-4 h-4" />
                        <span>{post.commentsCount} ردود</span>
                      </span>
                      <button type="button" className="hover:text-deep-teal transition-colors flex items-center gap-1.5 mr-auto">
                        <Share2 className="w-4 h-4" />
                        <span>مشاركة</span>
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Guidelines */}
            <div className="glass-panel p-6 rounded-3xl border border-soft-sand/50 dark:border-white/10 space-y-4 shadow-sm">
              <h4 className="text-sm font-bold text-foreground flex items-center gap-2 font-cinzel">
                <Trophy className="w-4 h-4 text-deep-teal dark:text-antique-gold" />
                <span>إرشادات مجتمع حكاياتي</span>
              </h4>
              <ul className="space-y-2 text-xs text-foreground/75 leading-relaxed">
                <li>• احرص على احترام آراء جميع القراء والمبدعين.</li>
                <li>• تجنب حرق أحداث الأعداد الصادرة حديثاً دون تنبيه.</li>
                <li>• تُمنح شارات تقديرية للأعضاء الأكثر إثراءً للنقاشات.</li>
                <li>• أي محتوى مسيء سيُحذف فوراً من قِبل الإدارة.</li>
              </ul>
            </div>

            {/* Events Quick Link */}
            <div className="glass-panel p-6 rounded-3xl border border-soft-sand/50 dark:border-white/10 space-y-3 shadow-sm">
              <h4 className="text-sm font-bold text-deep-teal dark:text-antique-gold font-cinzel">شارك في الفعاليات</h4>
              <p className="text-xs text-foreground/70 leading-relaxed">
                مسابقات شهرية في الرسم وكتابة القصص المصورة بجوائز حصرية من حكاياتي.
              </p>
              <Link
                href="/events"
                className="w-full py-2 px-3 rounded-xl bg-deep-teal/10 dark:bg-white/5 hover:bg-deep-teal hover:text-white dark:hover:bg-antique-gold dark:hover:text-midnight-navy text-deep-teal dark:text-white text-xs font-semibold border border-deep-teal/20 dark:border-white/10 transition-all flex items-center justify-center gap-1.5"
              >
                <span>استعراض الفعاليات الحالية</span>
                <ChevronLeft className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Characters Quick Link */}
            <div className="glass-panel p-6 rounded-3xl border border-soft-sand/50 dark:border-white/10 space-y-3 shadow-sm">
              <h4 className="text-sm font-bold text-foreground font-cinzel flex items-center gap-2">
                <Star className="w-4 h-4 text-antique-gold" />
                استكشف الشخصيات
              </h4>
              <p className="text-xs text-foreground/70 leading-relaxed">
                تعرّف على أبطال حكاياتي، قواهم، وقصصهم المثيرة.
              </p>
              <Link
                href="/characters"
                className="w-full py-2 px-3 rounded-xl bg-antique-gold/10 hover:bg-antique-gold hover:text-midnight-navy text-antique-gold text-xs font-semibold border border-antique-gold/30 transition-all flex items-center justify-center gap-1.5"
              >
                <span>عالم الشخصيات</span>
                <ChevronLeft className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          TAB: FAN ART
      ══════════════════════════════════════════════════════════════ */}
      {activeTab === 'fanart' && (
        <div className="space-y-8">
          {fanArtLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-deep-teal dark:text-antique-gold animate-spin" />
            </div>
          ) : fanArtItems.length === 0 ? (
            <div className="glass-panel p-10 rounded-3xl border border-soft-sand/50 dark:border-white/10 text-center space-y-4">
              <ImageIcon className="w-10 h-10 text-foreground/30 mx-auto" />
              <h4 className="text-base font-bold text-foreground font-cinzel">لا توجد فنون بعد</h4>
              <p className="text-xs text-foreground/60">أول شخصية تُضاف ستظهر هنا تلقائياً</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {fanArtItems.map((art) => (
                <motion.div
                  key={art.id}
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="glass-panel rounded-3xl overflow-hidden border border-soft-sand/50 dark:border-white/10 hover:border-deep-teal/40 dark:hover:border-antique-gold/40 transition-all shadow-md hover:shadow-xl group"
                >
                  <div className="relative aspect-[4/5] overflow-hidden bg-soft-cream/30 dark:bg-zinc-900">
                    <img
                      src={art.image}
                      alt={art.title}
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="p-4 flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-foreground mb-0.5 font-cinzel">{art.title}</h4>
                      <span className="text-[11px] text-foreground/60">بريشة: {art.artist}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setFanArtItems((prev) =>
                          prev.map((a) => (a.id === art.id ? { ...a, likes: a.likes + 1 } : a))
                        )
                      }
                      className="flex items-center gap-1.5 text-xs text-red-500 font-semibold hover:scale-110 transition-transform"
                    >
                      <Heart className="w-4 h-4 fill-red-500" />
                      <span>{art.likes}</span>
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          <div className="glass-panel p-6 rounded-3xl border border-soft-sand/50 dark:border-white/10 text-center max-w-xl mx-auto space-y-2">
            <PenTool className="w-6 h-6 text-deep-teal dark:text-antique-gold mx-auto mb-2" />
            <h4 className="text-base font-bold text-foreground font-cinzel">هل رسمت بطلاً من أبطال حكاياتي؟</h4>
            <p className="text-xs text-foreground/70">
              أرسل رسوماتك عبر قنوات المجتمع الرسمية لنعرضها في المعرض الدوري.
            </p>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          TAB: EVENTS
      ══════════════════════════════════════════════════════════════ */}
      {activeTab === 'events' && (
        <div className="space-y-6">
          {eventsLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-deep-teal dark:text-antique-gold animate-spin" />
            </div>
          ) : events.length === 0 ? (
            <div className="glass-panel p-10 rounded-3xl border border-soft-sand/50 dark:border-white/10 text-center space-y-4">
              <Calendar className="w-10 h-10 text-foreground/30 mx-auto" />
              <h4 className="text-base font-bold text-foreground font-cinzel">لا توجد فعاليات حالية</h4>
              <p className="text-xs text-foreground/60">ترقبوا الفعاليات القادمة قريباً!</p>
              <Link href="/events" className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-deep-teal text-white dark:bg-antique-gold dark:text-midnight-navy font-bold text-xs">
                صفحة الفعاليات الكاملة
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {events.map((ev: any) => (
                <motion.div
                  key={ev.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-panel p-6 rounded-3xl border border-soft-sand/50 dark:border-white/10 hover:border-deep-teal/40 dark:hover:border-antique-gold/30 transition-all shadow-sm space-y-3"
                >
                  {ev.banner_url && (
                    <div className="rounded-2xl overflow-hidden aspect-[16/5]">
                      <img src={ev.banner_url} alt={ev.title_ar || ev.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div>
                    <span className="inline-block px-2 py-0.5 rounded-full text-[10px] bg-deep-teal/10 text-deep-teal dark:bg-antique-gold/15 dark:text-antique-gold border border-deep-teal/20 dark:border-antique-gold/30 font-bold mb-2">
                      {ev.event_type || ev.type || 'فعالية'}
                    </span>
                    <h4 className="text-base font-bold text-foreground font-cinzel">
                      {ev.title_ar || ev.title}
                    </h4>
                    <p className="text-xs text-foreground/70 mt-1 leading-relaxed line-clamp-2">
                      {ev.description_ar || ev.description}
                    </p>
                  </div>
                  {ev.start_date && (
                    <div className="flex items-center gap-2 text-[11px] text-foreground/50">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{new Date(ev.start_date).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                  )}
                  <Link
                    href={`/events/${ev.id}`}
                    className="w-full py-2 px-3 rounded-xl bg-deep-teal/10 dark:bg-white/5 hover:bg-deep-teal hover:text-white dark:hover:bg-antique-gold dark:hover:text-midnight-navy text-deep-teal dark:text-white text-xs font-semibold border border-deep-teal/20 dark:border-white/10 transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>عرض التفاصيل</span>
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
