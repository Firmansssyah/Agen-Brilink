import React, { useMemo } from 'react';
import { Transaction } from '../types';

interface WeeklyTransactionSummaryProps {
    transactions: Transaction[];
    onDayClick: (date: string) => void;
    formatRupiah: (amount: number) => string;
}

interface DailySummary {
    date: Date;
    count: number;
    totalMargin: number;
}

const WeeklyTransactionSummary: React.FC<WeeklyTransactionSummaryProps> = ({ transactions, onDayClick, formatRupiah }) => {
    
    const weeklyData = useMemo<DailySummary[]>(() => {
        const getLocalDateString = (date: Date): string => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        const transactionMap = new Map<string, { count: number; totalMargin: number }>();
        transactions
            .filter(t => !t.isInternalTransfer && t.description !== 'Fee Brilink')
            .forEach(t => {
                const transactionDate = new Date(t.date); 
                const dateStr = getLocalDateString(transactionDate);
                
                const entry = transactionMap.get(dateStr) || { count: 0, totalMargin: 0 };
                entry.count++;
                entry.totalMargin += t.margin;
                transactionMap.set(dateStr, entry);
            });

        const data: DailySummary[] = [];
        const today = new Date();

        for (let i = 6; i >= 0; i--) {
            const day = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
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

    const { maxCount, maxMargin } = useMemo(() => {
        const countMax = Math.max(...weeklyData.map(d => d.count), 1);
        const marginMax = Math.max(...weeklyData.map(d => d.totalMargin), 10000);
        return { maxCount: countMax, maxMargin: marginMax };
    }, [weeklyData]);

    const weekDays = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

    return (
        <div className="bg-white dark:bg-neutral-800 p-4 rounded-3xl shadow-lg shadow-slate-200/50 dark:shadow-none">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-slate-800 dark:text-white">Aktivitas 7 Hari Terakhir</h3>
                <div className="flex items-center space-x-3 text-xs">
                    <div className="flex items-center space-x-1.5">
                        <div className="w-3 h-3 rounded-sm bg-blue-500"></div>
                        <span className="text-slate-500 dark:text-neutral-400">Transaksi</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                        <div className="w-3 h-3 rounded-sm bg-emerald-500"></div>
                        <span className="text-slate-500 dark:text-neutral-400">Margin</span>
                    </div>
                </div>
            </div>
            <div className="flex justify-around items-end gap-3 h-40">
                {weeklyData.map((dayData, index) => {
                    const countBarHeight = (dayData.count / maxCount) * 100;
                    const marginBarHeight = (dayData.totalMargin / maxMargin) * 100;
                    const dateStr = `${dayData.date.getFullYear()}-${String(dayData.date.getMonth() + 1).padStart(2, '0')}-${String(dayData.date.getDate()).padStart(2, '0')}`;
                    const isToday = new Date().toDateString() === dayData.date.toDateString();
                    const isClickable = dayData.count > 0;
                    const DayContainer = isClickable ? 'button' : 'div';

                    return (
                        <div key={index} className="flex-1 h-full flex flex-col items-center justify-end text-center">
                            <DayContainer
                                onClick={isClickable ? () => onDayClick(dateStr) : undefined}
                                className={`relative w-full h-full flex items-end justify-center gap-1 has-tooltip ${isClickable ? 'cursor-pointer group' : ''}`}
                                aria-label={isClickable ? `Lihat transaksi untuk ${dayData.date.toLocaleDateString('id-ID')}` : `Tidak ada transaksi pada ${dayData.date.toLocaleDateString('id-ID')}`}
                            >
                                <div className="tooltip absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-700 dark:bg-neutral-900 text-white text-xs px-2 py-1.5 rounded-md pointer-events-none w-max shadow-lg text-left z-10">
                                    <p>Transaksi: <span className="font-bold">{dayData.count}</span></p>
                                    <p>Margin: <span className="font-bold">{formatRupiah(dayData.totalMargin)}</span></p>
                                </div>
                                
                                <div
                                    className="w-2 rounded-t-sm bg-blue-400 group-hover:bg-blue-500 transition-all duration-300 dark:bg-blue-500/80 dark:group-hover:bg-blue-500"
                                    style={{ height: `${countBarHeight}%` }}
                                />
                                <div
                                    className="w-2 rounded-t-sm bg-emerald-400 group-hover:bg-emerald-500 transition-all duration-300 dark:bg-emerald-500/80 dark:group-hover:bg-emerald-500"
                                    style={{ height: `${marginBarHeight}%` }}
                                />
                            </DayContainer>
                            
                            <span className="text-xs text-slate-500 dark:text-neutral-400 mt-2">{weekDays[dayData.date.getDay()]}</span>
                            <span className={`text-sm font-semibold ${isToday ? 'text-slate-800 dark:text-white' : 'text-slate-600 dark:text-neutral-300'}`}>{dayData.date.getDate()}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default WeeklyTransactionSummary;