import React, { useState } from 'react';
// Fix: Removed WalletId as it is no longer exported from types.
import { Transaction, TransactionType, Wallet } from '../types';
import { ChevronDownIcon } from '../components/icons/Icons';

interface AddTransactionPageProps {
    onAddTransaction: (newTransaction: Omit<Transaction, 'id' | 'date'>) => void;
    wallets: Wallet[];
    categories: string[];
}

const AddTransactionPage: React.FC<AddTransactionPageProps> = ({ onAddTransaction, wallets, categories }) => {
    const formInputClass = "w-full bg-[#3C3A42] border border-slate-600 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 rounded-lg p-3 text-sm text-white transition outline-none";
    const formSelectClass = `${formInputClass} appearance-none`;
    
    const initialData = {
        description: categories.length > 0 ? categories[0] : '',
        customer: '',
        type: TransactionType.OUT,
        amount: 0,
        margin: 0,
        // Fix: Changed default wallet from non-existent enum to the first wallet's ID.
        wallet: wallets.length > 0 ? wallets[0].id : '',
        isPiutang: false,
    };

    const formatInputValue = (value: number) => {
        if (value === 0) return '';
        return new Intl.NumberFormat('id-ID').format(value);
    };

    const parseInputValue = (value: string): number => {
        return Number(value.replace(/\./g, '')) || 0;
    };
    
    const [newData, setNewData] = useState(initialData);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        
        let processedValue: string | number | boolean = value;

        if (name === 'amount' || name === 'margin') {
            processedValue = parseInputValue(value);
        } else if (e.target instanceof HTMLInputElement && e.target.type === 'checkbox') {
             processedValue = e.target.checked;
        }

        setNewData(prev => ({ ...prev, [name]: processedValue }));
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newData.description || newData.amount <= 0) {
            alert('Deskripsi dan Jumlah harus diisi dan lebih besar dari 0.');
            return;
        }
        onAddTransaction(newData);
    };
    
    return (
        <main className="p-4 sm:p-6 lg:p-8 flex-1">
           <div className="max-w-4xl mx-auto">
             <form onSubmit={handleSubmit} className="bg-slate-800/50 border border-slate-700/50 rounded-xl shadow-2xl">
                {/* Form Body */}
                <div className="p-6 sm:p-8 space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-slate-300 mb-2">Deskripsi</label>
                             <div className="relative">
                                <select name="description" value={newData.description} onChange={handleChange} className={formSelectClass}>
                                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                                    <ChevronDownIcon />
                                </div>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="customer" className="block text-sm font-medium text-slate-300 mb-2">Pelanggan</label>
                            <input type="text" name="customer" placeholder="Nama Pelanggan" value={newData.customer} onChange={handleChange} className={formInputClass} />
                        </div>
                    </div>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="amount" className="block text-sm font-medium text-slate-300 mb-2">Jumlah (Rp)</label>
                            <input 
                                type="text"
                                inputMode="numeric"
                                name="amount"
                                placeholder="Contoh: 500.000"
                                value={formatInputValue(newData.amount)}
                                onChange={handleChange}
                                className={formInputClass}
                            />
                        </div>
                         <div>
                            <label htmlFor="margin" className="block text-sm font-medium text-slate-300 mb-2">Margin (Rp)</label>
                            <input
                                type="text"
                                inputMode="numeric"
                                name="margin"
                                placeholder="Contoh: 2.500"
                                value={formatInputValue(newData.margin)}
                                onChange={handleChange}
                                className={formInputClass}
                            />
                        </div>
                    </div>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                             <label htmlFor="type" className="block text-sm font-medium text-slate-300 mb-2">Tipe</label>
                            <div className="relative">
                                <select name="type" value={newData.type} onChange={handleChange} className={formSelectClass}>
                                    <option value={TransactionType.IN}>IN (Masuk)</option>
                                    <option value={TransactionType.OUT}>OUT (Keluar)</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                                    <ChevronDownIcon />
                                </div>
                            </div>
                        </div>
                         <div>
                            <label htmlFor="wallet" className="block text-sm font-medium text-slate-300 mb-2">Dompet</label>
                            <div className="relative">
                                <select name="wallet" value={newData.wallet} onChange={handleChange} className={formSelectClass}>
                                    {wallets.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                                    <ChevronDownIcon />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center pt-2">
                        <input type="checkbox" name="isPiutang" checked={newData.isPiutang} onChange={handleChange} id="isPiutang" className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-blue-600 focus:ring-blue-500" />
                        <label htmlFor="isPiutang" className="ml-3 block text-sm text-slate-300">Tandai sebagai Piutang</label>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 bg-slate-800/50 border-t border-slate-700/50 flex justify-end space-x-3 rounded-b-xl">
                    <button type="button" onClick={() => setNewData(initialData)} className="bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-5 rounded-lg transition-colors duration-300 text-sm">
                        Reset
                    </button>
                    <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-5 rounded-lg transition-colors duration-300 text-sm">
                        Simpan Transaksi
                    </button>
                </div>
            </form>
           </div>
        </main>
    );
};

export default AddTransactionPage;