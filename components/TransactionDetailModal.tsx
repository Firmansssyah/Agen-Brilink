import React, { useState, useEffect } from 'react';
import { Transaction, TransactionType, Wallet } from '../types';
import { WalletIconComponent } from './WalletIconComponent';
import { CloseIcon } from './icons/Icons';

interface TransactionDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    transaction: Transaction | null;
    wallets: Wallet[];
    formatRupiah: (amount: number) => string;
}

const DetailItem: React.FC<{ label: string; value: React.ReactNode; }> = ({ label, value }) => (
    <div className="flex justify-between items-center py-2">
        <span className="text-sm text-slate-500 dark:text-neutral-400">{label}</span>
        <span className="text-sm text-right font-medium text-slate-800 dark:text-white">{value}</span>
    </div>
);

const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
    isOpen,
    onClose,
    transaction,
    wallets,
    formatRupiah,
}) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(isOpen);
    }, [isOpen]);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onClose, 300);
    };

    if (!isOpen || !transaction) return null;

    const wallet = wallets.find(w => w.id === transaction.wallet);
    const toWallet = transaction.toWallet ? wallets.find(w => w.id === transaction.toWallet) : null;

    const formattedDate = new Date(transaction.date).toLocaleString('id-ID', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
    
    const isTransfer = !!toWallet;
    
    let amountColor = 'text-slate-800 dark:text-white';
    if (!isTransfer) {
        amountColor = transaction.type === TransactionType.IN ? 'text-emerald-500 dark:text-emerald-400' : 'text-red-500 dark:text-red-400';
    }
    
    const amountPrefix = !isTransfer && transaction.type === TransactionType.IN ? '+' : '';

    return (
        <div
            className={`fixed inset-0 z-50 flex justify-center items-center p-4 transition-opacity duration-300 ease-in-out bg-black/40 backdrop-blur-sm ${isVisible ? 'opacity-100' : 'opacity-0'}`}
            onClick={handleClose}
            role="dialog" aria-modal="true" aria-labelledby="transaction-detail-title"
        >
            <div
                className={`bg-white dark:bg-neutral-800 rounded-3xl shadow-2xl w-full max-w-md transform transition-all duration-300 ease-in-out ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6 flex justify-between items-center">
                    <h2 id="transaction-detail-title" className="text-lg font-medium text-slate-800 dark:text-white">Detail Transaksi</h2>
                    <button onClick={handleClose} className="p-2 -mr-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 dark:text-neutral-300 transition-colors" aria-label="Tutup">
                        <CloseIcon />
                    </button>
                </div>
                <div className="px-6 pb-6 no-scrollbar overflow-y-auto max-h-[60vh]">
                    {/* --- Ringkasan Utama --- */}
                    <div className="text-center py-4">
                        <p className={`text-4xl font-bold ${amountColor}`}>
                            {`${amountPrefix} ${formatRupiah(transaction.amount)}`}
                        </p>
                        <p className="mt-2 text-lg font-medium text-slate-700 dark:text-neutral-200">{transaction.description}</p>
                        <p className="text-sm text-slate-500 dark:text-neutral-400">{formattedDate}</p>
                    </div>

                    <hr className="my-6 border-slate-200 dark:border-white/10" />
                    
                    {/* --- Detail Transaksi --- */}
                    <div className="space-y-4">
                        {/* Alur Dompet */}
                        {isTransfer && wallet && toWallet ? (
                             <div>
                                <h3 className="text-sm font-semibold text-slate-600 dark:text-neutral-300 mb-2">Alur Dana</h3>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between p-3 bg-slate-100 dark:bg-black/20 rounded-lg">
                                        <span className="text-xs text-slate-500 dark:text-neutral-400">Dari</span>
                                        <div className="flex items-center gap-2 font-medium text-slate-800 dark:text-white">
                                            <WalletIconComponent walletId={wallet.id} iconUrl={wallet.icon} className="h-5 w-5" altText={wallet.name} />
                                            <span>{wallet.name}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-slate-100 dark:bg-black/20 rounded-lg">
                                        <span className="text-xs text-slate-500 dark:text-neutral-400">Ke</span>
                                        <div className="flex items-center gap-2 font-medium text-slate-800 dark:text-white">
                                            <WalletIconComponent walletId={toWallet.id} iconUrl={toWallet.icon} className="h-5 w-5" altText={toWallet.name} />
                                            <span>{toWallet.name}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : wallet && (
                             <DetailItem label="Dompet" value={
                                <div className="flex items-center justify-end gap-2">
                                    <WalletIconComponent walletId={wallet.id} iconUrl={wallet.icon} className="h-5 w-5" altText={wallet.name} />
                                    <span>{wallet.name}</span>
                                </div>
                            } />
                        )}
                        
                        {/* Detail Lainnya */}
                        <div className="p-3 bg-slate-100 dark:bg-black/20 rounded-lg divide-y divide-slate-200 dark:divide-white/10">
                            <DetailItem label="Pelanggan" value={transaction.customer} />
                            {transaction.margin > 0 && <DetailItem label={isTransfer ? "Biaya" : "Margin"} value={<span className="text-sky-500 dark:text-sky-300">{formatRupiah(transaction.margin)}</span>} />}
                            <DetailItem label="Status Piutang" value={
                                <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${transaction.isPiutang ? 'bg-yellow-200 text-yellow-800 dark:bg-yellow-400/20 dark:text-yellow-300' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-400/10 dark:text-emerald-300'}`}>
                                    {transaction.isPiutang ? 'Ya' : 'Lunas'}
                                </span>
                            } />
                            {transaction.description === 'Tarik Tunai' && (
                                <DetailItem label="Tipe Margin" value={transaction.marginType === 'luar' ? 'Admin Luar' : 'Admin Dalam'} />
                            )}
                        </div>
                        
                         {transaction.notes && transaction.notes.trim() !== '' && (
                            <div>
                                <h3 className="text-sm font-semibold text-slate-600 dark:text-neutral-300 mb-2">Catatan</h3>
                                <div className="p-3 bg-slate-100 dark:bg-black/20 rounded-lg">
                                    <p className="text-sm italic text-slate-700 dark:text-neutral-300">"{transaction.notes}"</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TransactionDetailModal;
