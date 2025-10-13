import React, { useState, useEffect } from 'react';
import { Transaction, TransactionType, Wallet } from '../types';
import { WalletIconComponent } from './WalletIconComponent';
import { CloseIcon, UserIcon, CashIcon } from './icons/Icons';

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
    
    // Re-implement simplified display logic based on calculateWalletChanges from App.tsx
    // This is for display only and doesn't affect actual data.
    const getAssetChanges = () => {
        const { description, type, amount, margin, wallet: primaryWalletId, isInternalTransfer, isPiutang, marginType } = transaction;
        let primaryWalletChange = 0;
        let cashWalletChange = 0;

        if (description.startsWith('Reward:')) {
            primaryWalletChange = -amount;
        } else if (isInternalTransfer) {
            primaryWalletChange = (type === TransactionType.OUT) ? -(amount + margin) : amount;
            // The other side of the transfer is a separate transaction, so we just show this one's impact.
        } else if (description === 'Tambah Modal') {
            primaryWalletChange = amount;
        } else if (description === 'Penyesuaian Kas') {
            // For display, we assume the primary wallet is 'CASH'
            cashWalletChange = (type === TransactionType.IN) ? amount : -amount;
        } else if (description.startsWith('Penarikan Margin')) {
            cashWalletChange = -amount;
        } else if (description === 'Tarik Tunai') {
            if (marginType === 'luar') {
                primaryWalletChange = amount;
                cashWalletChange = isPiutang ? -amount : -amount + margin;
            } else {
                primaryWalletChange = amount + margin;
                cashWalletChange = -amount;
            }
        } else { // Standard OUT (Transfer Keluar, Pulsa) or IN (Fee)
            if (type === TransactionType.IN) {
                primaryWalletChange = amount + margin;
                if (!isPiutang) cashWalletChange = -amount;
            } else { // OUT
                primaryWalletChange = -amount;
                if (!isPiutang) cashWalletChange = amount + margin;
            }
        }

        const changes = [];
        const primaryWallet = wallets.find(w => w.id === primaryWalletId);
        const cashWallet = wallets.find(w => w.id === 'CASH');

        if (primaryWalletChange !== 0 && primaryWallet) {
            changes.push({
                wallet: primaryWallet,
                change: primaryWalletChange
            });
        }
        if (cashWalletChange !== 0 && cashWallet) {
             changes.push({
                wallet: cashWallet,
                change: cashWalletChange
            });
        }
        return changes;
    };

    const assetChanges = getAssetChanges();

    const formattedDate = new Date(transaction.date).toLocaleString('id-ID', {
        day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
    
    let amountColor = 'text-slate-800 dark:text-white';
    if (!transaction.isInternalTransfer) {
        amountColor = transaction.type === TransactionType.IN ? 'text-emerald-500 dark:text-emerald-400' : 'text-red-500 dark:text-red-400';
    }
    
    const showAdditionalDetails = transaction.margin > 0 || (transaction.description === 'Tarik Tunai' && transaction.marginType) || (transaction.notes && transaction.notes.trim() !== '');

    return (
        <div
            className={`fixed inset-0 z-50 flex justify-center items-center p-4 transition-opacity duration-300 ease-in-out bg-black/40 backdrop-blur-sm ${isVisible ? 'opacity-100' : 'opacity-0'}`}
            onClick={handleClose}
            role="dialog" aria-modal="true" aria-labelledby="transaction-detail-title"
        >
            <div
                className={`bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl w-full max-w-sm transform transition-all duration-300 ease-in-out flex flex-col max-h-[90vh] overflow-hidden ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* --- Header --- */}
                <div className={`relative p-4 flex items-center justify-center flex-shrink-0 ${
                    transaction.isPiutang ? 'bg-red-500' : 'bg-emerald-500'
                }`}>
                    <h2 id="transaction-detail-title" className="text-lg font-semibold text-white">
                        {transaction.description}
                    </h2>
                    <button onClick={handleClose} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full text-white/80 hover:bg-black/20 hover:text-white transition-colors" aria-label="Tutup">
                        <CloseIcon className="h-5 w-5" />
                    </button>
                </div>
                
                <div className="p-6 flex flex-col no-scrollbar overflow-y-auto">
                    {/* --- Main Info --- */}
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-2">
                            <UserIcon className="h-5 w-5 text-slate-400 dark:text-neutral-500"/>
                            <p className="text-lg font-medium text-slate-700 dark:text-neutral-200">{transaction.customer}</p>
                        </div>
                        
                        <p className={`text-5xl font-bold ${amountColor} my-3`}>
                            {formatRupiah(transaction.amount)}
                        </p>

                        <p className="text-xs text-slate-500 dark:text-neutral-400">{formattedDate}</p>

                        <div className="mt-4">
                            <span className={`px-3 py-1 text-xs font-bold rounded-full ${transaction.isPiutang ? 'bg-yellow-200 text-yellow-800 dark:bg-yellow-400/20 dark:text-yellow-300' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-400/10 dark:text-emerald-300'}`}>
                                {transaction.isPiutang ? 'Piutang' : 'Lunas'}
                            </span>
                        </div>
                    </div>
                    
                    {(assetChanges.length > 0 || showAdditionalDetails) && (
                        <div className="pt-6 mt-6 border-t border-slate-200 dark:border-white/10 space-y-5">
                            {/* --- Asset Impact --- */}
                            {assetChanges.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-semibold text-slate-600 dark:text-neutral-300 mb-2 px-1">
                                        Dampak pada Aset
                                    </h3>
                                    <div className="space-y-2">
                                        {assetChanges.map(({ wallet, change }) => (
                                            <div key={wallet.id} className="flex justify-between items-center bg-slate-100 dark:bg-black/20 p-3 rounded-lg">
                                                <div className="flex items-center gap-3">
                                                    <WalletIconComponent walletId={wallet.id} iconUrl={wallet.icon} className="h-6 w-6" altText={wallet.name} />
                                                    <span className="font-medium text-slate-700 dark:text-neutral-200">{wallet.name}</span>
                                                </div>
                                                <span className={`font-semibold ${change > 0 ? 'text-emerald-500 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
                                                    {change > 0 ? '+' : ''}{formatRupiah(change)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* --- Additional Details --- */}
                            {showAdditionalDetails && (
                                <div>
                                    <h3 className="text-sm font-semibold text-slate-600 dark:text-neutral-300 mb-2 px-1">
                                        Rincian Tambahan
                                    </h3>
                                    <div className="p-3 bg-slate-100 dark:bg-black/20 rounded-lg divide-y divide-slate-200 dark:divide-white/10">
                                        {transaction.margin > 0 && <DetailItem label={transaction.isInternalTransfer ? "Biaya" : "Margin"} value={<span className="text-sky-500 dark:text-sky-300">{formatRupiah(transaction.margin)}</span>} />}
                                        {transaction.description === 'Tarik Tunai' && transaction.marginType && (
                                            <DetailItem label="Tipe Margin" value={transaction.marginType === 'luar' ? 'Admin Luar' : 'Admin Dalam'} />
                                        )}
                                        {transaction.notes && transaction.notes.trim() !== '' && (
                                            <div className="py-2">
                                                <span className="text-sm text-slate-500 dark:text-neutral-400">Catatan</span>
                                                <p className="text-sm text-right font-medium text-slate-800 dark:text-white mt-1">"{transaction.notes}"</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TransactionDetailModal;