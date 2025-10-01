import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { Transaction, Wallet, SortKey, SortDirection, TransactionType } from '../types';
import WalletsSummaryCard from '../components/WalletsSummaryCard';
import AccountsReceivableCard from '../components/AccountsReceivableCard';
import TransactionTable from '../components/TransactionTable';
import WeeklyTransactionSummary from '../components/WeeklyTransactionSummary';
import TransactionModal from '../components/TransactionModal';
import AddFeeModal from '../components/AddFeeModal';
import TransactionFilterControls from '../components/TransactionFilterControls';
import { PlusIcon, TransferIcon } from '../components/icons/Icons';
import TransferModal from '../components/TransferModal';
import DailyTransactionsModal from '../components/DailyTransactionsModal';


interface DashboardPageProps {
    wallets: Wallet[];
    transactions: Transaction[];
    accountsReceivable: Transaction[];
    totalPiutang: number;
    categories: string[];
    customers: string[];
    onSettleReceivable: (transaction: Transaction) => void;
    onSaveTransaction: (data: Transaction | Omit<Transaction, 'id' | 'date'>) => void;
    onBalanceTransfer: (data: { fromWallet: string; toWallet: string; amount: number; fee: number; }) => void;
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
    onBalanceTransfer,
    onDeleteTransaction,
    formatRupiah,
}) => {
    const [transactionTablePage, setTransactionTablePage] = useState(1);
    const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
    const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);
    const [sortKey, setSortKey] = useState<SortKey>('date');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
    const [isFeeModalOpen, setIsFeeModalOpen] = useState(false);
    const [dailyModalDate, setDailyModalDate] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<'all' | TransactionType>('all');
    const [filterStartDate, setFilterStartDate] = useState('');
    const [filterEndDate, setFilterEndDate] = useState('');
    
    const itemsPerPage = 10;

    const currentMonthMargin = useMemo(() => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        return transactions
            .filter(t => {
                const transactionDate = new Date(t.date);
                return transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear && !t.isInternalTransfer;
            })
            .reduce((acc, curr) => acc + curr.margin, 0);
    }, [transactions]);

    const filteredAndSortedTransactions = useMemo(() => {
        let items = transactions.filter(t => !t.isDeleting);

        // 1. Apply search filter
        if (searchTerm.trim()) {
            const lowercasedFilter = searchTerm.toLowerCase();
            items = items.filter(t =>
                t.description.toLowerCase().includes(lowercasedFilter) ||
                t.customer.toLowerCase().includes(lowercasedFilter) ||
                t.amount.toString().includes(lowercasedFilter) ||
                formatRupiah(t.amount).includes(lowercasedFilter)
            );
        }

        // 2. Apply type filter
        if (filterType !== 'all') {
            items = items.filter(t => t.type === filterType);
        }

        // 3. Apply date range filter
        if (filterStartDate) {
            const startDate = new Date(filterStartDate);
            startDate.setHours(0, 0, 0, 0);
            items = items.filter(t => new Date(t.date) >= startDate);
        }
        if (filterEndDate) {
            const endDate = new Date(filterEndDate);
            endDate.setHours(23, 59, 59, 999);
            items = items.filter(t => new Date(t.date) <= endDate);
        }
        
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
    }, [transactions, searchTerm, filterType, filterStartDate, filterEndDate, sortKey, sortDirection, formatRupiah]);
    
    const totalPages = Math.ceil(filteredAndSortedTransactions.length / itemsPerPage) || 1;

    const paginatedTransactions = useMemo(() => {
        const startIndex = (transactionTablePage - 1) * itemsPerPage;
        return filteredAndSortedTransactions.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredAndSortedTransactions, transactionTablePage]);
    
    const handleOpenAddModal = useCallback(() => {
        setTransactionToEdit(null);
        setIsTransactionModalOpen(true);
    }, []);

    const handleOpenEditModal = (transaction: Transaction) => {
        setTransactionToEdit(transaction);
        setIsTransactionModalOpen(true);
    };
    
    const handleDayClick = useCallback((date: string) => {
        setDailyModalDate(date);
    }, []);

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
            description: 'Fee Brilink',
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

    const handleSaveTransfer = useCallback((transferData: { fromWallet: string; toWallet: string; amount: number; fee: number; }) => {
        onBalanceTransfer(transferData);
        setIsTransferModalOpen(false);
    }, [onBalanceTransfer]);

    const resetPage = (callback: (...args: any[]) => void) => (...args: any[]) => {
        callback(...args);
        setTransactionTablePage(1);
    };

    const handleClearFilters = useCallback(() => {
        setSearchTerm('');
        setFilterType('all');
        setFilterStartDate('');
        setFilterEndDate('');
        setTransactionTablePage(1);
    }, []);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            const target = event.target as HTMLElement;
            const isTyping = ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);

            if (event.key === '/' && !isTyping) {
                event.preventDefault();
                handleOpenAddModal();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleOpenAddModal]);

    return (
        <>
            <TransferModal
                isOpen={isTransferModalOpen}
                onClose={() => setIsTransferModalOpen(false)}
                onSave={handleSaveTransfer}
                wallets={wallets}
            />
            <TransactionModal
                isOpen={isTransactionModalOpen}
                onClose={handleCloseModal}
                onSave={handleSaveFromModal}
                onDeleteTransaction={onDeleteTransaction}
                transactionToEdit={transactionToEdit}
                wallets={wallets}
                categories={categories}
                customers={customers}
                formatRupiah={formatRupiah}
            />
            <DailyTransactionsModal
                isOpen={!!dailyModalDate}
                onClose={() => setDailyModalDate(null)}
                date={dailyModalDate}
                transactions={dailyTransactions}
                wallets={wallets}
                formatRupiah={formatRupiah}
                onEditTransaction={handleOpenEditModal}
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
                                <div className="bg-white dark:bg-neutral-800 p-4 rounded-3xl flex flex-col shadow-lg shadow-slate-200/50 dark:shadow-none">
                                    <div className="flex justify-between items-center mb-4 px-2">
                                        <h3 className="text-lg font-medium text-slate-800 dark:text-white">Riwayat Transaksi</h3>
                                        <div className="flex items-center space-x-2">
                                            <div className="grid grid-flow-col gap-2">
                                                 <button 
                                                    onClick={() => setIsTransferModalOpen(true)}
                                                    className="bg-sky-100 hover:bg-sky-200 text-sky-700 dark:bg-sky-400/10 dark:hover:bg-sky-400/20 dark:text-sky-200 font-semibold py-2 px-4 rounded-full flex items-center justify-center space-x-2 transition-colors duration-300 text-sm"
                                                    aria-label="Pindah saldo antar dompet"
                                                >
                                                    <TransferIcon className="h-4 w-4" />
                                                    <span>Pindah Saldo</span>
                                                </button>
                                                <button 
                                                    onClick={() => setIsFeeModalOpen(true)}
                                                    className="bg-blue-100 hover:bg-blue-200 text-blue-700 dark:bg-blue-400/10 dark:hover:bg-blue-400/20 dark:text-blue-200 font-semibold py-2 px-4 rounded-full flex items-center justify-center space-x-2 transition-colors duration-300 text-sm"
                                                    aria-label="Tambah Fee Brilink"
                                                >
                                                    <PlusIcon className="h-4 w-4" />
                                                    <span>Fee Brilink</span>
                                                </button>
                                                <button 
                                                    onClick={handleOpenAddModal}
                                                    className="bg-blue-500 hover:bg-blue-600 text-white dark:bg-blue-400 dark:hover:bg-blue-500 dark:text-slate-900 font-semibold py-2 px-4 rounded-full flex items-center justify-center space-x-2 transition-colors duration-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <PlusIcon className="h-4 w-4" />
                                                    <span>Tambah Transaksi</span>
                                                    <kbd className="hidden sm:inline-block ml-2 bg-slate-100/30 dark:bg-neutral-700/80 border border-slate-300 dark:border-neutral-600 rounded px-1.5 py-0.5 text-xs font-mono text-white dark:text-neutral-300">/</kbd>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <TransactionFilterControls 
                                        searchTerm={searchTerm}
                                        onSearchChange={resetPage(setSearchTerm)}
                                        filterType={filterType}
                                        onFilterTypeChange={resetPage(setFilterType)}
                                        startDate={filterStartDate}
                                        onStartDateChange={resetPage(setFilterStartDate)}
                                        endDate={filterEndDate}
                                        onEndDateChange={resetPage(setFilterEndDate)}
                                        onClearFilters={handleClearFilters}
                                    />
                                    <TransactionTable 
                                        wallets={wallets}
                                        transactions={paginatedTransactions} 
                                        formatRupiah={formatRupiah} 
                                        currentPage={transactionTablePage}
                                        totalPages={totalPages}
                                        setCurrentPage={setTransactionTablePage}
                                        onEditTransaction={handleOpenEditModal}
                                        sortKey={sortKey}
                                        sortDirection={sortDirection}
                                        onSort={handleSort}
                                    />
                                </div>
                            </div>

                            {/* Right Summary Sidebar */}
                            <div className="lg:col-span-1 space-y-6">
                                 <section>
                                    <WalletsSummaryCard 
                                        wallets={wallets}
                                        totalMargin={currentMonthMargin}
                                        totalPiutang={totalPiutang}
                                        formatRupiah={formatRupiah}
                                    />
                                </section>
                                <section>
                                    <WeeklyTransactionSummary 
                                        transactions={transactions}
                                        onDayClick={handleDayClick}
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
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
};

export default DashboardPage;