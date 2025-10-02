



import React from 'react';
import { Transaction, TransactionType, Wallet, SortKey, SortDirection } from '../types';
import WalletIconComponent from './WalletIconComponent';
import { ChevronDownIcon, ChevronUpIcon } from './icons/Icons';

interface TransactionTableProps {
    transactions: Transaction[];
    wallets: Wallet[];
    formatRupiah: (amount: number) => string;
    currentPage: number;
    totalPages: number;
    setCurrentPage: (page: number) => void;
    onEditTransaction: (transaction: Transaction) => void;
    sortKey: SortKey;
    sortDirection: SortDirection;
    onSort: (key: SortKey) => void;
}

const SortableHeader: React.FC<{
    columnKey: SortKey;
    title: string;
    onSort: (key: SortKey) => void;
    sortKey: SortKey;
    sortDirection: SortDirection;
    className?: string;
}> = ({ columnKey, title, onSort, sortKey, sortDirection, className = "" }) => {
    const isActive = sortKey === columnKey;
    
    return (
        <th className={`p-3 text-xs font-medium uppercase text-slate-500 dark:text-[#958F99] tracking-wider ${className}`}>
            <button onClick={() => onSort(columnKey)} className="flex items-center space-x-1.5 group focus:outline-none">
                <span className={isActive ? "text-slate-800 dark:text-white" : ""}>{title}</span>
                {isActive && (
                    sortDirection === 'asc' ? <ChevronUpIcon className="h-4 w-4 text-slate-800 dark:text-white" /> : <ChevronDownIcon className="h-4 w-4 text-slate-800 dark:text-white" />
                )}
            </button>
        </th>
    );
};


const TransactionTable: React.FC<TransactionTableProps> = ({ 
    transactions, 
    wallets, 
    formatRupiah, 
    currentPage, 
    totalPages, 
    setCurrentPage,
    onEditTransaction,
    sortKey,
    sortDirection,
    onSort
}) => {

    return (
        <>
             {/* Desktop Table View */}
            <div className="overflow-x-auto flex-grow hidden md:block">
                <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-white/10">
                    <table className="w-full text-left">
                        <thead className="border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5">
                            <tr>
                                <SortableHeader columnKey="date" title="Tanggal" sortKey={sortKey} sortDirection={sortDirection} onSort={onSort} />
                                <SortableHeader columnKey="description" title="Deskripsi" sortKey={sortKey} sortDirection={sortDirection} onSort={onSort} />
                                <SortableHeader columnKey="customer" title="Pelanggan" sortKey={sortKey} sortDirection={sortDirection} onSort={onSort} />
                                <SortableHeader columnKey="amount" title="Jumlah" sortKey={sortKey} sortDirection={sortDirection} onSort={onSort} />
                                <SortableHeader columnKey="margin" title="Margin" sortKey={sortKey} sortDirection={sortDirection} onSort={onSort} />
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.length > 0 ? (
                                transactions.map(transaction => (
                                    <tr 
                                        key={transaction.id} 
                                        onClick={() => onEditTransaction(transaction)}
                                        className={`border-b border-slate-200 dark:border-white/10 last:border-b-0 transition-colors duration-200 cursor-pointer ${
                                            transaction.isPiutang ? 'bg-yellow-100 dark:bg-yellow-400/10 hover:bg-yellow-200/60 dark:hover:bg-yellow-400/20' : 'hover:bg-slate-100 dark:hover:bg-white/5'
                                        }`}
                                    >
                                        <td className="p-3 text-sm text-slate-500 dark:text-neutral-400">{new Date(transaction.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric'})}</td>
                                        <td className="p-3 text-sm text-slate-800 dark:text-white">
                                            {transaction.description}
                                            {transaction.notes && (
                                                <p className="text-xs text-slate-500 dark:text-neutral-400 truncate italic">
                                                    "{transaction.notes}"
                                                </p>
                                            )}
                                        </td>
                                        <td className="p-3 text-sm text-slate-600 dark:text-neutral-300">{transaction.customer}</td>
                                        <td className={`p-3 text-sm font-medium ${transaction.type === TransactionType.IN ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
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
                                        </td>
                                        <td className="p-3 text-sm text-sky-600 dark:text-sky-300">{formatRupiah(transaction.margin)}</td>
                                    </tr>
                                ))
                             ) : (
                                <tr>
                                    <td colSpan={5} className="text-center py-20 text-slate-400 dark:text-neutral-500">
                                        Tidak ada transaksi yang cocok.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile Card View */}
            <div className="flex-grow md:hidden space-y-3">
                 {transactions.length > 0 ? (
                    transactions.map(transaction => {
                        const wallet = wallets.find(w => w.id === transaction.wallet);
                        return (
                            <div 
                                key={transaction.id} 
                                onClick={() => onEditTransaction(transaction)}
                                className={`p-4 rounded-2xl border transition-colors duration-200 cursor-pointer ${
                                    transaction.isPiutang 
                                        ? 'bg-yellow-100 border-yellow-200 dark:bg-yellow-400/10 dark:border-yellow-400/20 hover:bg-yellow-200/60 dark:hover:bg-yellow-400/20' 
                                        : 'bg-white border-slate-200 dark:bg-white/5 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10'
                                }`}
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-base font-semibold text-slate-800 dark:text-white truncate">{transaction.description}</p>
                                        <p className="text-sm text-slate-600 dark:text-neutral-300 truncate">{transaction.customer || 'Pelanggan'}</p>
                                        {transaction.notes && (
                                            <p className="text-xs text-slate-500 dark:text-neutral-400 truncate italic mt-1">
                                                "{transaction.notes}"
                                            </p>
                                        )}
                                    </div>
                                    {transaction.isPiutang && (
                                        <div className="ml-2 flex-shrink-0 text-xs font-bold px-2 py-0.5 bg-yellow-200 text-yellow-800 dark:bg-yellow-400/20 dark:text-yellow-300 rounded-full">Piutang</div>
                                    )}
                                </div>
                                <div className="mt-3 flex justify-between items-end">
                                    <div className="flex items-center space-x-3">
                                        {wallet && (
                                            <WalletIconComponent 
                                                walletId={wallet.id} 
                                                iconUrl={wallet.icon} 
                                                className="h-7 w-7 object-contain dark:brightness-0 dark:invert"
                                                altText={wallet.name}
                                            />
                                        )}
                                        <div>
                                            <p className={`text-lg font-bold ${transaction.type === TransactionType.IN ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                                                {`${transaction.type === TransactionType.IN ? '+' : '-'} ${formatRupiah(transaction.amount)}`}
                                            </p>
                                            <p className="text-xs text-sky-600 dark:text-sky-300">Margin: {formatRupiah(transaction.margin)}</p>
                                        </div>
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-neutral-400">{new Date(transaction.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short'})}</p>
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

            {totalPages > 1 && (
                 <div className="flex justify-between items-center pt-4 mt-2">
                    <button
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage <= 1}
                        className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-white border border-slate-300 dark:border-white/20 rounded-full disabled:opacity-50 hover:enabled:bg-slate-100 dark:hover:enabled:bg-white/10 transition-colors"
                    >
                        Sebelumnya
                    </button>
                    <span className="text-sm text-slate-500 dark:text-neutral-400">
                        Halaman {currentPage} dari {totalPages}
                    </span>
                    <button
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage >= totalPages}
                        className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-white border border-slate-300 dark:border-white/20 rounded-full disabled:opacity-50 hover:enabled:bg-slate-100 dark:hover:enabled:bg-white/10 transition-colors"
                    >
                        Berikutnya
                    </button>
                </div>
            )}
        </>
    );
};

export default TransactionTable;