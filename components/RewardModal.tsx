import React, { useState, useEffect } from 'react';
import { Wallet } from '../types';
import { CloseIcon, ChevronDownIcon } from './icons/Icons';

interface RewardModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: { rewardName: string; cost: number; walletId: string; }) => void;
    customerName: string | null;
}

const RewardModal: React.FC<RewardModalProps> = ({ isOpen, onClose, onSave, customerName }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [rewardName, setRewardName] = useState('');
    const [cost, setCost] = useState<number | null>(null);
    const [error, setError] = useState('');

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
            setRewardName('');
            setCost(null);
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!rewardName.trim()) {
            setError('Nama hadiah harus diisi.');
            return;
        }
        if (cost === null || cost <= 0) {
            setError('Biaya hadiah harus lebih besar dari 0.');
            return;
        }
        onSave({ rewardName, cost, walletId: 'CASH' });
    };

    if (!isOpen) return null;

    return (
        <div
            className={`fixed inset-0 z-50 flex justify-center items-center p-4 transition-opacity duration-300 ease-in-out bg-black/40 backdrop-blur-sm ${isVisible ? 'opacity-100' : 'opacity-0'}`}
            onClick={handleClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="reward-modal-title"
        >
            <div
                className={`bg-white dark:bg-neutral-800 rounded-3xl shadow-2xl w-full max-w-md transform transition-all duration-300 ease-in-out ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6 flex justify-between items-center border-b border-slate-200 dark:border-white/10">
                    <div>
                        <h2 id="reward-modal-title" className="text-xl font-medium text-slate-800 dark:text-white">Beri Reward</h2>
                        <p className="text-sm text-slate-500 dark:text-neutral-400">Untuk: {customerName}</p>
                    </div>
                    <button onClick={handleClose} className="p-2 -mr-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 dark:text-neutral-300 transition-colors" aria-label="Tutup">
                        <CloseIcon />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-5">
                        <div>
                            <label htmlFor="rewardName" className="block text-sm font-medium text-slate-600 dark:text-neutral-300 mb-2">Nama Hadiah</label>
                            <input
                                type="text"
                                id="rewardName"
                                value={rewardName}
                                onChange={(e) => setRewardName(e.target.value)}
                                placeholder="cth: Beras 5kg"
                                className="w-full bg-slate-100 dark:bg-neutral-700 border border-transparent focus:border-blue-400 focus:ring-1 focus:ring-blue-400 rounded-full px-4 py-3 text-sm text-slate-800 dark:text-white transition outline-none"
                                required
                                autoFocus
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2 sm:col-span-1">
                                <label htmlFor="cost" className="block text-sm font-medium text-slate-600 dark:text-neutral-300 mb-2">Biaya (Rp)</label>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    id="cost"
                                    value={formatInputValue(cost)}
                                    onChange={(e) => setCost(parseInputValue(e.target.value))}
                                    placeholder="cth: 75.000"
                                    className="w-full bg-slate-100 dark:bg-neutral-700 border border-transparent focus:border-blue-400 focus:ring-1 focus:ring-blue-400 rounded-full px-4 py-3 text-sm text-slate-800 dark:text-white transition outline-none"
                                    required
                                />
                            </div>
                            <div className="col-span-2 sm:col-span-1">
                                 <label className="block text-sm font-medium text-slate-600 dark:text-neutral-300 mb-2">Sumber Dana</label>
                                 <div className="w-full bg-slate-100 dark:bg-neutral-700/60 rounded-full px-4 py-3 text-sm text-slate-500 dark:text-neutral-400 text-center font-semibold">
                                    Kas Tunai
                                 </div>
                            </div>
                        </div>
                        {error && <p className="text-sm text-red-500 dark:text-red-400 text-center">{error}</p>}
                    </div>
                    <div className="px-6 py-4 flex justify-end space-x-3 border-t border-slate-200 dark:border-white/10">
                        <button type="button" onClick={handleClose} className="text-blue-600 hover:bg-blue-100 dark:text-blue-200 dark:hover:bg-blue-400/10 font-semibold py-2 px-5 rounded-full text-sm transition-colors">Batal</button>
                        <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white dark:bg-blue-400 dark:hover:bg-blue-500 dark:text-slate-900 font-semibold py-2 px-5 rounded-full text-sm transition-colors">Simpan Reward</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RewardModal;