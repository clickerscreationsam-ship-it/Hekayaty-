import React, { useState, useEffect } from 'react';
import { Bookmark, Check, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/useAuthStore';
import { useToast } from '@/hooks/use-toast';

interface FollowButtonProps {
  contentType: 'novel' | 'story' | 'comic' | 'series' | 'author' | 'publisher';
  contentId: string;
  initialCount?: number;
  showCount?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onFollowChange?: (following: boolean, count: number) => void;
}

export function FollowButton({
  contentType,
  contentId,
  initialCount = 0,
  showCount = true,
  size = 'md',
  className = '',
  onFollowChange,
}: FollowButtonProps) {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [following, setFollowing] = useState<boolean>(false);
  const [count, setCount] = useState<number>(initialCount);
  const [loading, setLoading] = useState<boolean>(false);
  const [confirmUnfollow, setConfirmUnfollow] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;
    api.getFollowStatus(contentType, contentId).then((res) => {
      if (mounted) {
        setFollowing(res.following);
        if (typeof res.followersCount === 'number') {
          setCount(res.followersCount);
        }
      }
    }).catch(() => {});

    return () => {
      mounted = false;
    };
  }, [contentType, contentId, user?.id]);

  const handleFollowClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast({
        title: 'تسجيل الدخول مطلوب',
        description: 'يرجى تسجيل الدخول لمتابعة هذا العمل واستلام إشعارات الفصول والأعداد الجديدة فور نشرها.',
        variant: 'destructive',
      });
      return;
    }

    if (loading) return;

    // If currently following and not yet confirming unfollow, prompt confirmation
    if (following && !confirmUnfollow) {
      setConfirmUnfollow(true);
      setTimeout(() => setConfirmUnfollow(false), 3500);
      return;
    }

    setConfirmUnfollow(false);
    const prevFollowing = following;
    const prevCount = count;
    const nextFollowing = !following;
    const nextCount = Math.max(0, nextFollowing ? prevCount + 1 : prevCount - 1);

    setFollowing(nextFollowing);
    setCount(nextCount);
    setLoading(true);

    try {
      const res = await api.toggleFollow(contentType, contentId);
      setFollowing(res.following);
      setCount(res.followersCount);
      toast({
        title: res.following ? '✨ تمت المتابعة بنجاح' : 'تم إلغاء المتابعة',
        description: res.following
          ? 'ستصلك إشعارات فور نشر فصول أو أعداد جديدة لهذا العمل.'
          : 'لن تصلك إشعارات جديدة لهذا العمل.',
      });
      if (onFollowChange) onFollowChange(res.following, res.followersCount);
    } catch {
      setFollowing(prevFollowing);
      setCount(prevCount);
      toast({
        title: 'تعذر تحديث المتابعة',
        description: 'حدث خطأ مؤقت في الاتصال، يرجى المحاولة مرة أخرى.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const sizeClasses = {
    sm: 'text-xs px-2.5 py-1 gap-1.5',
    md: 'text-xs sm:text-sm px-4 py-2 gap-2',
    lg: 'text-sm sm:text-base px-6 py-2.5 gap-2.5',
  }[size];

  return (
    <button
      type="button"
      onClick={handleFollowClick}
      disabled={loading}
      aria-label={following ? 'متابع' : 'متابعة'}
      className={`inline-flex items-center justify-center font-bold rounded-xl transition-all duration-300 border select-none ${
        confirmUnfollow
          ? 'bg-rose-500/20 border-rose-500/40 text-rose-300 hover:bg-rose-500/30'
          : following
          ? 'bg-[#087C7B]/20 border-[#087C7B]/50 text-teal-200 hover:bg-[#087C7B]/30 shadow-sm shadow-teal-950/40'
          : 'bg-[#C5A15B]/15 border-[#C5A15B]/40 text-[#E1C58B] hover:bg-[#C5A15B]/25 hover:border-[#C5A15B]/60'
      } ${sizeClasses} ${className}`}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : confirmUnfollow ? (
        <span>تأكيد الإلغاء؟</span>
      ) : following ? (
        <>
          <Check className="w-4 h-4 text-teal-300" />
          <span>مُتابع</span>
        </>
      ) : (
        <>
          <Bookmark className="w-4 h-4 text-current" />
          <span>متابعة</span>
        </>
      )}

      {showCount && !confirmUnfollow && (
        <span className="font-mono text-xs opacity-75 tabular-nums">
          ({count > 0 ? count.toLocaleString('ar-EG') : '0'})
        </span>
      )}
    </button>
  );
}
