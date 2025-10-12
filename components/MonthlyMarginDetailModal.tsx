import React, { useState, useEffect, useMemo } from 'react';
import { Transaction } from '../types';
import { CloseIcon } from './icons/Icons';

interface MonthlyMarginDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    transactions: Transaction[];
    formatRupiah: (amount: number) => string;
}

interface DailyMarginData {
    totalMargin: number;
    count: number;
}

const MonthlyMarginDetailModal: React.FC<MonthlyMarginDetailModalProps> = ({
    isOpen,
    onClose,
    transactions,
    formatRupiah,
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const viewDate = useMemo(() => new Date(), []); // Always show current month

    useEffect(() => {
        setIsVisible(isOpen);
    }, [isOpen]);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onClose, 300);
    };
    
    // This function is for mobile view
    const compactFormatRupiah = (amount: number) => {
        if (amount >= 1_000_000) {
            return `${(amount / 1_000_000).toFixed(1).replace(/\.0$/, '').replace('.', ',')}jt`;
        }
        if (amount >= 1_000) {
            return `${Math.round(amount / 1_000)}rb`;
        }
        return new Intl.NumberFormat('id-ID').format(amount);
    };

    const dailyData = useMemo<Map<number, DailyMarginData>>(() => {
        const dataMap = new Map<number, DailyMarginData>();
        const currentMonth = viewDate.getMonth();
        const currentYear = viewDate.getFullYear();

        transactions.forEach(t => {
            const transactionDate = new Date(t.date);
            if (transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear) {
                const day = transactionDate.getDate();
                const entry = dataMap.get(day) || { totalMargin: 0, count: 0 };
                entry.totalMargin += t.margin;
                entry.count++;
                dataMap.set(day, entry);
            }
        });
        return dataMap;
    }, [transactions, viewDate]);

    const maxMargin = useMemo(() => {
        const margins = Array.from(dailyData.values()).map((d: DailyMarginData) => d.totalMargin);
        const max = Math.max(...margins, 0);
        return max === 0 ? 10000 : max; // a sensible default to avoid division by zero
    }, [dailyData]);
    
    const getMarginColor = (margin: number) => {
        if (margin <= 0) return 'bg-slate-100 dark:bg-neutral-700/50';
        const percentage = (margin / maxMargin);
        if (percentage < 0.1) return 'bg-emerald-100 dark:bg-emerald-900/50';
        if (percentage < 0.25) return 'bg-emerald-200 dark:bg-emerald-800/60';
        if (percentage < 0.5) return 'bg-emerald-300 dark:bg-emerald-700/70';
        if (percentage < 0.75) return 'bg-emerald-400 dark:bg-emerald-600/80';
        return 'bg-emerald-500 dark:bg-emerald-500/90 text-white dark:text-white';
    };

    const generateCalendarDays = () => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        const days: (Date | null)[] = [];
        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(null);
        }
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(new Date(year, month, i));
        }
        return days;
    };
    
    const calendarDays = generateCalendarDays();
    const daysOfWeek = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

    if (!isOpen) return null;

    return (
        <div
            className={`fixed inset-0 z-50 flex justify-center items-center p-4 transition-opacity duration-300 ease-in-out bg-black/40 backdrop-blur-sm ${isVisible ? 'opacity-100' : 'opacity-0'}`}
            onClick={handleClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="margin-detail-title"
        >
            <div
                className={`bg-white dark:bg-neutral-800 rounded-3xl shadow-2xl w-full max-w-2xl transform transition-all duration-300 ease-in-out flex flex-col max-h-[90vh] ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6 flex justify-between items-center border-b border-slate-200 dark:border-white/10 flex-shrink-0">
                    <div>
                        <h2 id="margin-detail-title" className="text-xl font-medium text-slate-800 dark:text-white">Detail Margin Bulan Ini</h2>
                        <p className="text-sm text-slate-500 dark:text-neutral-400">
                            {viewDate.toLocaleString('id-ID', { month: 'long', year: 'numeric' })}
                        </p>
                    </div>
                    <button onClick={handleClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 dark:text-neutral-300 transition-colors" aria-label="Tutup">
                        <CloseIcon />
                    </button>
                </div>

                <div className="p-4 overflow-y-auto">
                    <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-500 dark:text-neutral-400 mb-2">
                        {daysOfWeek.map(day => <div key={day}>{day}</div>)}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                        {calendarDays.map((day, index) => {
                            if (!day) return <div key={`empty-${index}`} />;
                            
                            const dayNumber = day.getDate();
                            const data = dailyData.get(dayNumber);
                            const margin = data?.totalMargin || 0;
                            const count = data?.count || 0;
                            const colorClass = getMarginColor(margin);
                            const textColorClass = margin > (maxMargin * 0.75) ? 'text-white dark:text-white' : 'text-slate-700 dark:text-neutral-200';
                            
                            const today = new Date();
                            const isToday = today.getFullYear() === day.getFullYear() && today.getMonth() === day.getMonth() && today.getDate() === day.getDate();
                            
                            return (
                                <div
                                    key={day.toISOString()}
                                    className={`relative h-16 sm:h-24 p-1 sm:p-1.5 flex flex-col justify-between rounded-md transition-all duration-200 text-left ${colorClass} ${count === 0 && 'opacity-70'} ${isToday ? 'ring-2 ring-blue-500' : ''}`}
                                >
                                    <span className={`font-bold text-xs sm:text-sm ${textColorClass}`}>{dayNumber}</span>
                                    {count > 0 && (
                                        <div className={`text-[9px] sm:text-xs leading-tight sm:leading-normal ${textColorClass}`}>
                                            {/* Mobile view: compact format */}
                                            <p className="font-semibold sm:hidden">{compactFormatRupiah(margin)}</p>
                                            {/* Desktop view: full format */}
                                            <p className="font-semibold hidden sm:block">{formatRupiah(margin)}</p>
                                            <p className="opacity-80">{count} trx</p>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MonthlyMarginDetailModal;