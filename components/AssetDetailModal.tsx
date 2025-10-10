import React, { useState, useEffect, useMemo } from 'react';
import { Transaction, Wallet } from '../types';
import { CloseIcon, WalletIcon } from './icons/Icons';
import { WalletIconComponent } from './WalletIconComponent';

interface AssetDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    wallets: Wallet[];
    transactions: Transaction[];
    totalPiutang: number;
    formatRupiah: (amount: number) => string;
}

const AssetDetailModal: React.FC<AssetDetailModalProps> = ({
    isOpen,
    onClose,
    wallets,
    transactions,
    totalPiutang,
    formatRupiah,
}) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(isOpen);
    }, [isOpen]);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onClose, 300);
    };

    const assetData = useMemo(() => {
        const totalWalletBalance = wallets.reduce((sum, wallet) => sum + wallet.balance, 0);
        const totalAssets = totalWalletBalance + totalPiutang;
        const walletPercentage = totalAssets > 0 ? (totalWalletBalance / totalAssets) * 100 : 0;
        const piutangPercentage = 100 - walletPercentage;

        return {
            totalWalletBalance,
            totalAssets,
            walletPercentage,
            piutangPercentage
        };
    }, [wallets, totalPiutang]);
    
    // Logic to calculate historical asset data for the line chart
    const historicalAssetData = useMemo(() => {
        const data: { date: Date; totalAssets: number }[] = [];
        const today = new Date();
        today.setHours(23, 59, 59, 999);

        // Get all transactions sorted by date
        const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        let currentAssetTotal = assetData.totalAssets;

        // Iterate backwards from today for the last 30 days
        for (let i = 0; i < 30; i++) {
            const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
            date.setHours(23, 59, 59, 999);
            
            if (i > 0) {
                 const prevDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i + 1);
                 prevDate.setHours(23, 59, 59, 999);
                
                // Find transactions for the 'previous' day and revert their effect
                const transactionsForDay = sortedTransactions.filter(t => {
                     const tDate = new Date(t.date);
                     return tDate > date && tDate <= prevDate;
                });
                
                let netChangeForDay = 0;
                transactionsForDay.forEach(t => {
                     // This is a simplified reversal; a full reversal would need the complex logic from App.tsx
                     // For this chart, we'll approximate the asset change.
                    if (t.isInternalTransfer || t.description === 'Pindah Saldo') {
                        // Net zero effect on total assets
                    } else if (t.description === 'Tambah Modal') {
                        netChangeForDay += t.amount;
                    } else if (t.description === 'Penyesuaian Kas') {
                        netChangeForDay += (t.type === 'IN' ? t.amount : -t.amount);
                    } else {
                        netChangeForDay += t.margin;
                    }
                });
                currentAssetTotal -= netChangeForDay;
            }
            
            data.push({ date, totalAssets: currentAssetTotal });
        }
        
        return data.reverse(); // Reverse to have the oldest date first

    }, [transactions, assetData.totalAssets]);


    if (!isOpen) return null;

    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    const walletStrokeDashoffset = circumference * (1 - assetData.walletPercentage / 100);
    
    // Line Chart rendering logic
    const LineChart = () => {
        const width = 500;
        const height = 150;
        const margin = { top: 10, right: 10, bottom: 20, left: 50 };
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;

        const assetValues = historicalAssetData.map(d => d.totalAssets);
        const minAsset = Math.min(...assetValues);
        const maxAsset = Math.max(...assetValues);
        const yRange = maxAsset - minAsset;
        
        const yMin = Math.max(0, minAsset - yRange * 0.1);
        const yMax = maxAsset + yRange * 0.1;

        const xScale = (index: number) => (innerWidth / (historicalAssetData.length - 1)) * index;
        const yScale = (value: number) => innerHeight - ((value - yMin) / (yMax - yMin)) * innerHeight;

        const linePath = historicalAssetData
            .map((d, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(d.totalAssets)}`)
            .join(' ');
            
        const formatYAxisLabel = (value: number) => {
            if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}jt`;
            if (value >= 1_000) return `${(value / 1_000).toFixed(0)}rb`;
            return value;
        };

        return (
             <svg viewBox={`0 0 ${width} ${height}`} className="w-full">
                <g transform={`translate(${margin.left}, ${margin.top})`}>
                    {/* Y-Axis */}
                    <text x={-10} y={yScale(yMax)} dy="0.32em" textAnchor="end" className="text-xs fill-slate-500 dark:fill-neutral-400">{formatYAxisLabel(yMax)}</text>
                    <text x={-10} y={yScale(yMin)} dy="0.32em" textAnchor="end" className="text-xs fill-slate-500 dark:fill-neutral-400">{formatYAxisLabel(yMin)}</text>
                    
                    {/* X-Axis */}
                     <text x={xScale(0)} y={innerHeight + 15} textAnchor="start" className="text-xs fill-slate-500 dark:fill-neutral-400">30 hari lalu</text>
                     <text x={xScale(historicalAssetData.length - 1)} y={innerHeight + 15} textAnchor="end" className="text-xs fill-slate-500 dark:fill-neutral-400">Hari ini</text>

                    <path d={linePath} fill="none" stroke="#3b82f6" strokeWidth="2" />
                </g>
            </svg>
        );
    };


    return (
        <div
            className={`fixed inset-0 z-50 flex justify-center items-center p-4 transition-opacity duration-300 ease-in-out bg-black/40 backdrop-blur-sm ${isVisible ? 'opacity-100' : 'opacity-0'}`}
            onClick={handleClose}
            role="dialog" aria-modal="true" aria-labelledby="asset-detail-title"
        >
            <div
                className={`bg-white dark:bg-neutral-800 rounded-3xl shadow-2xl w-full max-w-2xl transform transition-all duration-300 ease-in-out flex flex-col max-h-[90vh] ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6 flex justify-between items-center border-b border-slate-200 dark:border-white/10 flex-shrink-0">
                    <h2 id="asset-detail-title" className="text-xl font-medium text-slate-800 dark:text-white">Rincian Aset</h2>
                    <button onClick={handleClose} className="p-2 -mr-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 dark:text-neutral-300 transition-colors" aria-label="Tutup">
                        <CloseIcon />
                    </button>
                </div>
                <div className="p-6 no-scrollbar overflow-y-auto space-y-8">
                     {/* Asset Composition */}
                    <div>
                        <h3 className="text-md font-semibold text-slate-700 dark:text-neutral-200 mb-4 text-center">Komposisi Aset Saat Ini</h3>
                        <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                            <div className="relative w-40 h-40">
                                <svg className="w-full h-full" viewBox="0 0 140 140">
                                    <circle cx="70" cy="70" r={radius} fill="transparent" strokeWidth="18" className="stroke-yellow-200 dark:stroke-yellow-500/20" />
                                    <circle
                                        cx="70" cy="70" r={radius}
                                        fill="transparent"
                                        strokeWidth="18"
                                        className="stroke-blue-500 dark:stroke-blue-400"
                                        strokeDasharray={circumference}
                                        strokeDashoffset={walletStrokeDashoffset}
                                        transform="rotate(-90 70 70)"
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-xs text-slate-500 dark:text-neutral-400">Total</span>
                                    <span className="text-xl font-bold text-slate-800 dark:text-white">{formatRupiah(assetData.totalAssets)}</span>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-4 h-4 rounded-sm bg-blue-500 dark:bg-blue-400"></div>
                                    <div>
                                        <p className="text-sm text-slate-500 dark:text-neutral-400">Total Saldo Dompet</p>
                                        <p className="font-bold text-slate-800 dark:text-white">{formatRupiah(assetData.totalWalletBalance)} ({assetData.walletPercentage.toFixed(1)}%)</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-4 h-4 rounded-sm bg-yellow-200 dark:bg-yellow-500/20"></div>
                                    <div>
                                        <p className="text-sm text-slate-500 dark:text-neutral-400">Total Piutang</p>
                                        <p className="font-bold text-slate-800 dark:text-white">{formatRupiah(totalPiutang)} ({assetData.piutangPercentage.toFixed(1)}%)</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Wallets Breakdown */}
                    <div>
                        <h3 className="text-md font-semibold text-slate-700 dark:text-neutral-200 mb-2">Rincian Saldo Dompet</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {wallets.map(wallet => (
                                <div key={wallet.id} className="bg-slate-100 dark:bg-black/20 p-3 rounded-lg flex items-center gap-3">
                                    <WalletIconComponent walletId={wallet.id} iconUrl={wallet.icon} className="h-7 w-7 flex-shrink-0" altText={wallet.name} />
                                    <div className="min-w-0">
                                        <p className="text-xs text-slate-500 dark:text-neutral-400 truncate">{wallet.name}</p>
                                        <p className="text-sm font-semibold text-slate-700 dark:text-neutral-200 truncate">{formatRupiah(wallet.balance)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Asset Trend */}
                    <div>
                        <h3 className="text-md font-semibold text-slate-700 dark:text-neutral-200 mb-2">Tren Aset (30 Hari Terakhir)</h3>
                         <div className="bg-slate-100 dark:bg-black/20 p-2 rounded-xl">
                           <LineChart />
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default AssetDetailModal;
