
import React, { useMemo } from 'react';
import { Transaction } from '../types';

interface CustomerManagementPageProps {
    transactions: Transaction[];
    formatRupiah: (amount: number) => string;
}

interface CustomerSummary {
    name: string;
    transactionCount: number;
    totalPiutang: number;
}

const CustomerManagementPage: React.FC<CustomerManagementPageProps> = ({ transactions, formatRupiah }) => {

    const customerData = useMemo<CustomerSummary[]>(() => {
        const summaryMap = new Map<string, Omit<CustomerSummary, 'name'>>();
        
        transactions.forEach(t => {
            if (!t.customer || t.customer.toLowerCase() === 'pelanggan') return;

            const entry = summaryMap.get(t.customer) || { transactionCount: 0, totalPiutang: 0 };
            entry.transactionCount++;
            if (t.isPiutang) {
                entry.totalPiutang += t.amount;
            }
            summaryMap.set(t.customer, entry);
        });

        return Array.from(summaryMap, ([name, data]) => ({ name, ...data }))
            .sort((a,b) => b.totalPiutang - a.totalPiutang);

    }, [transactions]);
    
    return (
        <main className="p-4 sm:p-6 flex-1">
            <div className="mx-auto max-w-4xl">
                <div className="bg-white dark:bg-[#2A282F] p-4 rounded-3xl shadow-lg shadow-slate-200/50 dark:shadow-none">
                    <div className="flex justify-between items-center mb-4 px-2">
                        <h3 className="text-lg font-medium text-slate-800 dark:text-white">Daftar Pelanggan</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="border-b border-slate-200 dark:border-white/10">
                                <tr>
                                    <th className="p-3 text-xs font-medium uppercase text-slate-500 dark:text-[#958F99] tracking-wider">Nama Pelanggan</th>
                                    <th className="p-3 text-xs font-medium uppercase text-slate-500 dark:text-[#958F99] tracking-wider text-center">Jumlah Transaksi</th>
                                    <th className="p-3 text-xs font-medium uppercase text-slate-500 dark:text-[#958F99] tracking-wider">Total Piutang</th>
                                </tr>
                            </thead>
                            <tbody>
                                {customerData.map(customer => (
                                     <tr key={customer.name} className="border-b border-slate-200 dark:border-white/10 last:border-b-0 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors duration-200">
                                        <td className="p-3 text-sm text-slate-800 dark:text-white">{customer.name}</td>
                                        <td className="p-3 text-sm text-slate-600 dark:text-slate-300 text-center">{customer.transactionCount}</td>
                                        <td className={`p-3 text-sm font-medium ${customer.totalPiutang > 0 ? 'text-yellow-500 dark:text-yellow-400' : 'text-slate-500 dark:text-slate-400'}`}>
                                            {formatRupiah(customer.totalPiutang)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default CustomerManagementPage;