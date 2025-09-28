
import React, { useMemo, useState } from 'react';
import { Transaction, Wallet, SortKey, SortDirection, TransactionType } from '../types';
import WalletsSummaryCard from '../components/WalletsSummaryCard';
import AccountsReceivableCard from '../components/AccountsReceivableCard';
import TransactionTable from '../components/TransactionTable';
import TransactionHeatmap from '../components/TransactionHeatmap';
import TransactionModal from '../components/TransactionModal';
import AddFeeModal from '../components/AddFeeModal';

interface DashboardPageProps {
    wallets: Wallet[];
    transactions: Transaction[];
    accountsReceivable: Transaction[];
    totalPiutang: number;
    categories: string[];
    customers: string[];
    onSettleReceivable: (transaction: Transaction) => void;
    onSaveTransaction: (data: Transaction | Omit<Transaction, 'id' | 'date'>) => void;
    onDeleteTransaction: (transactionId: string) => void;
    formatRupiah: (amount: number) => string;
}

const DashboardPage: React.FC<DashboardPageProps> = ({
    wallets,
    transactions,
    accountsReceivable,
    totalPiutang,
    categories,
    customers,
    onSettleReceivable,
    onSaveTransaction,
    onDeleteTransaction,
    formatRupiah,
}) => {
    const [transactionTablePage, setTransactionTablePage] = useState(1);
    const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
    const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);
    const [sortKey, setSortKey] = useState<SortKey>('date');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
    const [isFeeModalOpen, setIsFeeModalOpen] = useState(false);
    const itemsPerPage = 10;

    const currentMonthMargin = useMemo(() => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        return transactions
            .filter(t => {
                const transactionDate = new Date(t.date);
                return transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear;
            })
            .reduce((acc, curr) => acc + curr.margin, 0);
    }, [transactions]);

    const sortedTransactions = useMemo(() => {
        const items = [...transactions];
        items.sort((a, b) => {
            const valA = a[sortKey];
            const valB = b[sortKey];

            let comparison = 0;
            if (sortKey === 'date') {
                comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
            } else if (typeof valA === 'string' && typeof valB === 'string') {
                comparison = valA.localeCompare(valB);
            } else if (typeof valA === 'number' && typeof valB === 'number') {
                comparison = valA - valB;
            }

            return sortDirection === 'asc' ? comparison : -comparison;
        });
        return items;
    }, [transactions, sortKey, sortDirection]);
    
    const totalPages = Math.ceil(sortedTransactions.length / itemsPerPage) || 1;

    const paginatedTransactions = useMemo(() => {
        const startIndex = (transactionTablePage - 1) * itemsPerPage;
        return sortedTransactions.slice(startIndex, startIndex + itemsPerPage);
    }, [sortedTransactions, transactionTablePage]);
    
    const handleOpenAddModal = () => {
        setTransactionToEdit(null);
        setIsTransactionModalOpen(true);
    };

    const handleOpenEditModal = (transaction: Transaction) => {
        setTransactionToEdit(transaction);
        setIsTransactionModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsTransactionModalOpen(false);
    };

    const handleSaveFromModal = (data: Transaction | Omit<Transaction, 'id' | 'date'>) => {
        onSaveTransaction(data);
        setIsTransactionModalOpen(false);
    };
    
    const handleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortKey(key);
            setSortDirection(key === 'date' ? 'desc' : 'asc');
        }
        setTransactionTablePage(1);
    };

    const handleSaveFee = (amount: number) => {
        const feeTransaction: Omit<Transaction, 'id' | 'date'> = {
            description: 'Fee Bagi Hasil BRILink',
            customer: 'BRILink',
            type: TransactionType.IN,
            amount: 0,
            margin: amount,
            wallet: 'BRILINK',
            isPiutang: false,
        };
        onSaveTransaction(feeTransaction);
        setIsFeeModalOpen(false);
    };

    return (
        <>
            <TransactionModal
                isOpen={isTransactionModalOpen}
                onClose={handleCloseModal}
                onSave={handleSaveFromModal}
                onDeleteTransaction={onDeleteTransaction}
                transactionToEdit={transactionToEdit}
                wallets={wallets}
                categories={categories}
                formatRupiah={formatRupiah}
            />
            <AddFeeModal 
                isOpen={isFeeModalOpen}
                onClose={() => setIsFeeModalOpen(false)}
                onSave={handleSaveFee}
            />
            <main className="p-4 sm:p-6 flex-1">
                <div className="mx-auto max-w-7xl">
                    <div className="space-y-6">
                        {/* Main Grid Content */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Main Content Area */}
                            <div className="lg:col-span-2 space-y-6">
                                <section>
                                    <TransactionTable 
                                        wallets={wallets}
                                        transactions={paginatedTransactions} 
                                        formatRupiah={formatRupiah} 
                                        currentPage={transactionTablePage}
                                        totalPages={totalPages}
                                        setCurrentPage={setTransactionTablePage}
                                        onAddTransaction={handleOpenAddModal}
                                        onEditTransaction={handleOpenEditModal}
                                        sortKey={sortKey}
                                        sortDirection={sortDirection}
                                        onSort={handleSort}
                                    />
                                </section>
                            </div>

                            {/* Right Summary Sidebar */}
                            <div className="lg:col-span-1 space-y-6">
                                 <section>
                                    <WalletsSummaryCard 
                                        wallets={wallets}
                                        totalMargin={currentMonthMargin}
                                        formatRupiah={formatRupiah}
                                        onAddFee={() => setIsFeeModalOpen(true)}
                                    />
                                </section>
                                <section>
                                    <AccountsReceivableCard 
                                        receivableTransactions={accountsReceivable} 
                                        totalPiutang={totalPiutang}
                                        formatRupiah={formatRupiah} 
                                        onSettleReceivable={onSettleReceivable}
                                    />
                                </section>
                                <section>
                                    <TransactionHeatmap 
                                        transactions={transactions}
                                        formatRupiah={formatRupiah}
                                    />
                                </section>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
};

export default DashboardPage;
