import React, { useState, useEffect, useCallback } from 'react';
import { Wallet } from '../types';
// FIX: Changed to named import
import { WalletIconComponent } from './WalletIconComponent';
import { InfoIcon, CheckIcon, ErrorIcon, CloseIcon } from './icons/Icons';
import FormattedNumber from './FormattedNumber';
import { useToastContext, ToastMessage, ToastType } from '../contexts/ToastContext';

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
    
    // Clock State
    const [currentDate, setCurrentDate] = useState(new Date());

    // Toast State & Logic
    const { toasts, removeToast } = useToastContext();
    const currentToast = toasts.length > 0 ? toasts[0] : null;
    const [isExiting, setIsExiting] = useState(false);

    const handleDismiss = useCallback(() => {
        if (!currentToast) return;
        setIsExiting(true);
        setTimeout(() => {
            removeToast(currentToast.id);
            setIsExiting(false); // Reset for the next toast
        }, 300); // Animation duration
    }, [currentToast, removeToast]);

    useEffect(() => {
        if (currentToast) {
            const timer = setTimeout(() => {
                handleDismiss();
            }, 5000); // Auto-dismiss after 5 seconds
            return () => clearTimeout(timer);
        }
    }, [currentToast, handleDismiss]);


    // Clock Logic
    useEffect(() => {
        if (!currentToast) { // Only run the clock timer if no toast is active
            const timerId = setInterval(() => {
                setCurrentDate(new Date());
            }, 1000);

            return () => {
                clearInterval(timerId);
            };
        }
    }, [currentToast]);

    const hours = String(currentDate.getHours()).padStart(2, '0');
    const minutes = String(currentDate.getMinutes()).padStart(2, '0');
    
    // Render Logic for the clock
    const renderClock = () => {
        const dayName = new Intl.DateTimeFormat('id-ID', { weekday: 'long' }).format(currentDate);
        const dateAndMonth = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long' }).format(currentDate);

        return (
            <div className="flex flex-row items-center justify-center animate-fade-in w-full text-center divide-x divide-slate-200 dark:divide-neutral-700">
                {/* Date on the left */}
                <div className="flex-1 px-3">
                    <p className="text-base font-medium text-slate-500 dark:text-neutral-400">
                        {dayName}
                    </p>
                    <p className="text-xl font-bold text-slate-800 dark:text-white">
                        {dateAndMonth}
                    </p>
                </div>

                {/* Time on the right */}
                <div className="flex-1 px-3">
                    <p className="font-sans text-4xl font-bold text-slate-800 dark:text-white tracking-tight">
                        {hours}:{minutes}
                    </p>
                </div>
            </div>
        );
    };

    // Render Logic for the notification
    const renderNotification = () => {
        if (!currentToast) return null;

        const { message, type } = currentToast;

        const iconMap: Record<ToastType, React.ReactNode> = {
            success: <CheckIcon className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />,
            error: <ErrorIcon className="h-5 w-5 text-red-500 dark:text-red-400" />,
            info: <InfoIcon className="h-5 w-5 text-sky-500 dark:text-sky-400" />,
            destructive: <CheckIcon className="h-5 w-5 text-red-500 dark:text-red-400" />,
        };

        const colorMap: Record<ToastType, { text: string; closeButton: string; bg: string; progressBar: string; }> = {
            success: { text: 'text-emerald-800 dark:text-emerald-200', closeButton: 'text-emerald-500 hover:bg-emerald-200/50 dark:hover:bg-emerald-500/20', bg: 'bg-emerald-100 dark:bg-emerald-500/10', progressBar: 'bg-emerald-400' },
            error: { text: 'text-red-800 dark:text-red-200', closeButton: 'text-red-500 hover:bg-red-200/50 dark:hover:bg-red-500/20', bg: 'bg-red-100 dark:bg-red-500/10', progressBar: 'bg-red-400' },
            info: { text: 'text-sky-800 dark:text-sky-200', closeButton: 'text-sky-500 hover:bg-sky-200/50 dark:hover:bg-sky-500/20', bg: 'bg-sky-100 dark:bg-sky-500/10', progressBar: 'bg-sky-400' },
            destructive: { text: 'text-red-800 dark:text-red-200', closeButton: 'text-red-500 hover:bg-red-200/50 dark:hover:bg-red-500/20', bg: 'bg-red-100 dark:bg-red-500/10', progressBar: 'bg-red-400' },
        };
        const colors = colorMap[type];

        return (
            <div className={`relative w-full rounded-xl overflow-hidden ${colors.bg} ${isExiting ? 'animate-fade-out-up' : 'animate-fade-in'}`}>
                <div className="flex items-center justify-between gap-4 p-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="flex-shrink-0">
                            {iconMap[type]}
                        </div>
                        <p className={`text-sm font-semibold ${colors.text} truncate`}>{message}</p>
                    </div>
                    <button
                        onClick={handleDismiss}
                        className={`p-1 rounded-full transition-colors ${colors.closeButton}`}
                        aria-label="Tutup notifikasi"
                    >
                        <CloseIcon className="h-5 w-5" />
                    </button>
                </div>
                <div className={`absolute bottom-0 left-0 h-1 ${colors.progressBar} animate-progress-bar`}></div>
            </div>
        );
    };
    
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
                    <FormattedNumber 
                        value={totalAssets} 
                        formatFn={formatRupiah} 
                        className="text-xl font.bold text-blue-900 dark:text-blue-200 leading-tight block" 
                    />
                </button>
                {/* Margin Bulan Ini */}
                <button onClick={onMarginClick} className="bg-emerald-100 dark:bg-emerald-500/10 p-3 rounded-xl text-left w-full hover:ring-2 hover:ring-emerald-400 transition-all">
                    <p className="text-xs text-emerald-800/80 dark:text-emerald-200/80">Margin Bulan Ini</p>
                    <FormattedNumber 
                        value={totalMargin} 
                        formatFn={formatRupiah} 
                        className="text-xl font.bold text-emerald-600 dark:text-emerald-400 leading-tight block" 
                    />
                </button>
            </div>
            
            {/* Clock and Notification Area */}
            <div className="p-4 border-t lg:border-t-0 border-slate-200 dark:border-white/10 flex items-center justify-center">
                 {currentToast ? renderNotification() : renderClock()}
            </div>

            {/* Grid for displaying wallet balances, with separator for mobile */}
            <div className="grid grid-cols-2 gap-3 p-3 border-t border-slate-200 dark:border-white/10">
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
                                <FormattedNumber 
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