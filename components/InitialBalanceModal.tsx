import React, { useState, useEffect } from 'react';
import { Wallet } from '../types';
import { CloseIcon } from './icons/Icons';

interface InitialBalanceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (updatedWallets: { id: string; initialBalance: number }[]) => Promise<void>;
    wallets: Wallet[];
}

const InitialBalanceModal: React.FC<InitialBalanceModalProps> = ({ isOpen, onClose, onSave, wallets }) => {
    const [balances, setBalances] = useState<Record<string, string>>({});
    const [isVisible, setIsVisible] = useState(false);

    const formatInputValue = (value: number | undefined) => {
        if (value === undefined || value === null) return '';
        // Do not return '0' for empty input, let it be an empty string
        return new Intl.NumberFormat('id-ID').format(value);
    };

    const parseInputValue = (value: string): number => {
        return Number(value.replace(/\./g, '')) || 0;
    };
    
    useEffect(() => {
        if (isOpen) {
            const initialBalances: Record<string, string> = {};
            wallets.forEach(wallet => {
                const defaultValue = wallet.id.toLowerCase() === 'cash' ? 1500000 : 1000000;
                // Use initialBalance if it exists (including 0), otherwise use default
                const balanceValue = wallet.initialBalance ?? defaultValue;
                initialBalances[wallet.id] = formatInputValue(balanceValue);
            });
            setBalances(initialBalances);
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    }, [isOpen, wallets]);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onClose, 300);
    };

    const handleChange = (walletId: string, value: string) => {
        // Allow only numbers
        const numericValue = value.replace(/[^0-9]/g, '');
        const parsedValue = parseInputValue(numericValue);
        setBalances(prev => ({
            ...prev,
            [walletId]: formatInputValue(parsedValue)
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const updatedWallets = Object.entries(balances).map(([id, value]) => ({
            id,
            // FIX: Explicitly cast value to string to resolve TypeScript error where `value` is inferred as `unknown`.
            initialBalance: parseInputValue(String(value))
        }));
        onSave(updatedWallets).then(() => {
            handleClose();
        });
    };

    if (!isOpen) return null;

    return (
        <div
            className={`fixed inset-0 z-50 flex justify-center items-center p-4 transition-opacity duration-300 ease-in-out bg-black/40 backdrop-blur-sm ${isVisible ? 'opacity-100' : 'opacity-0'}`}
            onClick={handleClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="initial-balance-modal-title"
        >
            <div
                className={`bg-white dark:bg-neutral-800 rounded-3xl shadow-2xl w-full max-w-md transform transition-all duration-300 ease-in-out flex flex-col max-h-[90vh] ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6 flex justify-between items-center border-b border-slate-200 dark:border-white/10 flex-shrink-0">
                    <h2 id="initial-balance-modal-title" className="text-xl font-medium text-slate-800 dark:text-white">Atur Modal Awal Dompet</h2>
                    <button onClick={handleClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 dark:text-neutral-300 transition-colors" aria-label="Tutup">
                        <CloseIcon />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="flex flex-col flex-grow min-h-0">
                    <div className="no-scrollbar p-6 overflow-y-auto space-y-4">
                        <p className="text-sm text-slate-500 dark:text-neutral-400">
                            Atur modal awal untuk setiap dompet. Nilai ini tidak akan mempengaruhi saldo Anda saat ini.
                        </p>
                        {wallets.map(wallet => (
                            <div key={wallet.id}>
                                <label htmlFor={`balance-${wallet.id}`} className="block text-sm font-medium text-slate-600 dark:text-neutral-300 mb-2">{wallet.name}</label>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    id={`balance-${wallet.id}`}
                                    value={balances[wallet.id] || ''}
                                    onChange={(e) => handleChange(wallet.id, e.target.value)}
                                    placeholder="0"
                                    className="w-full bg-slate-100 dark:bg-neutral-700 border border-transparent focus:border-blue-400 focus:ring-1 focus:ring-blue-400 rounded-full px-4 py-3 text-sm text-slate-800 dark:text-white transition outline-none"
                                />
                            </div>
                        ))}
                    </div>
                    <div className="px-6 py-4 flex justify-end space-x-3 border-t border-slate-200 dark:border-white/10 flex-shrink-0">
                        <button type="button" onClick={handleClose} className="text-blue-600 hover:bg-blue-100 dark:text-blue-200 dark:hover:bg-blue-400/10 font-semibold py-2 px-5 rounded-full text-sm transition-colors">Batal</button>
                        <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white dark:bg-blue-400 dark:hover:bg-blue-500 dark:text-slate-900 font-semibold py-2 px-5 rounded-full text-sm transition-colors">Simpan</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default InitialBalanceModal;