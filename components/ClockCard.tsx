import React, { useState, useEffect, useCallback } from 'react';
import { useToastContext, ToastMessage, ToastType } from '../contexts/ToastContext';
import { CheckIcon, InfoIcon, CloseIcon, ErrorIcon } from './icons/Icons';

const ClockCard: React.FC = () => {
    // Clock State
    const [currentDate, setCurrentDate] = useState(new Date());

    // Toast State & Logic
    const { toasts, removeToast } = useToastContext();
    const currentToast = toasts.length > 0 ? toasts[0] : null;
    const [isExiting, setIsExiting] = useState(false);

    const handleDismiss = useCallback(() => {
        if (!currentToast) return;
        setIsExiting(true);
        setTimeout(() => {
            removeToast(currentToast.id);
            setIsExiting(false); // Reset for the next toast
        }, 300); // Animation duration
    }, [currentToast, removeToast]);

    useEffect(() => {
        if (currentToast) {
            const timer = setTimeout(() => {
                handleDismiss();
            }, 5000); // Auto-dismiss after 5 seconds
            return () => clearTimeout(timer);
        }
    }, [currentToast, handleDismiss]);


    // Clock Logic
    useEffect(() => {
        if (!currentToast) { // Only run the clock timer if no toast is active
            const timerId = setInterval(() => {
                setCurrentDate(new Date());
            }, 1000);

            return () => {
                clearInterval(timerId);
            };
        }
    }, [currentToast]);

    const hours = String(currentDate.getHours()).padStart(2, '0');
    const minutes = String(currentDate.getMinutes()).padStart(2, '0');
    
    // Render Logic for the clock
    const renderClock = () => {
        const dayName = new Intl.DateTimeFormat('id-ID', { weekday: 'long' }).format(currentDate);
        const dateAndMonth = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long' }).format(currentDate);

        return (
            <div className="flex flex-row items-center justify-center animate-fade-in w-full text-center divide-x divide-slate-200 dark:divide-neutral-700">
                {/* Date on the left */}
                <div className="flex-1 px-4">
                    <p className="text-lg font-medium text-slate-500 dark:text-neutral-400">
                        {dayName}
                    </p>
                    <p className="text-2xl font-bold text-slate-800 dark:text-white">
                        {dateAndMonth}
                    </p>
                </div>

                {/* Time on the right */}
                <div className="flex-1 px-4">
                    <p className="font-sans text-5xl font-bold text-slate-800 dark:text-white tracking-tight">
                        {hours}:{minutes}
                    </p>
                </div>
            </div>
        );
    };

    // Render Logic for the notification
    const renderNotification = () => {
        if (!currentToast) return null;

        const { message, type } = currentToast;

        const iconMap: Record<ToastType, React.ReactNode> = {
            success: <CheckIcon className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />,
            error: <ErrorIcon className="h-5 w-5 text-red-500 dark:text-red-400" />,
            info: <InfoIcon className="h-5 w-5 text-sky-500 dark:text-sky-400" />,
            destructive: <CheckIcon className="h-5 w-5 text-red-500 dark:text-red-400" />,
        };

        const colorMap: Record<ToastType, { text: string; closeButton: string; bg: string; progressBar: string; }> = {
            success: { text: 'text-emerald-800 dark:text-emerald-200', closeButton: 'text-emerald-500 hover:bg-emerald-200/50 dark:hover:bg-emerald-500/20', bg: 'bg-emerald-100 dark:bg-emerald-500/10', progressBar: 'bg-emerald-400' },
            error: { text: 'text-red-800 dark:text-red-200', closeButton: 'text-red-500 hover:bg-red-200/50 dark:hover:bg-red-500/20', bg: 'bg-red-100 dark:bg-red-500/10', progressBar: 'bg-red-400' },
            info: { text: 'text-sky-800 dark:text-sky-200', closeButton: 'text-sky-500 hover:bg-sky-200/50 dark:hover:bg-sky-500/20', bg: 'bg-sky-100 dark:bg-sky-500/10', progressBar: 'bg-sky-400' },
            destructive: { text: 'text-red-800 dark:text-red-200', closeButton: 'text-red-500 hover:bg-red-200/50 dark:hover:bg-red-500/20', bg: 'bg-red-100 dark:bg-red-500/10', progressBar: 'bg-red-400' },
        };
        const colors = colorMap[type];

        return (
            <div className={`relative w-full rounded-xl overflow-hidden ${colors.bg} ${isExiting ? 'animate-fade-out-up' : 'animate-fade-in'}`}>
                <div className="flex items-center justify-between gap-4 p-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="flex-shrink-0">
                            {iconMap[type]}
                        </div>
                        <p className={`text-sm font-semibold ${colors.text} truncate`}>{message}</p>
                    </div>
                    <button
                        onClick={handleDismiss}
                        className={`p-1 rounded-full transition-colors ${colors.closeButton}`}
                        aria-label="Tutup notifikasi"
                    >
                        <CloseIcon className="h-5 w-5" />
                    </button>
                </div>
                <div className={`absolute bottom-0 left-0 h-1 ${colors.progressBar} animate-progress-bar`}></div>
            </div>
        );
    };

    // Main component render
    return (
        <div className="bg-white dark:bg-neutral-800 rounded-3xl p-4 shadow-lg shadow-slate-200/50 dark:shadow-none min-h-[88px] flex items-center justify-center">
            {currentToast ? renderNotification() : renderClock()}
        </div>
    );
};

export default ClockCard;
