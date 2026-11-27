import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/useAuthStore';
import { useToast } from '@/hooks/use-toast';
import {
  Bookmark,
  Search,
  BookOpen,
  Layers,
  Sparkles,
  ArrowUpDown,
  Compass,
  X,
  ExternalLink,
} from 'lucide-react';

export default function FollowingPage() {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [activeCategory, setActiveCategory] = useState<'all' | 'novel' | 'comic' | 'series' | 'author' | 'publisher'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'title'>('recent');
  const [followingItems, setFollowingItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Content lookup maps
  const [stories, setStories] = useState<any[]>([]);
  const [comics, setComics] = useState<any[]>([]);
  const [seriesList, setSeriesList] = useState<any[]>([]);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    Promise.all([
      api.getUserFollowing(),
      api.getStories(),
      api.getComics(),
      api.getSeriesPlatformList({ limit: 50 }).catch(() => []),
    ])
      .then(([followRes, stList, cmList, serList]) => {
        setFollowingItems(followRes.following || []);
        setStories(Array.isArray(stList) ? stList : []);
        setComics(Array.isArray(cmList) ? cmList : []);
        setSeriesList(Array.isArray(serList) ? serList : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user]);

  const handleUnfollow = async (contentType: string, contentId: string, title: string) => {
    try {
      await api.toggleFollow(contentType, contentId);
      setFollowingItems((prev) => prev.filter((item) => !(item.content_type === contentType && item.content_id === contentId)));
      toast({
        title: 'تم إلغاء المتابعة',
        description: `تمت إزالة "${title}" من قائمة متابعاتك.`,
      });
    } catch {
      toast({
        title: 'خطأ',
        description: 'تعذر إلغاء المتابعة حالياً، يرجى المحاولة مرة أخرى.',
        variant: 'destructive',
      });
    }
  };

  // Resolve detailed item data
  const enrichedItems = followingItems.map((f) => {
    const type = f.content_type === 'story' ? 'novel' : f.content_type;
    let title = 'عمل إبداعي';
    let cover = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80';
    let author = 'حكاياتي';
    let link = '/';
    let genre = 'عام';

    if (f.content_type === 'story' || f.content_type === 'novel') {
      const match = stories.find((s) => String(s.id) === String(f.content_id));
      if (match) {
        title = match.titleAr || match.title_ar || title;
        cover = match.imageUrl || match.image_url || match.cover_image_url || cover;
        author = match.author_name || author;
        link = `/stories/${match.id}`;
        genre = match.genre || 'رواية أدبية';
      }
    } else if (f.content_type === 'comic') {
      const match = comics.find((c) => String(c.id) === String(f.content_id));
      if (match) {
        title = match.titleAr || match.title_ar || title;
        cover = match.coverImage || match.cover_image_url || cover;
        author = match.author_name || author;
        link = `/comics/${match.id}`;
        genre = match.genre || 'قصة مصورة';
      }
    } else if (f.content_type === 'series') {
      const match = seriesList.find((s) => String(s.id) === String(f.content_id) || s.slug === f.content_id);
      if (match) {
        title = match.title_ar || title;
        cover = match.cover_image_url || cover;
        author = match.author_name || author;
        link = `/series/${match.slug || match.id}`;
        genre = match.genre || 'سلسلة متسلسلة';
      }
    }

    return {
      ...f,
      resolvedType: type,
      title,
      cover,
      author,
      link,
      genre,
    };
  });

  // Filter & Search
  const filtered = enrichedItems.filter((item) => {
    if (activeCategory !== 'all') {
      if (activeCategory === 'novel' && item.resolvedType !== 'novel') return false;
      if (activeCategory === 'comic' && item.resolvedType !== 'comic') return false;
      if (activeCategory === 'series' && item.resolvedType !== 'series') return false;
      if (activeCategory === 'author' && item.resolvedType !== 'author') return false;
      if (activeCategory === 'publisher' && item.resolvedType !== 'publisher') return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.author.toLowerCase().includes(q) ||
        item.genre.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Sort
  filtered.sort((a, b) => {
    if (sortBy === 'title') return a.title.localeCompare(b.title, 'ar');
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <div className="min-h-screen bg-[#060D1A] text-white py-12 px-4 sm:px-6 lg:px-8 font-arabic notranslate" dir="rtl" translate="no">
      <div className="max-w-[1360px] mx-auto space-y-8">

        {/* ─── Header ─── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C5A15B]/15 text-[#E1C58B] text-xs font-bold border border-[#C5A15B]/30">
              <Bookmark className="w-3.5 h-3.5" />
              <span>مكتبة المتابعات الشخصية</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              الأعمال وصناع المحتوى الذين تتابعهم
            </h1>
            <p className="text-sm text-zinc-400 max-w-xl">
              تصفح جميع الروايات والقصص المصورة والسلاسل التي تتابعها، وابقَ على اطلاع دائم بالفصول والأعداد الجديدة.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/discover">
              <button className="px-5 py-2.5 rounded-xl bg-gradient-to-br from-[#087C7B] to-[#0A9D9C] hover:opacity-95 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-teal-950/40">
                <Compass className="w-4 h-4" />
                <span>استكشاف المزيد من الأعمال</span>
              </button>
            </Link>
          </div>
        </div>

        {/* ─── Controls: Search & Categories ─── */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Categories */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
            {[
              { key: 'all', label: 'الكل', count: enrichedItems.length },
              { key: 'novel', label: 'الروايات', count: enrichedItems.filter((i) => i.resolvedType === 'novel').length },
              { key: 'comic', label: 'الكوميكس', count: enrichedItems.filter((i) => i.resolvedType === 'comic').length },
              { key: 'series', label: 'السلاسل', count: enrichedItems.filter((i) => i.resolvedType === 'series').length },
              { key: 'author', label: 'المؤلفون', count: enrichedItems.filter((i) => i.resolvedType === 'author').length },
              { key: 'publisher', label: 'دور النشر', count: enrichedItems.filter((i) => i.resolvedType === 'publisher').length },
            ].map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key as any)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  activeCategory === cat.key
                    ? 'bg-[#C5A15B] text-black font-black shadow-md shadow-[#C5A15B]/20'
                    : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <span>{cat.label}</span>
                <span className="text-[10px] opacity-75 font-mono">({cat.count})</span>
              </button>
            ))}
          </div>

          {/* Search & Sort */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="بحث في المتابعات..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pr-10 pl-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#C5A15B]"
              />
            </div>

            <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl p-1 text-xs">
              <button
                onClick={() => setSortBy('recent')}
                className={`px-2.5 py-1 rounded-lg ${sortBy === 'recent' ? 'bg-[#087C7B] text-white font-bold' : 'text-zinc-400'}`}
              >
                الأحدث
              </button>
              <button
                onClick={() => setSortBy('title')}
                className={`px-2.5 py-1 rounded-lg ${sortBy === 'title' ? 'bg-[#087C7B] text-white font-bold' : 'text-zinc-400'}`}
              >
                الأبجدي
              </button>
            </div>
          </div>
        </div>

        {/* ─── Grid of Followed Content ─── */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-72 rounded-2xl bg-white/5 animate-pulse border border-white/5" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 bg-white/[0.02] border border-white/5 rounded-3xl space-y-4 max-w-xl mx-auto p-8">
            <div className="w-16 h-16 rounded-full bg-[#C5A15B]/10 border border-[#C5A15B]/30 flex items-center justify-center mx-auto text-[#C5A15B]">
              <Bookmark className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white">لا توجد متابعات في هذا القسم</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              {searchQuery
                ? 'لم يتم العثور على أي نتائج مطابقة لبحثك. جرب استخدام كلمات بحث مختلفة.'
                : 'استكشف القصص والروايات والسلاسل المفضلة لديك واضغط على زر "متابعة" لتظهر هنا وتصلك إشعارات فصولها الجديدة أولاً بأول.'}
            </p>
            <div className="pt-2">
              <Link href="/discover">
                <button className="px-6 py-2.5 rounded-xl bg-[#C5A15B] text-black font-black text-xs hover:bg-[#E5C77D] transition-all">
                  ابدأ استكشاف الأعمال الآن
                </button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filtered.map((item) => (
              <div
                key={`${item.content_type}_${item.content_id}`}
                className="group relative bg-[#071120] border border-white/8 hover:border-[#C5A15B]/50 rounded-2xl overflow-hidden transition-all duration-300 shadow-xl hover:-translate-y-1.5 flex flex-col justify-between"
              >
                {/* Poster Artwork */}
                <div className="relative aspect-[3/4] overflow-hidden bg-black/80">
                  <img
                    src={item.cover}
                    alt={item.title}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#071120] via-transparent to-transparent" />

                  {/* Badges */}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-black/80 backdrop-blur-sm text-amber-300 border border-white/10">
                      {item.resolvedType === 'novel' ? '📖 رواية' : item.resolvedType === 'comic' ? '🎨 كوميكس' : '✨ سلسلة'}
                    </span>
                  </div>

                  {/* Unfollow button */}
                  <button
                    onClick={() => handleUnfollow(item.content_type, item.content_id, item.title)}
                    title="إلغاء المتابعة"
                    className="absolute top-3 left-3 w-8 h-8 rounded-full bg-black/70 hover:bg-rose-500/80 backdrop-blur-sm text-zinc-300 hover:text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Info */}
                <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] text-[#C5A15B] font-bold block">{item.genre}</span>
                    <h3 className="font-bold text-sm text-white group-hover:text-[#E1C58B] transition-colors line-clamp-1">
                      {item.title}
                    </h3>
                    <p className="text-xs text-zinc-400">بواسطة: {item.author}</p>
                  </div>

                  <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                    <Link href={item.link}>
                      <button className="px-3.5 py-1.5 rounded-lg bg-[#087C7B]/20 hover:bg-[#087C7B]/40 text-teal-300 text-xs font-bold flex items-center gap-1 transition-all">
                        <span>فتح العمل</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </Link>

                    <span className="text-[10px] text-zinc-500 font-mono">
                      متابع منذ {new Date(item.created_at).toLocaleDateString('ar-EG')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
