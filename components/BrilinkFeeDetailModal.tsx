import React, { useState, useEffect, useMemo } from 'react';
import { Transaction } from '../types';
import { CloseIcon, ChevronDownIcon } from './icons/Icons';

interface BrilinkFeeDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    feeTransactions: Transaction[];
    formatRupiah: (amount: number) => string;
}

interface MonthlyFeeData {
    key: string;
    monthName: string;
    totalFee: number;
    count: number;
    transactions: Transaction[];
}

const BrilinkFeeDetailModal: React.FC<BrilinkFeeDetailModalProps> = ({
    isOpen,
    onClose,
    feeTransactions,
    formatRupiah,
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [openMonths, setOpenMonths] = useState<Set<string>>(new Set());

    const monthlyData = useMemo<MonthlyFeeData[]>(() => {
        const grouped = new Map<string, { totalFee: number; count: number; transactions: Transaction[] }>();

        feeTransactions.forEach(t => {
            const date = new Date(t.date);
            const key = `${date.getFullYear()}-${String(date.getMonth()).padStart(2, '0')}`; // YYYY-MM
            
            const entry = grouped.get(key) || { totalFee: 0, count: 0, transactions: [] };
            entry.totalFee += t.margin;
            entry.count++;
            entry.transactions.push(t);
            grouped.set(key, entry);
        });

        // Convert map to sorted array
        return Array.from(grouped.entries())
            .map(([key, value]) => {
                const [year, monthIndex] = key.split('-');
                const monthName = new Date(parseInt(year), parseInt(monthIndex)).toLocaleString('id-ID', { month: 'long', year: 'numeric' });
                return { key, monthName, ...value };
            })
            .sort((a, b) => b.key.localeCompare(a.key)); // Sort descending by key (most recent first)

    }, [feeTransactions]);

    const toggleMonth = (key: string) => {
        setOpenMonths(prev => {
            const newSet = new Set(prev);
            if (newSet.has(key)) {
                newSet.delete(key);
            } else {
                newSet.add(key);
            }
            return newSet;
        });
    };

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    }, [isOpen]);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(() => {
            onClose();
            // Reset open state when closing
            setOpenMonths(new Set());
        }, 300);
    };

    if (!isOpen) return null;

    return (
        <div
            className={`fixed inset-0 z-50 flex justify-center items-center p-4 transition-opacity duration-300 ease-in-out ${isVisible ? 'opacity-100' : 'opacity-0'}`}
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)'}}
            onClick={handleClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="brilink-fee-detail-title"
        >
            <div
                className={`bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-lg transform transition-all duration-300 ease-in-out ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6 flex justify-between items-center border-b border-slate-200 dark:border-white/10">
                    <h2 id="brilink-fee-detail-title" className="text-xl font-medium text-slate-800 dark:text-white">Detail Fee Brilink</h2>
                    <button onClick={handleClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 dark:text-slate-300 transition-colors" aria-label="Tutup">
                        <CloseIcon />
                    </button>
                </div>

                <div className="p-2 sm:p-4 max-h-[60vh] overflow-y-auto">
                    {monthlyData.length > 0 ? (
                        <div className="space-y-2">
                            {monthlyData.map(({ key, monthName, totalFee, count, transactions }) => {
                                const isMonthOpen = openMonths.has(key);
                                return (
                                    <div key={key} className="border border-slate-200 dark:border-white/10 rounded-lg overflow-hidden transition-all duration-300">
                                        <button 
                                            onClick={() => toggleMonth(key)}
                                            className="w-full flex justify-between items-center p-3 text-left hover:bg-slate-100/50 dark:hover:bg-white/5 transition-colors"
                                            aria-expanded={isMonthOpen}
                                            aria-controls={`fee-details-${key}`}
                                        >
                                            <div>
                                                <p className="font-semibold text-slate-800 dark:text-white">{monthName}</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">{count} transaksi</p>
                                            </div>
                                            <div className="flex items-center space-x-4">
                                                <span className="font-bold text-emerald-500 dark:text-emerald-400">{formatRupiah(totalFee)}</span>
                                                <ChevronDownIcon className={`h-5 w-5 text-slate-400 transition-transform duration-300 ${isMonthOpen ? 'rotate-180' : ''}`} />
                                            </div>
                                        </button>
                                        
                                        {isMonthOpen && (
                                            <div id={`fee-details-${key}`} className="bg-slate-50 dark:bg-black/20 p-3 animate-fade-in">
                                                <div className="rounded-lg overflow-hidden border border-slate-200 dark:border-white/10">
                                                    <table className="w-full text-sm bg-white dark:bg-slate-700/50">
                                                        <tbody>
                                                            {transactions.map(t => (
                                                                 <tr key={t.id} className="border-b border-slate-200/50 dark:border-white/5 last:border-b-0">
                                                                    <td className="py-1.5 px-3 pr-2 text-slate-600 dark:text-slate-300">
                                                                        {new Date(t.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                                    </td>
                                                                    <td className="py-1.5 px-3 pl-2 text-right font-medium text-emerald-600 dark:text-emerald-400">
                                                                        {formatRupiah(t.margin)}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-center py-10 text-slate-400 dark:text-slate-500">Tidak ada data fee untuk ditampilkan.</p>
                    )}
                </div>
                <div className="px-6 py-4 flex justify-end border-t border-slate-200 dark:border-white/10">
                    <button type="button" onClick={handleClose} className="text-blue-600 hover:bg-blue-100 dark:text-blue-200 dark:hover:bg-blue-400/10 font-semibold py-2 px-5 rounded-full text-sm transition-colors">Tutup</button>
                </div>
            </div>
        </div>
    );
};

export default BrilinkFeeDetailModal;