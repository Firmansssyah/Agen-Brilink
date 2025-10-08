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

const DetailRow: React.FC<{ label: string; value: React.ReactNode; isAmount?: boolean }> = ({ label, value, isAmount = false }) => (
    <div className="flex justify-between items-start py-3 border-b border-slate-200 dark:border-white/10 last:border-b-0">
        <span className="text-sm text-slate-500 dark:text-neutral-400 flex-shrink-0 pr-4">{label}</span>
        <span className={`text-sm text-right font-medium text-slate-800 dark:text-white ${isAmount ? 'font-bold' : ''}`}>{value}</span>
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
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
    
    const amountColor = transaction.type === TransactionType.IN ? 'text-emerald-500 dark:text-emerald-400' : 'text-red-500 dark:text-red-400';
    const amountPrefix = transaction.type === TransactionType.IN ? '+' : '-';

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
                <div className="p-6 flex justify-between items-center border-b border-slate-200 dark:border-white/10">
                    <h2 id="transaction-detail-title" className="text-xl font-medium text-slate-800 dark:text-white">Detail Transaksi</h2>
                    <button onClick={handleClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 dark:text-neutral-300 transition-colors" aria-label="Tutup">
                        <CloseIcon />
                    </button>
                </div>
                <div className="p-6 no-scrollbar overflow-y-auto max-h-[60vh]">
                    <DetailRow label="Tanggal" value={formattedDate} />
                    <DetailRow label="Deskripsi" value={transaction.description} />
                    <DetailRow label="Pelanggan" value={transaction.customer} />
                    
                    {toWallet && wallet ? ( // Transfer view
                        <>
                            <DetailRow label="Dari Dompet" value={
                                <div className="flex items-center justify-end gap-2">
                                    <WalletIconComponent walletId={wallet.id} iconUrl={wallet.icon} className="h-5 w-5" altText={wallet.name} />
                                    <span>{wallet.name}</span>
                                </div>
                            } />
                             <DetailRow label="Ke Dompet" value={
                                <div className="flex items-center justify-end gap-2">
                                    <WalletIconComponent walletId={toWallet.id} iconUrl={toWallet.icon} className="h-5 w-5" altText={toWallet.name} />
                                    <span>{toWallet.name}</span>
                                </div>
                            } />
                            <DetailRow label="Jumlah Transfer" value={formatRupiah(transaction.amount)} isAmount />
                            {transaction.margin > 0 && <DetailRow label="Biaya" value={<span className="text-sky-500 dark:text-sky-300">{formatRupiah(transaction.margin)}</span>} />}
                        </>
                    ) : ( // Normal transaction view
                        <>
                            <DetailRow label="Jumlah" value={<span className={amountColor}>{`${amountPrefix} ${formatRupiah(transaction.amount)}`}</span>} isAmount />
                            {transaction.margin > 0 && <DetailRow label="Margin" value={<span className="text-sky-500 dark:text-sky-300">{formatRupiah(transaction.margin)}</span>} />}
                            {wallet && <DetailRow label="Dompet" value={
                                <div className="flex items-center justify-end gap-2">
                                    <WalletIconComponent walletId={wallet.id} iconUrl={wallet.icon} className="h-5 w-5" altText={wallet.name} />
                                    <span>{wallet.name}</span>
                                </div>
                            } />}
                        </>
                    )}
                    
                    <DetailRow label="Status Piutang" value={
                        <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${transaction.isPiutang ? 'bg-yellow-200 text-yellow-800 dark:bg-yellow-400/20 dark:text-yellow-300' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-400/10 dark:text-emerald-300'}`}>
                            {transaction.isPiutang ? 'Ya' : 'Lunas'}
                        </span>
                    } />
                    
                    {transaction.description === 'Tarik Tunai' && (
                        <DetailRow label="Tipe Margin" value={transaction.marginType === 'luar' ? 'Admin Luar (ke Kas)' : 'Admin Dalam (ke Dompet)'} />
                    )}

                    {transaction.notes && transaction.notes.trim() !== '' && (
                        <DetailRow label="Catatan" value={<i className="text-slate-600 dark:text-neutral-300">"{transaction.notes}"</i>} />
                    )}
                </div>
                <div className="px-6 py-4 flex justify-end border-t border-slate-200 dark:border-white/10">
                    <button type="button" onClick={handleClose} className="text-blue-600 hover:bg-blue-100 dark:text-blue-200 dark:hover:bg-blue-400/10 font-semibold py-2 px-5 rounded-full text-sm transition-colors">Tutup</button>
                </div>
            </div>
        </div>
    );
};

export default TransactionDetailModal;
