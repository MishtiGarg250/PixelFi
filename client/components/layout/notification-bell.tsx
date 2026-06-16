"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, Check, Info, X } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import { motion, AnimatePresence } from "framer-motion";

export function NotificationBell() {
    const { notifications, markAsRead, deleteNotification } = useNotifications();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const unreadCount = notifications?.filter((n: any) => !n.read).length || 0;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }

        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="relative rounded-full border border-white/5 bg-white/2 p-2.5 text-neutral-500 transition hover:text-white"
                aria-label="Notifications"
            >
                <Bell size={15} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-[10px] font-bold text-white">
                        {unreadCount}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-80 overflow-hidden rounded-xl border border-white/10 bg-neutral-900/95 shadow-2xl backdrop-blur-xl z-50"
                    >
                        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                            <h3 className="text-sm font-semibold text-white">Notifications</h3>
                            <span className="text-xs text-neutral-400">{unreadCount} unread</span>
                        </div>
                        <div className="max-h-80 overflow-y-auto p-2">
                            {notifications?.length === 0 ? (
                                <div className="py-8 text-center text-sm text-neutral-500">
                                    No notifications yet.
                                </div>
                            ) : (
                                notifications?.map((notification: any) => (
                                    <div
                                        key={notification.id}
                                        className={`group mb-1 flex items-start gap-3 rounded-lg p-3 transition ${
                                            notification.read ? "opacity-60" : "bg-white/5"
                                        }`}
                                    >
                                        <div className="mt-0.5 shrink-0 rounded-full bg-blue-500/20 p-1.5 text-blue-400">
                                            <Info size={14} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-white">
                                                {notification.title}
                                            </p>
                                            <p className="mt-0.5 text-xs text-neutral-400">
                                                {notification.message}
                                            </p>
                                            <p className="mt-1 text-[10px] text-neutral-500">
                                                {new Date(notification.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="flex shrink-0 flex-col items-center gap-1">
                                            {!notification.read && (
                                                <button
                                                    onClick={() => markAsRead.mutate(notification.id)}
                                                    className="text-neutral-500 transition hover:text-white"
                                                    title="Mark as read"
                                                >
                                                    <Check size={14} />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => deleteNotification.mutate(notification.id)}
                                                className="text-neutral-500 transition hover:text-red-400"
                                                title="Delete notification"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
