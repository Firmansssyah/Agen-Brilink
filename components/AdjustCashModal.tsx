import React, { useState, useEffect } from 'react';
import { TransactionType } from '../types';
import { CloseIcon, PlusIcon } from './icons/Icons';

interface AdjustCashModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: { type: TransactionType; amount: number; notes: string; }) => Promise<void>;
}

const AdjustCashModal: React.FC<AdjustCashModalProps> = ({ isOpen, onClose, onSave }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [adjustmentType, setAdjustmentType] = useState<TransactionType>(TransactionType.IN);
    const [amount, setAmount] = useState(0);
    const [notes, setNotes] = useState('');
    const [error, setError] = useState('');

    const formatInputValue = (value: number) => {
        if (value === 0) return '';
        return new Intl.NumberFormat('id-ID').format(value);
    };

    const parseInputValue = (value: string): number => {
        return Number(value.replace(/\./g, '')) || 0;
    };
    
    useEffect(() => {
        if (isOpen) {
            setAdjustmentType(TransactionType.IN);
            setAmount(0);
            setNotes('');
            setError('');
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    }, [isOpen]);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onClose, 300);
    };

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const parsedValue = parseInputValue(e.target.value);
        setAmount(parsedValue);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (amount <= 0) {
            setError('Jumlah penyesuaian harus lebih besar dari 0.');
            return;
        }
        await onSave({ type: adjustmentType, amount, notes });
    };

    if (!isOpen) return null;

    return (
        <div
            className={`fixed inset-0 z-50 flex justify-center items-center p-4 transition-opacity duration-300 ease-in-out bg-black/40 backdrop-blur-sm ${isVisible ? 'opacity-100' : 'opacity-0'}`}
            onClick={handleClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="adjust-cash-modal-title"
        >
            <div
                className={`bg-white dark:bg-neutral-800 rounded-3xl shadow-2xl w-full max-w-md transform transition-all duration-300 ease-in-out ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6 flex justify-between items-center border-b border-slate-200 dark:border-white/10">
                    <h2 id="adjust-cash-modal-title" className="text-xl font-medium text-slate-800 dark:text-white">Penyesuaian Kas Tunai</h2>
                    <button onClick={handleClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 dark:text-neutral-300 transition-colors" aria-label="Tutup">
                        <CloseIcon />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-6">
                        <p className="text-sm text-slate-500 dark:text-neutral-400 -mt-2">
                            Gunakan fitur ini untuk menyamakan saldo kas di aplikasi dengan uang tunai fisik Anda.
                        </p>
                         <div>
                            <label className="block text-sm font.medium text-slate-600 dark:text-neutral-300 mb-2">Jenis Penyesuaian</label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setAdjustmentType(TransactionType.IN)}
                                    className={`p-3 text-sm font-semibold rounded-xl border-2 transition-colors duration-200 text-center ${
                                        adjustmentType === TransactionType.IN
                                            ? 'bg-emerald-100 text-emerald-700 border-emerald-400 dark:bg-emerald-400/20 dark:text-emerald-200 dark:border-emerald-400'
                                            : 'bg-slate-100 text-slate-600 border-transparent hover:border-slate-400 dark:bg-neutral-700/50 dark:text-neutral-300 dark:hover:border-neutral-500'
                                    }`}
                                >
                                    Tambah Kas
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setAdjustmentType(TransactionType.OUT)}
                                    className={`p-3 text-sm font-semibold rounded-xl border-2 transition-colors duration-200 text-center ${
                                        adjustmentType === TransactionType.OUT
                                            ? 'bg-red-100 text-red-700 border-red-400 dark:bg-red-400/20 dark:text-red-200 dark:border-red-400'
                                            : 'bg-slate-100 text-slate-600 border-transparent hover:border-slate-400 dark:bg-neutral-700/50 dark:text-neutral-300 dark:hover:border-neutral-500'
                                    }`}
                                >
                                    Kurangi Kas
                                </button>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="amount" className="block text-sm font.medium text-slate-600 dark:text-neutral-300 mb-2">Jumlah (Rp)</label>
                            <input
                                type="text"
                                inputMode="numeric"
                                id="amount"
                                value={formatInputValue(amount)}
                                onChange={handleAmountChange}
                                placeholder="cth: 50.000"
                                className="w-full bg-slate-100 dark:bg-neutral-700 border border-transparent focus:border-blue-400 focus:ring-1 focus:ring-blue-400 rounded-full px-4 py-3 text-sm text-slate-800 dark:text-white transition outline-none"
                                required
                                autoFocus
                            />
                        </div>
                         <div>
                            <label htmlFor="notes" className="block text-sm font.medium text-slate-600 dark:text-neutral-300 mb-2">Catatan (Opsional)</label>
                            <input
                                type="text"
                                id="notes"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="cth: Selisih kas harian"
                                className="w-full bg-slate-100 dark:bg-neutral-700 border border-transparent focus:border-blue-400 focus:ring-1 focus:ring-blue-400 rounded-full px-4 py-3 text-sm text-slate-800 dark:text-white transition outline-none"
                            />
                        </div>
                        {error && <p className="text-sm text-red-500 dark:text-red-400 text-center">{error}</p>}
                    </div>
                    <div className="px-6 py-4 flex justify-end space-x-3 border-t border-slate-200 dark:border-white/10">
                        <button type="button" onClick={handleClose} className="text-blue-600 hover:bg-blue-100 dark:text-blue-200 dark:hover:bg-blue-400/10 font-semibold py-2 px-5 rounded-full text-sm transition-colors">Batal</button>
                        <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white dark:bg-blue-400 dark:hover:bg-blue-500 dark:text-slate-900 font-semibold py-2 px-5 rounded-full text-sm transition-colors">Simpan Penyesuaian</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdjustCashModal;
