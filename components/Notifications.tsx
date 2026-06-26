
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context';
import { Card, Badge, Avatar, Button } from './UI';
import { Notification } from '../types';

interface NotificationCenterProps {
    isOpen: boolean;
    onClose: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onClose }) => {
    const { notifications, markNotificationRead, markAllNotificationsRead, deleteNotification, unreadCount, currentRole } = useApp();
    const navigate = useNavigate();
    const [filter, setFilter] = useState<'all' | 'unread' | 'order' | 'system'>('all');
    const [selectedNotif, setSelectedNotif] = useState<Notification | null>(null);

    const filtered: Notification[] = useMemo(() => {
        return notifications.filter(n => {
            if (filter === 'unread') return !n.isRead;
            if (filter === 'order') return n.type === 'order_update' || n.type === 'new_order' || n.type === 'delivery';
            if (filter === 'system') return n.type === 'system' || n.type === 'approval';
            return true;
        });
    }, [notifications, filter]);

    const grouped: Record<string, Notification[]> = useMemo(() => {
        const groups: Record<string, Notification[]> = { Today: [], Yesterday: [], Earlier: [] };
        const now = new Date();
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);

        filtered.forEach(n => {
            const date = new Date(n.createdAt);
            if (date.toDateString() === now.toDateString()) groups.Today.push(n);
            else if (date.toDateString() === yesterday.toDateString()) groups.Yesterday.push(n);
            else groups.Earlier.push(n);
        });
        return groups;
    }, [filtered]);

    const handleSelectNotif = (n: Notification) => {
        if (!n.isRead) {
            markNotificationRead(n.id);
        }
        setSelectedNotif(n);
    };

    const handleManualMarkRead = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        await markNotificationRead(id);
    };

    const handleDeepLink = (n: Notification) => {
        setSelectedNotif(null);
        onClose();
        if (n.relatedId) {
            let path = '/buyer/orders';
            if (currentRole === 'vendor') {
                if (n.type === 'new_order' || n.type === 'order_update') path = '/vendor/orders';
                else if (n.type === 'approval') path = '/vendor/products';
            } else if (currentRole === 'courier') {
                path = '/delivery/dashboard';
            }
            navigate(path);
        }
    };

    const getIcon = (type: string) => {
        switch(type) {
            case 'order_update': return { icon: 'box', color: 'text-primary bg-primary/5 dark:bg-primary/20' };
            case 'new_order': return { icon: 'cart-plus', color: 'text-green-500 bg-green-50 dark:bg-green-900/20' };
            case 'delivery': return { icon: 'motorcycle', color: 'text-primary bg-primary/5 dark:bg-primary/20' };
            case 'approval': return { icon: 'circle-check', color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' };
            case 'promotion': return { icon: 'fire', color: 'text-orange-500 bg-orange-50 dark:bg-orange-900/20' };
            default: return { icon: 'bell', color: 'text-gray-500 bg-gray-50 dark:bg-gray-800' };
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 z-[100] flex justify-end">
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] animate-fade-in" onClick={onClose}></div>
                
                <div className="relative w-full max-w-sm h-full bg-white dark:bg-darkSurface shadow-2xl flex flex-col animate-slide-left border-l border-gray-100 dark:border-white/5">
                    <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-display font-black text-gray-900 dark:text-white">Notifications</h2>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded-full">
                                    {unreadCount} New
                                </span>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            {unreadCount > 0 && (
                                <button 
                                    onClick={markAllNotificationsRead} 
                                    title="Mark all as read"
                                    className="w-8 h-8 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all shadow-sm"
                                >
                                    <i className="fa-solid fa-check-double text-xs"></i>
                                </button>
                            )}
                            <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all">
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </div>
                    </div>

                    <div className="px-4 py-3 flex gap-2 overflow-x-auto hide-scrollbar border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-black/10">
                        {[
                            {id: 'all', label: 'All'},
                            {id: 'unread', label: 'Unread'},
                            {id: 'order', label: 'Orders'},
                            {id: 'system', label: 'System'}
                        ].map(f => (
                            <button 
                                key={f.id}
                                onClick={() => setFilter(f.id as any)}
                                className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all border ${filter === f.id ? 'bg-primary text-white border-primary shadow-glow' : 'bg-white dark:bg-gray-800 text-gray-400 border-gray-100 dark:border-gray-700'}`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-8 custom-scrollbar">
                        {filtered.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center opacity-30 px-10">
                                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                                    <i className="fa-solid fa-bell-slash text-3xl"></i>
                                </div>
                                <p className="text-sm font-bold uppercase tracking-widest">Inbox Empty</p>
                                <p className="text-[10px] mt-2 leading-relaxed">We'll alert you here for orders, approvals, and campus updates.</p>
                            </div>
                        ) : (
                            Object.entries(grouped).map(([title, items]) => items.length > 0 && (
                                <div key={title} className="space-y-3">
                                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                                        {title}
                                    </h3>
                                    {items.map(n => {
                                        const style = getIcon(n.type);
                                        return (
                                            <div 
                                                key={n.id}
                                                onClick={() => handleSelectNotif(n)}
                                                className={`p-4 rounded-2xl border transition-all cursor-pointer group relative ${n.isRead ? 'bg-white dark:bg-darkSurface border-gray-100 dark:border-gray-800/50 opacity-60' : 'bg-white dark:bg-gray-800/40 border-primary/20 shadow-md ring-1 ring-primary/5'}`}
                                            >
                                                <div className="flex gap-4">
                                                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${style.color}`}>
                                                        <i className={`fa-solid fa-${style.icon} text-base`}></i>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex justify-between items-start mb-1">
                                                            <h4 className={`text-sm font-bold truncate ${n.isRead ? 'text-gray-600 dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}>{n.title}</h4>
                                                            <span className="text-[8px] font-black text-gray-400 uppercase whitespace-nowrap ml-2">
                                                                {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed font-medium">
                                                            {n.message}
                                                        </p>
                                                    </div>
                                                </div>
                                                
                                                <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {!n.isRead && (
                                                        <button 
                                                            onClick={(e) => handleManualMarkRead(e, n.id)}
                                                            title="Mark as read"
                                                            className="p-2 text-green-500 hover:bg-green-50 dark:hover:bg-green-900/10 rounded-lg"
                                                        >
                                                            <i className="fa-solid fa-check text-[9px]"></i>
                                                        </button>
                                                    )}
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); deleteNotification(n.id); }}
                                                        title="Delete"
                                                        className="p-2 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg"
                                                    >
                                                        <i className="fa-solid fa-trash-can text-[9px]"></i>
                                                    </button>
                                                </div>

                                                {!n.isRead && (
                                                    <div className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full animate-pulse shadow-glow group-hover:hidden"></div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            ))
                        )}
                    </div>
                    
                    <div className="p-4 bg-gray-50 dark:bg-black/20 border-t border-gray-100 dark:border-gray-800">
                        <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest text-center">
                            Tap to read • Syncing in real-time
                        </p>
                    </div>
                </div>
            </div>

            {selectedNotif && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center px-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md animate-fade-in" onClick={() => setSelectedNotif(null)}></div>
                    <Card className="relative w-full max-md bg-white dark:bg-darkSurface p-8 rounded-[2.5rem] shadow-2xl animate-slide-up border-none">
                        <div className="flex justify-between items-start mb-6">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${getIcon(selectedNotif.type).color}`}>
                                <i className={`fa-solid fa-${getIcon(selectedNotif.type).icon} text-xl`}></i>
                            </div>
                            <button onClick={() => setSelectedNotif(null)} className="w-10 h-10 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors">
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <Badge color={selectedNotif.priority === 'high' ? 'red' : 'primary'} className="text-[8px] px-2 py-0.5">
                                        {selectedNotif.priority} priority
                                    </Badge>
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                        {new Date(selectedNotif.createdAt).toLocaleDateString()} at {new Date(selectedNotif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <h3 className="text-2xl font-display font-black text-gray-900 dark:text-white leading-tight">
                                    {selectedNotif.title}
                                </h3>
                            </div>

                            <div className="bg-gray-50 dark:bg-darkBg/50 p-6 rounded-3xl border border-gray-100 dark:border-gray-800">
                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed font-medium whitespace-pre-wrap">
                                    {selectedNotif.message}
                                </p>
                            </div>

                            <div className="space-y-2 pt-2">
                                {selectedNotif.relatedId && (
                                    <Button 
                                        fullWidth 
                                        size="lg" 
                                        className="h-14 shadow-glow font-black uppercase tracking-widest text-sm"
                                        onClick={() => handleDeepLink(selectedNotif)}
                                        icon="arrow-right-to-bracket"
                                    >
                                        {(selectedNotif.type === 'delivery' || selectedNotif.type === 'new_order') ? 'View New Job' : 'View Order Details'}
                                    </Button>
                                )}
                            </div>

                            <button 
                                onClick={() => setSelectedNotif(null)}
                                className="w-full py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-primary transition-colors"
                            >
                                Dismiss
                            </button>
                        </div>
                    </Card>
                </div>
            )}
        </>
    );
};