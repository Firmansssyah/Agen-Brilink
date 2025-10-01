import React, { useMemo } from 'react';
import { Transaction } from '../types';

interface BrilinkFeeReportProps {
    feeTransactions: Transaction[];
    formatRupiah: (amount: number) => string;
    onOpenDetail: () => void;
}

const BrilinkFeeReport: React.FC<BrilinkFeeReportProps> = ({ feeTransactions, formatRupiah, onOpenDetail }) => {
    
    const monthlyFeeData = useMemo(() => {
        const data: { [key: string]: number } = {};
        const monthLabels: { key: string; label: string }[] = [];
        const today = new Date();

        // Initialize last 6 months
        for (let i = 5; i >= 0; i--) {
            const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const year = date.getFullYear();
            const month = date.getMonth();
            const key = `${year}-${String(month).padStart(2, '0')}`;
            const label = date.toLocaleString('id-ID', { month: 'short' });
            
            data[key] = 0;
            monthLabels.push({ key, label });
        }

        // Aggregate data
        feeTransactions.forEach(t => {
            const date = new Date(t.date);
            const year = date.getFullYear();
            const month = date.getMonth();
            const key = `${year}-${String(month).padStart(2, '0')}`;
            if (data.hasOwnProperty(key)) {
                data[key] += t.margin;
            }
        });

        const result = monthLabels.map(m => ({
            month: m.label,
            totalFee: data[m.key]
        }));
        
        return result;

    }, [feeTransactions]);

    const maxFee = useMemo(() => {
        if (monthlyFeeData.length === 0) return 0;
        const max = Math.max(...monthlyFeeData.map(d => d.totalFee));
        return max === 0 ? 1 : max; // Avoid division by zero, use 1 as a base if all are 0
    }, [monthlyFeeData]);
    
    const totalLast6Months = useMemo(() => {
        return monthlyFeeData.reduce((sum, item) => sum + item.totalFee, 0);
    }, [monthlyFeeData]);

    return (
        <div
            className="bg-white dark:bg-slate-800 p-4 rounded-3xl shadow-lg shadow-slate-200/50 dark:shadow-none h-full flex flex-col text-left w-full"
        >
            {/* Header */}
            <div className="flex justify-between items-start mb-4 px-2">
                <div>
                    <h3 className="text-lg font-medium text-slate-800 dark:text-white">Fee Brilink (6 Bulan)</h3>
                    <p className="text-sm text-slate-500 dark:text-[#CAC4D0]">Total: {formatRupiah(totalLast6Months)}</p>
                </div>
                <button 
                    onClick={onOpenDetail}
                    className="text-xs font-semibold text-blue-500 dark:text-blue-300 hover:underline"
                >
                    Lihat Detail
                </button>
            </div>
            
            {/* Chart Area */}
            <div className="flex-grow flex items-end justify-around gap-2 px-2 h-48 min-h-[12rem]">
                {monthlyFeeData.map((data, index) => {
                    const barHeight = (data.totalFee / maxFee) * 100;
                    return (
                        <div key={index} className="flex flex-col items-center justify-end h-full w-full relative has-tooltip">
                            {/* Tooltip */}
                            <div className="tooltip absolute -top-8 bg-slate-700 dark:bg-slate-900 text-white text-xs px-2 py-1 rounded-md pointer-events-none whitespace-nowrap">
                                {formatRupiah(data.totalFee)}
                            </div>
                            
                            {/* Bar */}
                            <div
                                className="w-3/4 rounded-t-md bg-emerald-400 hover:bg-emerald-500 transition-all duration-300"
                                style={{ height: `${barHeight}%` }}
                            />
                            
                            {/* Label */}
                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-2">{data.month}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default BrilinkFeeReport;