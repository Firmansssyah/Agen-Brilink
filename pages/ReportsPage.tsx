import React from 'react';
import { Transaction } from '../types';
import MonthlyFinancialSummary from '../components/MonthlyFinancialSummary';

interface ReportsPageProps {
    transactions: Transaction[];
    formatRupiah: (amount: number) => string;
}

const ReportsPage: React.FC<ReportsPageProps> = ({ transactions, formatRupiah }) => {
    return (
        <main className="p-4 sm:p-6 flex-1">
            <div className="mx-auto max-w-7xl">
                <div className="space-y-6">
                    <MonthlyFinancialSummary 
                        transactions={transactions}
                        formatRupiah={formatRupiah}
                    />
                </div>
            </div>
        </main>
    );
};

export default ReportsPage;