
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Transaction, TransactionType, Wallet } from '../types';
import { ChevronDownIcon, CheckIcon, DeleteIcon } from './icons/Icons';
import WalletIconComponent from './WalletIconComponent';
import ConfirmationModal from './ConfirmationModal';

interface TransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Transaction | Omit<Transaction, 'id' | 'date'>) => void;
    onDeleteTransaction: (transactionId: string) => void;
    transactionToEdit: Transaction | null;
    wallets: Wallet[];
    categories: string[];
    formatRupiah: (amount: number) => string;
}

const TransactionModal: React.FC<TransactionModalProps> = ({ isOpen, onClose, onSave, onDeleteTransaction, transactionToEdit, wallets, categories, formatRupiah }) => {
    const getInitialData = useCallback(() => {
        const defaultDescription = categories[0] || '';
        const defaultType = defaultDescription === 'Tarik Tunai' ? TransactionType.IN : TransactionType.OUT;
        return {
            description: defaultDescription,
            customer: '',
            type: defaultType,
            amount: 0,
            margin: 0,
            wallet: wallets.filter(w => w.id !== 'CASH')[0]?.id || '',
            isPiutang: false,
        };
    }, [categories, wallets]);

    const [formData, setFormData] = useState<Omit<Transaction, 'id' | 'date'> | Transaction>(getInitialData());
    const [isVisible, setIsVisible] = useState(false);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

    const formatInputValue = (value: number) => {
        if (value === 0) return '';
        return new Intl.NumberFormat('id-ID').format(value);
    };

    const parseInputValue = (value: string): number => {
        return Number(value.replace(/\./g, '')) || 0;
    };

    useEffect(() => {
        if (isOpen) {
            setFormData(transactionToEdit || getInitialData());
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    }, [isOpen, transactionToEdit, getInitialData]);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Wait for animation
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        
        let processedValue: string | number | boolean = value;

        if (name === 'amount' || name === 'margin') {
            processedValue = parseInputValue(value);
        } else if (e.target instanceof HTMLInputElement && e.target.type === 'checkbox') {
             processedValue = e.target.checked;
        }

        const updatedData = { ...formData, [name]: processedValue };

        if (name === 'description') {
            const newType = value === 'Tarik Tunai' ? TransactionType.IN : TransactionType.OUT;
            if (newType !== updatedData.type) {
                (updatedData as any).type = newType;
            }
        }

        setFormData(updatedData as any);
    };

    const handleWalletChange = (walletId: string) => {
        setFormData(prev => ({...prev, wallet: walletId}));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.description || formData.amount <= 0 || !formData.wallet) {
            alert('Deskripsi, Jumlah, dan Dompet harus diisi.');
            return;
        }
        onSave(formData);
    };

    const handleConfirmDelete = () => {
        if (transactionToEdit) {
            onDeleteTransaction(transactionToEdit.id);
            setIsDeleteConfirmOpen(false);
            handleClose();
        }
    };

     const cashFlowInfo = useMemo(() => {
        if (formData.isPiutang) {
            if (formData.description === 'Tarik Tunai' && formData.amount > 0) {
                 return `Piutang akan tercatat. Kas akan berkurang sejumlah ${formatRupiah(formData.amount)}.`;
            }
            return "Transaksi akan dicatat sebagai piutang. Tidak ada perubahan kas.";
        }
        if (formData.amount > 0) {
            if (formData.description === 'Tarik Tunai') {
                return `Kas akan berkurang sejumlah ${formatRupiah(formData.amount)}.`;
            } else {
                return `Kas akan bertambah sejumlah ${formatRupiah(formData.amount + formData.margin)}.`;
            }
        }
        return "Masukkan jumlah untuk melihat dampak pada kas.";
    }, [formData.description, formData.amount, formData.margin, formData.isPiutang, formatRupiah]);
    
    if (!isOpen) return null;

    const formInputClass = "w-full bg-[#3C3A42] border border-transparent focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 rounded-lg p-3 text-sm text-white transition outline-none";
    const formSelectClass = `${formInputClass} appearance-none`;
    const formLabelClass = "block text-sm font-medium text-slate-300 mb-2";

    return (
        <>
            <div 
                className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ease-in-out ${isVisible ? 'opacity-100' : 'opacity-0'}`}
                style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)'}}
                onClick={handleClose}
            >
                <div 
                    className={`bg-[#2F2D35] rounded-3xl shadow-2xl w-full max-w-lg transform transition-all duration-300 ease-in-out ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
                    onClick={(e) => e.stopPropagation()}
                >
                     <div className="p-6 border-b border-white/10">
                        <h2 className="text-xl font-medium text-white">{transactionToEdit ? 'Edit Transaksi' : 'Tambah Transaksi Baru'}</h2>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="p-6 flex flex-col gap-5">
                            {/* Transaction Details */}
                            <div>
                                <label htmlFor="description" className={formLabelClass}>Jenis Transaksi</label>
                                <div className="relative">
                                    <select id="description" name="description" value={formData.description} onChange={handleChange} className={formSelectClass} required>
                                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                                        <ChevronDownIcon />
                                    </div>
                                </div>
                            </div>
                             <div>
                                <label htmlFor="customer" className={formLabelClass}>Pelanggan</label>
                                <input type="text" id="customer" name="customer" placeholder="cth: Budi Santoso (Opsional)" value={formData.customer} onChange={handleChange} className={formInputClass} />
                            </div>

                            {/* Financials */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="amount" className={formLabelClass}>Jumlah (Rp)</label>
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
                                    <label htmlFor="margin" className={formLabelClass}>Margin (Rp)</label>
                                    <input 
                                        type="text"
                                        inputMode="numeric"
                                        id="margin"
                                        name="margin"
                                        placeholder="cth: 6.500"
                                        value={formatInputValue(formData.margin)}
                                        onChange={handleChange}
                                        className={formInputClass}
                                    />
                                </div>
                            </div>
                            
                            {/* Source & Modifiers */}
                            <div>
                                <label className={formLabelClass}>Dompet</label>
                                <div className="grid grid-cols-5 gap-3">
                                    {wallets.filter(w => w.id !== 'CASH').map(wallet => (
                                        <button
                                            key={wallet.id}
                                            type="button"
                                            onClick={() => handleWalletChange(wallet.id)}
                                            className={`relative flex items-center justify-center p-3 rounded-xl transition-all duration-200 bg-white aspect-square has-tooltip ${
                                                formData.wallet === wallet.id
                                                    ? 'ring-2 ring-indigo-400 shadow-lg'
                                                    : 'hover:ring-2 hover:ring-indigo-300'
                                            }`}
                                            aria-label={wallet.name}
                                        >
                                            <WalletIconComponent
                                                walletId={wallet.id}
                                                iconUrl={wallet.icon}
                                                className="h-14 w-14"
                                                altText={wallet.name}
                                            />
                                            {formData.wallet === wallet.id && (
                                                 <div className="absolute top-1.5 right-1.5 bg-indigo-500 rounded-full p-0.5 flex items-center justify-center">
                                                    <CheckIcon className="h-3 w-3 text-white" />
                                                </div>
                                            )}
                                            <div className="tooltip absolute -top-8 bg-slate-900 text-white text-xs px-2 py-1 rounded-md pointer-events-none">
                                                {wallet.name}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white/5 p-3 rounded-lg text-center text-sm text-slate-300">
                                {cashFlowInfo}
                            </div>
                            
                            <div className="flex justify-between items-center pt-2">
                                <div className="flex items-center gap-3">
                                    <span className={formLabelClass + ' mb-0'}>Tipe Transaksi:</span>
                                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${formData.type === TransactionType.IN ? 'bg-emerald-400/10 text-emerald-300' : 'bg-red-400/10 text-red-300'}`}>
                                        {formData.type === TransactionType.IN ? 'Masuk' : 'Keluar'}
                                    </span>
                                </div>

                                <label htmlFor="isPiutang" className="flex items-center cursor-pointer">
                                    <span className="mr-3 text-sm text-slate-300">Piutang</span>
                                    <div className="relative">
                                        <input type="checkbox" id="isPiutang" name="isPiutang" className="sr-only peer" checked={formData.isPiutang} onChange={handleChange} />
                                        <div className="block bg-slate-600 w-12 h-7 rounded-full transition"></div>
                                        <div className="dot absolute left-1 top-1 bg-white w-5 h-5 rounded-full transition-transform peer-checked:translate-x-full peer-checked:bg-indigo-300"></div>
                                    </div>
                                </label>
                            </div>
                        </div>
                        <div className="px-6 py-4 flex justify-between items-center border-t border-white/10">
                            <div>
                                {transactionToEdit && (
                                    <button 
                                        type="button" 
                                        onClick={() => setIsDeleteConfirmOpen(true)}
                                        className="bg-red-500/10 text-red-400 hover:bg-red-500/20 font-semibold py-2 px-5 rounded-full text-sm transition-colors"
                                    >
                                        Hapus
                                    </button>
                                )}
                            </div>
                            <div className="flex space-x-3">
                                <button type="button" onClick={handleClose} className="text-indigo-200 hover:bg-indigo-400/10 font-semibold py-2 px-5 rounded-full text-sm transition-colors">Batal</button>
                                <button type="submit" className="bg-indigo-400 hover:bg-indigo-500 text-slate-900 font-semibold py-2 px-5 rounded-full text-sm transition-colors">Simpan</button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
            <ConfirmationModal
                isOpen={isDeleteConfirmOpen}
                onClose={() => setIsDeleteConfirmOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Hapus Transaksi"
                message="Apakah Anda yakin ingin menghapus transaksi ini? Tindakan ini akan mengembalikan saldo dompet dan tidak dapat dibatalkan."
            />
        </>
    );
};
export default TransactionModal;