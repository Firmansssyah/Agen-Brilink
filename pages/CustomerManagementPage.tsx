import React, { useMemo, useState } from 'react';
import { Transaction, Wallet, SortDirection, TransactionType } from '../types';
import CustomerDetailModal from '../components/CustomerDetailModal';
import RewardModal from '../components/RewardModal';
import { ChevronDownIcon, ChevronUpIcon, GiftIcon } from '../components/icons/Icons';

// Properti untuk komponen CustomerManagementPage.
interface CustomerManagementPageProps {
    transactions: Transaction[];
    formatRupiah: (amount: number) => string;
    wallets: Wallet[];
    onSaveTransaction: (data: Transaction | Omit<Transaction, 'id' | 'date'>) => void;
}

// Struktur data untuk ringkasan per pelanggan.
interface CustomerSummary {
    name: string;
    transactionCount: number;
    totalPiutang: number;
    totalMargin: number;
}

// Tipe alias untuk kunci pengurutan tabel pelanggan.
type CustomerSortKey = 'name' | 'transactionCount' | 'totalMargin' | 'totalPiutang';

/**
 * Komponen SortableHeader adalah header kolom untuk tabel yang dapat diklik
 * untuk mengurutkan data berdasarkan kolom tersebut.
 */
const SortableHeader: React.FC<{
    columnKey: CustomerSortKey;
    title: string;
    onSort: (key: CustomerSortKey) => void;
    sortKey: CustomerSortKey;
    sortDirection: SortDirection;
    className?: string;
    textAlignment?: 'text-left' | 'text-center' | 'text-right';
}> = ({ columnKey, title, onSort, sortKey, sortDirection, className = "", textAlignment = 'text-left' }) => {
    const isActive = sortKey === columnKey; // Cek apakah ini kolom yang sedang aktif diurutkan.
    
    return (
        <th className={`p-2 text-xs font-semibold uppercase text-slate-500 dark:text-[#958F99] tracking-wider ${className} ${textAlignment}`}>
            <button onClick={() => onSort(columnKey)} className={`flex items-center space-x-1.5 group focus:outline-none ${textAlignment === 'text-center' ? 'mx-auto' : ''}`}>
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
 * Komponen CustomerManagementPage menampilkan analisis data pelanggan,
 * termasuk jumlah transaksi, total margin, dan total piutang.
 * Data dapat difilter berdasarkan periode waktu dan diurutkan.
 */
const CustomerManagementPage: React.FC<CustomerManagementPageProps> = ({ transactions, formatRupiah, wallets, onSaveTransaction }) => {
    // State untuk periode filter (misal: 'all-time' atau '2023-10').
    const [selectedPeriod, setSelectedPeriod] = useState('all-time');
    // State untuk visibilitas modal detail pelanggan.
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isRewardModalOpen, setIsRewardModalOpen] = useState(false);
    // State untuk menyimpan nama pelanggan yang detailnya akan ditampilkan.
    const [selectedCustomerName, setSelectedCustomerName] = useState<string | null>(null);
    const [customerForReward, setCustomerForReward] = useState<CustomerSummary | null>(null);
    // State untuk pengurutan tabel.
    const [sortKey, setSortKey] = useState<CustomerSortKey>('totalMargin');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

    // useMemo untuk mendapatkan daftar bulan unik dari transaksi untuk filter dropdown.
    const availableMonths = useMemo(() => {
        const months = new Set<string>();
        transactions.forEach(t => {
            const date = new Date(t.date);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            months.add(`${year}-${month}`);
        });
        return Array.from(months).sort().reverse();
    }, [transactions]);

    // useMemo untuk menghitung dan mengelompokkan data pelanggan berdasarkan periode yang dipilih.
    const customerData = useMemo<CustomerSummary[]>(() => {
        // 1. Saring transaksi berdasarkan periode.
        const filteredTransactions = transactions.filter(t => {
            if (t.isInternalTransfer) return false;
            if (selectedPeriod === 'all-time') {
                return true;
            }
            const date = new Date(t.date);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            return `${year}-${month}` === selectedPeriod;
        });

        const summaryMap = new Map<string, Omit<CustomerSummary, 'name'>>();
        
        // 2. Agregasi data per pelanggan.
        filteredTransactions.forEach(t => {
            // Abaikan pelanggan internal/generik.
            if (!t.customer || ['internal', 'brilink', 'pelanggan'].includes(t.customer.toLowerCase())) return;

            const entry = summaryMap.get(t.customer) || { transactionCount: 0, totalPiutang: 0, totalMargin: 0 };
            
            const updatedEntry = {
                transactionCount: entry.transactionCount + 1,
                totalMargin: entry.totalMargin + t.margin,
                totalPiutang: entry.totalPiutang + (t.isPiutang ? (t.amount + t.margin) : 0),
            };

            summaryMap.set(t.customer, updatedEntry);
        });

        // 3. Ubah map menjadi array.
        const data = Array.from(summaryMap, ([name, data]) => ({ name, ...data }));
        
        // 4. Lakukan pengurutan.
        data.sort((a, b) => {
            const valA = a[sortKey];
            const valB = b[sortKey];
            let comparison = 0;
            
            if (typeof valA === 'string' && typeof valB === 'string') {
                comparison = valA.localeCompare(valB);
            } else if (typeof valA === 'number' && typeof valB === 'number') {
                comparison = valA - valB;
            }

            return sortDirection === 'asc' ? comparison : -comparison;
        });
        
        return data;

    }, [transactions, selectedPeriod, sortKey, sortDirection]);

    // Handler saat baris pelanggan di-klik untuk membuka modal detail.
    const handleRowClick = (customerName: string) => {
        setSelectedCustomerName(customerName);
        setIsDetailModalOpen(true);
    };

    const handleOpenRewardModal = (customer: CustomerSummary) => {
        setCustomerForReward(customer);
        setIsRewardModalOpen(true);
    };

    const handleSaveReward = (data: { rewardName: string, cost: number, walletId: string }) => {
        if (!customerForReward) return;

        const rewardTransaction: Omit<Transaction, 'id' | 'date'> = {
            description: `Reward: ${data.rewardName}`,
            customer: customerForReward.name,
            type: TransactionType.OUT,
            amount: data.cost,
            margin: 0,
            wallet: data.walletId,
            isPiutang: false,
        };
        onSaveTransaction(rewardTransaction);
        setIsRewardModalOpen(false);
    };

    // Handler untuk mengubah pengurutan tabel.
    const handleSort = (key: CustomerSortKey) => {
        if (sortKey === key) {
            setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortKey(key);
            // Default ke 'desc' untuk kolom angka, 'asc' untuk nama.
            setSortDirection(key === 'name' ? 'asc' : 'desc');
        }
    };


    // useMemo untuk menyaring riwayat transaksi pelanggan yang dipilih untuk ditampilkan di modal.
    const selectedCustomerTransactions = useMemo(() => {
        if (!selectedCustomerName) return [];
        return transactions
            .filter(t => t.customer === selectedCustomerName)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [selectedCustomerName, transactions]);
    
    return (
        <>
            <main className="p-4 sm:p-6 flex-1">
                <div className="mx-auto max-w-4xl">
                    <div className="bg-white dark:bg-neutral-800 p-4 rounded-3xl shadow-lg shadow-slate-200/50 dark:shadow-none">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 px-2 gap-4">
                            <h3 className="text-lg font.medium text-slate-800 dark:text-white">Analisis Pelanggan</h3>
                            <div className="w-full sm:w-auto relative">
                                <select 
                                    value={selectedPeriod} 
                                    onChange={(e) => setSelectedPeriod(e.target.value)}
                                    className="w-full sm:w-56 bg-slate-100 dark:bg-neutral-700 border border-transparent focus:border-blue-400 focus:ring-1 focus:ring-blue-400 rounded-full px-4 py-2 text-sm text-slate-800 dark:text-white transition outline-none appearance-none"
                                >
                                    <option value="all-time">Semua Waktu</option>
                                    {availableMonths.map(monthStr => {
                                        const [year, monthIndex] = monthStr.split('-');
                                        const date = new Date(parseInt(year), parseInt(monthIndex) - 1);
                                        const displayMonth = date.toLocaleString('id-ID', { month: 'long', year: 'numeric' });
                                        return <option key={monthStr} value={monthStr}>{displayMonth}</option>
                                    })}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-neutral-400">
                                    <ChevronDownIcon className="h-5 w-5" />
                                </div>
                            </div>
                        </div>
                        <div className="overflow-x-auto no-scrollbar">
                            <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-white/10">
                                <table className="w-full text-left">
                                    <thead className="border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5">
                                        <tr>
                                            <SortableHeader columnKey="name" title="Nama Pelanggan" sortKey={sortKey} sortDirection={sortDirection} onSort={handleSort} />
                                            <SortableHeader columnKey="transactionCount" title="Jml. Transaksi" sortKey={sortKey} sortDirection={sortDirection} onSort={handleSort} textAlignment="text-center" />
                                            <SortableHeader columnKey="totalMargin" title="Total Margin" sortKey={sortKey} sortDirection={sortDirection} onSort={handleSort} />
                                            <SortableHeader columnKey="totalPiutang" title="Total Piutang" sortKey={sortKey} sortDirection={sortDirection} onSort={handleSort} />
                                            <th className="p-2 text-xs font-semibold uppercase text-slate-500 dark:text-[#958F99] tracking-wider text-center">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {customerData.length > 0 ? customerData.map(customer => (
                                            <tr 
                                                key={customer.name} 
                                                className="border-b border-slate-200 dark:border-white/10 last:border-b-0 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors duration-200 cursor-pointer"
                                                onClick={() => handleRowClick(customer.name)}
                                            >
                                                <td className="p-2 text-sm text-slate-800 dark:text-white font.medium">{customer.name}</td>
                                                <td className="p-2 text-sm text-slate-600 dark:text-neutral-300 text-center">{customer.transactionCount}</td>
                                                <td className="p-2 text-sm font.medium text-emerald-600 dark:text-emerald-400">
                                                    {formatRupiah(customer.totalMargin)}
                                                </td>
                                                <td className={`p-2 text-sm font.medium ${customer.totalPiutang > 0 ? 'text-yellow-500 dark:text-yellow-400' : 'text-slate-500 dark:text-neutral-400'}`}>
                                                    {formatRupiah(customer.totalPiutang)}
                                                </td>
                                                <td className="p-2 text-sm text-center">
                                                    <div className="relative has-tooltip inline-flex">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleOpenRewardModal(customer);
                                                            }}
                                                            className="p-2 rounded-full text-amber-500 hover:bg-amber-100 dark:hover:bg-amber-500/10 transition-colors"
                                                            aria-label={`Beri reward untuk ${customer.name}`}
                                                        >
                                                            <GiftIcon className="h-5 w-5" />
                                                        </button>
                                                        <span className="tooltip absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 bg-slate-700 text-white text-xs rounded-md shadow-lg">
                                                            Beri Reward
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan={5} className="text-center py-10 text-slate-400 dark:text-neutral-500">
                                                    Tidak ada data pelanggan untuk periode ini.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            {/* Modal untuk menampilkan detail transaksi pelanggan */}
            <CustomerDetailModal 
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                customerName={selectedCustomerName}
                transactions={selectedCustomerTransactions}
                wallets={wallets}
                formatRupiah={formatRupiah}
            />
             <RewardModal
                isOpen={isRewardModalOpen}
                onClose={() => setIsRewardModalOpen(false)}
                onSave={handleSaveReward}
                customerName={customerForReward?.name || null}
            />
        </>
    );
};

export default CustomerManagementPage;