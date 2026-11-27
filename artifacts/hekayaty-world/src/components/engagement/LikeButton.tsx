import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/useAuthStore';
import { useToast } from '@/hooks/use-toast';

interface LikeButtonProps {
  contentType: 'novel' | 'story' | 'comic' | 'series' | 'episode' | 'chapter';
  contentId: string;
  initialCount?: number;
  showCount?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onLikeChange?: (liked: boolean, count: number) => void;
}

export function LikeButton({
  contentType,
  contentId,
  initialCount = 0,
  showCount = true,
  size = 'md',
  className = '',
  onLikeChange,
}: LikeButtonProps) {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [liked, setLiked] = useState<boolean>(false);
  const [count, setCount] = useState<number>(initialCount);
  const [loading, setLoading] = useState<boolean>(false);
  const [animating, setAnimating] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;
    api.getLikeStatus(contentType, contentId).then((res) => {
      if (mounted) {
        setLiked(res.liked);
        if (typeof res.likesCount === 'number') {
          setCount(res.likesCount);
        }
      }
    }).catch(() => {});

    return () => {
      mounted = false;
    };
  }, [contentType, contentId, user?.id]);

  const handleToggleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast({
        title: 'تسجيل الدخول مطلوب',
        description: 'يرجى تسجيل الدخول لتسجيل إعجابك وحفظ العمل في مكتبتك المفضلة.',
        variant: 'destructive',
      });
      return;
    }

    if (loading) return;

    // Optimistic update
    const prevLiked = liked;
    const prevCount = count;
    const nextLiked = !liked;
    const nextCount = Math.max(0, nextLiked ? prevCount + 1 : prevCount - 1);

    setLiked(nextLiked);
    setCount(nextCount);
    setLoading(true);
    if (nextLiked) setAnimating(true);

    try {
      const res = await api.toggleLike(contentType, contentId);
      setLiked(res.liked);
      setCount(res.likesCount);
      if (onLikeChange) onLikeChange(res.liked, res.likesCount);
    } catch {
      // Rollback on error
      setLiked(prevLiked);
      setCount(prevCount);
      toast({
        title: 'تعذر تحديث الإعجاب',
        description: 'حدث خطأ مؤقت في الاتصال، يرجى المحاولة مرة أخرى.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setTimeout(() => setAnimating(false), 500);
    }
  };

  const sizeClasses = {
    sm: 'text-xs px-2.5 py-1 gap-1.5',
    md: 'text-xs sm:text-sm px-3.5 py-1.5 gap-2',
    lg: 'text-sm sm:text-base px-5 py-2.5 gap-2.5',
  }[size];

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }[size];

  return (
    <button
      type="button"
      onClick={handleToggleLike}
      disabled={loading}
      aria-label={liked ? 'إلغاء الإعجاب' : 'تسجيل الإعجاب'}
      className={`inline-flex items-center justify-center font-bold rounded-xl transition-all duration-300 border select-none ${
        liked
          ? 'bg-rose-500/15 border-rose-500/40 text-rose-400 hover:bg-rose-500/25 shadow-sm shadow-rose-950/40'
          : 'bg-white/5 border-white/10 text-zinc-300 hover:text-white hover:bg-white/10 hover:border-white/20'
      } ${sizeClasses} ${className} ${animating ? 'scale-105' : ''}`}
    >
      <Heart
        className={`${iconSizes} transition-transform duration-300 ${
          liked ? 'fill-rose-500 text-rose-500' : 'text-current'
        } ${animating ? 'scale-125' : ''}`}
      />
      {showCount && (
        <span className="font-mono text-xs tabular-nums">
          {count > 0 ? count.toLocaleString('ar-EG') : '0'}
        </span>
      )}
    </button>
  );
}
