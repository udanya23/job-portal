import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../api/axiosInstance';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchNotifications();
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await axios.get('/notifications');
            setNotifications(res.data);
        } catch (err) { console.error(err); }
    };

    const markAsRead = async (id) => {
        try {
            await axios.put(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
        } catch (err) { console.error(err); }
    };

    // Marks as read AND navigates to the notification link
    const handleNotificationClick = async (n) => {
        if (!n.isRead) await markAsRead(n._id);
        setIsOpen(false);
        if (n.link) navigate(n.link);
    };

    const deleteNotification = async (id, e) => {
        e.stopPropagation();
        try {
            await axios.delete(`/notifications/${id}`);
            setNotifications(prev => prev.filter(n => n._id !== id));
        } catch (err) { console.error(err); }
    };

    const clearAll = async () => {
        try {
            await axios.delete('/notifications/clear');
            setNotifications([]);
        } catch (err) { console.error(err); }
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-[#1a5c40] transition-all"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-[100] anim-slide-down">
                    {/* Header */}
                    <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <div className="flex items-center gap-2">
                            <h3 className="text-sm font-extrabold text-slate-900">Notifications</h3>
                            {unreadCount > 0 && (
                                <span className="text-[10px] font-black text-[#1a5c40] bg-[#e8f5ee] px-2 py-0.5 rounded-full">
                                    {unreadCount} new
                                </span>
                            )}
                        </div>
                        {notifications.length > 0 && (
                            <button
                                onClick={clearAll}
                                className="text-[10px] font-bold text-slate-400 hover:text-rose-500 transition-colors"
                            >
                                Clear all
                            </button>
                        )}
                    </div>

                    {/* List */}
                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="py-12 px-5 text-center">
                                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-3 text-slate-300">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                    </svg>
                                </div>
                                <p className="text-xs font-bold text-slate-400">All caught up!</p>
                                <p className="text-[10px] text-slate-300 mt-1">No notifications yet</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-50">
                                {notifications.map((n) => (
                                    <div
                                        key={n._id}
                                        onClick={() => handleNotificationClick(n)}
                                        className={`px-5 py-4 cursor-pointer transition-colors group ${!n.isRead ? 'bg-[#e8f5ee]/40 hover:bg-[#e8f5ee]/60' : 'hover:bg-slate-50'}`}
                                    >
                                        <div className="flex gap-3">
                                            {/* Unread dot */}
                                            <div className="shrink-0 mt-1.5">
                                                {!n.isRead
                                                    ? <div className="w-2 h-2 rounded-full bg-[#1a5c40]" />
                                                    : <div className="w-2 h-2 rounded-full bg-transparent" />
                                                }
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm leading-snug ${!n.isRead ? 'text-slate-900 font-bold' : 'text-slate-600 font-medium'}`}>
                                                    {n.message}
                                                </p>
                                                <div className="flex items-center justify-between mt-1.5">
                                                    <span className="text-[10px] font-semibold text-slate-400">
                                                        {new Date(n.createdAt).toLocaleDateString('en-IN', {
                                                            day: '2-digit', month: 'short',
                                                            hour: '2-digit', minute: '2-digit'
                                                        })}
                                                    </span>
                                                    <div className="flex items-center gap-2">
                                                        {n.link && (
                                                            <span className="text-[10px] font-black text-[#1a5c40] px-2 py-0.5 bg-[#e8f5ee] rounded">
                                                                View →
                                                            </span>
                                                        )}
                                                        <button
                                                            onClick={(e) => deleteNotification(n._id, e)}
                                                            className="text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                                                            title="Delete"
                                                        >
                                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Notifications;
