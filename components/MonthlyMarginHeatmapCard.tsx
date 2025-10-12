import React, { useState, useMemo } from 'react';
import { Transaction } from '../types';
import { ChevronLeftIcon, ChevronRightIcon } from './icons/Icons';

interface MonthlyMarginHeatmapCardProps {
    transactions: Transaction[];
    formatRupiah: (amount: number) => string;
}

interface DailyMarginData {
    totalMargin: number;
    count: number;
}

const MonthlyMarginHeatmapCard: React.FC<MonthlyMarginHeatmapCardProps> = ({
    transactions,
    formatRupiah,
}) => {
    const [viewDate, setViewDate] = useState(new Date());

    const handleMonthChange = (offset: number) => {
        setViewDate(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(prev.getMonth() + offset);
            return newDate;
        });
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
        if (dailyData.size === 0) return 10000;
        // FIX: Add explicit type to 'd' to resolve TypeScript inference error.
        const margins = Array.from(dailyData.values()).map((d: DailyMarginData) => d.totalMargin);
        const max = Math.max(...margins, 0);
        return max === 0 ? 10000 : max; // a sensible default
    }, [dailyData]);
    
    const getMarginColor = (margin: number) => {
        if (margin <= 0) return 'bg-slate-100 dark:bg-neutral-700/50';
        const percentage = (margin / maxMargin);
        if (percentage < 0.1) return 'bg-emerald-100 dark:bg-emerald-900/50';
        if (percentage < 0.25) return 'bg-emerald-200 dark:bg-emerald-800/60';
        if (percentage < 0.5) return 'bg-emerald-300 dark:bg-emerald-700/70';
        if (percentage < 0.75) return 'bg-emerald-400 dark:bg-emerald-600/80';
        return 'bg-emerald-500 dark:bg-emerald-500/90';
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

    return (
        <div className="bg-white dark:bg-neutral-800 p-4 sm:p-6 rounded-3xl shadow-lg shadow-slate-200/50 dark:shadow-none">
            <div className="flex justify-between items-center mb-4 px-2">
                <h3 className="text-lg font-medium text-slate-800 dark:text-white">Peta Margin Bulanan</h3>
                <div className="flex items-center space-x-2">
                     <button onClick={() => handleMonthChange(-1)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 dark:text-neutral-300 transition-colors" aria-label="Bulan sebelumnya">
                        {/* FIX: Use ChevronLeftIcon component instead of inlined SVG. */}
                        <ChevronLeftIcon className="h-5 w-5" />
                    </button>
                    <span className="font-semibold text-slate-700 dark:text-neutral-200 w-32 text-center">
                        {viewDate.toLocaleString('id-ID', { month: 'long', year: 'numeric' })}
                    </span>
                    <button onClick={() => handleMonthChange(1)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 dark:text-neutral-300 transition-colors" aria-label="Bulan berikutnya">
                        {/* FIX: Use ChevronRightIcon component instead of inlined SVG. */}
                        <ChevronRightIcon className="h-5 w-5" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-500 dark:text-neutral-400 mb-2">
                {daysOfWeek.map(day => <div key={day}>{day}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, index) => {
                    if (!day) return <div key={`empty-${index}`} className="rounded-md bg-slate-50/50 dark:bg-neutral-800/30" />;
                    
                    const dayNumber = day.getDate();
                    const data = dailyData.get(dayNumber);
                    const margin = data?.totalMargin || 0;
                    const count = data?.count || 0;
                    const colorClass = getMarginColor(margin);
                    const textColorClass = margin > (maxMargin * 0.75) ? 'text-white dark:text-white' : 'text-slate-700 dark:text-neutral-200';
                    
                    const today = new Date();
                    const isToday = today.getFullYear() === day.getFullYear() && today.getMonth() === day.getMonth() && today.getDate() === day.getDate();
                    
                    return (
                        <div key={day.toISOString()} className="relative has-tooltip">
                            <div
                                className={`h-24 p-1.5 flex flex-col justify-between rounded-md transition-all duration-200 text-left ${colorClass} ${count === 0 && 'opacity-70'} ${isToday ? 'ring-2 ring-blue-500' : ''}`}
                            >
                                <span className={`font-bold text-sm ${textColorClass}`}>{dayNumber}</span>
                                {count > 0 && (
                                    <div className={`text-xs ${textColorClass}`}>
                                        <p className="font-semibold">{formatRupiah(margin)}</p>
                                        <p className="opacity-80">{count} trx</p>
                                    </div>
                                )}
                            </div>
                            <div className="tooltip absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-10 w-max whitespace-nowrap px-3 py-1.5 bg-slate-800 dark:bg-neutral-900 text-white text-xs font-medium rounded-md shadow-lg">
                                <p className="font-bold">{day.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                <p>Margin: {formatRupiah(margin)}</p>
                                <p>Transaksi: {count}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default MonthlyMarginHeatmapCard;