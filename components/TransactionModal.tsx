import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Transaction, TransactionType, Wallet } from '../types';
import { ChevronDownIcon, CheckIcon, DeleteIcon } from './icons/Icons';
// FIX: Changed to named import
import { WalletIconComponent } from './WalletIconComponent';
import DatePicker from './DatePicker';
import ConfirmationModal from './ConfirmationModal';

interface TransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Transaction | Omit<Transaction, 'id' | 'date'>) => void;
    onDeleteTransaction: (transactionId: string) => void;
    transactionToEdit: Transaction | null;
    wallets: Wallet[];
    categories: string[];
    customers: string[];
    formatRupiah: (amount: number) => string;
}

const toYYYYMMDD = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// Define a type for the form data to allow null for numeric inputs, distinguishing empty from zero.
type FormDataType = Omit<Transaction, 'id' | 'date' | 'amount' | 'margin' | 'isDeleting' | 'notes'> & {
    date: string;
    amount: number | null;
    margin: number | null;
    notes?: string;
};


const TransactionModal: React.FC<TransactionModalProps> = ({ isOpen, onClose, onSave, onDeleteTransaction, transactionToEdit, wallets, categories, customers, formatRupiah }) => {
    const getInitialData = useCallback((): FormDataType => {
        const defaultDescription = categories[0] || '';
        const defaultType = defaultDescription === 'Tarik Tunai' ? TransactionType.IN : TransactionType.OUT;
        return {
            date: new Date().toISOString(),
            description: defaultDescription,
            customer: '',
            type: defaultType,
            amount: null,
            margin: null,
            wallet: wallets.filter(w => w.id !== 'CASH')[0]?.id || '',
            isPiutang: false,
            marginType: 'dalam' as 'dalam' | 'luar',
            isInternalTransfer: false,
            notes: '',
        };
    }, [categories, wallets]);

    const [formData, setFormData] = useState<FormDataType>(getInitialData());
    const [isVisible, setIsVisible] = useState(false);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [showMarginSuggestions, setShowMarginSuggestions] = useState(false);
    const [showNotes, setShowNotes] = useState(false);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);


    const marginSuggestions = useMemo(() => {
        const specialCategories = ['Pulsa', 'Listrik', 'Lainnya'];
        if (specialCategories.includes(formData.description)) {
            return [1500, 2000, 2500, 3000, 5000];
        }
        return [2500, 3000, 5000, 7500, 10000];
    }, [formData.description]);

    const formatInputValue = (value: number | null) => {
        if (value === null) return '';
        return new Intl.NumberFormat('id-ID').format(value);
    };

    const parseInputValue = (value: string): number | null => {
        if (value.trim() === '') return null;
        const num = Number(value.replace(/\./g, ''));
        return isNaN(num) ? null : num;
    };

    useEffect(() => {
        if (isOpen) {
            const baseData = getInitialData();
            const mergedData = transactionToEdit ? { ...baseData, ...transactionToEdit } : baseData;
            setFormData(mergedData as FormDataType);
            setShowNotes(!!transactionToEdit?.notes && transactionToEdit.notes.trim() !== '');
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    }, [isOpen, transactionToEdit, getInitialData]);


    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Wait for animation
    };

    const updateSuggestions = useCallback((value: string) => {
        if (value.trim() === '') {
            setSuggestions([]);
            setShowSuggestions(false);
        } else {
            const filteredSuggestions = customers.filter(customer =>
                customer.toLowerCase().includes(value.toLowerCase())
            );
            setSuggestions(filteredSuggestions);
            setShowSuggestions(filteredSuggestions.length > 0);
        }
    }, [customers]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        
        let processedValue: string | number | boolean | null = value;

        if (name === 'amount' || name === 'margin') {
            processedValue = parseInputValue(value);
        } else if (e.target instanceof HTMLInputElement && e.target.type === 'checkbox') {
             processedValue = e.target.checked;
        }

        if (name === 'customer') {
            updateSuggestions(value);
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
    
     const handleDateChange = (dateString: string) => { // dateString is 'YYYY-MM-DD'
        if (!dateString) return;
        const [year, month, day] = dateString.split('-').map(Number);
        
        // Use current time for new transactions, preserve time for edited ones.
        const baseDate = new Date(formData.date || Date.now());

        const newDate = new Date(
            year,
            month - 1,
            day,
            baseDate.getHours(),
            baseDate.getMinutes(),
            baseDate.getSeconds()
        );

        setFormData(prev => ({ ...prev, date: newDate.toISOString() }));
    };

    const handleSuggestionClick = (customerName: string) => {
        setFormData(prev => ({ ...prev, customer: customerName }));
        setShowSuggestions(false);
        setSuggestions([]);
    };
    
    const handleCustomerFocus = () => {
        if (formData.customer.trim() === '') {
            setSuggestions(customers);
            setShowSuggestions(customers.length > 0);
        } else {
            updateSuggestions(formData.customer);
        }
    };


    const handleWalletChange = (walletId: string) => {
        setFormData(prev => ({...prev, wallet: walletId}));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Updated validation: amount can be 0, but not empty (null).
        if (!formData.description || formData.amount === null || formData.amount < 0 || !formData.wallet) {
            alert('Deskripsi, Jumlah (tidak boleh kosong), dan Dompet harus diisi.');
            return;
        }
        
        // Default customer name to "Pelanggan" if empty
        const customerName = formData.customer.trim() === '' ? 'Pelanggan' : formData.customer;

        // Convert null margin back to 0 before saving.
        const dataToSave = {
            ...formData,
            customer: customerName,
            amount: formData.amount,
            margin: formData.margin ?? 0,
        };
        onSave(dataToSave as Transaction);
    };

    const handleDelete = () => {
        setIsDeleteConfirmOpen(true);
    };
    
    const handleConfirmDelete = () => {
        if (transactionToEdit) {
            onDeleteTransaction(transactionToEdit.id);
        }
        setIsDeleteConfirmOpen(false);
        handleClose();
    };
    
    const handleMarginSuggestionClick = (amount: number) => {
        setFormData(prev => ({ ...prev, margin: amount }));
        setShowMarginSuggestions(false);
    };
    
    if (!isOpen) return null;

    const formInputClass = "w-full bg-slate-100 dark:bg-neutral-700 border border-transparent focus:border-blue-400 focus:ring-1 focus:ring-blue-400 rounded-full px-4 py-3 text-sm text-slate-800 dark:text-white transition outline-none placeholder:text-slate-400 dark:placeholder:text-neutral-500 disabled:opacity-70 disabled:cursor-not-allowed";
    const formSelectClass = `${formInputClass} appearance-none`;
    const formLabelClass = "block text-sm font-medium text-slate-600 dark:text-neutral-300 mb-2 px-2";

    return (
        <>
            <div 
                className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ease-in-out bg-black/40 backdrop-blur-sm ${isVisible ? 'opacity-100' : 'opacity-0'}`}
                onClick={handleClose}
            >
                <div 
                    className={`bg-white dark:bg-neutral-800 rounded-3xl shadow-2xl w-full max-w-lg transform transition-all duration-300 ease-in-out flex flex-col max-h-[90vh] ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
                    onClick={(e) => e.stopPropagation()}
                >
                     <div className="p-6 border-b border-slate-200 dark:border-white/10 flex-shrink-0">
                        <h2 className="text-xl font-medium text-slate-800 dark:text-white">{transactionToEdit ? 'Edit Transaksi' : 'Tambah Transaksi Baru'}</h2>
                    </div>
                    <form onSubmit={handleSubmit} className="flex flex-col flex-grow min-h-0">
                        <div className="no-scrollbar p-6 flex flex-col gap-5 overflow-y-auto">
                            {/* Transaction Details */}
                            <div>
                                <label htmlFor="description" className={formLabelClass}>Jenis Transaksi</label>
                                <div className="relative">
                                    <select id="description" name="description" value={formData.description} onChange={handleChange} className={formSelectClass} required>
                                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-neutral-400">
                                        <ChevronDownIcon />
                                    </div>
                                </div>
                            </div>
                            <div className="relative">
                                <label htmlFor="customer" className={formLabelClass}>Pelanggan</label>
                                <input
                                    type="text"
                                    id="customer"
                                    name="customer"
                                    placeholder="cth: Budi Santoso (Opsional)"
                                    value={formData.customer}
                                    onChange={handleChange}
                                    onFocus={handleCustomerFocus}
                                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                    className={formInputClass}
                                    autoComplete="off"
                                />
                                {showSuggestions && suggestions.length > 0 && (
                                    <ul className="absolute z-10 w-full bg-white dark:bg-neutral-700 border border-slate-300 dark:border-neutral-600 rounded-2xl mt-2 max-h-40 overflow-y-auto shadow-lg animate-fade-in">
                                        {suggestions.map((suggestion) => (
                                            <li
                                                key={suggestion}
                                                className="px-4 py-2 text-sm text-slate-700 dark:text-white cursor-pointer hover:bg-blue-500 hover:text-white dark:hover:bg-blue-500/50"
                                                onMouseDown={() => handleSuggestionClick(suggestion)}
                                            >
                                                {suggestion}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            {transactionToEdit && (
                                <div>
                                    <label htmlFor="date" className={formLabelClass}>Tanggal</label>
                                    <DatePicker
                                        value={formData.date ? toYYYYMMDD(new Date(formData.date)) : ''}
                                        onChange={handleDateChange}
                                    />
                                </div>
                            )}


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
                                 <div className="relative">
                                    <label htmlFor="margin" className={formLabelClass}>Margin (Rp)</label>
                                    <input 
                                        type="text"
                                        inputMode="numeric"
                                        id="margin"
                                        name="margin"
                                        placeholder="cth: 6.500"
                                        value={formatInputValue(formData.margin)}
                                        onChange={handleChange}
                                        onFocus={() => setShowMarginSuggestions(true)}
                                        onBlur={() => setTimeout(() => setShowMarginSuggestions(false), 200)}
                                        className={formInputClass}
                                    />
                                    {showMarginSuggestions && (
                                        <ul className="absolute z-10 w-full bg-white dark:bg-neutral-700 border border-slate-300 dark:border-neutral-600 rounded-2xl mt-2 max-h-48 overflow-y-auto shadow-lg animate-fade-in">
                                            {marginSuggestions.map((suggestion) => (
                                                <li
                                                    key={suggestion}
                                                    className="px-4 py-2 text-sm text-slate-700 dark:text-white cursor-pointer hover:bg-blue-500 hover:text-white dark:hover:bg-blue-500/50"
                                                    onMouseDown={() => handleMarginSuggestionClick(suggestion)}
                                                >
                                                    {formatInputValue(suggestion)}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>
                            
                            {/* Margin Type Selector */}
                            {formData.description === 'Tarik Tunai' && (
                                <div>
                                    <label className={formLabelClass}>Tipe Margin</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, marginType: 'dalam' }))}
                                            className={`px-3 py-2 text-sm font-semibold rounded-full border-2 transition-colors duration-200 text-center ${
                                                (formData as Transaction).marginType === 'dalam' || !(formData as Transaction).marginType
                                                    ? 'bg-blue-100 text-blue-700 border-blue-400 dark:bg-blue-400/20 dark:text-blue-200 dark:border-blue-400'
                                                    : 'bg-slate-100 text-slate-600 border-transparent hover:border-slate-400 dark:bg-neutral-700/50 dark:text-neutral-300 dark:hover:border-neutral-500'
                                            }`}
                                        >
                                            Admin Dalam
                                            <p className="text-xs font-normal text-slate-500 dark:text-neutral-400">(Margin ke Dompet)</p>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, marginType: 'luar' }))}
                                            className={`px-3 py-2 text-sm font-semibold rounded-full border-2 transition-colors duration-200 text-center ${
                                                (formData as Transaction).marginType === 'luar'
                                                    ? 'bg-blue-100 text-blue-700 border-blue-400 dark:bg-blue-400/20 dark:text-blue-200 dark:border-blue-400'
                                                    : 'bg-slate-100 text-slate-600 border-transparent hover:border-slate-400 dark:bg-neutral-700/50 dark:text-neutral-300 dark:hover:border-neutral-500'
                                            }`}
                                        >
                                            Admin Luar
                                            <p className="text-xs font-normal text-slate-500 dark:text-neutral-400">(Margin ke Kas)</p>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Source & Modifiers */}
                            <div>
                                <label className={formLabelClass}>Dompet</label>
                                <div className="grid grid-cols-5 gap-3">
                                    {wallets.filter(w => w.id !== 'CASH').map(wallet => (
                                        <button
                                            key={wallet.id}
                                            type="button"
                                            onClick={() => handleWalletChange(wallet.id)}
                                            className={`relative flex items-center justify-center p-3 rounded-xl transition-all duration-200 bg-white dark:bg-neutral-800/30 aspect-square has-tooltip ${
                                                formData.wallet === wallet.id
                                                    ? 'ring-2 ring-blue-400 shadow-lg'
                                                    : 'hover:ring-2 hover:ring-blue-300'
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
                                                 <div className="absolute top-1.5 right-1.5 bg-blue-500 rounded-full p-0.5 flex items-center justify-center">
                                                    <CheckIcon className="h-3 w-3 text-white" />
                                                </div>
                                            )}
                                            <div className="tooltip absolute -top-8 bg-slate-700 dark:bg-neutral-900 text-white text-xs px-2 py-1 rounded-md pointer-events-none">
                                                {wallet.name}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            
                            <div>
                                {showNotes ? (
                                    <div>
                                        <label htmlFor="notes" className={formLabelClass}>Catatan</label>
                                        <input
                                            type="text"
                                            id="notes"
                                            name="notes"
                                            placeholder="cth: untuk bayar arisan"
                                            value={formData.notes || ''}
                                            onChange={handleChange}
                                            className={formInputClass}
                                            autoComplete="off"
                                            autoFocus
                                        />
                                    </div>
                                ) : (
                                    <div className="pt-2">
                                        <button
                                            type="button"
                                            onClick={() => setShowNotes(true)}
                                            className="w-full text-center py-2 px-4 border-2 border-dashed border-slate-300 dark:border-neutral-600 rounded-full text-sm font-semibold text-slate-500 dark:text-neutral-400 hover:bg-slate-100 dark:hover:bg-neutral-700 hover:border-slate-400 dark:hover:border-neutral-500 transition-colors"
                                        >+ Tambah Catatan</button>
                                    </div>
                                )}
                            </div>
                            
                            <div className="flex justify-between items-center pt-2">
                                <div className="flex items-center gap-3">
                                    <span className={formLabelClass + ' mb-0'}>Tipe Transaksi:</span>
                                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${formData.type === TransactionType.IN ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-400/10 dark:text-emerald-300' : 'bg-red-100 text-red-800 dark:bg-red-400/10 dark:text-red-300'}`}>
                                        {formData.type === TransactionType.IN ? 'Masuk' : 'Keluar'}
                                    </span>
                                </div>

                                <label htmlFor="isPiutang" className={`flex items-center cursor-pointer`}>
                                    <span className="mr-3 text-sm text-slate-600 dark:text-neutral-300">Piutang</span>
                                    <div className="relative">
                                        <input type="checkbox" id="isPiutang" name="isPiutang" className="sr-only peer" checked={formData.isPiutang} onChange={handleChange}/>
                                        <div className="block bg-slate-300 dark:bg-neutral-600 w-12 h-7 rounded-full transition"></div>
                                        <div className="dot absolute left-1 top-1 bg-white w-5 h-5 rounded-full transition-transform peer-checked:translate-x-full peer-checked:bg-blue-300"></div>
                                    </div>
                                </label>
                            </div>
                        </div>
                        <div className="px-6 py-4 flex justify-between items-center border-t border-slate-200 dark:border-white/10 flex-shrink-0">
                            <div>
                                {transactionToEdit && (
                                    <button 
                                        type="button" 
                                        onClick={handleDelete}
                                        className="bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20 font-semibold py-2 px-5 rounded-full text-sm transition-colors"
                                    >
                                        Hapus
                                    </button>
                                )}
                            </div>
                            <div className="flex space-x-3">
                                <button type="button" onClick={handleClose} className="text-blue-600 hover:bg-blue-100 dark:text-blue-200 dark:hover:bg-blue-400/10 font-semibold py-2 px-5 rounded-full text-sm transition-colors">Batal</button>
                                <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white dark:bg-blue-400 dark:hover:bg-blue-500 dark:text-slate-900 font-semibold py-2 px-5 rounded-full text-sm transition-colors">Simpan</button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
            {transactionToEdit && (
                <ConfirmationModal
                    isOpen={isDeleteConfirmOpen}
                    onClose={() => setIsDeleteConfirmOpen(false)}
                    onConfirm={handleConfirmDelete}
                    title="Hapus Transaksi"
                    message="Apakah Anda yakin ingin menghapus transaksi ini? Tindakan ini tidak dapat dibatalkan."
                    confirmText="Ya, Hapus"
                    confirmColor="bg-red-600 hover:bg-red-700"
                />
            )}
        </>
    );
};
export default TransactionModal;