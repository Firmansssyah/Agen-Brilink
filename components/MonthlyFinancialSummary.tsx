import React, { useMemo } from 'react';
import { Transaction } from '../types';

interface MonthlyFinancialSummaryProps {
    transactions: Transaction[];
    formatRupiah: (amount: number) => string;
}

interface MonthlySummary {
    month: string;
    year: number;
    totalOmzet: number;
    totalMargin: number;
    transactionCount: number;
    newReceivables: number;
}

const MonthlyFinancialSummary: React.FC<MonthlyFinancialSummaryProps> = ({ transactions, formatRupiah }) => {
    
    const monthlyData = useMemo<MonthlySummary[]>(() => {
        const summaryMap = new Map<string, Omit<MonthlySummary, 'month' | 'year'>>();

        transactions.forEach(t => {
            const date = new Date(t.date);
            const year = date.getFullYear();
            const month = date.getMonth();
            const key = `${year}-${String(month).padStart(2, '0')}`; // YYYY-MM format for sorting

            const entry = summaryMap.get(key) || {
                totalOmzet: 0,
                totalMargin: 0,
                transactionCount: 0,
                newReceivables: 0,
            };
            
            const newEntry = {
                 totalOmzet: entry.totalOmzet + t.amount,
                 totalMargin: entry.totalMargin + t.margin,
                 transactionCount: entry.transactionCount + 1,
                 newReceivables: entry.newReceivables + (t.isPiutang ? (t.amount + t.margin) : 0),
            };

            summaryMap.set(key, newEntry);
        });

        const sortedKeys = Array.from(summaryMap.keys()).sort().reverse();
        
        return sortedKeys.map(key => {
            const [year, monthIndex] = key.split('-').map(Number);
            const monthName = new Date(year, monthIndex).toLocaleString('id-ID', { month: 'long' });
            return {
                month: monthName,
                year: year,
                ...summaryMap.get(key)!
            }
        });

    }, [transactions]);


    return (
        <div className="bg-white dark:bg-slate-800 p-4 rounded-3xl shadow-lg shadow-slate-200/50 dark:shadow-none">
            <h3 className="text-lg font-medium text-slate-800 dark:text-white mb-4 px-2">Ringkasan Keuangan Bulanan</h3>
            <div className="overflow-x-auto">
                <div className="rounded-xl overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5">
                            <tr>
                                <th className="p-3 text-xs font-medium uppercase text-slate-500 dark:text-[#958F99] tracking-wider">Periode</th>
                                <th className="p-3 text-xs font-medium uppercase text-slate-500 dark:text-[#958F99] tracking-wider">Total Omzet</th>
                                <th className="p-3 text-xs font-medium uppercase text-slate-500 dark:text-[#958F99] tracking-wider">Total Margin</th>
                                <th className="p-3 text-xs font-medium uppercase text-slate-500 dark:text-[#958F99] tracking-wider text-center">Jml. Transaksi</th>
                                <th className="p-3 text-xs font-medium uppercase text-slate-500 dark:text-[#958F99] tracking-wider">Piutang Baru</th>
                            </tr>
                        </thead>
                        <tbody>
                            {monthlyData.length > 0 ? monthlyData.map(summary => (
                                <tr key={`${summary.year}-${summary.month}`} className="border-b border-slate-200 dark:border-white/10 last:border-b-0 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors duration-200">
                                    <td className="p-3 text-sm text-slate-800 dark:text-white font-medium">{summary.month} {summary.year}</td>
                                    <td className="p-3 text-sm text-slate-600 dark:text-slate-300">{formatRupiah(summary.totalOmzet)}</td>
                                    <td className="p-3 text-sm font-medium text-emerald-600 dark:text-emerald-400">{formatRupiah(summary.totalMargin)}</td>
                                    <td className="p-3 text-sm text-slate-600 dark:text-slate-300 text-center">{summary.transactionCount}</td>
                                    <td className={`p-3 text-sm font-medium ${summary.newReceivables > 0 ? 'text-yellow-500 dark:text-yellow-400' : 'text-slate-500 dark:text-slate-400'}`}>
                                        {formatRupiah(summary.newReceivables)}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="text-center py-8 text-slate-400 dark:text-slate-500">Tidak ada data transaksi.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default MonthlyFinancialSummary;