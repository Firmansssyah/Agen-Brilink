

import React from 'react';
import { Wallet } from '../types';
import { TransferIcon } from './icons/Icons';
import WalletIconComponent from './WalletIconComponent';

interface WalletsSummaryCardProps {
    wallets: Wallet[];
    totalMargin: number;
    formatRupiah: (amount: number) => string;
    onOpenTransferModal: () => void;
}

const WalletsSummaryCard: React.FC<WalletsSummaryCardProps> = ({ wallets, totalMargin, formatRupiah, onOpenTransferModal }) => {
    return (
        <div className="bg-white dark:bg-[#2A282F] rounded-3xl p-4 flex flex-col shadow-lg shadow-slate-200/50 dark:shadow-none">
            {/* Header for Total Keuntungan */}
            <div className="px-1 pb-3 mb-3 border-b border-slate-200 dark:border-white/10 flex justify-between items-center">
                <div>
                    <p className="text-xs text-slate-500 dark:text-[#CAC4D0]">Margin Bulan Ini</p>
                    <p className="text-xl font-bold text-slate-800 dark:text-white">{formatRupiah(totalMargin)}</p>
                </div>
                <div className="flex items-center space-x-2">
                     <button 
                        onClick={onOpenTransferModal}
                        className="bg-sky-100 hover:bg-sky-200 text-sky-700 dark:bg-sky-400/10 dark:hover:bg-sky-400/20 dark:text-sky-200 text-xs font-semibold py-1.5 px-3 rounded-full flex items-center space-x-1.5 transition-colors duration-200"
                        aria-label="Pindah saldo antar dompet"
                    >
                        <TransferIcon className="h-3 w-3" strokeWidth={3} />
                        <span>Pindah Saldo</span>
                    </button>
                </div>
            </div>
            {/* Grid for Wallets */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-3 px-1">
                {wallets.map(wallet => (
                    <div 
                        key={wallet.id} 
                        className="flex items-center space-x-3 min-w-0"
                    >
                        <div className="flex-shrink-0">
                            <WalletIconComponent 
                                walletId={wallet.id}
                                iconUrl={wallet.icon}
                                className="h-8 w-8 text-slate-800 dark:text-white"
                                altText={wallet.name}
                            />
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-xs text-slate-500 dark:text-[#CAC4D0] truncate">{wallet.name}</span>
                            <span className="text-sm font-bold text-slate-700 dark:text-[#E6E1E5] truncate">
                                {formatRupiah(wallet.balance)}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default WalletsSummaryCard;