import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Transaction, Wallet, TransactionType, Page } from './types';
import Header from './components/Header';
import DashboardPage from './pages/DashboardPage';
import ManagementPage from './pages/ManagementPage';
import CustomerManagementPage from './pages/CustomerManagementPage';
import ReportsPage from './pages/ReportsPage';
import { ToastProvider, useToastContext } from './contexts/ToastContext';
import ToastContainer from './components/ToastContainer';

type Theme = 'light' | 'dark';

const API_BASE_URL = 'http://localhost:3001';

const MainApp: React.FC = () => {
    const { addToast } = useToastContext();
    const [wallets, setWallets] = useState<Wallet[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const [currentPage, setCurrentPage] = useState<Page>('dashboard');
    const [theme, setTheme] = useState<Theme>(
        (localStorage.getItem('theme') as Theme) ||
        (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    );

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [walletsRes, transactionsRes, categoriesRes] = await Promise.all([
                    fetch(`${API_BASE_URL}/wallets`),
                    fetch(`${API_BASE_URL}/transactions?_sort=date&_order=desc`),
                    fetch(`${API_BASE_URL}/categories/1`)
                ]);

                if (!walletsRes.ok || !transactionsRes.ok || !categoriesRes.ok) {
                    throw new Error('Failed to fetch data from the server. Is json-server running?');
                }

                const walletsData = await walletsRes.json();
                const transactionsData = await transactionsRes.json();
                const categoriesObject = await categoriesRes.json();

                setWallets(walletsData);
                setTransactions(transactionsData);
                setCategories(categoriesObject.values || []);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An unknown error occurred.');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);


    useEffect(() => {
        const root = window.document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

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

    const applyWalletChanges = useCallback(async (
        transaction: Transaction,
        action: 'create' | 'settle' | 'revert_settle' | 'delete'
    ) => {
        const currentWallets = [...wallets];
        const { wallet: primaryWalletId, amount, margin, type, description, marginType, isInternalTransfer } = transaction;
        const cashWalletId = 'CASH';
        
        if (!primaryWalletId) return;

        let primaryWalletChange = 0;
        let cashWalletChange = 0;

        if (action === 'create') {
                if (isInternalTransfer) {
                    primaryWalletChange = (type === TransactionType.OUT) ? -(amount + margin) : amount;
                } else if (description.startsWith('Pindah Saldo')) { // backward compatibility
                    primaryWalletChange = (type === TransactionType.IN) ? amount : -amount;
                } else if (description === 'Fee Brilink') {
                    primaryWalletChange = margin;
                } else if (description.startsWith('Penarikan Margin')) {
                    cashWalletChange = -amount;
                } else if (description === 'Tarik Tunai') {
                    if (marginType === 'luar') {
                        primaryWalletChange = amount;
                        if (!transaction.isPiutang) cashWalletChange = -amount + margin;
                        else cashWalletChange = -amount;
                    } else {
                        primaryWalletChange = amount + margin;
                        cashWalletChange = -amount;
                    }
                } else {
                    if (type === TransactionType.IN) {
                        primaryWalletChange = amount + margin;
                        if (!transaction.isPiutang) cashWalletChange = -amount;
                    } else {
                        primaryWalletChange = -amount;
                        if (!transaction.isPiutang) cashWalletChange = amount + margin;
                    }
                }
        } else if (action === 'settle') {
            cashWalletChange = amount + margin;
        } else if (action === 'revert_settle') {
            cashWalletChange = -(amount + margin);
        } else if (action === 'delete') {
            if (isInternalTransfer) {
                primaryWalletChange = (type === TransactionType.OUT) ? (amount + margin) : -amount;
            } else if (description.startsWith('Pindah Saldo')) { // backward compatibility
                primaryWalletChange = (type === TransactionType.IN) ? -amount : amount;
            } else if (description === 'Fee Brilink') {
                primaryWalletChange = -margin;
            } else if (description.startsWith('Penarikan Margin')) {
                cashWalletChange = amount;
            } else if (description === 'Tarik Tunai') {
                    if (marginType === 'luar') {
                    primaryWalletChange = -amount;
                    if (!transaction.isPiutang) cashWalletChange = amount - margin;
                    else cashWalletChange = amount;
                } else {
                    primaryWalletChange = -(amount + margin);
                    cashWalletChange = amount;
                }
            } else {
                if (type === TransactionType.IN) {
                    primaryWalletChange = -(amount + margin);
                    if (!transaction.isPiutang) cashWalletChange = amount;
                } else {
                    primaryWalletChange = amount;
                    if (!transaction.isPiutang) cashWalletChange = -(amount + margin);
                }
            }
        }

        const updatePromises: Promise<any>[] = [];
        const updatedWalletsState = currentWallets.map(w => {
            if (w.id === primaryWalletId) {
                const newBalance = w.balance + primaryWalletChange;
                updatePromises.push(fetch(`${API_BASE_URL}/wallets/${w.id}`, {
                    method: 'PATCH', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ balance: newBalance })
                }));
                return { ...w, balance: newBalance };
            }
            if (w.id === cashWalletId) {
                const newBalance = w.balance + cashWalletChange;
                 updatePromises.push(fetch(`${API_BASE_URL}/wallets/${w.id}`, {
                    method: 'PATCH', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ balance: newBalance })
                }));
                return { ...w, balance: newBalance };
            }
            return w;
        });

        await Promise.all(updatePromises);
        setWallets(updatedWalletsState);

    }, [wallets]);

    const handleSaveTransaction = useCallback(async (data: Transaction | Omit<Transaction, 'id' | 'date'>) => {
        const isEditing = 'id' in data;
        try {
            if (isEditing) {
                const updatedTransaction = data as Transaction;
                const originalTransaction = transactions.find(t => t.id === updatedTransaction.id);
                if (!originalTransaction) throw new Error("Transaction not found for update.");

                const res = await fetch(`${API_BASE_URL}/transactions/${updatedTransaction.id}`, {
                    method: 'PUT', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updatedTransaction)
                });
                if (!res.ok) throw new Error(`Server responded with status ${res.status}`);
                const savedTransaction = await res.json();
                
                setTransactions(prev => prev.map(t => (t.id === savedTransaction.id ? savedTransaction : t)).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));

                if (originalTransaction.isPiutang && !updatedTransaction.isPiutang) {
                    await applyWalletChanges(updatedTransaction, 'settle');
                } else if (!originalTransaction.isPiutang && updatedTransaction.isPiutang) {
                    await applyWalletChanges(updatedTransaction, 'revert_settle');
                }
            } else {
                const newTransactionData: Omit<Transaction, 'id'> = {
                    ...data,
                    date: new Date().toISOString(),
                };
                const res = await fetch(`${API_BASE_URL}/transactions`, {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newTransactionData)
                });
                if (!res.ok) throw new Error(`Server responded with status ${res.status}`);
                const savedTransaction = await res.json();
                
                setTransactions(prev => [savedTransaction, ...prev]);
                await applyWalletChanges(savedTransaction, 'create');
            }
            addToast(isEditing ? 'Transaksi berhasil diperbarui' : 'Transaksi berhasil ditambahkan', 'success');
        } catch(err) {
            console.error("Failed to save transaction:", err);
            addToast('Gagal menyimpan transaksi.', 'error');
        }
    }, [transactions, applyWalletChanges, addToast]);
    
    const handleSettleReceivable = useCallback(async (transactionToSettle: Transaction) => {
        try {
            const updatedTransaction: Transaction = { ...transactionToSettle, isPiutang: false };
            
            const res = await fetch(`${API_BASE_URL}/transactions/${updatedTransaction.id}`, {
                method: 'PATCH', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isPiutang: false })
            });
            if (!res.ok) throw new Error(`Server responded with status ${res.status}`);
            const savedTransaction = await res.json();
            
            setTransactions(prev => prev.map(t => (t.id === savedTransaction.id ? savedTransaction : t)));
            await applyWalletChanges(savedTransaction, 'settle');
            addToast(`Piutang untuk ${savedTransaction.customer} lunas`, 'success');
        } catch(err) {
            console.error("Failed to settle receivable:", err);
            addToast('Gagal melunasi piutang.', 'error');
        }
    }, [applyWalletChanges, addToast]);
    
    const handleDeleteTransaction = useCallback((transactionId: string) => {
        const transactionToDelete = transactions.find(t => t.id === transactionId);
        if (!transactionToDelete) return;

        let deleteTimeoutId: ReturnType<typeof setTimeout> | null = null;

        const confirmDelete = async () => {
            if (deleteTimeoutId) clearTimeout(deleteTimeoutId);
            try {
                const res = await fetch(`${API_BASE_URL}/transactions/${transactionId}`, { method: 'DELETE' });
                if (!res.ok) throw new Error(`Server responded with status ${res.status}`);

                await applyWalletChanges(transactionToDelete, 'delete');
                setTransactions(prev => prev.filter(t => t.id !== transactionId));
                addToast('Transaksi dihapus permanen', 'success');
            } catch (err) {
                console.error("Failed to delete transaction:", err);
                addToast('Gagal menghapus transaksi.', 'error');
                // Revert UI state on failure
                setTransactions(prev => prev.map(t => (t.id === transactionId ? { ...t, isDeleting: false } : t)));
            }
        };

        const cancelDelete = () => {
            if (deleteTimeoutId) clearTimeout(deleteTimeoutId);
            setTransactions(prev => prev.map(t => (t.id === transactionId ? { ...t, isDeleting: false } : t)));
        };

        // Hide the transaction immediately from the UI
        setTransactions(prev => prev.map(t => (t.id === transactionId ? { ...t, isDeleting: true } : t)));
        
        deleteTimeoutId = setTimeout(confirmDelete, 5000);

        addToast('Transaksi dihapus', 'info', { undoHandler: cancelDelete });
    }, [transactions, applyWalletChanges, addToast]);

    const handleSaveWallet = async (walletData: Omit<Wallet, 'id'> | Wallet) => {
        try {
            if ('id' in walletData) {
                const res = await fetch(`${API_BASE_URL}/wallets/${walletData.id}`, {
                    method: 'PUT', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(walletData),
                });
                if (!res.ok) throw new Error(`Server responded with status ${res.status}`);
                const updatedWallet = await res.json();
                setWallets(prev => prev.map(w => w.id === updatedWallet.id ? updatedWallet : w));
            } else {
                const newWalletData = { ...walletData, id: walletData.name.toUpperCase().replace(/\s/g, '') + Date.now() };
                const res = await fetch(`${API_BASE_URL}/wallets`, {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newWalletData),
                });
                if (!res.ok) throw new Error(`Server responded with status ${res.status}`);
                const newWallet = await res.json();
                setWallets(prev => [...prev, newWallet]);
            }
            addToast('Dompet berhasil disimpan', 'success');
        } catch (err) {
            console.error("Failed to save wallet:", err);
            addToast('Gagal menyimpan dompet.', 'error');
        }
    };

    const handleDeleteWallet = async (walletId: string) => {
        try {
            const res = await fetch(`${API_BASE_URL}/wallets/${walletId}`, { method: 'DELETE' });
            if (!res.ok) throw new Error(`Server responded with status ${res.status}`);
            setWallets(prev => prev.filter(w => w.id !== walletId));
            addToast('Dompet berhasil dihapus', 'success');
        } catch (err) {
            console.error("Failed to delete wallet:", err);
            addToast('Gagal menghapus dompet.', 'error');
        }
    };

    const handleSaveCategories = async (newCategories: string[]) => {
        try {
            const res = await fetch(`${API_BASE_URL}/categories/1`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: 1, values: newCategories }),
            });
            if (!res.ok) throw new Error(`Server responded with status ${res.status}`);
            setCategories(newCategories);
            addToast('Kategori berhasil disimpan', 'success');
        } catch(err) {
            console.error("Failed to save categories:", err);
            addToast('Gagal menyimpan kategori.', 'error');
        }
    };

    const handleBalanceTransfer = useCallback(async (transferData: { fromWallet: string; toWallet: string; amount: number; fee: number; }) => {
        const { fromWallet, toWallet, amount, fee } = transferData;
        const fromWalletName = wallets.find(w => w.id === fromWallet)?.name;
        const toWalletName = wallets.find(w => w.id === toWallet)?.name;

        if (!fromWalletName || !toWalletName) {
            addToast('Dompet tidak ditemukan.', 'error');
            return;
        }

        const outTransactionData: Omit<Transaction, 'id'> = {
            date: new Date().toISOString(),
            description: `Pindah Saldo ke ${toWalletName}`,
            customer: 'Internal',
            type: TransactionType.OUT,
            amount: amount + fee,
            margin: 0,
            wallet: fromWallet,
            isPiutang: false,
            isInternalTransfer: true,
        };

        const inTransactionData: Omit<Transaction, 'id'> = {
            date: new Date().toISOString(),
            description: `Pindah Saldo dari ${fromWalletName}`,
            customer: 'Internal',
            type: TransactionType.IN,
            amount,
            margin: 0,
            wallet: toWallet,
            isPiutang: false,
            isInternalTransfer: true,
        };

        try {
            const outRes = await fetch(`${API_BASE_URL}/transactions`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(outTransactionData)
            });
            if (!outRes.ok) throw new Error('Gagal menyimpan transaksi keluar.');
            const savedOutTransaction = await outRes.json();
            
            const inRes = await fetch(`${API_BASE_URL}/transactions`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(inTransactionData)
            });
            if (!inRes.ok) throw new Error('Gagal menyimpan transaksi masuk.');
            const savedInTransaction = await inRes.json();
            
            setTransactions(prev => [savedInTransaction, savedOutTransaction, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
            
            const updatedWalletsState = wallets.map(w => {
                if (w.id === fromWallet) {
                    return { ...w, balance: w.balance - (amount + fee) };
                }
                if (w.id === toWallet) {
                    return { ...w, balance: w.balance + amount };
                }
                return w;
            });
            
            const fromWalletUpdate = updatedWalletsState.find(w => w.id === fromWallet);
            const toWalletUpdate = updatedWalletsState.find(w => w.id === toWallet);
            
            const promises = [];
            if (fromWalletUpdate) promises.push(fetch(`${API_BASE_URL}/wallets/${fromWallet}`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(fromWalletUpdate)
            }));
            if (toWalletUpdate) promises.push(fetch(`${API_BASE_URL}/wallets/${toWallet}`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(toWalletUpdate)
            }));
            await Promise.all(promises);

            setWallets(updatedWalletsState);
            addToast('Pindah saldo berhasil', 'success');

        } catch (err) {
            console.error("Failed to process transfer:", err);
            addToast(err instanceof Error ? err.message : 'Gagal memproses pindah saldo.', 'error');
        }
    }, [wallets, addToast]);


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
                    onBalanceTransfer={handleBalanceTransfer}
                    onDeleteTransaction={handleDeleteTransaction}
                    categories={categories}
                    customers={customers}
                    formatRupiah={formatRupiah}
                />;
            case 'management':
                return <ManagementPage 
                    wallets={wallets}
                    onSaveWallet={handleSaveWallet}
                    onDeleteWallet={handleDeleteWallet}
                    categories={categories}
                    onSaveCategories={handleSaveCategories}
                    formatRupiah={formatRupiah}
                />;
            case 'customers':
                return <CustomerManagementPage transactions={transactions} formatRupiah={formatRupiah} wallets={wallets} />;
            case 'reports':
                return <ReportsPage 
                    transactions={transactions} 
                    formatRupiah={formatRupiah}
                    categories={categories}
                />;
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
                    onBalanceTransfer={handleBalanceTransfer}
                    onDeleteTransaction={handleDeleteTransaction}
                    categories={categories}
                    customers={customers}
                    formatRupiah={formatRupiah}
                />;
        }
    };
    
    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            );
        }
        if (error) {
            return (
                <div className="flex flex-col justify-center items-center h-[calc(100vh-4rem)] text-center p-4">
                    <h2 className="text-xl font-semibold text-red-500 mb-2">Terjadi Kesalahan</h2>
                    <p className="text-slate-600 dark:text-slate-400 max-w-md">{error}</p>
                    <p className="text-sm text-slate-500 mt-4">Pastikan `json-server` sedang berjalan pada port 3001.</p>
                </div>
            );
        }
        return renderPage();
    }

    return (
        <div className="bg-slate-50 dark:bg-slate-900 min-h-screen text-slate-800 dark:text-[#E6E1E5]">
            <Header 
                currentPage={currentPage} 
                setCurrentPage={setCurrentPage}
                theme={theme}
                setTheme={setTheme}
            />
            {renderContent()}
        </div>
    );
};


const App: React.FC = () => {
    return (
        <ToastProvider>
            <MainApp />
            <ToastContainer />
        </ToastProvider>
    );
};

export default App;