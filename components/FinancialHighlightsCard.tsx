import React from 'react';
import { InfoIcon, WalletIcon, MarginIcon } from './icons/Icons';

interface FinancialHighlightsCardProps {
    totalAssets: number;
    totalMargin: number;
    formatRupiah: (amount: number) => string;
}

const FinancialHighlightsCard: React.FC<FinancialHighlightsCardProps> = ({ totalAssets, totalMargin, formatRupiah }) => {
    return (
        <div className="bg-white dark:bg-neutral-800 rounded-3xl p-3 shadow-lg shadow-slate-200/50 dark:shadow-none">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Total Aset */}
                <div className="bg-blue-100 dark:bg-blue-500/10 p-4 rounded-2xl flex items-center gap-4">
                    <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white dark:bg-blue-400/20 flex items-center justify-center">
                        <WalletIcon className="w-6 h-6 sm:w-7 sm:h-7 text-blue-500 dark:text-blue-300" />
                    </div>
                    <div>
                        <div className="flex items-center space-x-1.5 has-tooltip relative">
                            <p className="text-sm text-blue-800/80 dark:text-blue-200/80">Total Aset</p>
                            <InfoIcon className="h-3.5 w-3.5 text-blue-800/60 dark:text-blue-200/60" />
                            <div className="tooltip absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-700 dark:bg-neutral-900 text-white text-xs px-2 py-1 rounded-md pointer-events-none w-52 text-center shadow-lg">
                                Saldo dompet (BRI & BRILink dikurangi Rp50rb) + Total Piutang
                            </div>
                        </div>
                        <p className="text-2xl sm:text-3xl font-bold text-blue-900 dark:text-blue-200 leading-tight">{formatRupiah(totalAssets)}</p>
                    </div>
                </div>

                {/* Margin Bulan Ini */}
                <div className="bg-emerald-100 dark:bg-emerald-500/10 p-4 rounded-2xl flex items-center gap-4">
                     <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white dark:bg-emerald-400/20 flex items-center justify-center">
                        <MarginIcon className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-500 dark:text-emerald-400" />
                    </div>
                    <div>
                        <p className="text-sm text-emerald-800/80 dark:text-emerald-200/80">Margin Bulan Ini</p>
                        <p className="text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400 leading-tight">{formatRupiah(totalMargin)}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FinancialHighlightsCard;