import React from 'react';
import { Wallet } from '../types';
// FIX: Changed to named import
import { WalletIconComponent } from './WalletIconComponent';
import { InfoIcon } from './icons/Icons';

// Properti untuk komponen WalletsSummaryCard.
interface WalletsSummaryCardProps {
    wallets: Wallet[]; // Daftar semua dompet.
    formatRupiah: (amount: number) => string; // Fungsi utilitas untuk format mata uang.
    totalAssets: number;
    totalMargin: number;
}

/**
 * Komponen WalletsSummaryCard menampilkan ringkasan finansial utama di dashboard.
 * Ini mencakup total aset, margin bulan ini, dan daftar saldo dari setiap dompet.
 */
const WalletsSummaryCard: React.FC<WalletsSummaryCardProps> = ({ wallets, formatRupiah, totalAssets, totalMargin }) => {
    
    return (
        <div className="bg-white dark:bg-neutral-800 rounded-3xl p-4 flex flex-col shadow-lg shadow-slate-200/50 dark:shadow-none">
            {/* Financial Highlights for mobile/tablet view */}
            <div className="lg:hidden mb-4 grid grid-cols-2 gap-4">
                {/* Total Aset */}
                <div>
                    <div className="flex items-center space-x-1 has-tooltip relative">
                        <p className="text-xs text-slate-500 dark:text-[#CAC4D0]">Total Aset</p>
                        <InfoIcon className="h-3 w-3 text-slate-400" />
                        <div className="tooltip absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-700 dark:bg-neutral-900 text-white text-xs px-2 py-1 rounded-md pointer-events-none w-52 text-center shadow-lg">
                            Saldo dompet (BRI & BRILink dikurangi Rp50rb) + Total Piutang
                        </div>
                    </div>
                    <p className="text-xl font-bold text-slate-800 dark:text-white leading-tight">{formatRupiah(totalAssets)}</p>
                </div>
                {/* Margin Bulan Ini */}
                <div>
                    <p className="text-xs text-slate-500 dark:text-[#CAC4D0]">Margin Bulan Ini</p>
                    <p className="text-xl font-bold text-emerald-500 dark:text-emerald-400 leading-tight">{formatRupiah(totalMargin)}</p>
                </div>
            </div>

            {/* Grid untuk menampilkan daftar saldo per dompet, with separator for mobile */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-3 px-1 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-200 dark:border-white/10">
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