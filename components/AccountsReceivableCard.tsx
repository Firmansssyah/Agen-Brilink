
import React from 'react';
import { Transaction } from '../types';
import { CheckIcon } from './icons/Icons';

interface AccountsReceivableCardProps {
    receivableTransactions: Transaction[];
    totalPiutang: number;
    formatRupiah: (amount: number) => string;
    onSettleReceivable: (transaction: Transaction) => void;
}

const AccountsReceivableCard: React.FC<AccountsReceivableCardProps> = ({ receivableTransactions, totalPiutang, formatRupiah, onSettleReceivable }) => {

    const calculateDaysAgo = (dateString: string): string => {
        const piutangDate = new Date(dateString);
        const today = new Date();
        piutangDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);

        const diffTime = today.getTime() - piutangDate.getTime();
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= 0) {
            return 'Hari ini';
        }
        return `${diffDays} hari`;
    };
    
    const handleSettle = (transaction: Transaction) => {
        onSettleReceivable(transaction);
    };

    return (
        <div className="bg-white dark:bg-neutral-800 rounded-3xl flex flex-col shadow-lg shadow-slate-200/50 dark:shadow-none">
            {/* Header */}
            <div className="p-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-slate-800 dark:text-white">Daftar Piutang</h3>
                </div>
            </div>
            
            {/* Body (List) */}
            <div className="px-2 pb-2">
                {receivableTransactions.length > 0 ? (
                    <div className="space-y-2">
                        {receivableTransactions.map((item) => {
                            const daysAgo = calculateDaysAgo(item.date);
                            return (
                                <div key={item.id} className="group flex justify-between items-center px-4 py-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 transition-colors duration-200">
                                    <div className="flex flex-col min-w-0 flex-1">
                                        <span className="text-sm text-slate-700 dark:text-neutral-200 truncate font-medium">{item.customer}</span>
                                        <span className="text-xs text-slate-500 dark:text-neutral-400 truncate">{item.description}</span>
                                    </div>
                                    <div className="flex items-center space-x-3 flex-shrink-0 ml-2">
                                        <div className="flex flex-col items-end">
                                          <span className="text-sm font-medium text-yellow-500 dark:text-yellow-400">{formatRupiah(item.amount + item.margin)}</span>
                                          <span className="text-xs text-red-500 dark:text-red-300">{daysAgo}</span>
                                        </div>
                                        <div className="relative has-tooltip flex items-center">
                                            <button 
                                                onClick={() => handleSettle(item)}
                                                className="h-8 w-8 rounded-full border border-slate-300 dark:border-neutral-600 text-slate-500 dark:text-neutral-400 flex items-center justify-center transition-colors duration-200 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 hover:border-emerald-400 dark:hover:border-emerald-500 hover:text-emerald-500 dark:hover:text-emerald-400"
                                                aria-label={`Tandai lunas untuk ${item.customer}`}
                                            >
                                                <CheckIcon className="h-4 w-4" />
                                            </button>
                                            <div className="tooltip absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-700 dark:bg-neutral-900 text-white text-xs px-2 py-1 rounded-md pointer-events-none whitespace-nowrap">
                                                Tandai Lunas
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="flex items-center justify-center py-4 px-4">
                        <p className="text-slate-400 dark:text-neutral-500 text-sm">Tidak ada piutang.</p>
                    </div>
                )}
            </div>
            
            {/* Footer */}
            {receivableTransactions.length > 0 && (
                <div className="p-4 border-t border-slate-200 dark:border-white/10">
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-slate-600 dark:text-neutral-300">Total Piutang</span>
                        <span className="text-xl font-bold text-yellow-500 dark:text-yellow-400">{formatRupiah(totalPiutang)}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AccountsReceivableCard;
