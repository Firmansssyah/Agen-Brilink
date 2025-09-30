
import React, { useState, useEffect } from 'react';
import { Wallet } from '../types';

interface AddEditWalletModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (wallet: Omit<Wallet, 'id'> | Wallet) => void;
    walletToEdit: Wallet | null;
}

const AddEditWalletModal: React.FC<AddEditWalletModalProps> = ({ isOpen, onClose, onSave, walletToEdit }) => {
    const formInputClass = "w-full bg-slate-100 dark:bg-[#3C3A42] border border-transparent focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 rounded-lg p-3 text-sm text-slate-800 dark:text-white transition outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500";
    
    const formatInputValue = (value: number) => {
        if (value === 0) return '';
        return new Intl.NumberFormat('id-ID').format(value);
    };

    const parseInputValue = (value: string): number => {
        return Number(value.replace(/\./g, '')) || 0;
    };
    
    const getInitialData = () => ({
        name: '',
        balance: 0,
        icon: ''
    });

    const [formData, setFormData] = useState(getInitialData());
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setFormData(walletToEdit || getInitialData());
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    }, [isOpen, walletToEdit]);
    
    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onClose, 300);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        
        let processedValue: string | number = value;

        if (name === 'balance') {
            processedValue = parseInputValue(value);
        }
        
        setFormData(prev => ({
            ...prev,
            [name]: processedValue
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name) {
            alert("Nama dompet harus diisi.");
            return;
        }
        onSave(walletToEdit ? { ...walletToEdit, ...formData } : formData);
    };

    if (!isOpen) return null;

    return (
        <div 
            className={`fixed inset-0 z-50 flex justify-center items-center p-4 transition-opacity duration-300 ease-in-out ${isVisible ? 'opacity-100' : 'opacity-0'}`}
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)'}}
            onClick={handleClose}
        >
            <div 
                className={`bg-white dark:bg-[#2F2D35] rounded-3xl shadow-2xl w-full max-w-md transform transition-all duration-300 ease-in-out ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6">
                    <h2 className="text-xl font-medium text-slate-800 dark:text-white">{walletToEdit ? 'Edit Dompet' : 'Tambah Dompet Baru'}</h2>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">Nama Dompet</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} className={formInputClass} required />
                        </div>
                        <div>
                            <label htmlFor="balance" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">Saldo Awal</label>
                            <input 
                                type="text"
                                inputMode="numeric"
                                name="balance"
                                placeholder="cth: 1.000.000"
                                value={formatInputValue(formData.balance)}
                                onChange={handleChange}
                                className={formInputClass}
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="icon" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">URL Ikon (Opsional)</label>
                            <input type="text" name="icon" value={formData.icon} onChange={handleChange} className={formInputClass} />
                        </div>
                    </div>
                    <div className="px-6 py-4 flex justify-end space-x-3">
                        <button type="button" onClick={handleClose} className="text-indigo-600 hover:bg-indigo-100 dark:text-indigo-200 dark:hover:bg-indigo-400/10 font-semibold py-2 px-5 rounded-full text-sm transition-colors">Batal</button>
                        <button type="submit" className="bg-indigo-500 hover:bg-indigo-600 text-white dark:bg-indigo-400 dark:hover:bg-indigo-500 dark:text-slate-900 font-semibold py-2 px-5 rounded-full text-sm transition-colors">Simpan</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddEditWalletModal;