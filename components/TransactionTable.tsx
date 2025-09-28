
import React from 'react';
import { Transaction, TransactionType, Wallet, SortKey, SortDirection } from '../types';
import WalletIconComponent from './WalletIconComponent';
import { PlusIcon, ChevronDownIcon, ChevronUpIcon } from './icons/Icons';

interface TransactionTableProps {
    transactions: Transaction[];
    wallets: Wallet[];
    formatRupiah: (amount: number) => string;
    currentPage: number;
    totalPages: number;
    setCurrentPage: (page: number) => void;
    onAddTransaction: () => void;
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
        <th className={`p-3 text-xs font-medium uppercase text-[#958F99] tracking-wider ${className}`}>
            <button onClick={() => onSort(columnKey)} className="flex items-center space-x-1.5 group focus:outline-none">
                <span className={isActive ? "text-white" : ""}>{title}</span>
                {isActive && (
                    sortDirection === 'asc' ? <ChevronUpIcon className="h-4 w-4 text-white" /> : <ChevronDownIcon className="h-4 w-4 text-white" />
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
    onAddTransaction,
    onEditTransaction,
    sortKey,
    sortDirection,
    onSort
}) => {

    return (
        <div className="bg-[#2A282F] p-4 rounded-3xl flex flex-col">
            <div className="flex justify-between items-center mb-4 px-2">
                <h3 className="text-lg font-medium text-white">Riwayat Transaksi</h3>
                 <button 
                    onClick={onAddTransaction}
                    className="bg-indigo-400 hover:bg-indigo-500 text-slate-900 font-semibold py-2 px-4 rounded-full flex items-center space-x-2 transition-colors duration-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <PlusIcon className="h-4 w-4" />
                    <span>Tambah Transaksi</span>
                </button>
            </div>
            <div className="overflow-x-auto flex-grow">
                <table className="w-full text-left">
                    <thead className="border-b border-white/10">
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
                                    className={`border-b border-white/10 transition-colors duration-200 cursor-pointer ${
                                        transaction.isPiutang ? 'bg-yellow-400/10 hover:bg-yellow-400/20' : 'hover:bg-white/5'
                                    }`}
                                >
                                    <td className="p-3 text-sm text-slate-400">{new Date(transaction.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric'})}</td>
                                    <td className="p-3 text-sm text-white">{transaction.description}</td>
                                    <td className="p-3 text-sm text-slate-300">{transaction.customer}</td>
                                    <td className={`p-3 text-sm font-medium ${transaction.type === TransactionType.IN ? 'text-emerald-400' : 'text-red-400'}`}>
                                        <div className="flex items-center space-x-3">
                                            {(() => {
                                                const wallet = wallets.find(w => w.id === transaction.wallet);
                                                return wallet && (
                                                    <WalletIconComponent 
                                                        walletId={wallet.id} 
                                                        iconUrl={wallet.icon} 
                                                        className="h-5 w-5 object-contain brightness-0 invert"
                                                        altText={wallet.name}
                                                    />
                                                );
                                            })()}
                                            <span>{`${transaction.type === TransactionType.IN ? '+' : '-'} ${formatRupiah(transaction.amount)}`}</span>
                                        </div>
                                    </td>
                                    <td className="p-3 text-sm text-sky-300">{formatRupiah(transaction.margin)}</td>
                                </tr>
                            ))
                         ) : (
                            <tr>
                                <td colSpan={5} className="text-center py-20 text-slate-500">
                                    Tidak ada riwayat transaksi.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            {totalPages > 1 && (
                 <div className="flex justify-between items-center pt-4 mt-2">
                    <button
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage <= 1}
                        className="px-4 py-2 text-sm font-medium text-white border border-white/20 rounded-full disabled:opacity-50 hover:enabled:bg-white/10 transition-colors"
                    >
                        Sebelumnya
                    </button>
                    <span className="text-sm text-slate-400">
                        Halaman {currentPage} dari {totalPages}
                    </span>
                    <button
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage >= totalPages}
                        className="px-4 py-2 text-sm font-medium text-white border border-white/20 rounded-full disabled:opacity-50 hover:enabled:bg-white/10 transition-colors"
                    >
                        Berikutnya
                    </button>
                </div>
            )}
        </div>
    );
};

export default TransactionTable;