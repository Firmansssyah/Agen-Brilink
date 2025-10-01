import React, { useState, useEffect, useMemo } from 'react';
import { Transaction, Wallet, TransactionType } from '../types';
import { CloseIcon } from './icons/Icons';
import WalletIconComponent from './WalletIconComponent';

interface CustomerDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    customerName: string | null;
    transactions: Transaction[];
    wallets: Wallet[];
    formatRupiah: (amount: number) => string;
}

interface MonthlyMargin {
    key: string;
    monthName: string;
    totalMargin: number;
}

const CustomerDetailModal: React.FC<CustomerDetailModalProps> = ({
    isOpen,
    onClose,
    customerName,
    transactions,
    wallets,
    formatRupiah,
}) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(isOpen);
    }, [isOpen]);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Wait for animation
    };

    const summary = useMemo(() => {
        if (!transactions || transactions.length === 0) {
            return { totalTransactions: 0, totalMargin: 0 };
        }
        const totalMargin = transactions.reduce((sum, t) => sum + t.margin, 0);
        return {
            totalTransactions: transactions.length,
            totalMargin,
        };
    }, [transactions]);

    const monthlyMarginData = useMemo<MonthlyMargin[]>(() => {
        const grouped = new Map<string, number>();

        transactions.forEach(t => {
            const date = new Date(t.date);
            const key = `${date.getFullYear()}-${String(date.getMonth()).padStart(2, '0')}`; // YYYY-MM
            
            const currentMargin = grouped.get(key) || 0;
            grouped.set(key, currentMargin + t.margin);
        });

        return Array.from(grouped.entries())
            .map(([key, totalMargin]) => {
                const [year, monthIndex] = key.split('-');
                const monthName = new Date(parseInt(year), parseInt(monthIndex)).toLocaleString('id-ID', { month: 'long', year: 'numeric' });
                return { key, monthName, totalMargin };
            })
            .sort((a, b) => b.key.localeCompare(a.key)); // Sort descending by key (most recent first)

    }, [transactions]);


    if (!isOpen) return null;

    return (
        <div
            className={`fixed inset-0 z-50 flex justify-center items-center p-4 transition-opacity duration-300 ease-in-out ${isVisible ? 'opacity-100' : 'opacity-0'}`}
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)'}}
            onClick={handleClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="customer-detail-title"
        >
            <div
                className={`bg-white dark:bg-neutral-800 rounded-3xl shadow-2xl w-full max-w-3xl transform transition-all duration-300 ease-in-out ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6 flex justify-between items-center border-b border-slate-200 dark:border-white/10">
                    <div>
                        <h2 id="customer-detail-title" className="text-xl font-medium text-slate-800 dark:text-white">{customerName}</h2>
                        <p className="text-sm text-slate-500 dark:text-neutral-400">Detail Pelanggan</p>
                    </div>
                    <button onClick={handleClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 dark:text-neutral-300 transition-colors" aria-label="Tutup">
                        <CloseIcon />
                    </button>
                </div>
                
                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 max-h-[70vh] overflow-y-auto">
                    {/* Left Column: Summary & Monthly Breakdown */}
                    <div className="md:col-span-1 space-y-6">
                        {/* Summary */}
                        <div className="bg-slate-100 dark:bg-black/20 p-4 rounded-xl">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm text-slate-600 dark:text-neutral-300">Total Transaksi</span>
                                <span className="text-lg font-bold text-slate-800 dark:text-white">{summary.totalTransactions}</span>
                            </div>
                             <div className="flex justify-between items-center">
                                <span className="text-sm text-slate-600 dark:text-neutral-300">Total Margin</span>
                                <span className="text-lg font-bold text-emerald-500 dark:text-emerald-400">{formatRupiah(summary.totalMargin)}</span>
                            </div>
                        </div>

                        {/* Monthly Margin */}
                        <div>
                            <h3 className="text-md font-semibold text-slate-700 dark:text-neutral-200 mb-2">Margin per Bulan</h3>
                            <div className="space-y-2">
                                {monthlyMarginData.map(month => (
                                    <div key={month.key} className="flex justify-between items-center text-sm p-2 rounded-lg bg-slate-50 dark:bg-white/5">
                                        <span className="text-slate-600 dark:text-neutral-300">{month.monthName}</span>
                                        <span className="font-medium text-emerald-600 dark:text-emerald-400">{formatRupiah(month.totalMargin)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Transaction History */}
                    <div className="md:col-span-2">
                         <h3 className="text-md font-semibold text-slate-700 dark:text-neutral-200 mb-2">Riwayat Transaksi</h3>
                        {transactions.length > 0 ? (
                            <div className="border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden">
                                <div className="max-h-[50vh] overflow-y-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 dark:bg-white/5 sticky top-0">
                                        <tr>
                                            <th className="p-3 font-medium text-slate-500 dark:text-neutral-400">Tanggal</th>
                                            <th className="p-3 font-medium text-slate-500 dark:text-neutral-400">Deskripsi</th>
                                            <th className="p-3 font-medium text-slate-500 dark:text-neutral-400 text-right">Jumlah</th>
                                            <th className="p-3 font-medium text-slate-500 dark:text-neutral-400 text-right">Margin</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {transactions.map(t => (
                                            <tr key={t.id} className="border-b border-slate-200 dark:border-white/10 last:border-b-0 hover:bg-slate-100/50 dark:hover:bg-white/5 transition-colors duration-200">
                                                <td className="p-3 text-slate-600 dark:text-neutral-300 whitespace-nowrap">
                                                    {new Date(t.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                                                </td>
                                                <td className="p-3 text-slate-800 dark:text-white">{t.description}</td>
                                                <td className={`p-3 font-medium text-right ${t.type === TransactionType.IN ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                                                    {formatRupiah(t.amount)}
                                                </td>
                                                <td className="p-3 text-sky-600 dark:text-sky-300 text-right">{formatRupiah(t.margin)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                </div>
                            </div>
                        ) : (
                            <p className="text-center py-10 text-slate-400 dark:text-neutral-500">Tidak ada transaksi.</p>
                        )}
                    </div>
                </div>

                <div className="px-6 py-4 flex justify-end border-t border-slate-200 dark:border-white/10">
                    <button type="button" onClick={handleClose} className="text-blue-600 hover:bg-blue-100 dark:text-blue-200 dark:hover:bg-blue-400/10 font-semibold py-2 px-5 rounded-full text-sm transition-colors">Tutup</button>
                </div>
            </div>
        </div>
    );
};

export default CustomerDetailModal;