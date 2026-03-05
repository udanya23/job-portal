import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axiosInstance";

const BellIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
);

const timeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
};

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const dropRef = useRef(null);
    const navigate = useNavigate();

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const fetchNotifications = useCallback(async () => {
        try {
            setLoading(true);
            const res = await axios.get("/notifications");
            setNotifications(res.data);
        } catch (err) {
            // silent fail
        } finally {
            setLoading(false);
        }
    }, []);

    // Initial load + poll every 30s
    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    // Close on outside click
    useEffect(() => {
        const handler = (e) => {
            if (dropRef.current && !dropRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const handleOpen = () => {
        setOpen(prev => !prev);
        if (!open) fetchNotifications();
    };

    const markRead = async (n) => {
        if (!n.isRead) {
            try {
                await axios.patch(`/notifications/${n._id}/read`);
                setNotifications(prev => prev.map(x => x._id === n._id ? { ...x, isRead: true } : x));
            } catch { }
        }
        if (n.link) {
            setOpen(false);
            navigate(n.link);
        }
    };

    const markAllRead = async () => {
        try {
            await axios.patch("/notifications/read-all");
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch { }
    };

    const clearRead = async () => {
        try {
            await axios.delete("/notifications/clear");
            setNotifications(prev => prev.filter(n => !n.isRead));
        } catch { }
    };

    return (
        <div className="relative" ref={dropRef}>
            {/* Bell Button */}
            <button
                id="notifications-bell"
                onClick={handleOpen}
                className={`relative w-9 h-9 rounded-xl flex items-center justify-center transition-all border ${open ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100" : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100"}`}
            >
                <BellIcon />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4.5 h-4.5 min-w-[18px] px-1 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {open && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl border border-slate-100 shadow-2xl shadow-slate-200/60 z-50 overflow-hidden">
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-800">Notifications</span>
                            {unreadCount > 0 && (
                                <span className="px-1.5 py-0.5 bg-indigo-600 text-white text-[10px] font-bold rounded-full">{unreadCount}</span>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            {unreadCount > 0 && (
                                <button onClick={markAllRead} className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 uppercase tracking-widest transition-colors">
                                    Mark all read
                                </button>
                            )}
                            {notifications.some(n => n.isRead) && (
                                <button onClick={clearRead} className="text-[10px] font-bold text-slate-400 hover:text-rose-500 uppercase tracking-widest transition-colors">
                                    Clear
                                </button>
                            )}
                        </div>
                    </div>

                    {/* List */}
                    <div className="max-h-80 overflow-y-auto">
                        {loading && notifications.length === 0 ? (
                            <div className="py-10 flex items-center justify-center">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600" />
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="py-12 text-center">
                                <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                                    <BellIcon />
                                </div>
                                <p className="text-sm font-semibold text-slate-400">All caught up!</p>
                                <p className="text-xs text-slate-300 mt-1">No notifications yet</p>
                            </div>
                        ) : (
                            notifications.map((n) => (
                                <button
                                    key={n._id}
                                    onClick={() => markRead(n)}
                                    className={`w-full text-left px-4 py-3 flex gap-3 items-start hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0 ${!n.isRead ? "bg-indigo-50/30" : ""}`}
                                >
                                    {/* Dot indicator */}
                                    <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${!n.isRead ? "bg-indigo-600" : "bg-slate-200"}`} />
                                    <div className="min-w-0 flex-1">
                                        <p className={`text-xs leading-relaxed ${!n.isRead ? "text-slate-800 font-semibold" : "text-slate-500 font-medium"}`}>
                                            {n.message}
                                        </p>
                                        <p className="text-[10px] text-slate-400 mt-1 font-medium">{timeAgo(n.createdAt)}</p>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Notifications;
