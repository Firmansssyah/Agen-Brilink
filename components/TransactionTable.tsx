import React from 'react';
import { Transaction, TransactionType, Wallet } from '../types';
import { WalletIconComponent } from './WalletIconComponent';
import { EditIcon, DeleteIcon, ArrowRightIcon } from './icons/Icons';

interface TransactionTableProps {
    transactions: Transaction[];
    wallets: Wallet[];
    formatRupiah: (amount: number) => string;
    onInfoTransaction: (transaction: Transaction) => void;
    onEditTransaction: (transaction: Transaction) => void;
    onDeleteTransactionConfirm: (transactionId: string) => void;
    onEditTransfer?: (transaction: Transaction) => void;
    onDeleteTransferConfirm: (transferId: string) => void;
}

const TransactionTable: React.FC<TransactionTableProps> = ({ 
    transactions, 
    wallets, 
    formatRupiah,
    onInfoTransaction,
    onEditTransaction,
    onDeleteTransactionConfirm,
    onEditTransfer,
    onDeleteTransferConfirm,
}) => {
    const tooltipClasses = "tooltip absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 bg-slate-700 text-white text-xs rounded-md shadow-lg z-10";

    return (
        <>
             {/* Tampilan Tabel untuk Desktop */}
            <div className="hidden md:block h-full">
                <div className="no-scrollbar relative h-full w-full overflow-auto rounded-xl border border-slate-200 dark:border-white/10">
                    {transactions.length > 0 ? (
                        <table className="w-full text-left border-collapse">
                            <thead className="sticky top-0 z-10 border-b border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-neutral-800/80 backdrop-blur-sm">
                                <tr>
                                    <th className="p-3 text-left text-xs font-semibold uppercase text-slate-500 dark:text-[#958F99] tracking-wider">Tanggal</th>
                                    <th className="p-3 text-left text-xs font-semibold uppercase text-slate-500 dark:text-[#958F99] tracking-wider">Deskripsi</th>
                                    <th className="p-3 text-left text-xs font-semibold uppercase text-slate-500 dark:text-[#958F99] tracking-wider">Pelanggan</th>
                                    <th className="p-3 text-left text-xs font-semibold uppercase text-slate-500 dark:text-[#958F99] tracking-wider">Jumlah</th>
                                    <th className="p-3 text-left text-xs font-semibold uppercase text-slate-500 dark:text-[#958F99] tracking-wider">Margin</th>
                                    <th className="p-3 text-xs font-semibold uppercase text-slate-500 dark:text-[#958F99] tracking-wider text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.map(transaction => {
                                    return (
                                        <tr 
                                            key={transaction.id}
                                            onClick={() => onInfoTransaction(transaction)}
                                            className={`border-b border-slate-200/50 dark:border-white/5 transition-colors duration-200 cursor-pointer ${
                                                transaction.isPiutang ? 'bg-red-100/50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20' : 'hover:bg-slate-50 dark:hover:bg-white/5'
                                            }`}
                                        >
                                            <td className="p-3 align-middle text-sm text-slate-500 dark:text-neutral-400">{new Date(transaction.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric'})}</td>
                                            <td className="p-3 align-middle text-sm text-slate-800 dark:text-white">
                                                <span className="font-medium">{transaction.description}</span>
                                                {transaction.notes && (
                                                    <p className="text-xs text-slate-500 dark:text-neutral-400 truncate italic">
                                                        "{transaction.notes}"
                                                    </p>
                                                )}
                                            </td>
                                            <td className="p-3 align-middle text-sm text-slate-600 dark:text-neutral-300">{transaction.customer}</td>
                                            <td className={`p-3 align-middle text-sm font-medium ${
                                                    transaction.toWallet ? 'text-slate-800 dark:text-white' :
                                                    transaction.type === TransactionType.IN ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                                                }`}>
                                                {transaction.toWallet ? (
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center space-x-2">
                                                            {(() => {
                                                                const fromWallet = wallets.find(w => w.id === transaction.wallet);
                                                                const toWallet = wallets.find(w => w.id === transaction.toWallet);
                                                                return (
                                                                    <>
                                                                        {fromWallet && (
                                                                            <div className="relative has-tooltip">
                                                                                <WalletIconComponent walletId={fromWallet.id} iconUrl={fromWallet.icon} className="h-6 w-6 object-contain dark:brightness-0 dark:invert" altText={fromWallet.name} />
                                                                                <span className={tooltipClasses}>{fromWallet.name}</span>
                                                                            </div>
                                                                        )}
                                                                        <ArrowRightIcon className="h-4 w-4 text-slate-400 dark:text-neutral-500" />
                                                                        {toWallet && (
                                                                            <div className="relative has-tooltip">
                                                                                <WalletIconComponent walletId={toWallet.id} iconUrl={toWallet.icon} className="h-6 w-6 object-contain dark:brightness-0 dark:invert" altText={toWallet.name} />
                                                                                <span className={tooltipClasses}>{toWallet.name}</span>
                                                                            </div>
                                                                        )}
                                                                    </>
                                                                );
                                                            })()}
                                                        </div>
                                                        <span className="ml-4 font-bold">{formatRupiah(transaction.amount)}</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center space-x-3">
                                                        {(() => {
                                                            const wallet = wallets.find(w => w.id === transaction.wallet);
                                                            return wallet && (
                                                                <div className="relative has-tooltip">
                                                                    <WalletIconComponent 
                                                                        walletId={wallet.id} iconUrl={wallet.icon} 
                                                                        className="h-6 w-6 object-contain dark:brightness-0 dark:invert" altText={wallet.name}
                                                                    />
                                                                    <span className={tooltipClasses}>{wallet.name}</span>
                                                                </div>
                                                            );
                                                        })()}
                                                        <span className="font-bold">{`${transaction.type === TransactionType.IN ? '+' : '-'} ${formatRupiah(transaction.amount)}`}</span>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-3 align-middle text-sm font-semibold text-sky-600 dark:text-sky-300">{formatRupiah(transaction.margin)}</td>
                                            <td className="p-3 align-middle text-center">
                                                <div className="flex items-center justify-center space-x-1">
                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (transaction.isInternalTransfer && onEditTransfer) {
                                                                onEditTransfer(transaction);
                                                            } else {
                                                                onEditTransaction(transaction);
                                                            }
                                                        }}
                                                        className="p-2 rounded-full text-slate-500 dark:text-neutral-400 hover:bg-slate-200/60 dark:hover:bg-white/10"
                                                        aria-label="Edit transaksi"
                                                    >
                                                        <EditIcon className="h-4 w-4" />
                                                    </button>
                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (transaction.isInternalTransfer && transaction.transferId) {
                                                                onDeleteTransferConfirm(transaction.transferId);
                                                            } else {
                                                                onDeleteTransactionConfirm(transaction.id);
                                                            }
                                                        }}
                                                        className="p-2 rounded-full text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/10"
                                                        aria-label="Hapus transaksi"
                                                    >
                                                        <DeleteIcon className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
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

            {/* Tampilan Kartu untuk Mobile */}
            <div className="flex-grow md:hidden space-y-3">
                 {transactions.length > 0 ? (
                    transactions.map(transaction => {
                        return (
                            <div 
                                key={transaction.id}
                                onClick={() => onInfoTransaction(transaction)}
                                className={`p-4 rounded-2xl border transition-colors duration-200 cursor-pointer ${
                                    transaction.isPiutang 
                                        ? 'bg-red-100/60 border-red-200 dark:bg-red-500/10 dark:border-red-500/20' 
                                        : 'bg-white border-slate-200 dark:bg-white/5 dark:border-white/10'
                                }`}
                            >
                                <div className="flex justify-between items-start gap-3">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-base font-semibold text-slate-800 dark:text-white truncate">{transaction.description}</p>
                                        <p className="text-sm text-slate-600 dark:text-neutral-300 truncate">{transaction.customer || 'Pelanggan'}</p>
                                    </div>
                                    <div className="flex-shrink-0 flex items-center gap-1">
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (transaction.isInternalTransfer && onEditTransfer) {
                                                    onEditTransfer(transaction);
                                                } else {
                                                    onEditTransaction(transaction);
                                                }
                                            }} 
                                            className="p-2 -mr-1 text-slate-500 dark:text-neutral-400 rounded-full hover:bg-black/5 dark:hover:bg-white/10" aria-label="Edit transaksi"
                                        >
                                            <EditIcon className="h-5 w-5" />
                                        </button>
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (transaction.isInternalTransfer && transaction.transferId) {
                                                    onDeleteTransferConfirm(transaction.transferId);
                                                } else {
                                                    onDeleteTransactionConfirm(transaction.id);
                                                }
                                            }} 
                                            className="p-2 -mr-2 text-red-500 dark:text-red-400 rounded-full hover:bg-black/5 dark:hover:bg-white/10" aria-label="Hapus transaksi"
                                        >
                                            <DeleteIcon className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="mt-3 flex justify-between items-end">
                                    {transaction.toWallet ? (
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center space-x-2">
                                                {(() => {
                                                    const fromWallet = wallets.find(w => w.id === transaction.wallet);
                                                    const toWallet = wallets.find(w => w.id === transaction.toWallet);
                                                    return (
                                                        <>
                                                            {fromWallet && (
                                                                <div className="relative has-tooltip">
                                                                    <WalletIconComponent walletId={fromWallet.id} iconUrl={fromWallet.icon} className="h-7 w-7 object-contain dark:brightness-0 dark:invert" altText={fromWallet.name} />
                                                                    <span className={tooltipClasses}>{fromWallet.name}</span>
                                                                </div>
                                                            )}
                                                            <ArrowRightIcon className="h-4 w-4 text-slate-400 dark:text-neutral-500" />
                                                            {toWallet && (
                                                                <div className="relative has-tooltip">
                                                                    <WalletIconComponent walletId={toWallet.id} iconUrl={toWallet.icon} className="h-7 w-7 object-contain dark:brightness-0 dark:invert" altText={toWallet.name} />
                                                                    <span className={tooltipClasses}>{toWallet.name}</span>
                                                                </div>
                                                            )}
                                                        </>
                                                    );
                                                })()}
                                            </div>
                                            <p className="text-lg font-bold text-slate-800 dark:text-white mt-1">{formatRupiah(transaction.amount)}</p>
                                        </div>
                                    ) : (
                                        <div className="flex items-center space-x-3">
                                            {(() => {
                                                const wallet = wallets.find(w => w.id === transaction.wallet);
                                                return wallet && (
                                                    <div className="relative has-tooltip">
                                                        <WalletIconComponent walletId={wallet.id} iconUrl={wallet.icon} className="h-7 w-7 object-contain dark:brightness-0 dark:invert" altText={wallet.name} />
                                                        <span className={tooltipClasses}>{wallet.name}</span>
                                                    </div>
                                                );
                                            })()}
                                            <div>
                                                <p className={`text-lg font-bold ${transaction.type === TransactionType.IN ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                                                    {`${transaction.type === TransactionType.IN ? '+' : '-'} ${formatRupiah(transaction.amount)}`}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                    <div className="text-right flex-shrink-0">
                                        <p className="text-xs text-sky-600 dark:text-sky-300 font-medium">{transaction.toWallet ? 'Biaya:' : 'Margin:'} {formatRupiah(transaction.margin)}</p>
                                        <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">{new Date(transaction.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short'})}</p>
                                    </div>
                                </div>
                                {transaction.notes && (
                                    <p className="text-xs text-slate-500 dark:text-neutral-400 truncate italic mt-2 pt-2 border-t border-slate-200/50 dark:border-white/5">
                                        "{transaction.notes}"
                                    </p>
                                )}
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