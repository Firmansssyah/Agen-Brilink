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
        // Helper to format a Date object into a 'YYYY-MM-DD' string based on the user's local timezone.
        // This avoids timezone mismatches when comparing dates.
        const getLocalDateString = (date: Date): string => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        // Group transactions by their local date string.
        const transactionMap = new Map<string, { count: number; totalMargin: number }>();
        transactions
            .filter(t => !t.isInternalTransfer && t.description !== 'Fee Brilink') // Exclude internal transfers & fee transactions
            .forEach(t => {
                // Parses ISO string into a date object in the browser's local timezone
                const transactionDate = new Date(t.date); 
                const dateStr = getLocalDateString(transactionDate);
                
                const entry = transactionMap.get(dateStr) || { count: 0, totalMargin: 0 };
                entry.count++;
                entry.totalMargin += t.margin;
                transactionMap.set(dateStr, entry);
            });

        const data: DailySummary[] = [];
        const today = new Date(); // Today, in local time

        // Generate data for the last 7 days, including today.
        for (let i = 6; i >= 0; i--) {
            // Create a new date object for each day to avoid mutation issues
            const day = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
            
            // Use the same local date string format for lookup.
            const dateStr = getLocalDateString(day);
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
        <div className="bg-white dark:bg-slate-800 p-4 rounded-3xl shadow-lg shadow-slate-200/50 dark:shadow-none">
            <h3 className="text-lg font-medium text-slate-800 dark:text-white mb-4">Aktivitas 7 Hari Terakhir</h3>
            <div className="flex justify-around items-end gap-2 h-40">
                {weeklyData.map((dayData, index) => {
                    const barHeight = dayData.count > 0 ? (dayData.count / maxCount) * 100 : 0;
                    const dateStr = `${dayData.date.getFullYear()}-${String(dayData.date.getMonth() + 1).padStart(2, '0')}-${String(dayData.date.getDate()).padStart(2, '0')}`;
                    const isToday = new Date().toDateString() === dayData.date.toDateString();
                    const isClickable = dayData.count > 0;
                    const DayComponent = isClickable ? 'button' : 'div';

                    return (
                        <div key={index} className="flex-1 h-full flex flex-col items-center justify-end text-center">
                            {/* Bar */}
                            <DayComponent
                                onClick={isClickable ? () => onDayClick(dateStr) : undefined}
                                className={`relative w-full rounded-md transition-all duration-300 flex items-center justify-center ${isClickable ? 'cursor-pointer hover:bg-blue-400' : ''} ${isToday ? 'bg-blue-500' : 'bg-blue-400 dark:bg-blue-500/50'}`}
                                style={{ height: `${barHeight}%` }}
                                aria-label={isClickable ? `Lihat transaksi untuk ${dayData.date.toLocaleDateString('id-ID')}` : `Tidak ada transaksi pada ${dayData.date.toLocaleDateString('id-ID')}`}
                            >
                               {dayData.count > 0 && (
                                    <span className="text-md font-bold text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]">
                                        {dayData.count}
                                    </span>
                                )}
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