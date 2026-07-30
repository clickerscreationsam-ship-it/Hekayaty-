import React from 'react';
import { useAppStore } from '@/stores/useAppStore';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen, ShieldAlert, Star } from 'lucide-react';
import { Link } from 'wouter';

export function NotificationsPanel() {
  const { notificationsOpen, setNotificationsOpen } = useAppStore();

  const notifications = [
    { id: 1, type: 'release', title: 'New Issue Available!', message: 'Origins of Light Issue #2 is now available to read.', time: '2 hours ago', icon: BookOpen, color: 'text-primary' },
    { id: 2, type: 'alert', title: 'Community Event', message: 'The Shadow Incursion event has begun. Join a faction now!', time: '1 day ago', icon: ShieldAlert, color: 'text-destructive' },
    { id: 3, type: 'achievement', title: 'Badge Unlocked', message: 'You earned the "Lore Master" badge for reading 10 encyclopedia entries.', time: '2 days ago', icon: Star, color: 'text-accent' },
  ];

  return (
    <AnimatePresence>
      {notificationsOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setNotificationsOpen(false)}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[400px] bg-card border-l border-border z-50 shadow-2xl flex flex-col"
          >
            <div className="p-6 border-b border-border flex items-center justify-between bg-black/20">
              <h2 className="text-xl font-cinzel font-bold text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                Notifications
              </h2>
              <button
                onClick={() => setNotificationsOpen(false)}
                className="p-2 rounded-full hover:bg-white/10 text-muted-foreground hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {notifications.map((notif) => (
                <div key={notif.id} className="p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer relative overflow-hidden group">
                  <div className={`absolute top-0 left-0 w-1 h-full bg-current ${notif.color}`}></div>
                  <div className="flex gap-4">
                    <div className={`mt-1 ${notif.color}`}>
                      <notif.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white group-hover:text-primary transition-colors">{notif.title}</h4>
                      <p className="text-sm text-white/70 mt-1">{notif.message}</p>
                      <span className="text-xs text-muted-foreground mt-2 block">{notif.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-border bg-black/20">
              <button className="w-full py-3 rounded-lg text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors">
                Mark all as read
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
