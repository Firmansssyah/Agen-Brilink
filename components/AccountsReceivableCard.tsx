import React, { useMemo } from 'react';
import { Transaction } from '../types';
import { ChevronRightIcon, CheckIcon } from './icons/Icons';

// Interface untuk properti komponen AccountsReceivableCard.
interface AccountsReceivableCardProps {
    receivableTransactions: Transaction[]; // Daftar semua transaksi piutang.
    totalPiutang: number; // Jumlah total semua piutang.
    formatRupiah: (amount: number) => string; // Fungsi untuk memformat angka ke Rupiah.
    onOpenDetail: (customerName: string) => void; // Callback saat pengguna ingin melihat detail piutang per pelanggan.
    onSettleReceivable: (transaction: Transaction) => void; // Callback untuk melunasi transaksi piutang tertua.
}

// Interface untuk struktur data piutang yang telah dikelompokkan per pelanggan.
interface GroupedReceivable {
    customer: string;
    totalAmount: number;
    transactionCount: number;
    oldestTransaction: Transaction;
}

/**
 * Komponen AccountsReceivableCard menampilkan ringkasan daftar piutang.
 * Komponen ini mengelompokkan piutang berdasarkan pelanggan, menampilkan total
 * piutang per pelanggan, dan memungkinkan pengguna untuk melunasi atau melihat detail.
 */
const AccountsReceivableCard: React.FC<AccountsReceivableCardProps> = ({ receivableTransactions, totalPiutang, formatRupiah, onOpenDetail, onSettleReceivable }) => {

    // useMemo untuk mengelompokkan dan mengurutkan piutang, dihitung ulang hanya jika daftar piutang berubah.
    const groupedReceivables = useMemo((): GroupedReceivable[] => {
        const customerMap = new Map<string, GroupedReceivable>();

        // Mengelompokkan transaksi piutang berdasarkan nama pelanggan.
        receivableTransactions.forEach(transaction => {
            const customerName = transaction.customer;
            const existing = customerMap.get(customerName);

            if (existing) {
                // Jika pelanggan sudah ada di map, perbarui total dan jumlah transaksinya.
                existing.totalAmount += transaction.amount + transaction.margin;
                existing.transactionCount++;
                if (new Date(transaction.date) < new Date(existing.oldestTransaction.date)) {
                    existing.oldestTransaction = transaction;
                }
            } else {
                // Jika pelanggan baru, tambahkan entri baru ke map.
                customerMap.set(customerName, {
                    customer: customerName,
                    totalAmount: transaction.amount + transaction.margin,
                    transactionCount: 1,
                    oldestTransaction: transaction,
                });
            }
        });

        const grouped = Array.from(customerMap.values());
        
        // Mengurutkan pelanggan berdasarkan tanggal piutang terlama (yang paling lama menunggak tampil di atas).
        grouped.sort((a, b) => 
            new Date(a.oldestTransaction.date).getTime() - new Date(b.oldestTransaction.date).getTime()
        );

        return grouped;
    }, [receivableTransactions]);

    /**
     * Fungsi utilitas untuk menghitung sudah berapa hari piutang berlangsung.
     * @param dateString - Tanggal piutang dalam format ISO string.
     * @returns String yang mendeskripsikan umur piutang (e.g., "Hari ini", "5 hari").
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
        <div className="bg-white dark:bg-neutral-800 rounded-3xl flex flex-col shadow-lg shadow-slate-200/50 dark:shadow-none h-full">
            {/* Header Kartu */}
            <div className="p-4 flex-shrink-0 border-b border-slate-200 dark:border-white/10">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font.medium text-slate-800 dark:text-white">Daftar Piutang</h3>
                </div>
            </div>
            
            {/* Body Kartu (Daftar Piutang) */}
            <div className="no-scrollbar px-2 pb-2 flex-grow min-h-0 overflow-y-auto">
                {groupedReceivables.length > 0 ? (
                    <div className="space-y-2">
                        {groupedReceivables.map((item) => {
                            const daysAgo = calculateDaysAgo(item.oldestTransaction.date);
                            return (
                                <button 
                                    key={item.customer} 
                                    onClick={() => onOpenDetail(item.customer)}
                                    className="group w-full flex justify-between mt-2 items-center px-4 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition-colors duration-200 text-left"
                                >
                                    <div className="flex flex-col min-w-0 flex-1">
                                        <span className="text-sm text-slate-700 dark:text-neutral-200 truncate font.medium">{item.customer}</span>
                                        <span className="text-xs text-slate-500 dark:text-neutral-400 truncate">{`${item.transactionCount} transaksi`}</span>
                                    </div>
                                    <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
                                        <div className="flex flex-col items-end">
                                          <span className="text-sm font.medium text-yellow-500 dark:text-yellow-400">{formatRupiah(item.totalAmount)}</span>
                                          <span className="text-xs text-red-500 dark:text-red-300">{daysAgo}</span>
                                        </div>
                                        {/* Tombol untuk melunasi piutang tertua dari pelanggan ini */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation(); // Mencegah tombol detail ikut ter-klik.
                                                onSettleReceivable(item.oldestTransaction);
                                            }}
                                            className="z-10 h-9 w-9 flex-shrink-0 rounded-full border border-slate-300 dark:border-neutral-600 text-slate-500 dark:text-neutral-400 flex items-center justify-center transition-colors duration-200 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 hover:border-emerald-400 dark:hover:border-emerald-500 hover:text-emerald-500 dark:hover:text-emerald-400"
                                            aria-label={`Lunas piutang tertua dari ${item.customer}`}
                                        >
                                            <CheckIcon className="h-4 w-4" />
                                        </button>
                                        
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                ) : (
                    // Tampilan jika tidak ada piutang.
                    <div className="flex flex-col items-center justify-center h-full text-center p-4">
                        <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center mb-4">
                           <CheckIcon className="w-8 h-8 text-emerald-500 dark:text-emerald-400" />
                        </div>
                        <p className="text-slate-600 dark:text-neutral-300 font-medium">Lunas!</p>
                        <p className="text-slate-400 dark:text-neutral-500 text-sm mt-1">Tidak ada piutang saat ini.</p>
                    </div>
                )}
            </div>
            
            {/* Footer Kartu (Total Piutang) */}
            {receivableTransactions.length > 0 && (
                <div className="p-4 border-t border-slate-200 dark:border-white/10 flex-shrink-0">
                    <div className="flex justify-between items-center">
                        <span className="text-sm font.medium text-slate-600 dark:text-neutral-300">Total Piutang</span>
                        <span className="text-xl font.bold text-yellow-500 dark:text-yellow-400">{formatRupiah(totalPiutang)}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AccountsReceivableCard;