
import React, { useState, useMemo, useCallback } from 'react';
import { Transaction, Wallet } from '../types';
import MonthlyFinancialSummary from '../components/MonthlyFinancialSummary';
import FinancialChart from '../components/FinancialChart';
import TransactionTypeAnalysis from '../components/TransactionTypeAnalysis';
import TransactionHeatmap from '../components/TransactionHeatmap';
import DailyTransactionsModal from '../components/DailyTransactionsModal';
import TransactionModal from '../components/TransactionModal';

interface ReportsPageProps {
    transactions: Transaction[];
    formatRupiah: (amount: number) => string;
    wallets: Wallet[];
    onSaveTransaction: (data: Transaction | Omit<Transaction, 'id' | 'date'>) => void;
    onDeleteTransaction: (transactionId: string) => void;
    categories: string[];
    customers: string[];
}

const ReportsPage: React.FC<ReportsPageProps> = ({
    transactions,
    formatRupiah,
    wallets,
    onSaveTransaction,
    onDeleteTransaction,
    categories,
    customers,
}) => {
    const [dailyModalDate, setDailyModalDate] = useState<string | null>(null);
    const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
    const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);

    const handleHeatmapDayClick = useCallback((date: string) => {
        setDailyModalDate(date);
    }, []);

    const handleOpenEditModal = (transaction: Transaction) => {
        setDailyModalDate(null); // Close daily modal if open
        setTransactionToEdit(transaction);
        setIsTransactionModalOpen(true);
    };

    const handleCloseTransactionModal = () => {
        setIsTransactionModalOpen(false);
        setTransactionToEdit(null);
    };

    const handleSaveFromModal = (data: Transaction | Omit<Transaction, 'id' | 'date'>) => {
        onSaveTransaction(data);
        setIsTransactionModalOpen(false);
    };

    const dailyTransactions = useMemo(() => {
        if (!dailyModalDate) return [];
        // Adjust for timezone when creating the date object
        const [year, month, day] = dailyModalDate.split('-').map(Number);
        const targetDateStart = new Date(year, month - 1, day);
        targetDateStart.setHours(0, 0, 0, 0);

        const targetDateEnd = new Date(year, month - 1, day);
        targetDateEnd.setHours(23, 59, 59, 999);

        return transactions.filter(t => {
            const tDate = new Date(t.date);
            return tDate >= targetDateStart && tDate <= targetDateEnd;
        }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [dailyModalDate, transactions]);

    return (
        <>
            <DailyTransactionsModal
                isOpen={!!dailyModalDate}
                onClose={() => setDailyModalDate(null)}
                date={dailyModalDate}
                transactions={dailyTransactions}
                wallets={wallets}
                formatRupiah={formatRupiah}
                onEditTransaction={handleOpenEditModal}
            />
            <TransactionModal
                isOpen={isTransactionModalOpen}
                onClose={handleCloseTransactionModal}
                onSave={handleSaveFromModal}
                onDeleteTransaction={onDeleteTransaction}
                transactionToEdit={transactionToEdit}
                wallets={wallets}
                categories={categories}
                customers={customers}
                formatRupiah={formatRupiah}
            />
            <main className="p-4 sm:p-6 flex-1">
                <div className="mx-auto max-w-7xl">
                    <div className="space-y-6">
                        <FinancialChart
                            transactions={transactions}
                            formatRupiah={formatRupiah}
                        />
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <TransactionTypeAnalysis 
                                transactions={transactions}
                            />
                            <TransactionHeatmap 
                                transactions={transactions}
                                formatRupiah={formatRupiah}
                                onDayClick={handleHeatmapDayClick}
                            />
                        </div>
                        <MonthlyFinancialSummary 
                            transactions={transactions}
                            formatRupiah={formatRupiah}
                        />
                    </div>
                </div>
            </main>
        </>
    );
};

export default ReportsPage;