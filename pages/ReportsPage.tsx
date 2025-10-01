



import React, { useState, useMemo } from 'react';
import { Transaction } from '../types';
import MonthlyFinancialSummary from '../components/MonthlyFinancialSummary';
import TransactionTypeAnalysis from '../components/TransactionTypeAnalysis';
import BrilinkFeeReport from '../components/BrilinkFeeReport';
import BrilinkFeeDetailModal from '../components/BrilinkFeeDetailModal';

interface ReportsPageProps {
    transactions: Transaction[];
    formatRupiah: (amount: number) => string;
    categories: string[];
}

const ReportsPage: React.FC<ReportsPageProps> = ({
    transactions,
    formatRupiah,
    categories,
}) => {
    const [isBrilinkDetailOpen, setIsBrilinkDetailOpen] = useState(false);

    const reportTransactions = useMemo(() => 
        transactions.filter(t => !t.isInternalTransfer), 
        [transactions]
    );
    
    const feeTransactions = useMemo(() => {
        return reportTransactions
            .filter(t => t.description === 'Fee Brilink')
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [reportTransactions]);


    return (
        <>
            <BrilinkFeeDetailModal
                isOpen={isBrilinkDetailOpen}
                onClose={() => setIsBrilinkDetailOpen(false)}
                feeTransactions={feeTransactions}
                formatRupiah={formatRupiah}
            />
            <main className="p-4 sm:p-6 flex-1">
                <div className="mx-auto max-w-7xl">
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <TransactionTypeAnalysis 
                                transactions={reportTransactions}
                                categories={categories}
                            />
                            <BrilinkFeeReport
                                feeTransactions={feeTransactions}
                                formatRupiah={formatRupiah}
                                onOpenDetail={() => setIsBrilinkDetailOpen(true)}
                            />
                        </div>
                        <MonthlyFinancialSummary 
                            transactions={reportTransactions}
                            formatRupiah={formatRupiah}
                        />
                    </div>
                </div>
            </main>
        </>
    );
};

export default ReportsPage;