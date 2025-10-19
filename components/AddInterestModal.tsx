import React, { useState, useEffect } from 'react';
import { Wallet } from '../types';
import { ChevronDownIcon, CloseIcon } from './icons/Icons';
import DatePicker from './DatePicker';

interface AddInterestModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: { walletId: string; amount: number; date: string; }) => Promise<void>;
    wallets: Wallet[];
}

const toYYYYMMDD = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const AddInterestModal: React.FC<AddInterestModalProps> = ({ isOpen, onClose, onSave, wallets }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [walletId, setWalletId] = useState('');
    const [amount, setAmount] = useState(0);
    const [date, setDate] = useState(toYYYYMMDD(new Date()));
    const [error, setError] = useState('');
    
    // Wallets that can earn interest, excluding CASH
    const bankWallets = wallets.filter(w => w.id !== 'CASH');

    const formatInputValue = (value: number) => {
        if (value === 0) return '';
        return new Intl.NumberFormat('id-ID').format(value);
    };

    const parseInputValue = (value: string): number => {
        return Number(value.replace(/\./g, '')) || 0;
    };
    
    useEffect(() => {
        if (isOpen) {
            // Default to SeaBank if it exists, otherwise the first bank wallet
            const seaBank = bankWallets.find(w => w.id.toUpperCase().includes('SEABANK'));
            setWalletId(seaBank?.id || bankWallets[0]?.id || '');
            setAmount(0);
            setDate(toYYYYMMDD(new Date()));
            setError('');
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    }, [isOpen, wallets]);

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
            setError('Jumlah bunga harus lebih besar dari 0.');
            return;
        }
        if (!walletId) {
            setError('Pilih dompet tujuan.');
            return;
        }
        
        // Convert YYYY-MM-DD back to a full ISO string
        const [year, month, day] = date.split('-').map(Number);
        const submissionDate = new Date(year, month - 1, day);
        // Set a fixed time late in the day to avoid sorting issues with transactions made on the same day.
        submissionDate.setHours(23, 59, 58);

        await onSave({ walletId, amount, date: submissionDate.toISOString() });
    };

    if (!isOpen) return null;

    return (
        <div
            className={`fixed inset-0 z-50 flex justify-center items-center p-4 transition-opacity duration-300 ease-in-out bg-black/40 backdrop-blur-sm ${isVisible ? 'opacity-100' : 'opacity-0'}`}
            onClick={handleClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-interest-modal-title"
        >
            <div
                className={`bg-white dark:bg-neutral-800 rounded-3xl shadow-2xl w-full max-w-md transform transition-all duration-300 ease-in-out ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6 flex justify-between items-center border-b border-slate-200 dark:border-white/10">
                    <h2 id="add-interest-modal-title" className="text-xl font-medium text-slate-800 dark:text-white">Catat Bunga Bank</h2>
                    <button onClick={handleClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 dark:text-neutral-300 transition-colors" aria-label="Tutup">
                        <CloseIcon />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-5">
                        <p className="text-sm text-slate-500 dark:text-neutral-400 -mt-2">
                            Catat bunga yang diterima dari bank. Jumlah ini akan ditambahkan ke saldo dompet dan dihitung sebagai margin.
                        </p>
                         <div>
                            <label htmlFor="walletIdInterest" className="block text-sm font-medium text-slate-600 dark:text-neutral-300 mb-2">Dompet Tujuan</label>
                            <div className="relative">
                                <select
                                    id="walletIdInterest"
                                    value={walletId}
                                    onChange={(e) => setWalletId(e.target.value)}
                                    className="w-full bg-slate-100 dark:bg-neutral-700 border border-transparent focus:border-blue-400 focus:ring-1 focus:ring-blue-400 rounded-full px-4 py-3 text-sm text-slate-800 dark:text-white transition outline-none appearance-none"
                                >
                                    {bankWallets.length > 0 ? (
                                        bankWallets.map(w => <option key={w.id} value={w.id}>{w.name}</option>)
                                    ) : (
                                        <option disabled>Tidak ada dompet bank</option>
                                    )}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-neutral-400">
                                    <ChevronDownIcon />
                                </div>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="amountInterest" className="block text-sm font-medium text-slate-600 dark:text-neutral-300 mb-2">Jumlah Bunga (Rp)</label>
                            <input
                                type="text"
                                inputMode="numeric"
                                id="amountInterest"
                                value={formatInputValue(amount)}
                                onChange={handleAmountChange}
                                placeholder="cth: 15.000"
                                className="w-full bg-slate-100 dark:bg-neutral-700 border border-transparent focus:border-blue-400 focus:ring-1 focus:ring-blue-400 rounded-full px-4 py-3 text-sm text-slate-800 dark:text-white transition outline-none"
                                required
                                autoFocus
                            />
                        </div>
                        <div>
                            <label htmlFor="dateInterest" className="block text-sm font-medium text-slate-600 dark:text-neutral-300 mb-2">Tanggal</label>
                            <DatePicker
                                value={date}
                                onChange={setDate}
                            />
                        </div>
                        {error && <p className="text-sm text-red-500 dark:text-red-400 text-center">{error}</p>}
                    </div>
                    <div className="px-6 py-4 flex justify-end space-x-3 border-t border-slate-200 dark:border-white/10">
                        <button type="button" onClick={handleClose} className="text-blue-600 hover:bg-blue-100 dark:text-blue-200 dark:hover:bg-blue-400/10 font-semibold py-2 px-5 rounded-full text-sm transition-colors">Batal</button>
                        <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white dark:bg-blue-400 dark:hover:bg-blue-500 dark:text-slate-900 font-semibold py-2 px-5 rounded-full text-sm transition-colors">Simpan Bunga</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddInterestModal;
