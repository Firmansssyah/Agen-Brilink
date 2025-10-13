import React from 'react';
import { Wallet } from '../types';
// FIX: Changed to named import
import { WalletIconComponent } from './WalletIconComponent';
import { InfoIcon } from './icons/Icons';
import AnimatedNumber from './AnimatedNumber';

// Properti untuk komponen WalletsSummaryCard.
interface WalletsSummaryCardProps {
    wallets: Wallet[]; // Daftar semua dompet.
    formatRupiah: (amount: number) => string; // Fungsi utilitas untuk format mata uang.
    totalAssets: number;
    totalMargin: number;
    onMarginClick: () => void;
    onAssetClick: () => void;
}

/**
 * Komponen WalletsSummaryCard menampilkan ringkasan finansial utama di dashboard.
 * Ini mencakup total aset, margin bulan ini, dan daftar saldo dari setiap dompet.
 */
const WalletsSummaryCard: React.FC<WalletsSummaryCardProps> = ({ 
    wallets, 
    formatRupiah, 
    totalAssets, 
    totalMargin, 
    onMarginClick, 
    onAssetClick,
}) => {
    
    return (
        <div className="bg-white dark:bg-neutral-800 rounded-3xl flex flex-col shadow-lg shadow-slate-200/50 dark:shadow-none">
            {/* Financial Highlights for mobile/tablet view */}
            <div className="lg:hidden p-3 grid grid-cols-2 gap-3">
                {/* Total Aset */}
                <button onClick={onAssetClick} className="bg-blue-100 dark:bg-blue-500/10 p-3 rounded-xl text-left w-full hover:ring-2 hover:ring-blue-400 transition-all">
                    <div className="flex items-center space-x-1 has-tooltip relative">
                        <p className="text-xs text-blue-800/80 dark:text-blue-200/80">Total Aset</p>
                        <InfoIcon className="h-3 w-3 text-blue-800/60 dark:text-blue-200/60" />
                        <div className="tooltip absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-700 dark:bg-neutral-900 text-white text-xs px-2 py-1 rounded-md pointer-events-none w-52 text-center shadow-lg">
                            Saldo dompet (BRI & BRILink dikurangi Rp50rb) + Total Piutang
                        </div>
                    </div>
                    <AnimatedNumber 
                        value={totalAssets} 
                        formatFn={formatRupiah} 
                        className="text-xl font.bold text-blue-900 dark:text-blue-200 leading-tight block" 
                    />
                </button>
                {/* Margin Bulan Ini */}
                <button onClick={onMarginClick} className="bg-emerald-100 dark:bg-emerald-500/10 p-3 rounded-xl text-left w-full hover:ring-2 hover:ring-emerald-400 transition-all">
                    <p className="text-xs text-emerald-800/80 dark:text-emerald-200/80">Margin Bulan Ini</p>
                    <AnimatedNumber 
                        value={totalMargin} 
                        formatFn={formatRupiah} 
                        className="text-xl font.bold text-emerald-600 dark:text-emerald-400 leading-tight block" 
                    />
                </button>
            </div>

            {/* Grid for displaying wallet balances, with separator for mobile */}
            <div className="grid grid-cols-2 gap-3 p-3 border-t lg:border-t-0 border-slate-200 dark:border-white/10">
                {wallets.map(wallet => {
                    return (
                         <div
                            key={wallet.id}
                            className="p-3 rounded-xl flex items-center gap-3 w-full text-left bg-slate-50 dark:bg-neutral-900/50"
                        >
                            <div className="flex-shrink-0">
                                <WalletIconComponent
                                    walletId={wallet.id}
                                    iconUrl={wallet.icon}
                                    className="h-8 w-8"
                                    altText={wallet.name}
                                />
                            </div>
                            <div className="min-w-0">
                                <span className="block text-xs font-medium text-slate-500 dark:text-neutral-400 truncate">{wallet.name}</span>
                                <AnimatedNumber 
                                    value={wallet.balance}
                                    formatFn={formatRupiah}
                                    className="block text-base font-bold text-slate-800 dark:text-white truncate"
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default WalletsSummaryCard;