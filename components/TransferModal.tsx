import React, { useState, useEffect } from 'react';
import { Transaction, Wallet } from '../types';
import { ChevronDownIcon, TransferIcon } from './icons/Icons';

interface TransferModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: { fromWallet: string; toWallet: string; amount: number; fee: number; transferId?: string; }) => void;
    wallets: Wallet[];
    transferToEdit?: Transaction | null;
    onDelete?: (transferId: string) => void;
}

const TransferModal: React.FC<TransferModalProps> = ({ isOpen, onClose, onSave, wallets, transferToEdit, onDelete }) => {
    const formInputClass = "w-full bg-slate-100 dark:bg-neutral-700 border border-transparent focus:border-blue-400 focus:ring-1 focus:ring-blue-400 rounded-full px-4 py-3 text-sm text-slate-800 dark:text-white transition outline-none placeholder:text-slate-400 dark:placeholder:text-neutral-500";
    const formSelectClass = `${formInputClass} appearance-none`;

    const getInitialData = () => ({
        fromWallet: wallets[0]?.id || '',
        toWallet: wallets[1]?.id || '',
        amount: 0,
        fee: 0,
    });

    const [formData, setFormData] = useState(getInitialData());
    const [isVisible, setIsVisible] = useState(false);
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
            if (transferToEdit) {
                setFormData({
                    fromWallet: transferToEdit.wallet,
                    toWallet: transferToEdit.toWallet || '',
                    amount: transferToEdit.amount,
                    fee: transferToEdit.margin,
                });
            } else {
                setFormData(getInitialData());
            }
            setError('');
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    }, [isOpen, wallets, transferToEdit]);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onClose, 300);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        let processedValue: string | number = value;

        if (name === 'amount' || name === 'fee') {
            processedValue = parseInputValue(value);
        }
        
        setFormData(prev => {
            const updated = { ...prev, [name]: processedValue };
            // Ensure toWallet is not same as fromWallet
            if (name === 'fromWallet' && updated.toWallet === value) {
                updated.toWallet = wallets.find(w => w.id !== value)?.id || '';
            }
            if (name === 'toWallet' && updated.fromWallet === value) {
                updated.fromWallet = wallets.find(w => w.id !== value)?.id || '';
            }
            return updated;
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        if (formData.fromWallet === formData.toWallet) {
            setError("Dompet sumber dan tujuan tidak boleh sama.");
            return;
        }
        if (formData.amount <= 0) {
            setError("Jumlah harus lebih besar dari 0.");
            return;
        }
        
        // Don't check balance on edit, as the calculation is relative
        if (!transferToEdit) {
            const sourceWallet = wallets.find(w => w.id === formData.fromWallet);
            if (sourceWallet && sourceWallet.balance < (formData.amount + formData.fee)) {
                setError("Saldo dompet sumber tidak mencukupi.");
                return;
            }
        }

        onSave({ ...formData, transferId: transferToEdit?.id });
    };

    const handleDeleteClick = () => {
        if (transferToEdit?.id && onDelete) {
            onDelete(transferToEdit.id);
        }
    };

    if (!isOpen) return null;
    
    const toWallets = wallets.filter(w => w.id !== formData.fromWallet);


    return (
        <div 
            className={`fixed inset-0 z-50 flex justify-center items-center p-4 transition-opacity duration-300 ease-in-out bg-black/40 backdrop-blur-sm ${isVisible ? 'opacity-100' : 'opacity-0'}`}
            onClick={handleClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="transfer-modal-title"
        >
            <div 
                className={`bg-white dark:bg-neutral-800 rounded-3xl shadow-2xl w-full max-w-md transform transition-all duration-300 ease-in-out ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6">
                    <h2 id="transfer-modal-title" className="text-xl font-medium text-slate-800 dark:text-white">
                        {transferToEdit ? 'Edit Pindah Saldo' : 'Pindah Saldo'}
                    </h2>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-6">
                        <div className="flex items-center gap-4">
                            {/* From Wallet */}
                            <div className="flex-1">
                                <label htmlFor="fromWallet" className="block text-sm font-medium text-slate-600 dark:text-neutral-300 mb-2">Dari Dompet</label>
                                <div className="relative">
                                    <select name="fromWallet" id="fromWallet" value={formData.fromWallet} onChange={handleChange} className={formSelectClass}>
                                        {wallets.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-neutral-400">
                                        <ChevronDownIcon />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-7">
                                <TransferIcon className="h-6 w-6 text-neutral-400" />
                            </div>

                            {/* To Wallet */}
                            <div className="flex-1">
                                <label htmlFor="toWallet" className="block text-sm font-medium text-slate-600 dark:text-neutral-300 mb-2">Ke Dompet</label>
                                <div className="relative">
                                    <select name="toWallet" id="toWallet" value={formData.toWallet} onChange={handleChange} className={formSelectClass}>
                                        {toWallets.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                                    </select>
                                     <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-neutral-400">
                                        <ChevronDownIcon />
                                    </div>
                                </div>
                            </div>
                        </div>

                         <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="amount" className="block text-sm font-medium text-slate-600 dark:text-neutral-300 mb-2">Jumlah Transfer</label>
                                <input 
                                    type="text"
                                    inputMode="numeric"
                                    id="amount"
                                    name="amount"
                                    placeholder="cth: 500.000"
                                    value={formatInputValue(formData.amount)}
                                    onChange={handleChange}
                                    className={formInputClass}
                                    required
                                />
                            </div>
                             <div>
                                <label htmlFor="fee" className="block text-sm font-medium text-slate-600 dark:text-neutral-300 mb-2">Biaya Tambahan</label>
                                <input 
                                    type="text"
                                    inputMode="numeric"
                                    id="fee"
                                    name="fee"
                                    placeholder="(Opsional)"
                                    value={formatInputValue(formData.fee)}
                                    onChange={handleChange}
                                    className={formInputClass}
                                />
                            </div>
                        </div>

                        {error && <p className="text-sm text-red-500 dark:text-red-400 text-center">{error}</p>}

                    </div>
                    <div className="px-6 py-4 flex justify-between items-center">
                        <div>
                            {transferToEdit && onDelete && (
                                <button
                                    type="button"
                                    onClick={handleDeleteClick}
                                    className="bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20 font-semibold py-2 px-5 rounded-full text-sm transition-colors"
                                >
                                    Hapus
                                </button>
                            )}
                        </div>
                        <div className="flex space-x-3">
                            <button type="button" onClick={handleClose} className="text-blue-600 hover:bg-blue-100 dark:text-blue-200 dark:hover:bg-blue-400/10 font-semibold py-2 px-5 rounded-full text-sm transition-colors">Batal</button>
                            <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white dark:bg-blue-400 dark:hover:bg-blue-500 dark:text-slate-900 font-semibold py-2 px-5 rounded-full text-sm transition-colors">
                                {transferToEdit ? 'Simpan Perubahan' : 'Pindahkan'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TransferModal;