import React, { useMemo } from 'react';
import { Transaction } from '../types';

interface TransactionHeatmapCardProps {
    transactions: Transaction[];
    formatRupiah: (amount: number) => string;
}

const TransactionHeatmapCard: React.FC<TransactionHeatmapCardProps> = ({ transactions, formatRupiah }) => {
    
    const getLocalDateString = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const dailyData = useMemo(() => {
        const dataMap = new Map<string, { totalMargin: number; count: number }>();
        transactions
            .filter(t => !t.isInternalTransfer)
            .forEach(t => {
                const dateStr = getLocalDateString(new Date(t.date));
                const entry = dataMap.get(dateStr) || { totalMargin: 0, count: 0 };
                entry.totalMargin += t.margin;
                entry.count++;
                dataMap.set(dateStr, entry);
            });
        return dataMap;
    }, [transactions]);

    const maxMargin = useMemo(() => {
        if (dailyData.size === 0) return 1;
        // FIX: Add explicit type to `d` to resolve TypeScript inference error.
        const margins = Array.from(dailyData.values()).map((d: { totalMargin: number; count: number }) => d.totalMargin);
        const max = Math.max(...margins, 0);
        return max === 0 ? 10000 : max;
    }, [dailyData]);

    const getHeatmapColor = (margin: number) => {
        if (margin <= 0) return 'bg-slate-100 dark:bg-neutral-700/50';
        const percentage = (margin / maxMargin);
        if (percentage < 0.1) return 'bg-emerald-100 dark:bg-emerald-900/50';
        if (percentage < 0.25) return 'bg-emerald-200 dark:bg-emerald-800/60';
        if (percentage < 0.5) return 'bg-emerald-300 dark:bg-emerald-700/70';
        if (percentage < 0.75) return 'bg-emerald-400 dark:bg-emerald-600/80';
        return 'bg-emerald-500 dark:bg-emerald-500/90';
    };

    const { days, monthLabels } = useMemo(() => {
        const TOTAL_DAYS = 182; // 26 weeks
        const days = [];
        const monthLabels = new Map<number, { label: string; colStart: number }>();
        const today = new Date();
        const endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const startDate = new Date(endDate);
        startDate.setDate(startDate.getDate() - TOTAL_DAYS + 1);

        // Align start date to the beginning of the week (Sunday)
        startDate.setDate(startDate.getDate() - startDate.getDay());

        let currentMonth = -1;

        for (let i = 0; i < TOTAL_DAYS + startDate.getDay(); i++) {
            const date = new Date(startDate);
            date.setDate(date.getDate() + i);
            days.push(date);

            if (date.getMonth() !== currentMonth) {
                currentMonth = date.getMonth();
                const col = Math.floor(i / 7);
                if (!monthLabels.has(currentMonth)) {
                    monthLabels.set(currentMonth, {
                        label: date.toLocaleString('id-ID', { month: 'short' }),
                        colStart: col,
                    });
                }
            }
        }
        return { days, monthLabels: Array.from(monthLabels.values()) };
    }, []);
    

    return (
        <div className="bg-white dark:bg-neutral-800 p-4 sm:p-6 rounded-3xl shadow-lg shadow-slate-200/50 dark:shadow-none">
            <h3 className="text-lg font-medium text-slate-800 dark:text-white mb-4">Peta Aktivitas Transaksi</h3>
            <div className="overflow-x-auto no-scrollbar">
                <div className="inline-block">
                    <div className="flex justify-start gap-[11px] text-xs text-slate-400 dark:text-neutral-500 mb-1">
                        {monthLabels.map((m, i) => {
                            const prevCol = monthLabels[i-1]?.colStart ?? 0;
                            const marginLeft = (m.colStart - prevCol) * 15; // 11px cell + 4px gap
                            return (
                                <div key={m.label} style={{ marginLeft: `${marginLeft}px`}}>{m.label}</div>
                            )
                        })}
                    </div>
                    <div className="flex gap-1">
                        <div className="flex flex-col gap-1 mr-2 text-xs text-slate-400 dark:text-neutral-500 justify-around">
                            <span>Sen</span>
                            <span>Rab</span>
                            <span>Jum</span>
                        </div>
                         <div className="grid grid-flow-col grid-rows-7 grid-cols-[repeat(27,minmax(0,1fr))] gap-1">
                             {days.map(date => {
                                const dateStr = getLocalDateString(date);
                                const data = dailyData.get(dateStr);
                                const margin = data?.totalMargin || 0;
                                const count = data?.count || 0;
                                const isFuture = date > new Date();

                                if (isFuture) {
                                    return <div key={dateStr} className="w-2.5 h-2.5 rounded-sm bg-transparent" />;
                                }
                                
                                return (
                                    <div key={dateStr} className="relative has-tooltip">
                                        <div
                                            className="w-2.5 h-2.5 rounded-sm"
                                            style={{ backgroundColor: getHeatmapColor(margin).replace('bg-', '') }}
                                        />
                                        <div className="tooltip absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-700 dark:bg-neutral-900 text-white text-xs px-2 py-1.5 rounded-md pointer-events-none w-max shadow-lg text-left z-10">
                                            <p className="font-bold">{date.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                                            <p>Margin: <span className="font-semibold">{formatRupiah(margin)}</span></p>
                                            <p>Transaksi: <span className="font-semibold">{count}</span></p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TransactionHeatmapCard;