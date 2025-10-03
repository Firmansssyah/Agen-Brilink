import React, { useState, useEffect, useMemo } from 'react';
import { Transaction } from '../types';
import { CloseIcon, CheckIcon } from './icons/Icons';

interface ReceivableDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    customerName: string | null;
    allReceivables: Transaction[];
    onSettle: (transaction: Transaction) => void;
    formatRupiah: (amount: number) => string;
}

const ReceivableDetailModal: React.FC<ReceivableDetailModalProps> = ({
    isOpen,
    onClose,
    customerName,
    allReceivables,
    onSettle,
    formatRupiah,
}) => {
    const [isVisible, setIsVisible] = useState(false);

    const customerReceivables = useMemo(() => {
        if (!customerName) return [];
        return allReceivables
            .filter(t => t.customer === customerName)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()); // Oldest first
    }, [allReceivables, customerName]);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    }, [isOpen]);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onClose, 300);
    };

    const calculateDaysAgo = (dateString: string): string => {
        const piutangDate = new Date(dateString);
        const today = new Date();
        piutangDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);

        const diffTime = today.getTime() - piutangDate.getTime();
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= 0) return 'Hari ini';
        return `${diffDays} hari`;
    };

    if (!isOpen) return null;

    return (
        <div
            className={`fixed inset-0 z-50 flex justify-center items-center p-4 transition-opacity duration-300 ease-in-out bg-black/40 backdrop-blur-sm ${isVisible ? 'opacity-100' : 'opacity-0'}`}
            onClick={handleClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="receivable-detail-title"
        >
            <div
                className={`bg-white dark:bg-neutral-800 rounded-3xl shadow-2xl w-full max-w-lg transform transition-all duration-300 ease-in-out flex flex-col max-h-[90vh] ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6 flex justify-between items-center border-b border-slate-200 dark:border-white/10 flex-shrink-0">
                    <div>
                        <h2 id="receivable-detail-title" className="text-xl font-medium text-slate-800 dark:text-white">Detail Piutang</h2>
                        <p className="text-sm text-slate-500 dark:text-neutral-400">{customerName}</p>
                    </div>
                    <button onClick={handleClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 dark:text-neutral-300 transition-colors" aria-label="Tutup">
                        <CloseIcon />
                    </button>
                </div>

                <div className="p-2 sm:p-4 overflow-y-auto flex-grow">
                    {customerReceivables.length > 0 ? (
                        <ul className="space-y-2">
                            {customerReceivables.map(t => (
                                <li key={t.id} className="p-3 rounded-xl flex items-center justify-between bg-slate-50 dark:bg-white/5">
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium text-slate-800 dark:text-white truncate">{t.description}</p>
                                        <p className="text-xs text-slate-500 dark:text-neutral-400">
                                            {new Date(t.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
                                        </p>
                                    </div>
                                    <div className="flex items-center space-x-3 ml-4">
                                        <div className="text-right">
                                            <p className="text-sm font-semibold text-yellow-500 dark:text-yellow-400">{formatRupiah(t.amount + t.margin)}</p>
                                            <p className="text-xs text-red-500 dark:text-red-400">{calculateDaysAgo(t.date)}</p>
                                        </div>
                                        <button 
                                            onClick={() => onSettle(t)}
                                            className="h-9 w-9 flex-shrink-0 rounded-full border border-slate-300 dark:border-neutral-600 text-slate-500 dark:text-neutral-400 flex items-center justify-center transition-colors duration-200 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 hover:border-emerald-400 dark:hover:border-emerald-500 hover:text-emerald-500 dark:hover:text-emerald-400"
                                            aria-label={`Tandai lunas untuk ${t.description}`}
                                        >
                                            <CheckIcon className="h-4 w-4" />
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="text-center py-16">
                            <p className="text-slate-500 dark:text-neutral-400">Semua piutang untuk {customerName} sudah lunas.</p>
                        </div>
                    )}
                </div>
                <div className="px-6 py-4 flex justify-end border-t border-slate-200 dark:border-white/10 flex-shrink-0">
                    <button type="button" onClick={handleClose} className="text-blue-600 hover:bg-blue-100 dark:text-blue-200 dark:hover:bg-blue-400/10 font-semibold py-2 px-5 rounded-full text-sm transition-colors">Tutup</button>
                </div>
            </div>
        </div>
    );
};

export default ReceivableDetailModal;
