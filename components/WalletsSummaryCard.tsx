import React from 'react';
import { Wallet } from '../types';
// FIX: Changed to named import
import { WalletIconComponent } from './WalletIconComponent';

// Properti untuk komponen WalletsSummaryCard.
interface WalletsSummaryCardProps {
    wallets: Wallet[]; // Daftar semua dompet.
    formatRupiah: (amount: number) => string; // Fungsi utilitas untuk format mata uang.
}

/**
 * Komponen WalletsSummaryCard menampilkan ringkasan finansial utama di dashboard.
 * Ini mencakup total aset, margin bulan ini, dan daftar saldo dari setiap dompet.
 */
const WalletsSummaryCard: React.FC<WalletsSummaryCardProps> = ({ wallets, formatRupiah }) => {
    
    return (
        <div className="bg-white dark:bg-neutral-800 rounded-3xl p-4 flex flex-col shadow-lg shadow-slate-200/50 dark:shadow-none">
            {/* Header: Total Aset dan Margin */}
            <h3 className="text-lg font.medium text-slate-800 dark:text-white px-1 pb-3 mb-3 border-b border-slate-200 dark:border-white/10">Dompet</h3>

            {/* Grid untuk menampilkan daftar saldo per dompet */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-3 px-1">
                {wallets.map(wallet => (
                    <div 
                        key={wallet.id} 
                        className="flex items-center space-x-3 min-w-0"
                    >
                        <div className="flex-shrink-0">
                            {/* Komponen untuk menampilkan ikon dompet */}
                            <WalletIconComponent 
                                walletId={wallet.id}
                                iconUrl={wallet.icon}
                                className="h-8 w-8 text-slate-800 dark:text-white"
                                altText={wallet.name}
                            />
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-xs text-slate-500 dark:text-[#CAC4D0] truncate">{wallet.name}</span>
                            <span className="text-sm font.bold text-slate-700 dark:text-[#E6E1E5] truncate">
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
