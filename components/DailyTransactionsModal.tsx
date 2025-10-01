

import React, { useState, useEffect } from 'react';
import { Transaction, TransactionType, Wallet } from '../types';
import WalletIconComponent from './WalletIconComponent';
import { CloseIcon } from './icons/Icons';

interface DailyTransactionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    transactions: Transaction[];
    wallets: Wallet[];
    date: string | null;
    formatRupiah: (amount: number) => string;
    onEditTransaction: (transaction: Transaction) => void;
}

const DailyTransactionsModal: React.FC<DailyTransactionsModalProps> = ({
    isOpen,
    onClose,
    transactions,
    wallets,
    date,
    formatRupiah,
    onEditTransaction
}) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    }, [isOpen]);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Wait for animation
    };

    if (!isOpen || !date) return null;

    // Adjust for timezone when creating the date object for display
    const [year, month, day] = date.split('-').map(Number);
    const displayDate = new Date(year, month - 1, day);

    const formattedDate = displayDate.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    const handleEditClick = (transaction: Transaction) => {
        onClose(); // Close this modal
        setTimeout(() => onEditTransaction(transaction), 310); // Open the edit modal after a delay
    };

    return (
        <div
            className={`fixed inset-0 z-50 flex justify-center items-center p-4 transition-opacity duration-300 ease-in-out ${isVisible ? 'opacity-100' : 'opacity-0'}`}
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)'}}
            onClick={handleClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="daily-transactions-title"
        >
            <div
                className={`bg-white dark:bg-neutral-800 rounded-3xl shadow-2xl w-full max-w-2xl transform transition-all duration-300 ease-in-out ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6 flex justify-between items-center border-b border-slate-200 dark:border-white/10">
                    <div>
                        <h2 id="daily-transactions-title" className="text-xl font-medium text-slate-800 dark:text-white">Detail Transaksi</h2>
                        <p className="text-sm text-slate-500 dark:text-neutral-400">{formattedDate}</p>
                    </div>
                    <button onClick={handleClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 dark:text-neutral-300 transition-colors" aria-label="Tutup">
                        <CloseIcon />
                    </button>
                </div>

                <div className="p-2 sm:p-4 max-h-[60vh] overflow-y-auto">
                    {transactions.length > 0 ? (
                        <ul className="space-y-2">
                            {transactions.map(t => {
                                const wallet = wallets.find(w => w.id === t.wallet);
                                return (
                                    <li key={t.id} onClick={() => handleEditClick(t)} className={`p-3 rounded-lg flex items-center justify-between transition-colors duration-200 cursor-pointer ${t.isPiutang ? 'bg-yellow-100 dark:bg-yellow-400/10 hover:bg-yellow-200/60 dark:hover:bg-yellow-400/20' : 'hover:bg-slate-100 dark:hover:bg-white/5'}`}>
                                        <div className="flex items-center space-x-3 min-w-0">
                                            {wallet && (
                                                <div className="flex-shrink-0">
                                                    <WalletIconComponent
                                                        walletId={wallet.id}
                                                        iconUrl={wallet.icon}
                                                        className="h-7 w-7 object-contain dark:brightness-0 dark:invert"
                                                        altText={wallet.name}
                                                    />
                                                </div>
                                            )}
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-medium text-slate-800 dark:text-white truncate">{t.description}</p>
                                                <p className="text-xs text-slate-500 dark:text-neutral-400 truncate">{t.customer || 'Pelanggan'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-4 ml-4">
                                            <div className="text-right">
                                                <p className={`text-sm font-semibold ${t.type === TransactionType.IN ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                                                    {`${t.type === TransactionType.IN ? '+' : '-'} ${formatRupiah(t.amount)}`}
                                                </p>
                                                <p className="text-xs text-sky-600 dark:text-sky-300">
                                                    Margin: {formatRupiah(t.margin)}
                                                </p>
                                            </div>
                                            {t.isPiutang && (
                                                <div className="text-xs font-bold px-2 py-0.5 bg-yellow-200 text-yellow-800 dark:bg-yellow-400/20 dark:text-yellow-300 rounded-full">Piutang</div>
                                            )}
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    ) : (
                        <p className="text-center py-10 text-slate-400 dark:text-neutral-500">Tidak ada transaksi pada tanggal ini.</p>
                    )}
                </div>
                <div className="px-6 py-4 flex justify-end border-t border-slate-200 dark:border-white/10">
                    <button type="button" onClick={handleClose} className="text-blue-600 hover:bg-blue-100 dark:text-blue-200 dark:hover:bg-blue-400/10 font-semibold py-2 px-5 rounded-full text-sm transition-colors">Tutup</button>
                </div>
            </div>
        </div>
    );
};

export default DailyTransactionsModal;