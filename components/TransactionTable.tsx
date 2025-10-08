import React from 'react';
import { Transaction, TransactionType, Wallet, SortKey, SortDirection } from '../types';
// FIX: Changed to named import
import { WalletIconComponent } from './WalletIconComponent';
import { ChevronDownIcon, ChevronUpIcon, EditIcon, InfoIcon } from './icons/Icons';

// Interface untuk properti komponen TransactionTable.
interface TransactionTableProps {
    transactions: Transaction[]; // Daftar transaksi yang akan ditampilkan di halaman ini.
    wallets: Wallet[]; // Daftar semua dompet untuk mencari ikon dan nama.
    formatRupiah: (amount: number) => string; // Fungsi untuk format Rupiah.
    onInfoTransaction: (transaction: Transaction) => void; // Callback saat tombol info di-klik.
    onEditTransaction: (transaction: Transaction) => void; // Callback saat transaksi biasa di-klik untuk diedit.
    onEditTransfer?: (transaction: Transaction) => void; // Callback saat transaksi transfer di-klik untuk diedit.
    sortKey: SortKey; // Kunci pengurutan saat ini.
    sortDirection: SortDirection; // Arah pengurutan saat ini.
    onSort: (key: SortKey) => void; // Callback untuk mengubah pengurutan.
}

/**
 * Komponen SortableHeader adalah header kolom untuk tabel yang dapat diklik
 * untuk mengurutkan data berdasarkan kolom tersebut.
 */
const SortableHeader: React.FC<{
    columnKey: SortKey;
    title: string;
    onSort: (key: SortKey) => void;
    sortKey: SortKey;
    sortDirection: SortDirection;
    className?: string;
}> = ({ columnKey, title, onSort, sortKey, sortDirection, className = "" }) => {
    const isActive = sortKey === columnKey; // Cek apakah ini kolom yang sedang aktif diurutkan.
    
    return (
        <th className={`p-3 text-xs font.medium uppercase text-slate-500 dark:text-[#958F99] tracking-wider ${className}`}>
            <button onClick={() => onSort(columnKey)} className="flex items-center space-x-1.5 group focus:outline-none">
                <span className={isActive ? "text-slate-800 dark:text-white" : ""}>{title}</span>
                {/* Menampilkan ikon panah naik/turun jika kolom ini aktif */}
                {isActive && (
                    sortDirection === 'asc' ? <ChevronUpIcon className="h-4 w-4 text-slate-800 dark:text-white" /> : <ChevronDownIcon className="h-4 w-4 text-slate-800 dark:text-white" />
                )}
            </button>
        </th>
    );
};

/**
 * Komponen TransactionTable bertanggung jawab untuk menampilkan daftar transaksi
 * dalam format tabel di desktop dan format kartu di mobile. Komponen ini juga
 * menangani paginasi dan event klik untuk mengedit transaksi.
 */
const TransactionTable: React.FC<TransactionTableProps> = ({ 
    transactions, 
    wallets, 
    formatRupiah,
    onInfoTransaction,
    onEditTransaction,
    onEditTransfer,
    sortKey,
    sortDirection,
    onSort
}) => {
    
    /**
     * Menghitung umur piutang dalam hari.
     * @param dateString - Tanggal transaksi dalam format ISO.
     * @returns String yang menyatakan umur piutang (misal: "Hari ini", "3 hari").
     */
    const calculateDaysAgo = (dateString: string): string => {
        const piutangDate = new Date(dateString);
        const today = new Date();
        piutangDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);

        const diffTime = today.getTime() - piutangDate.getTime();
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= 0) {
            return 'Hari ini';
        }
        return `${diffDays} hari`;
    };


    return (
        <>
             {/* Tampilan Tabel untuk Desktop (disembunyikan di mobile) */}
            <div className="hidden md:block h-full">
                <div className="no-scrollbar relative h-full w-full overflow-auto rounded-xl border border-slate-200 dark:border-white/10">
                    {transactions.length > 0 ? (
                        <table className="w-full text-left">
                            <thead className="sticky top-0 z-10 border-b border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-neutral-800/80 backdrop-blur-sm">
                                <tr>
                                    <SortableHeader columnKey="date" title="Tanggal" sortKey={sortKey} sortDirection={sortDirection} onSort={onSort} />
                                    <SortableHeader columnKey="description" title="Deskripsi" sortKey={sortKey} sortDirection={sortDirection} onSort={onSort} />
                                    <SortableHeader columnKey="customer" title="Pelanggan" sortKey={sortKey} sortDirection={sortDirection} onSort={onSort} />
                                    <SortableHeader columnKey="amount" title="Jumlah" sortKey={sortKey} sortDirection={sortDirection} onSort={onSort} />
                                    <SortableHeader columnKey="margin" title="Margin" sortKey={sortKey} sortDirection={sortDirection} onSort={onSort} />
                                    <th className="p-3 text-xs font.medium uppercase text-slate-500 dark:text-[#958F99] tracking-wider text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-white/10">
                                {transactions.map(transaction => (
                                    <tr 
                                        key={transaction.id} 
                                        className={`transition-colors duration-200 ${
                                            transaction.isPiutang ? 'bg-yellow-100 dark:bg-yellow-400/10 hover:bg-yellow-200/60 dark:hover:bg-yellow-400/20' : 'hover:bg-slate-100 dark:hover:bg-white/5'
                                        }`}
                                    >
                                        <td className="p-3 text-sm text-slate-500 dark:text-neutral-400">{new Date(transaction.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric'})}</td>
                                        <td className="p-3 text-sm text-slate-800 dark:text-white">
                                            {/* Menampilkan badge umur piutang jika transaksi adalah piutang */}
                                            {transaction.isPiutang ? (
                                                <div className="flex items-start justify-between gap-2">
                                                    <span>{transaction.description}</span>
                                                    <span className="flex-shrink-0 text-xs font.bold px-2 py-0.5 bg-yellow-200 text-yellow-800 dark:bg-yellow-400/20 dark:text-yellow-300 rounded-full">{calculateDaysAgo(transaction.date)}</span>
                                                </div>
                                            ) : (
                                                <span>{transaction.description}</span>
                                            )}
                                            {/* Menampilkan catatan jika ada */}
                                            {transaction.notes && (
                                                <p className="text-xs text-slate-500 dark:text-neutral-400 truncate italic">
                                                    "{transaction.notes}"
                                                </p>
                                            )}
                                        </td>
                                        <td className="p-3 text-sm text-slate-600 dark:text-neutral-300">{transaction.customer}</td>
                                        <td className={`p-3 text-sm font.medium ${
                                                // Logika pewarnaan dan tampilan untuk kolom Jumlah.
                                                transaction.toWallet ? 'text-slate-800 dark:text-white' :
                                                transaction.type === TransactionType.IN ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                                            }`}>
                                             {/* Tampilan khusus untuk transaksi transfer saldo */}
                                             {transaction.toWallet ? (
                                                <div className="flex items-center space-x-2">
                                                    {(() => {
                                                        const fromWallet = wallets.find(w => w.id === transaction.wallet);
                                                        const toWallet = wallets.find(w => w.id === transaction.toWallet);
                                                        return (
                                                            <>
                                                                {fromWallet && <WalletIconComponent walletId={fromWallet.id} iconUrl={fromWallet.icon} className="h-6 w-6 object-contain dark:brightness-0 dark:invert" altText={fromWallet.name} />}
                                                                <span className="text-slate-500 dark:text-neutral-400">→</span>
                                                                {toWallet && <WalletIconComponent walletId={toWallet.id} iconUrl={toWallet.icon} className="h-6 w-6 object-contain dark:brightness-0 dark:invert" altText={toWallet.name} />}
                                                                <span className="ml-2">{formatRupiah(transaction.amount)}</span>
                                                            </>
                                                        );
                                                    })()}
                                                </div>
                                            ) : (
                                                // Tampilan untuk transaksi biasa.
                                                <div className="flex items-center space-x-3">
                                                    {(() => {
                                                        const wallet = wallets.find(w => w.id === transaction.wallet);
                                                        return wallet && (
                                                            <WalletIconComponent 
                                                                walletId={wallet.id} 
                                                                iconUrl={wallet.icon} 
                                                                className="h-6 w-6 object-contain dark:brightness-0 dark:invert"
                                                                altText={wallet.name}
                                                            />
                                                        );
                                                    })()}
                                                    <span>{`${transaction.type === TransactionType.IN ? '+' : '-'} ${formatRupiah(transaction.amount)}`}</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-3 text-sm text-sky-600 dark:text-sky-300">{formatRupiah(transaction.margin)}</td>
                                        <td className="p-3 text-sm text-right">
                                            <div className="flex items-center justify-end space-x-1">
                                                <button
                                                    onClick={() => onInfoTransaction(transaction)}
                                                    className="p-2 rounded-full text-slate-500 dark:text-neutral-400 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-slate-700 dark:hover:text-white transition-colors duration-200"
                                                    aria-label="Info transaksi"
                                                >
                                                    <InfoIcon className="h-4 w-4" />
                                                </button>
                                                <button 
                                                    onClick={() => {
                                                        if (transaction.isInternalTransfer && transaction.toWallet) {
                                                            onEditTransfer?.(transaction);
                                                        } else {
                                                            onEditTransaction(transaction);
                                                        }
                                                    }}
                                                    className="p-2 rounded-full text-slate-500 dark:text-neutral-400 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-slate-700 dark:hover:text-white transition-colors duration-200"
                                                    aria-label="Edit transaksi"
                                                >
                                                    <EditIcon className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="flex items-center justify-center h-full">
                             <p className="text-slate-400 dark:text-neutral-500">
                                Tidak ada transaksi yang cocok.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Tampilan Kartu untuk Mobile (disembunyikan di desktop) */}
            <div className="flex-grow md:hidden space-y-3">
                 {transactions.length > 0 ? (
                    transactions.map(transaction => {
                        return (
                            <div 
                                key={transaction.id}
                                className={`p-4 rounded-2xl border transition-colors duration-200 ${
                                    transaction.isPiutang 
                                        ? 'bg-yellow-100 border-yellow-200 dark:bg-yellow-400/10 dark:border-yellow-400/20 hover:bg-yellow-200/60 dark:hover:bg-yellow-400/20 border-l-4 border-l-yellow-400 dark:border-l-yellow-500' 
                                        : 'bg-white border-slate-200 dark:bg-white/5 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10'
                                }`}
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-base font.semibold text-slate-800 dark:text-white truncate">{transaction.description}</p>
                                        <p className="text-sm text-slate-600 dark:text-neutral-300 truncate">{transaction.customer || 'Pelanggan'}</p>
                                        {transaction.notes && (
                                            <p className="text-xs text-slate-500 dark:text-neutral-400 truncate italic mt-1">
                                                "{transaction.notes}"
                                            </p>
                                        )}
                                    </div>
                                    {transaction.isPiutang && (
                                        <div className="ml-2 flex-shrink-0 text-xs font.bold px-2 py-0.5 bg-yellow-200 text-yellow-800 dark:bg-yellow-400/20 dark:text-yellow-300 rounded-full">{calculateDaysAgo(transaction.date)}</div>
                                    )}
                                </div>
                                <div className="mt-3 flex justify-between items-center">
                                     {/* Tampilan khusus transfer di mobile */}
                                     {transaction.toWallet ? (
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center space-x-2">
                                                {(() => {
                                                    const fromWallet = wallets.find(w => w.id === transaction.wallet);
                                                    const toWallet = wallets.find(w => w.id === transaction.toWallet);
                                                    return (
                                                        <>
                                                            {fromWallet && <WalletIconComponent walletId={fromWallet.id} iconUrl={fromWallet.icon} className="h-7 w-7 object-contain dark:brightness-0 dark:invert" altText={fromWallet.name} />}
                                                            <span className="text-slate-500 dark:text-neutral-400">→</span>
                                                            {toWallet && <WalletIconComponent walletId={toWallet.id} iconUrl={toWallet.icon} className="h-7 w-7 object-contain dark:brightness-0 dark:invert" altText={toWallet.name} />}
                                                        </>
                                                    );
                                                })()}
                                            </div>
                                            <p className="text-lg font.bold text-slate-800 dark:text-white mt-1">{formatRupiah(transaction.amount)}</p>
                                            {transaction.margin > 0 && <p className="text-xs text-sky-600 dark:text-sky-300">Biaya: {formatRupiah(transaction.margin)}</p>}
                                        </div>
                                    ) : (
                                        // Tampilan transaksi biasa di mobile
                                        <div className="flex items-center space-x-3">
                                            {(() => {
                                                const wallet = wallets.find(w => w.id === transaction.wallet);
                                                return wallet && <WalletIconComponent walletId={wallet.id} iconUrl={wallet.icon} className="h-7 w-7 object-contain dark:brightness-0 dark:invert" altText={wallet.name} />;
                                            })()}
                                            <div>
                                                <p className={`text-lg font.bold ${transaction.type === TransactionType.IN ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                                                    {`${transaction.type === TransactionType.IN ? '+' : '-'} ${formatRupiah(transaction.amount)}`}
                                                </p>
                                                <p className="text-xs text-sky-600 dark:text-sky-300">Margin: {formatRupiah(transaction.margin)}</p>
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-1">
                                        <p className="text-xs text-slate-500 dark:text-neutral-400">{new Date(transaction.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short'})}</p>
                                        <button 
                                            onClick={() => onInfoTransaction(transaction)}
                                            className="p-2 rounded-full text-slate-500 dark:text-neutral-400 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-slate-700 dark:hover:text-white transition-colors duration-200"
                                            aria-label="Info transaksi"
                                        >
                                            <InfoIcon className="h-4 w-4" />
                                        </button>
                                        <button 
                                            onClick={() => {
                                                if (transaction.isInternalTransfer && transaction.toWallet) {
                                                    onEditTransfer?.(transaction);
                                                } else {
                                                    onEditTransaction(transaction);
                                                }
                                            }}
                                            className="p-2 rounded-full text-slate-500 dark:text-neutral-400 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-slate-700 dark:hover:text-white transition-colors duration-200"
                                            aria-label="Edit transaksi"
                                        >
                                            <EditIcon className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )
                    })
                ) : (
                    <div className="text-center py-20 text-slate-400 dark:text-neutral-500">
                        Tidak ada transaksi yang cocok.
                    </div>
                )}
            </div>
        </>
    );
};

export default TransactionTable;