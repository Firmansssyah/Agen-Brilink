
import React, { useState, useMemo, useCallback } from 'react';
import { Transaction, Wallet, TransactionType, Page } from './types';
import { INITIAL_WALLETS, MOCK_TRANSACTIONS, INITIAL_CATEGORIES } from './constants';
import Header from './components/Header';
import DashboardPage from './pages/DashboardPage';
// Fix: Import Sidebar and other page components to implement navigation.
import WalletManagementPage from './pages/WalletManagementPage';
import TransactionCategoryPage from './pages/TransactionCategoryPage';
import CustomerManagementPage from './pages/CustomerManagementPage';
import ReportsPage from './pages/ReportsPage';

const App: React.FC = () => {
    // FIX: Corrected typo from INITIAL_WALLELETS to INITIAL_WALLETS.
    const [wallets, setWallets] = useState<Wallet[]>(INITIAL_WALLETS);
    const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
    const [categories, setCategories] = useState<string[]>(INITIAL_CATEGORIES);
    
    // Fix: Add state for current page to enable navigation.
    const [currentPage, setCurrentPage] = useState<Page>('dashboard');

    const formatRupiah = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const accountsReceivable = useMemo<Transaction[]>(() => {
        return transactions
            .filter(t => t.isPiutang)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [transactions]);
    
    const totalPiutang = useMemo(() => {
      return accountsReceivable.reduce((sum, item) => sum + item.amount + item.margin, 0);
    }, [accountsReceivable]);

    const customers = useMemo(() => {
        const customerSet = new Set<string>();
        transactions.forEach(t => {
            if (t.customer && t.customer.trim() && t.customer.toLowerCase() !== 'pelanggan') {
                customerSet.add(t.customer.trim());
            }
        });
        return Array.from(customerSet).sort((a, b) => a.localeCompare(b));
    }, [transactions]);

    const handleWalletBalanceUpdate = useCallback((
        transaction: Transaction,
        action: 'create' | 'settle' | 'revert_settle' | 'delete'
    ) => {
        setWallets(prevWallets => {
            const { wallet: primaryWalletId, amount, margin, type, description } = transaction;
            const cashWalletId = 'CASH';
            
            if (!primaryWalletId) return prevWallets;

            let primaryWalletChange = 0;
            let cashWalletChange = 0;

            if (action === 'create') {
                if (description === 'Fee Bagi Hasil BRILink') {
                    // This fee is pure margin deposited directly into the BRILink wallet. No cash movement.
                    primaryWalletChange = margin;
                    cashWalletChange = 0;
                } else {
                    // Standard customer transactions
                    if (type === TransactionType.IN) { // e.g., Tarik Tunai
                        primaryWalletChange = amount + margin;
                    } else { // e.g., Transfer
                        primaryWalletChange = -amount;
                    }

                    if (!transaction.isPiutang) {
                        if (description === 'Tarik Tunai') {
                            cashWalletChange = -amount; // Cash given to customer
                        } else {
                            cashWalletChange = amount + margin; // Cash received from customer
                        }
                    } else { // Is Piutang (credit)
                        if (description === 'Tarik Tunai') {
                            cashWalletChange = -amount; // Cash still given out
                        } else {
                            cashWalletChange = 0; // No cash moves yet for other piutang
                        }
                    }
                }
            } else if (action === 'settle') {
                // Settling a piutang means receiving cash
                cashWalletChange = amount + margin;
            } else if (action === 'revert_settle') {
                // Reverting a settlement means cash is "returned"
                cashWalletChange = -(amount + margin);
            } else if (action === 'delete') {
                // This logic is the inverse of the 'create' action
                if (description === 'Fee Bagi Hasil BRILink') {
                    primaryWalletChange = -margin;
                    cashWalletChange = 0;
                } else {
                    if (type === TransactionType.IN) {
                        primaryWalletChange = -(amount + margin);
                    } else {
                        primaryWalletChange = amount;
                    }

                    if (!transaction.isPiutang) {
                        if (description === 'Tarik Tunai') {
                            cashWalletChange = amount;
                        } else {
                            cashWalletChange = -(amount + margin);
                        }
                    } else {
                        if (description === 'Tarik Tunai') {
                            cashWalletChange = amount;
                        } else {
                            cashWalletChange = 0;
                        }
                    }
                }
            }


            return prevWallets.map(wallet => {
                if (wallet.id === primaryWalletId) {
                    return { ...wallet, balance: wallet.balance + primaryWalletChange };
                }
                if (wallet.id === cashWalletId) {
                    return { ...wallet, balance: wallet.balance + cashWalletChange };
                }
                return wallet;
            });
        });
    }, []);

    const handleSaveTransaction = useCallback((data: Transaction | Omit<Transaction, 'id' | 'date'>) => {
        if ('id' in data) { // Update existing transaction
            const updatedTransaction = data as Transaction;
            const originalTransaction = transactions.find(t => t.id === updatedTransaction.id);
            if (!originalTransaction) return;

            setTransactions(prev => prev.map(t => (t.id === updatedTransaction.id ? updatedTransaction : t)));

            if (originalTransaction.isPiutang && !updatedTransaction.isPiutang) {
                handleWalletBalanceUpdate(updatedTransaction, 'settle');
            } else if (!originalTransaction.isPiutang && updatedTransaction.isPiutang) {
                handleWalletBalanceUpdate(updatedTransaction, 'revert_settle');
            }
        } else { // Add new transaction
            const newTransaction: Transaction = {
                ...data,
                id: `T${Date.now()}`,
                date: new Date().toISOString(),
            };
            setTransactions(prev => [newTransaction, ...prev]);
            handleWalletBalanceUpdate(newTransaction, 'create');
        }
    }, [transactions, handleWalletBalanceUpdate]);
    
    const handleSettleReceivable = useCallback((transactionToSettle: Transaction) => {
        const originalTransaction = transactions.find(t => t.id === transactionToSettle.id);
        if (!originalTransaction || !originalTransaction.isPiutang) return;

        const updatedTransaction: Transaction = { ...transactionToSettle, isPiutang: false };
        
        setTransactions(prev => prev.map(t => (t.id === updatedTransaction.id ? updatedTransaction : t)));
        handleWalletBalanceUpdate(updatedTransaction, 'settle');
    }, [transactions, handleWalletBalanceUpdate]);
    
    const handleDeleteTransaction = useCallback((transactionId: string) => {
        const transactionToDelete = transactions.find(t => t.id === transactionId);
        if (!transactionToDelete) return;

        handleWalletBalanceUpdate(transactionToDelete, 'delete');
        setTransactions(prev => prev.filter(t => t.id !== transactionId));
    }, [transactions, handleWalletBalanceUpdate]);

    // Fix: Add a function to render the current page based on state.
    const renderPage = () => {
        switch (currentPage) {
            case 'dashboard':
                return <DashboardPage 
                    wallets={wallets}
                    transactions={transactions}
                    accountsReceivable={accountsReceivable}
                    totalPiutang={totalPiutang}
                    onSettleReceivable={handleSettleReceivable}
                    onSaveTransaction={handleSaveTransaction}
                    onDeleteTransaction={handleDeleteTransaction}
                    categories={categories}
                    customers={customers}
                    formatRupiah={formatRupiah}
                />;
            case 'wallets':
                return <WalletManagementPage wallets={wallets} setWallets={setWallets} formatRupiah={formatRupiah} />;
            case 'categories':
                return <TransactionCategoryPage categories={categories} setCategories={setCategories} />;
            case 'customers':
                return <CustomerManagementPage transactions={transactions} formatRupiah={formatRupiah} />;
            case 'reports':
                return <ReportsPage transactions={transactions} formatRupiah={formatRupiah} />;
            case 'settings':
                return <div className="p-8 mx-auto max-w-7xl"><h1 className="text-2xl">Pengaturan</h1><p>Halaman ini sedang dalam pengembangan.</p></div>;
            default:
                return <DashboardPage 
                    wallets={wallets}
                    transactions={transactions}
                    accountsReceivable={accountsReceivable}
                    totalPiutang={totalPiutang}
                    onSettleReceivable={handleSettleReceivable}
                    onSaveTransaction={handleSaveTransaction}
                    onDeleteTransaction={handleDeleteTransaction}
                    categories={categories}
                    customers={customers}
                    formatRupiah={formatRupiah}
                />;
        }
    };
    
    return (
        // Fix: Update layout to include Sidebar and render the current page.
        <div className="bg-[#1C1B1F] min-h-screen text-[#E6E1E5]">
            <Header currentPage={currentPage} setCurrentPage={setCurrentPage} />
            {renderPage()}
        </div>
    );
};

export default App;
