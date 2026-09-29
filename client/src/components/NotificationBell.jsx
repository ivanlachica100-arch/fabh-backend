import React, { useState, useEffect, useRef } from 'react';
import api from '../api/client';
import { 
  Bell, 
  Check, 
  CheckCheck, 
  Clock, 
  Info, 
  AlertTriangle, 
  ShieldCheck, 
  Loader2 
} from 'lucide-react';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  // Fetch notifications on mount and whenever popover is toggled
  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.data || []);
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Poll every 30 seconds for non-intrusive fresh alerts
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close popover when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  const handleMarkAsRead = async (id, e) => {
    e.stopPropagation();
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    setLoading(true);
    try {
      await api.put('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all read:', err);
    } finally {
      setLoading(false);
    }
  };

  const getIconForType = (type) => {
    switch (type) {
      case 'success':
        return <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0" />;
      default:
        return <Info className="w-4 h-4 text-blue-500 dark:text-blue-400 shrink-0" />;
    }
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) fetchNotifications();
        }}
        className="relative p-2 rounded-full bg-white/95 dark:bg-slate-900/95 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 shadow-md transition-all cursor-pointer flex items-center justify-center"
        title="View Notifications"
      >
        <Bell className="w-4 h-4" />
        
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[10px] font-extrabold w-4.5 h-4.5 rounded-full flex items-center justify-center animate-pulse border-2 border-white dark:border-slate-900">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Floating Popover Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-[1100] animate-in fade-in slide-in-from-top-2 duration-150 transition-colors">
          {/* Header */}
          <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/40">
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Notifications
              </h4>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold text-[10px]">
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                disabled={loading}
                onClick={handleMarkAllAsRead}
                className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 hover:underline flex items-center gap-1 cursor-pointer"
              >
                {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCheck className="w-3.5 h-3.5" />}
                Mark all read
              </button>
            )}
          </div>

          {/* List Feed */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-slate-400 dark:text-slate-500">
                <Bell className="w-6 h-6 mx-auto mb-1.5 stroke-[1.5] text-slate-300 dark:text-slate-600" />
                <p className="text-xs font-semibold">No notifications yet</p>
                <p className="text-[10px] mt-0.5">Updates on applications and dorm reviews will appear here.</p>
              </div>
            ) : (
              notifications.map((n) => {
                const timeAgo = n.createdAt
                  ? new Date(n.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : 'Just now';

                return (
                  <div
                    key={n._id}
                    className={`p-3.5 flex items-start gap-3 transition-colors ${
                      n.isRead
                        ? 'bg-white dark:bg-slate-900'
                        : 'bg-emerald-50/40 dark:bg-emerald-950/20'
                    }`}
                  >
                    <div className="mt-0.5">{getIconForType(n.type)}</div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p className={`text-xs ${n.isRead ? 'font-semibold text-slate-800 dark:text-slate-200' : 'font-bold text-slate-900 dark:text-white'}`}>
                          {n.title}
                        </p>
                        {!n.isRead && (
                          <button
                            type="button"
                            onClick={(e) => handleMarkAsRead(n._id, e)}
                            title="Mark as read"
                            className="p-1 rounded-md text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 leading-snug break-words">
                        {n.message}
                      </p>

                      <span className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500 mt-1.5">
                        <Clock className="w-3 h-3" />
                        {timeAgo}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}