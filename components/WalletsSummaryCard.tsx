import React, { useMemo } from 'react';
import { Wallet } from '../types';
// FIX: Changed to named import
import { WalletIconComponent } from './WalletIconComponent';
import { InfoIcon } from './icons/Icons';

// Properti untuk komponen WalletsSummaryCard.
interface WalletsSummaryCardProps {
    wallets: Wallet[]; // Daftar semua dompet.
    totalMargin: number; // Total margin untuk periode saat ini.
    totalPiutang: number; // Total semua piutang yang belum lunas.
    formatRupiah: (amount: number) => string; // Fungsi utilitas untuk format mata uang.
}

/**
 * Komponen WalletsSummaryCard menampilkan ringkasan finansial utama di dashboard.
 * Ini mencakup total aset, margin bulan ini, dan daftar saldo dari setiap dompet.
 */
const WalletsSummaryCard: React.FC<WalletsSummaryCardProps> = ({ wallets, totalMargin, totalPiutang, formatRupiah }) => {
    
    // useMemo untuk menghitung total aset. Dihitung ulang hanya jika dompet atau piutang berubah.
    const totalAssets = useMemo(() => {
        // Menjumlahkan saldo semua dompet.
        const walletsTotal = wallets.reduce((sum, wallet) => {
            let usableBalance = wallet.balance;
            // Saldo BRI dan BRILink dikurangi Rp50.000 karena biasanya tidak dapat digunakan.
            if (wallet.id === 'BRI' || wallet.id === 'BRILINK') {
                usableBalance = Math.max(0, wallet.balance - 50000);
            }
            return sum + usableBalance;
        }, 0);
        // Total aset adalah total saldo dompet yang dapat digunakan ditambah total piutang.
        return walletsTotal + totalPiutang;
    }, [wallets, totalPiutang]);

    return (
        <div className="bg-white dark:bg-neutral-800 rounded-3xl p-4 flex flex-col shadow-lg shadow-slate-200/50 dark:shadow-none">
            {/* Header: Total Aset dan Margin */}
            <div className="px-1 pb-3 mb-3 border-b border-slate-200 dark:border-white/10">
                <div className="grid grid-cols-2 gap-4">
                     <div>
                        <div className="flex items-center space-x-1.5 has-tooltip relative">
                            <p className="text-xs text-slate-500 dark:text-[#CAC4D0]">Total Aset</p>
                            <InfoIcon className="h-3.5 w-3.5 text-slate-400" />
                            {/* Tooltip yang menjelaskan cara perhitungan total aset */}
                            <div className="tooltip absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-700 dark:bg-neutral-900 text-white text-xs px-2 py-1 rounded-md pointer-events-none w-52 text-center shadow-lg">
                                Saldo dompet (BRI & BRILink dikurangi Rp50rb) + Total Piutang
                            </div>
                        </div>
                        <p className="text-xl font.bold text-slate-800 dark:text-white">{formatRupiah(totalAssets)}</p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 dark:text-[#CAC4D0]">Margin Bulan Ini</p>
                        <p className="text-xl font.bold text-emerald-500 dark:text-emerald-400">{formatRupiah(totalMargin)}</p>
                    </div>
                </div>
            </div>

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
