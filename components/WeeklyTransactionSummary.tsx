
import React, { useMemo } from 'react';
import { Transaction } from '../types';

interface WeeklyTransactionSummaryProps {
    transactions: Transaction[];
    onDayClick: (date: string) => void;
}

interface DailySummary {
    date: Date;
    count: number;
    totalMargin: number;
}

const formatCompactRupiah = (amount: number): string => {
    if (amount === 0) return 'Rp0';
    const absAmount = Math.abs(amount);
    const sign = amount < 0 ? '-' : '';
    
    if (absAmount >= 1_000_000) {
        return `${sign}Rp${(absAmount / 1_000_000).toFixed(1).replace('.', ',')}jt`;
    }
    if (absAmount >= 1_000) {
        return `${sign}Rp${Math.floor(absAmount / 1_000)}rb`;
    }
    return `${sign}Rp${absAmount}`;
};

const WeeklyTransactionSummary: React.FC<WeeklyTransactionSummaryProps> = ({ transactions, onDayClick }) => {
    
    const weeklyData = useMemo<DailySummary[]>(() => {
        const data: DailySummary[] = [];
        const today = new Date();
        today.setHours(23, 59, 59, 999);

        // Create a map for quick lookup
        const transactionMap = new Map<string, { count: number; totalMargin: number }>();
        transactions.forEach(t => {
            const dateStr = new Date(t.date).toISOString().split('T')[0];
            const entry = transactionMap.get(dateStr) || { count: 0, totalMargin: 0 };
            entry.count++;
            entry.totalMargin += t.margin;
            transactionMap.set(dateStr, entry);
        });

        // Generate data for the last 7 days
        for (let i = 6; i >= 0; i--) {
            const day = new Date(today);
            day.setDate(today.getDate() - i);
            day.setHours(0,0,0,0);
            
            const dateStr = day.toISOString().split('T')[0];
            const summary = transactionMap.get(dateStr) || { count: 0, totalMargin: 0 };

            data.push({
                date: day,
                count: summary.count,
                totalMargin: summary.totalMargin,
            });
        }
        return data;
    }, [transactions]);

    const maxCount = useMemo(() => {
        return Math.max(...weeklyData.map(d => d.count), 1); // Avoid division by zero
    }, [weeklyData]);

    const weekDays = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

    return (
        <div className="bg-white dark:bg-[#2A282F] p-4 rounded-3xl shadow-lg shadow-slate-200/50 dark:shadow-none">
            <h3 className="text-lg font-medium text-slate-800 dark:text-white mb-4">Aktivitas 7 Hari Terakhir</h3>
            <div className="flex justify-around items-end gap-2 h-40">
                {weeklyData.map((dayData, index) => {
                    const barHeight = dayData.count > 0 ? (dayData.count / maxCount) * 100 : 0;
                    const dateStr = dayData.date.toISOString().split('T')[0];
                    const isToday = new Date().toDateString() === dayData.date.toDateString();
                    const isClickable = dayData.count > 0;
                    const DayComponent = isClickable ? 'button' : 'div';

                    return (
                        <div key={index} className="flex-1 h-full flex flex-col items-center justify-end text-center group relative has-tooltip">
                            {/* Tooltip */}
                            <div className="tooltip absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-800 dark:bg-slate-900 text-white text-xs px-3 py-1.5 rounded-lg pointer-events-none whitespace-nowrap shadow-lg">
                                <div>{dayData.date.toLocaleDateString('id-ID', {day: 'numeric', month: 'long'})}</div>
                                <div className="font-semibold">{dayData.count} Transaksi</div>
                                <div className="text-emerald-300">{formatCompactRupiah(dayData.totalMargin)} Margin</div>
                            </div>
                            
                            {/* Bar */}
                            <DayComponent
                                onClick={isClickable ? () => onDayClick(dateStr) : undefined}
                                className={`w-full rounded-md transition-all duration-300 ${isClickable ? 'cursor-pointer hover:bg-indigo-400' : ''} ${isToday ? 'bg-indigo-500' : 'bg-indigo-400 dark:bg-indigo-500/50'}`}
                                style={{ height: `${barHeight}%` }}
                                aria-label={isClickable ? `Lihat transaksi untuk ${dayData.date.toLocaleDateString('id-ID')}` : `Tidak ada transaksi pada ${dayData.date.toLocaleDateString('id-ID')}`}
                            >
                            </DayComponent>
                            
                            {/* Labels */}
                            <span className="text-xs text-slate-500 dark:text-slate-400 mt-2">{weekDays[dayData.date.getDay()]}</span>
                            <span className={`text-sm font-semibold ${isToday ? 'text-slate-800 dark:text-white' : 'text-slate-600 dark:text-slate-300'}`}>{dayData.date.getDate()}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default WeeklyTransactionSummary;