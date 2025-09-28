
import React from 'react';
import { Wallet } from '../types';
import { PlusIcon } from './icons/Icons';

interface WalletsSummaryCardProps {
    wallets: Wallet[];
    totalMargin: number;
    formatRupiah: (amount: number) => string;
    onAddFee: () => void;
}

const WalletsSummaryCard: React.FC<WalletsSummaryCardProps> = ({ wallets, totalMargin, formatRupiah, onAddFee }) => {
    return (
        <div className="bg-[#2A282F] rounded-3xl p-4 flex flex-col">
            {/* Header for Total Keuntungan */}
            <div className="px-1 pb-3 mb-3 border-b border-white/10 flex justify-between items-center">
                <div>
                    <p className="text-xs text-[#CAC4D0]">Margin Bulan Ini</p>
                    <p className="text-xl font-bold text-white">{formatRupiah(totalMargin)}</p>
                </div>
                <button 
                    onClick={onAddFee}
                    className="bg-indigo-400/10 hover:bg-indigo-400/20 text-indigo-200 text-xs font-semibold py-1.5 px-3 rounded-full flex items-center space-x-1.5 transition-colors duration-200"
                    aria-label="Tambah Fee Bagi Hasil BRILink"
                >
                    <PlusIcon className="h-3 w-3" strokeWidth={3} />
                    <span>Fee BRILink</span>
                </button>
            </div>
            {/* Grid for Wallets */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-3 px-1">
                {wallets.map(wallet => (
                    <div 
                        key={wallet.id} 
                        className="flex flex-col"
                    >
                        <span className="text-xs text-[#CAC4D0] truncate">{wallet.name}</span>
                        <span className="text-sm font-bold text-[#E6E1E5] truncate">
                            {formatRupiah(wallet.balance)}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default WalletsSummaryCard;