import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, Check, Sparkles, BookOpen, Trophy, ArrowRight, Loader2 } from 'lucide-react';
import { useAppStore } from '@/stores/useAppStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { api } from '@/lib/api';
import { Link } from 'wouter';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  link?: string;
  iconType: 'comic' | 'event' | 'badge';
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif_1',
    title: 'مرحباً بك في منصة حكاياتي!',
    message: 'منصة السرد القصصي والأدب المصور العربي. تابع الإصدارات والفعاليات الجديدة فور نشرها.',
    time: 'الآن',
    isRead: false,
    link: '/discover',
    iconType: 'comic',
  },
  {
    id: 'notif_2',
    title: 'فعاليات ومسابقات مجتمعية',
    message: 'ترقبوا إطلاق أولى المسابقات والفعاليات التفاعلية لكتّاب ورسامي الوطن العربي قريباً.',
    time: 'قريباً',
    isRead: true,
    link: '/events',
    iconType: 'event',
  },
];

export function NotificationsPanel() {
  const { notificationsOpen, setNotificationsOpen } = useAppStore();
  const { isAuthenticated } = useAuthStore();
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!notificationsOpen) return;
    if (isAuthenticated) {
      setLoading(true);
      api
        .getNotifications()
        .then((data: any[]) => {
          if (Array.isArray(data) && data.length > 0) {
            const mapped: NotificationItem[] = data.map((n: any) => ({
              id: n.id,
              title: n.titleAr || n.title_ar || 'إشعار جديد',
              message: n.bodyAr || n.body_ar || '',
              time: n.createdAt ? new Date(n.createdAt).toLocaleDateString('ar-SA') : 'الآن',
              isRead: !!n.isRead || !!n.is_read,
              link: n.linkUrl || n.link_url || undefined,
              iconType: 'comic',
            }));
            setNotifications(mapped);
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [notificationsOpen, isAuthenticated]);

  if (!notificationsOpen) return null;

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    if (isAuthenticated) {
      try {
        await api.markAllNotificationsAsRead();
      } catch {}
    }
  };

  const markSingleAsRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    if (isAuthenticated) {
      try {
        await api.markNotificationAsRead(id);
      } catch {}
    }
  };

  const getIcon = (type: NotificationItem['iconType']) => {
    switch (type) {
      case 'comic':
        return <BookOpen className="w-4 h-4 text-[#087C7B] dark:text-[#C5A15B]" />;
      case 'event':
        return <Sparkles className="w-4 h-4 text-[#119B98]" />;
      case 'badge':
        return <Trophy className="w-4 h-4 text-[#C5A15B]" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" dir="rtl">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setNotificationsOpen(false)}
        className="fixed inset-0 bg-[#111C2B]/70 dark:bg-black/70 backdrop-blur-md"
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className="w-screen max-w-md bg-[#FAF5ED] dark:bg-[#172538] border-l border-[#D8C5A8] dark:border-[#C5A15B]/30 shadow-2xl p-6 font-arabic flex flex-col justify-between"
        >
          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#D8C5A8] dark:border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#087C7B]/10 dark:bg-[#C5A15B]/15 border border-[#087C7B]/30 dark:border-[#C5A15B]/30 flex items-center justify-center text-[#087C7B] dark:text-[#C5A15B]">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#2A1F17] dark:text-white">إشعارات الكون</h3>
                  <p className="text-[11px] text-[#604735] dark:text-zinc-400">آخر المستجدات والإصدارات التفاعلية</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setNotificationsOpen(false)}
                className="p-1.5 rounded-lg text-[#604735] dark:text-zinc-400 hover:text-[#087C7B] dark:hover:text-white hover:bg-[#EFE5D4] dark:hover:bg-white/5 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List */}
            <div className="mt-5 space-y-3">
              {loading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="w-6 h-6 text-[#087C7B] dark:text-[#C5A15B] animate-spin" />
                </div>
              ) : (
                notifications.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => markSingleAsRead(item.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      item.isRead
                        ? 'bg-[#EFE5D4]/60 dark:bg-white/[0.02] border-[#D8C5A8] dark:border-white/5 text-[#604735] dark:text-zinc-400'
                        : 'bg-[#FAF5ED] dark:bg-white/[0.04] border-[#087C7B]/40 dark:border-[#C5A15B]/30 text-[#2A1F17] dark:text-white shadow-sm'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#EFE5D4] dark:bg-zinc-900 border border-[#D8C5A8] dark:border-white/10 flex items-center justify-center shrink-0 mt-0.5">
                        {getIcon(item.iconType)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-sm font-bold text-[#2A1F17] dark:text-zinc-200">{item.title}</h4>
                          <span className="text-[10px] text-[#604735] dark:text-zinc-500">{item.time}</span>
                        </div>
                        <p className="text-xs text-[#604735] dark:text-zinc-400 leading-relaxed mb-2.5">
                          {item.message}
                        </p>
                        {item.link && (
                          <Link
                            href={item.link}
                            onClick={() => setNotificationsOpen(false)}
                            className="text-xs text-[#087C7B] dark:text-[#E1C58B] hover:underline flex items-center gap-1 font-semibold"
                          >
                            <span>عرض التفاصيل</span>
                            <ArrowRight className="w-3 h-3 rotate-180" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-[#D8C5A8] dark:border-white/10 flex items-center justify-between">
            <button
              type="button"
              onClick={markAllAsRead}
              className="text-xs text-[#604735] dark:text-zinc-400 hover:text-[#087C7B] dark:hover:text-[#C5A15B] flex items-center gap-1.5 transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              <span>تحديد الكل كمقروء</span>
            </button>
            <span className="text-[11px] text-[#604735] dark:text-zinc-500 font-medium">نموذج تجريبي تفاعلي</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
