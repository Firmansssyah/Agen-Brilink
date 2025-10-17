import React, { useState, useEffect } from 'react';
import { Wallet } from '../types';
import { ChevronDownIcon, CloseIcon } from './icons/Icons';

interface BankFeeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: { walletId: string; amount: number; }) => Promise<void>;
    wallets: Wallet[];
}

const BankFeeModal: React.FC<BankFeeModalProps> = ({ isOpen, onClose, onSave, wallets }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [walletId, setWalletId] = useState('');
    const [amount, setAmount] = useState(0);
    const [error, setError] = useState('');

    const bankWallets = wallets.filter(w => w.id === 'BRI' || w.id === 'BRILINK');
    
    const formatInputValue = (value: number) => {
        if (value === 0) return '';
        return new Intl.NumberFormat('id-ID').format(value);
    };

    const parseInputValue = (value: string): number => {
        return Number(value.replace(/\./g, '')) || 0;
    };
    
    useEffect(() => {
        if (isOpen) {
            setWalletId(bankWallets[0]?.id || '');
            setAmount(0);
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
            setError('Jumlah potongan harus lebih besar dari 0.');
            return;
        }
        if (!walletId) {
            setError('Pilih dompet yang akan dipotong.');
            return;
        }
        await onSave({ walletId, amount });
    };

    if (!isOpen) return null;

    return (
        <div
            className={`fixed inset-0 z-50 flex justify-center items-center p-4 transition-opacity duration-300 ease-in-out bg-black/40 backdrop-blur-sm ${isVisible ? 'opacity-100' : 'opacity-0'}`}
            onClick={handleClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="bank-fee-modal-title"
        >
            <div
                className={`bg-white dark:bg-neutral-800 rounded-3xl shadow-2xl w-full max-w-md transform transition-all duration-300 ease-in-out ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6 flex justify-between items-center border-b border-slate-200 dark:border-white/10">
                    <h2 id="bank-fee-modal-title" className="text-xl font-medium text-slate-800 dark:text-white">Potongan Biaya Bank</h2>
                    <button onClick={handleClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 dark:text-neutral-300 transition-colors" aria-label="Tutup">
                        <CloseIcon />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-5">
                        <p className="text-sm text-slate-500 dark:text-neutral-400 -mt-2">
                            Catat potongan biaya administrasi bulanan dari bank untuk dompet BRILink atau BRI.
                        </p>
                         <div>
                            <label htmlFor="walletIdFee" className="block text-sm font-medium text-slate-600 dark:text-neutral-300 mb-2">Dompet</label>
                            <div className="relative">
                                <select
                                    id="walletIdFee"
                                    value={walletId}
                                    onChange={(e) => setWalletId(e.target.value)}
                                    className="w-full bg-slate-100 dark:bg-neutral-700 border border-transparent focus:border-blue-400 focus:ring-1 focus:ring-blue-400 rounded-full px-4 py-3 text-sm text-slate-800 dark:text-white transition outline-none appearance-none"
                                >
                                    {bankWallets.length > 0 ? (
                                        bankWallets.map(w => <option key={w.id} value={w.id}>{w.name}</option>)
                                    ) : (
                                        <option disabled>Tidak ada dompet BRI/BRILink</option>
                                    )}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-neutral-400">
                                    <ChevronDownIcon />
                                </div>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="amountFee" className="block text-sm font-medium text-slate-600 dark:text-neutral-300 mb-2">Jumlah Potongan (Rp)</label>
                            <input
                                type="text"
                                inputMode="numeric"
                                id="amountFee"
                                value={formatInputValue(amount)}
                                onChange={handleAmountChange}
                                placeholder="cth: 12.500"
                                className="w-full bg-slate-100 dark:bg-neutral-700 border border-transparent focus:border-blue-400 focus:ring-1 focus:ring-blue-400 rounded-full px-4 py-3 text-sm text-slate-800 dark:text-white transition outline-none"
                                required
                                autoFocus
                            />
                        </div>
                        {error && <p className="text-sm text-red-500 dark:text-red-400 text-center">{error}</p>}
                    </div>
                    <div className="px-6 py-4 flex justify-end space-x-3 border-t border-slate-200 dark:border-white/10">
                        <button type="button" onClick={handleClose} className="text-blue-600 hover:bg-blue-100 dark:text-blue-200 dark:hover:bg-blue-400/10 font-semibold py-2 px-5 rounded-full text-sm transition-colors">Batal</button>
                        <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white dark:bg-blue-400 dark:hover:bg-blue-500 dark:text-slate-900 font-semibold py-2 px-5 rounded-full text-sm transition-colors">Simpan Potongan</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BankFeeModal;