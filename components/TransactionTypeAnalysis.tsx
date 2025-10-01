import React, { useState, useMemo } from 'react';
import { Transaction } from '../types';

interface TransactionTypeAnalysisProps {
    transactions: Transaction[];
    categories: string[];
}

interface TypeCount {
    description: string;
    count: number;
}

const TransactionTypeAnalysis: React.FC<TransactionTypeAnalysisProps> = ({ transactions, categories }) => {
    const [period, setPeriod] = useState<'monthly' | 'overall'>('monthly');

    const analysisData = useMemo<TypeCount[]>(() => {
        let filteredTransactions = transactions;

        if (period === 'monthly') {
            const now = new Date();
            const currentMonth = now.getMonth();
            const currentYear = now.getFullYear();
            filteredTransactions = transactions.filter(t => {
                const transactionDate = new Date(t.date);
                return transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear;
            });
        }

        // Initialize counts for all categories with 0.
        const counts = new Map<string, number>(
            categories.map(cat => [cat, 0])
        );

        filteredTransactions.forEach(t => {
            counts.set(t.description, (counts.get(t.description) || 0) + 1);
        });

        return Array.from(counts.entries())
            .map(([description, count]) => ({ description, count }))
            .sort((a, b) => b.count - a.count);

    }, [transactions, period, categories]);

    const maxCount = analysisData.length > 0 ? analysisData[0].count : 0;

    const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
        <button
            onClick={onClick}
            className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors duration-200 ${
                active ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-400/20 dark:text-indigo-200' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-white/10'
            }`}
        >
            {children}
        </button>
    );

    return (
        <div className="bg-white dark:bg-[#2A282F] p-4 sm:p-6 rounded-3xl animate-fade-in shadow-lg shadow-slate-200/50 dark:shadow-none">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-slate-800 dark:text-white">Transaksi Terpopuler</h3>
                <div className="flex items-center space-x-2 bg-slate-100 dark:bg-[#1C1B1F] p-1 rounded-full">
                    <TabButton active={period === 'monthly'} onClick={() => setPeriod('monthly')}>
                        Bulan Ini
                    </TabButton>
                    <TabButton active={period === 'overall'} onClick={() => setPeriod('overall')}>
                        Semua
                    </TabButton>
                </div>
            </div>

            <div className="space-y-4">
                {analysisData.length > 0 ? (
                    analysisData.map(({ description, count }) => (
                        <div key={description}>
                            <div className="flex justify-between items-center mb-1 text-sm">
                                <span className="font-medium text-slate-700 dark:text-slate-200">{description}</span>
                                <span className="font-semibold text-slate-800 dark:text-white">{count}x</span>
                            </div>
                            <div className="w-full bg-slate-200 dark:bg-slate-700/50 rounded-full h-2.5">
                                <div
                                    className="bg-indigo-400 h-2.5 rounded-full"
                                    style={{ width: `${maxCount > 0 ? (count / maxCount) * 100 : 0}%` }}
                                ></div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-8">
                        <p className="text-slate-400 dark:text-slate-500 text-sm">Tidak ada data untuk periode ini.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TransactionTypeAnalysis;