import React, { useMemo, useState } from 'react';
import { Transaction, Wallet } from '../types';
import CustomerDetailModal from '../components/CustomerDetailModal';
import { ChevronDownIcon } from '../components/icons/Icons';

interface CustomerManagementPageProps {
    transactions: Transaction[];
    formatRupiah: (amount: number) => string;
    wallets: Wallet[];
}

interface CustomerSummary {
    name: string;
    transactionCount: number;
    totalPiutang: number;
    totalMargin: number;
}

const CustomerManagementPage: React.FC<CustomerManagementPageProps> = ({ transactions, formatRupiah, wallets }) => {
    const [selectedPeriod, setSelectedPeriod] = useState('all-time'); // 'all-time' or 'YYYY-MM'
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedCustomerName, setSelectedCustomerName] = useState<string | null>(null);

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

    const customerData = useMemo<CustomerSummary[]>(() => {
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
        
        filteredTransactions.forEach(t => {
            // Exclude internal/generic customers, but include "Pelanggan"
            if (!t.customer || ['internal', 'brilink'].includes(t.customer.toLowerCase())) return;

            const entry = summaryMap.get(t.customer) || { transactionCount: 0, totalPiutang: 0, totalMargin: 0 };
            
            const updatedEntry = {
                transactionCount: entry.transactionCount + 1,
                totalMargin: entry.totalMargin + t.margin,
                totalPiutang: entry.totalPiutang + (t.isPiutang ? (t.amount + t.margin) : 0),
            };

            summaryMap.set(t.customer, updatedEntry);
        });

        return Array.from(summaryMap, ([name, data]) => ({ name, ...data }))
            .sort((a,b) => b.totalMargin - a.totalMargin);

    }, [transactions, selectedPeriod]);

    const handleRowClick = (customerName: string) => {
        setSelectedCustomerName(customerName);
        setIsDetailModalOpen(true);
    };

    const selectedCustomerTransactions = useMemo(() => {
        if (!selectedCustomerName) return [];
        return transactions
            .filter(t => t.customer === selectedCustomerName)
            .sort((a, b) => {
                // Primary sort: piutang status
                if (a.isPiutang !== b.isPiutang) {
                    return a.isPiutang ? -1 : 1;
                }
                
                // Secondary sort: if both are piutang, sort by date ascending (oldest first)
                if (a.isPiutang && b.isPiutang) {
                    return new Date(a.date).getTime() - new Date(b.date).getTime();
                }

                // Tertiary sort: for non-piutang items, sort by date descending (newest first)
                return new Date(b.date).getTime() - new Date(a.date).getTime();
            });
    }, [selectedCustomerName, transactions]);
    
    return (
        <>
            <main className="p-4 sm:p-6 flex-1">
                <div className="mx-auto max-w-4xl">
                    <div className="bg-white dark:bg-neutral-800 p-4 rounded-3xl shadow-lg shadow-slate-200/50 dark:shadow-none">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 px-2 gap-4">
                            <h3 className="text-lg font-medium text-slate-800 dark:text-white">Analisis Pelanggan</h3>
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
                        <div className="overflow-x-auto">
                            <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-white/10">
                                <table className="w-full text-left">
                                    <thead className="border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5">
                                        <tr>
                                            <th className="p-3 text-xs font-semibold uppercase text-slate-500 dark:text-[#958F99] tracking-wider">Nama Pelanggan</th>
                                            <th className="p-3 text-xs font-semibold uppercase text-slate-500 dark:text-[#958F99] tracking-wider text-center">Jml. Transaksi</th>
                                            <th className="p-3 text-xs font-semibold uppercase text-slate-500 dark:text-[#958F99] tracking-wider">Total Margin</th>
                                            <th className="p-3 text-xs font-semibold uppercase text-slate-500 dark:text-[#958F99] tracking-wider">Total Piutang</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {customerData.length > 0 ? customerData.map(customer => (
                                            <tr 
                                                key={customer.name} 
                                                className="border-b border-slate-200 dark:border-white/10 last:border-b-0 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors duration-200 cursor-pointer"
                                                onClick={() => handleRowClick(customer.name)}
                                            >
                                                <td className="p-3 text-sm text-slate-800 dark:text-white font-medium">{customer.name}</td>
                                                <td className="p-3 text-sm text-slate-600 dark:text-neutral-300 text-center">{customer.transactionCount}</td>
                                                <td className="p-3 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                                                    {formatRupiah(customer.totalMargin)}
                                                </td>
                                                <td className={`p-3 text-sm font-medium ${customer.totalPiutang > 0 ? 'text-yellow-500 dark:text-yellow-400' : 'text-slate-500 dark:text-neutral-400'}`}>
                                                    {formatRupiah(customer.totalPiutang)}
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan={4} className="text-center py-10 text-slate-400 dark:text-neutral-500">
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
            <CustomerDetailModal 
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                customerName={selectedCustomerName}
                transactions={selectedCustomerTransactions}
                wallets={wallets}
                formatRupiah={formatRupiah}
            />
        </>
    );
};

export default CustomerManagementPage;