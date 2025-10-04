import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Transaction, Wallet, TransactionType, Page, Font } from './types';
import Header from './components/Header';
import DashboardPage from './pages/DashboardPage';
import ManagementPage from './pages/ManagementPage';
import CustomerManagementPage from './pages/CustomerManagementPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import { ToastProvider, useToastContext } from './contexts/ToastContext';
import ToastContainer from './components/ToastContainer';

// Mendefinisikan tipe untuk tema aplikasi.
type Theme = 'light' | 'dark';

/**
 * Komponen inti aplikasi yang mengelola state utama, logika bisnis, dan perutean halaman.
 */
const MainApp: React.FC = () => {
    // Menggunakan hook dari ToastContext untuk menampilkan notifikasi.
    const { addToast } = useToastContext();
    // State untuk menyimpan daftar dompet.
    const [wallets, setWallets] = useState<Wallet[]>([]);
    // State untuk menyimpan daftar transaksi.
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    // State untuk menyimpan daftar kategori transaksi.
    const [categories, setCategories] = useState<string[]>([]);
    // State untuk menandai status loading data awal.
    const [isLoading, setIsLoading] = useState(true);
    // State untuk menyimpan pesan error jika terjadi kegagalan fetch data.
    const [error, setError] = useState<string | null>(null);
    
    // State untuk halaman yang sedang aktif.
    const [currentPage, setCurrentPage] = useState<Page>('dashboard');
    // State untuk nama aplikasi, diambil dari localStorage atau default.
    const [appName, setAppName] = useState<string>(() => localStorage.getItem('appName') || 'Agen BRILink');
    // State untuk tema aplikasi, disesuaikan dengan preferensi sistem atau localStorage.
    const [theme, setTheme] = useState<Theme>(
        (localStorage.getItem('theme') as Theme) ||
        (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    );
    // State untuk jenis huruf aplikasi, diambil dari localStorage atau default.
    const [font, setFont] = useState<Font>(
        () => (localStorage.getItem('fontFamily') as Font) || 'font-sans'
    );


    // useMemo untuk mendefinisikan URL dasar API, agar tidak dihitung ulang pada setiap render.
    const API_BASE_URL = useMemo(() => {
        const hostname = window.location.hostname || 'localhost';
        return `http://${hostname}:3001`;
    }, []);

    // useEffect untuk mengambil data awal (dompet, transaksi, kategori) saat komponen dimuat.
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Mengambil semua data secara paralel untuk efisiensi.
                const [walletsRes, transactionsRes, categoriesRes] = await Promise.all([
                    fetch(`${API_BASE_URL}/wallets`),
                    fetch(`${API_BASE_URL}/transactions?_sort=date&_order=desc`),
                    fetch(`${API_BASE_URL}/categories/1`)
                ]);

                // Memeriksa apakah semua request berhasil.
                if (!walletsRes.ok || !transactionsRes.ok || !categoriesRes.ok) {
                    throw new Error('Failed to fetch data from the server. Is json-server running?');
                }

                // Mengubah respons menjadi JSON.
                const walletsData = await walletsRes.json();
                const transactionsData = await transactionsRes.json();
                const categoriesObject = await categoriesRes.json();

                // Memperbarui state dengan data yang diterima.
                setWallets(walletsData);
                setTransactions(transactionsData);
                setCategories(categoriesObject.values || []);
            } catch (err) {
                // Menangani error jika pengambilan data gagal.
                setError(err instanceof Error ? err.message : 'An unknown error occurred.');
                console.error(err);
            } finally {
                // Menghentikan status loading setelah selesai (baik berhasil maupun gagal).
                setIsLoading(false);
            }
        };

        fetchData();
    }, [API_BASE_URL]);


    // useEffect untuk mengubah tema (light/dark) pada elemen HTML dan menyimpannya di localStorage.
    useEffect(() => {
        const root = window.document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);
    
    // useEffect untuk menyimpan nama aplikasi ke localStorage setiap kali berubah.
    useEffect(() => {
        localStorage.setItem('appName', appName);
    }, [appName]);

    // useEffect untuk mengubah jenis huruf aplikasi dan menyimpannya di localStorage.
    useEffect(() => {
        const body = window.document.body;
        // Hapus kelas font lama
        body.classList.remove('font-sans', 'font-inter', 'font-poppins', 'font-roboto-flex');
        // Tambahkan kelas font baru
        body.classList.add(font);
        // Simpan ke local storage
        localStorage.setItem('fontFamily', font);
    }, [font]);


    /**
     * Fungsi utilitas untuk memformat angka menjadi format mata uang Rupiah.
     * @param amount - Angka yang akan diformat.
     * @returns String dalam format Rupiah (e.g., "Rp 5.000").
     */
    const formatRupiah = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    // useMemo untuk menghitung dan menyaring daftar piutang dari semua transaksi.
    const accountsReceivable = useMemo<Transaction[]>(() => {
        return transactions
            .filter(t => t.isPiutang)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [transactions]);
    
    // useMemo untuk menghitung total jumlah piutang.
    const totalPiutang = useMemo(() => {
      return accountsReceivable.reduce((sum, item) => sum + item.amount + item.margin, 0);
    }, [accountsReceivable]);

    // useMemo untuk mengumpulkan dan mengurutkan nama pelanggan unik berdasarkan jumlah transaksi.
    const customers = useMemo(() => {
        const customerCounts = new Map<string, number>();
        transactions.forEach(t => {
            const customerName = t.customer?.trim();
            if (customerName) {
                const lowerCaseName = customerName.toLowerCase();
                // Menyaring nama generik atau internal.
                if (lowerCaseName !== 'pelanggan' && lowerCaseName !== 'internal' && lowerCaseName !== 'brilink') {
                     customerCounts.set(customerName, (customerCounts.get(customerName) || 0) + 1);
                }
            }
        });

        // Mengubah map menjadi array, mengurutkan berdasarkan jumlah transaksi, lalu mengambil namanya.
        const sortedCustomers = Array.from(customerCounts.entries())
            .sort(([, countA], [, countB]) => countB - countA)
            .map(([name]) => name);

        return sortedCustomers;
    }, [transactions]);
    
    /**
     * Fungsi murni untuk menghitung perubahan saldo pada dompet utama dan kas tunai
     * berdasarkan sebuah transaksi dan aksi yang dilakukan.
     * @param transaction - Objek transaksi.
     * @param action - Tipe aksi: 'create' (menerapkan) atau 'delete' (membalikkan).
     * @returns Objek yang berisi perubahan untuk dompet primer dan kas.
     */
    const calculateWalletChanges = (transaction: Transaction, action: 'create' | 'delete'): { primaryWalletId: string | null, primaryWalletChange: number, cashWalletChange: number } => {
        const { wallet: primaryWalletId, amount, margin, type, description, marginType, isInternalTransfer, isPiutang } = transaction;

        if (!primaryWalletId) return { primaryWalletId: null, primaryWalletChange: 0, cashWalletChange: 0 };

        let primaryWalletChange = 0;
        let cashWalletChange = 0;
        
        // Logika ini dihitung seolah-olah untuk aksi 'create'.
        if (isInternalTransfer) {
            primaryWalletChange = (type === TransactionType.OUT) ? -(amount + margin) : amount;
        } else if (description.startsWith('Pindah Saldo')) { // Kompatibilitas mundur
            primaryWalletChange = (type === TransactionType.IN) ? amount : -amount;
        } else if (description === 'Fee Brilink') {
            primaryWalletChange = margin;
        } else if (description.startsWith('Penarikan Margin')) {
            cashWalletChange = -amount;
        } else if (description === 'Tarik Tunai') {
            if (marginType === 'luar') {
                primaryWalletChange = amount;
                if (!isPiutang) cashWalletChange = -amount + margin;
                else cashWalletChange = -amount;
            } else {
                primaryWalletChange = amount + margin;
                cashWalletChange = -amount;
            }
        } else { // Transfer IN/OUT dan lainnya
            if (type === TransactionType.IN) {
                primaryWalletChange = amount + margin;
                if (!isPiutang) cashWalletChange = -amount;
            } else { // OUT
                primaryWalletChange = -amount;
                if (!isPiutang) cashWalletChange = amount + margin;
            }
        }

        // Jika aksi adalah 'delete', balikkan semua nilainya.
        const multiplier = action === 'create' ? 1 : -1;

        return {
            primaryWalletId,
            primaryWalletChange: primaryWalletChange * multiplier,
            cashWalletChange: cashWalletChange * multiplier,
        };
    };


    /**
     * useCallback untuk mengaplikasikan perubahan saldo pada dompet setelah transaksi.
     * Fungsi ini menangani skenario sederhana seperti pembuatan, pelunasan piutang, dan penghapusan.
     * @param transaction - Objek transaksi yang memicu perubahan.
     * @param action - Tipe aksi yang dilakukan ('create', 'settle', 'delete', dll.).
     */
    const applyWalletChanges = useCallback(async (
        transaction: Transaction,
        action: 'create' | 'settle' | 'revert_settle' | 'delete'
    ) => {
        let changes: { primaryWalletId: string | null, primaryWalletChange: number, cashWalletChange: number };
        
        if (action === 'create' || action === 'delete') {
            changes = calculateWalletChanges(transaction, action);
        } else {
            // Logika spesifik untuk 'settle' (melunasi) dan 'revert_settle' (membatalkan pelunasan).
            const { amount, margin } = transaction;
            changes = {
                primaryWalletId: null,
                primaryWalletChange: 0,
                cashWalletChange: action === 'settle' ? amount + margin : -(amount + margin),
            };
        }
        
        const { primaryWalletId, primaryWalletChange, cashWalletChange } = changes;
        if (primaryWalletChange === 0 && cashWalletChange === 0) return;

        const cashWalletId = 'CASH';
        
        const updatePromises: Promise<any>[] = [];
        // Menggunakan state callback untuk memastikan data dompet terbaru yang digunakan.
        setWallets(currentWallets => {
            const updatedWalletsState = currentWallets.map(w => {
                let newBalance = w.balance;
                let hasChanged = false;
                if (w.id === primaryWalletId && primaryWalletChange !== 0) {
                    newBalance += primaryWalletChange;
                    hasChanged = true;
                }
                if (w.id === cashWalletId && cashWalletChange !== 0) {
                     newBalance += cashWalletChange;
                     hasChanged = true;
                }

                if (hasChanged) {
                    updatePromises.push(fetch(`${API_BASE_URL}/wallets/${w.id}`, {
                        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ balance: newBalance })
                    }));
                    return { ...w, balance: newBalance };
                }
                return w;
            });
            return updatedWalletsState;
        });

        await Promise.all(updatePromises);

    }, [API_BASE_URL]);

    /**
     * useCallback untuk menangani penyimpanan transaksi (baik baru maupun editan).
     * @param data - Data transaksi yang akan disimpan.
     */
    const handleSaveTransaction = useCallback(async (data: Transaction | Omit<Transaction, 'id' | 'date'>) => {
        const isEditing = 'id' in data;
        try {
            if (isEditing) {
                // Logika untuk mengedit transaksi yang sudah ada dengan strategi "Revert and Apply".
                const updatedTransaction = data as Transaction;
                const originalTransaction = transactions.find(t => t.id === updatedTransaction.id);
                if (!originalTransaction) throw new Error("Transaksi original tidak ditemukan untuk diperbarui.");

                // 1. Hitung efek pembalikan dari transaksi lama.
                const revertChanges = calculateWalletChanges(originalTransaction, 'delete');
                // 2. Hitung efek penerapan dari transaksi baru.
                const applyChanges = calculateWalletChanges(updatedTransaction, 'create');
                
                // 3. Gabungkan semua perubahan untuk mendapatkan perubahan bersih per dompet.
                const netChanges = new Map<string, number>();
                const addToMap = (walletId: string | null, value: number) => {
                    if (walletId && value !== 0) {
                        netChanges.set(walletId, (netChanges.get(walletId) || 0) + value);
                    }
                };

                addToMap(revertChanges.primaryWalletId, revertChanges.primaryWalletChange);
                addToMap('CASH', revertChanges.cashWalletChange);
                addToMap(applyChanges.primaryWalletId, applyChanges.primaryWalletChange);
                addToMap('CASH', applyChanges.cashWalletChange);

                // 4. Kirim pembaruan data transaksi ke server.
                const res = await fetch(`${API_BASE_URL}/transactions/${updatedTransaction.id}`, {
                    method: 'PUT', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updatedTransaction)
                });
                if (!res.ok) throw new Error(`Server merespon dengan status ${res.status}`);
                const savedTransaction = await res.json();
                
                // 5. Jika berhasil, perbarui saldo dompet di server dan state lokal.
                const walletUpdatePromises: Promise<any>[] = [];
                const updatedWalletsState = wallets.map(w => {
                    if (netChanges.has(w.id)) {
                        const change = netChanges.get(w.id) || 0;
                        const newBalance = w.balance + change;
                        walletUpdatePromises.push(fetch(`${API_BASE_URL}/wallets/${w.id}`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ balance: newBalance })
                        }));
                        return { ...w, balance: newBalance };
                    }
                    return w;
                });
                
                await Promise.all(walletUpdatePromises);
                
                // 6. Perbarui state lokal untuk dompet dan transaksi.
                setWallets(updatedWalletsState);
                setTransactions(prev => prev.map(t => (t.id === savedTransaction.id ? savedTransaction : t)).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));

            } else {
                // Logika untuk menambahkan transaksi baru.
                const newTransactionData: Omit<Transaction, 'id'> = {
                    ...data,
                    date: new Date().toISOString(),
                };
                const res = await fetch(`${API_BASE_URL}/transactions`, {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newTransactionData)
                });
                if (!res.ok) throw new Error(`Server merespon dengan status ${res.status}`);
                const savedTransaction = await res.json();
                
                setTransactions(prev => [savedTransaction, ...prev]);
                await applyWalletChanges(savedTransaction, 'create');
            }
            addToast(isEditing ? 'Transaksi berhasil diperbarui' : 'Transaksi berhasil ditambahkan', 'success');
        } catch(err) {
            console.error("Gagal menyimpan transaksi:", err);
            addToast('Gagal menyimpan transaksi.', 'error');
        }
    }, [transactions, wallets, addToast, API_BASE_URL]);
    
    /**
     * useCallback untuk melunasi piutang.
     * @param transactionToSettle - Transaksi piutang yang akan dilunasi.
     */
    const handleSettleReceivable = useCallback(async (transactionToSettle: Transaction) => {
        try {
            const updatedTransaction: Transaction = { ...transactionToSettle, isPiutang: false };
            
            const res = await fetch(`${API_BASE_URL}/transactions/${updatedTransaction.id}`, {
                method: 'PATCH', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isPiutang: false })
            });
            if (!res.ok) throw new Error(`Server merespon dengan status ${res.status}`);
            const savedTransaction = await res.json();
            
            setTransactions(prev => prev.map(t => (t.id === savedTransaction.id ? savedTransaction : t)));
            await applyWalletChanges(savedTransaction, 'settle');
            addToast(`Piutang untuk ${savedTransaction.customer} lunas`, 'success');
        } catch(err) {
            console.error("Gagal melunasi piutang:", err);
            addToast('Gagal melunasi piutang.', 'error');
        }
    }, [applyWalletChanges, addToast, API_BASE_URL]);
    
    /**
     * useCallback untuk menghapus transaksi dengan fitur "undo".
     * @param transactionId - ID transaksi yang akan dihapus.
     */
    const handleDeleteTransaction = useCallback((transactionId: string) => {
        const transactionToDelete = transactions.find(t => t.id === transactionId);
        if (!transactionToDelete) return;

        let deleteTimeoutId: ReturnType<typeof setTimeout> | null = null;

        // Fungsi yang akan dijalankan jika penghapusan dikonfirmasi (setelah 5 detik).
        const confirmDelete = async () => {
            if (deleteTimeoutId) clearTimeout(deleteTimeoutId);
            try {
                const res = await fetch(`${API_BASE_URL}/transactions/${transactionId}`, { method: 'DELETE' });
                if (!res.ok) throw new Error(`Server merespon dengan status ${res.status}`);

                await applyWalletChanges(transactionToDelete, 'delete');
                setTransactions(prev => prev.filter(t => t.id !== transactionId));
                addToast('Transaksi dihapus permanen', 'success');
            } catch (err) {
                console.error("Gagal menghapus transaksi:", err);
                addToast('Gagal menghapus transaksi.', 'error');
                // Mengembalikan state UI jika penghapusan gagal.
                setTransactions(prev => prev.map(t => (t.id === transactionId ? { ...t, isDeleting: false } : t)));
            }
        };

        // Fungsi untuk membatalkan penghapusan.
        const cancelDelete = () => {
            if (deleteTimeoutId) clearTimeout(deleteTimeoutId);
            setTransactions(prev => prev.map(t => (t.id === transactionId ? { ...t, isDeleting: false } : t)));
        };

        // Menandai transaksi sebagai 'isDeleting' untuk menyembunyikannya dari UI secara langsung.
        setTransactions(prev => prev.map(t => (t.id === transactionId ? { ...t, isDeleting: true } : t)));
        
        // Menjalankan timeout untuk penghapusan permanen.
        deleteTimeoutId = setTimeout(confirmDelete, 5000);

        // Menampilkan notifikasi dengan tombol "Urungkan".
        addToast('Transaksi dihapus', 'info', { undoHandler: cancelDelete });
    }, [transactions, applyWalletChanges, addToast, API_BASE_URL]);

    /**
     * useCallback untuk menyimpan data dompet (baru atau editan).
     * @param walletData - Data dompet yang akan disimpan.
     */
    const handleSaveWallet = useCallback(async (walletData: Omit<Wallet, 'id'> | Wallet) => {
        try {
            if ('id' in walletData) {
                // Logika edit dompet.
                const res = await fetch(`${API_BASE_URL}/wallets/${walletData.id}`, {
                    method: 'PUT', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(walletData),
                });
                if (!res.ok) throw new Error(`Server merespon dengan status ${res.status}`);
                const updatedWallet = await res.json();
                setWallets(prev => prev.map(w => w.id === updatedWallet.id ? updatedWallet : w));
            } else {
                // Logika tambah dompet baru.
                const newWalletData = { ...walletData, id: walletData.name.toUpperCase().replace(/\s/g, '') + Date.now() };
                const res = await fetch(`${API_BASE_URL}/wallets`, {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newWalletData),
                });
                if (!res.ok) throw new Error(`Server merespon dengan status ${res.status}`);
                const newWallet = await res.json();
                setWallets(prev => [...prev, newWallet]);
            }
            addToast('Dompet berhasil disimpan', 'success');
        } catch (err) {
            console.error("Gagal menyimpan dompet:", err);
            addToast('Gagal menyimpan dompet.', 'error');
        }
    }, [addToast, API_BASE_URL]);

    /**
     * useCallback untuk menghapus dompet.
     * @param walletId - ID dompet yang akan dihapus.
     */
    const handleDeleteWallet = useCallback(async (walletId: string) => {
        try {
            const res = await fetch(`${API_BASE_URL}/wallets/${walletId}`, { method: 'DELETE' });
            if (!res.ok) throw new Error(`Server merespon dengan status ${res.status}`);
            setWallets(prev => prev.filter(w => w.id !== walletId));
            addToast('Dompet berhasil dihapus', 'success');
        } catch (err) {
            console.error("Gagal menghapus dompet:", err);
            addToast('Gagal menghapus dompet.', 'error');
        }
    }, [addToast, API_BASE_URL]);

    /**
     * useCallback untuk menyimpan daftar kategori.
     * @param newCategories - Array string kategori baru.
     */
    const handleSaveCategories = useCallback(async (newCategories: string[]) => {
        try {
            const res = await fetch(`${API_BASE_URL}/categories/1`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: 1, values: newCategories }),
            });
            if (!res.ok) throw new Error(`Server merespon dengan status ${res.status}`);
            setCategories(newCategories);
            addToast('Kategori berhasil disimpan', 'success');
        } catch(err) {
            console.error("Gagal menyimpan kategori:", err);
            addToast('Gagal menyimpan kategori.', 'error');
        }
    }, [addToast, API_BASE_URL]);

    /**
     * useCallback untuk menangani transfer saldo antar dompet.
     * Membuat dua transaksi: satu keluar (dengan biaya) dan satu masuk.
     * @param transferData - Data transfer yang berisi dompet asal, tujuan, jumlah, dan biaya.
     */
    const handleBalanceTransfer = useCallback(async (transferData: { fromWallet: string; toWallet: string; amount: number; fee: number; }) => {
        const { fromWallet, toWallet, amount, fee } = transferData;
        const fromWalletName = wallets.find(w => w.id === fromWallet)?.name;
        const toWalletName = wallets.find(w => w.id === toWallet)?.name;

        if (!fromWalletName || !toWalletName) {
            addToast('Dompet tidak ditemukan.', 'error');
            return;
        }

        // ID unik untuk menghubungkan dua transaksi transfer.
        const transferId = `transfer-${Date.now()}-${Math.random()}`;

        // Transaksi keluar dari dompet sumber.
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
            transferId,
        };

        // Transaksi masuk ke dompet tujuan.
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
            transferId,
        };

        try {
            // Mengirim kedua transaksi ke API.
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
            
            // Memperbarui state transaksi lokal.
            setTransactions(prev => [savedInTransaction, savedOutTransaction, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
            
            // Memperbarui saldo dompet secara manual untuk responsivitas UI.
            const updatedWalletsState = wallets.map(w => {
                if (w.id === fromWallet) {
                    return { ...w, balance: w.balance - (amount + fee) };
                }
                if (w.id === toWallet) {
                    return { ...w, balance: w.balance + amount };
                }
                return w;
            });
            
            // Mengirim pembaruan saldo dompet ke API.
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
    }, [wallets, addToast, API_BASE_URL]);

    /**
     * useCallback untuk memperbarui transaksi transfer saldo yang sudah ada.
     * @param data - Data transfer yang diperbarui.
     */
    const handleUpdateBalanceTransfer = useCallback(async (data: { fromWallet: string; toWallet: string; amount: number; fee: number; transferId: string; }) => {
        try {
            // Mencari transaksi keluar dan masuk original berdasarkan transferId.
            const originalOutTx = transactions.find(t => t.transferId === data.transferId && t.type === 'OUT');
            const originalInTx = transactions.find(t => t.transferId === data.transferId && t.type === 'IN');

            if (!originalOutTx || !originalInTx) {
                throw new Error('Transaksi pindah saldo original tidak ditemukan.');
            }

            const toWalletName = wallets.find(w => w.id === data.toWallet)?.name || 'Unknown';
            const fromWalletName = wallets.find(w => w.id === data.fromWallet)?.name || 'Unknown';

            // Membuat objek transaksi yang diperbarui.
            const updatedOutTx: Transaction = {
                ...originalOutTx,
                description: `Pindah Saldo ke ${toWalletName}`,
                wallet: data.fromWallet,
                amount: data.amount + data.fee,
                margin: 0,
            };

            const updatedInTx: Transaction = {
                ...originalInTx,
                description: `Pindah Saldo dari ${fromWalletName}`,
                wallet: data.toWallet,
                amount: data.amount,
                margin: 0,
            };

            // Menghitung perubahan bersih untuk setiap dompet.
            const walletChanges = new Map<string, number>();
            const addToMap = (walletId: string, value: number) => {
                walletChanges.set(walletId, (walletChanges.get(walletId) || 0) + value);
            };

            // 1. Mengembalikan efek transaksi original.
            addToMap(originalOutTx.wallet, originalOutTx.amount);
            addToMap(originalInTx.wallet, -originalInTx.amount);

            // 2. Menerapkan efek transaksi baru.
            addToMap(updatedOutTx.wallet, -updatedOutTx.amount);
            addToMap(updatedInTx.wallet, updatedInTx.amount);

            // Mengirim pembaruan transaksi ke API.
            const txUpdatePromises = [
                fetch(`${API_BASE_URL}/transactions/${updatedOutTx.id}`, {
                    method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updatedOutTx)
                }),
                fetch(`${API_BASE_URL}/transactions/${updatedInTx.id}`, {
                    method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updatedInTx)
                })
            ];
            
            const txResponses = await Promise.all(txUpdatePromises);
            for (const res of txResponses) {
                if (!res.ok) throw new Error('Gagal memperbarui data transaksi.');
            }
            const [savedOut, savedIn] = await Promise.all(txResponses.map(r => r.json()));

            // Mengirim pembaruan saldo dompet ke API dan memperbarui state lokal.
            const walletUpdatePromises: Promise<any>[] = [];
            const updatedWalletsState = wallets.map(w => {
                if (walletChanges.has(w.id)) {
                    const newBalance = w.balance + (walletChanges.get(w.id) || 0);
                    walletUpdatePromises.push(fetch(`${API_BASE_URL}/wallets/${w.id}`, {
                        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ balance: newBalance })
                    }));
                    return { ...w, balance: newBalance };
                }
                return w;
            });
            
            await Promise.all(walletUpdatePromises);
            
            // Memperbarui state lokal untuk dompet dan transaksi.
            setWallets(updatedWalletsState);
            setTransactions(prev => 
                prev.map(t => {
                    if (t.id === savedOut.id) return savedOut;
                    if (t.id === savedIn.id) return savedIn;
                    return t;
                }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            );

            addToast('Pindah saldo berhasil diperbarui', 'success');

        } catch (err) {
            console.error("Failed to update transfer:", err);
            addToast(err instanceof Error ? err.message : 'Gagal memperbarui pindah saldo.', 'error');
        }
    }, [transactions, wallets, addToast, API_BASE_URL]);

    /**
     * useCallback untuk menghapus kedua transaksi yang terkait dengan transfer saldo.
     * @param transferId - ID transfer yang akan dihapus.
     */
    const handleDeleteBalanceTransfer = useCallback(async (transferId: string) => {
        const originalOutTx = transactions.find(t => t.transferId === transferId && t.type === 'OUT');
        const originalInTx = transactions.find(t => t.transferId === transferId && t.type === 'IN');

        if (!originalOutTx || !originalInTx) {
            addToast('Transaksi transfer tidak ditemukan.', 'error');
            return;
        }

        try {
            // Menghapus kedua transaksi dari API.
            const deletePromises = [
                fetch(`${API_BASE_URL}/transactions/${originalOutTx.id}`, { method: 'DELETE' }),
                fetch(`${API_BASE_URL}/transactions/${originalInTx.id}`, { method: 'DELETE' })
            ];
            const deleteResponses = await Promise.all(deletePromises);
            for (const res of deleteResponses) {
                if (!res.ok) throw new Error('Gagal menghapus data transaksi.');
            }

            // Menghitung perubahan untuk mengembalikan saldo dompet.
            const walletChanges = new Map<string, number>();
            const addToMap = (walletId: string, value: number) => {
                walletChanges.set(walletId, (walletChanges.get(walletId) || 0) + value);
            };
            
            // Mengembalikan efek transaksi original.
            addToMap(originalOutTx.wallet, originalOutTx.amount); // Tambahkan kembali jumlah untuk transaksi KELUAR.
            addToMap(originalInTx.wallet, -originalInTx.amount); // Kurangi jumlah untuk transaksi MASUK.

            // Mengirim pembaruan saldo dompet ke API dan memperbarui state lokal.
            const walletUpdatePromises: Promise<any>[] = [];
            const updatedWalletsState = wallets.map(w => {
                if (walletChanges.has(w.id)) {
                    const newBalance = w.balance + (walletChanges.get(w.id) || 0);
                    walletUpdatePromises.push(fetch(`${API_BASE_URL}/wallets/${w.id}`, {
                        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ balance: newBalance })
                    }));
                    return { ...w, balance: newBalance };
                }
                return w;
            });
            await Promise.all(walletUpdatePromises);

            // Memperbarui state lokal.
            setWallets(updatedWalletsState);
            setTransactions(prev => prev.filter(t => t.transferId !== transferId));
            
            addToast('Pindah saldo berhasil dihapus', 'success');
            
        } catch (err) {
            console.error("Failed to delete transfer:", err);
            addToast(err instanceof Error ? err.message : 'Gagal menghapus pindah saldo.', 'error');
        }
    }, [transactions, wallets, addToast, API_BASE_URL]);


    /**
     * Fungsi untuk me-render halaman yang sesuai berdasarkan state `currentPage`.
     * @returns Komponen halaman yang akan di-render.
     */
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
                    onUpdateBalanceTransfer={handleUpdateBalanceTransfer}
                    onDeleteTransaction={handleDeleteTransaction}
                    onDeleteBalanceTransfer={handleDeleteBalanceTransfer}
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
                return <SettingsPage 
                    appName={appName} 
                    onAppNameChange={setAppName}
                    font={font}
                    onFontChange={setFont}
                />;
            default:
                return <DashboardPage 
                    wallets={wallets}
                    transactions={transactions}
                    accountsReceivable={accountsReceivable}
                    totalPiutang={totalPiutang}
                    onSettleReceivable={handleSettleReceivable}
                    onSaveTransaction={handleSaveTransaction}
                    onBalanceTransfer={handleBalanceTransfer}
                    onUpdateBalanceTransfer={handleUpdateBalanceTransfer}
                    onDeleteTransaction={handleDeleteTransaction}
                    onDeleteBalanceTransfer={handleDeleteBalanceTransfer}
                    categories={categories}
                    customers={customers}
                    formatRupiah={formatRupiah}
                />;
        }
    };
    
    /**
     * Fungsi untuk me-render konten utama, menangani status loading dan error.
     * @returns Komponen yang sesuai: loading spinner, pesan error, atau halaman utama.
     */
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
                    <h2 className="text-xl font.semibold text-red-500 mb-2">Terjadi Kesalahan</h2>
                    <p className="text-slate-600 dark:text-neutral-400 max-w-md">{error}</p>
                    <p className="text-sm text-neutral-500 mt-4">Pastikan `json-server` sedang berjalan pada port 3001.</p>
                </div>
            );
        }
        return renderPage();
    }

    // JSX untuk struktur utama aplikasi.
    return (
        <div className="bg-slate-50 dark:bg-[#191919] min-h-screen text-slate-800 dark:text-[#E6E1E5]">
            <Header 
                currentPage={currentPage} 
                setCurrentPage={setCurrentPage}
                theme={theme}
                setTheme={setTheme}
                appName={appName}
            />
            {renderContent()}
        </div>
    );
};


/**
 * Komponen root aplikasi yang membungkus MainApp dengan ToastProvider.
 * Ini memastikan bahwa seluruh aplikasi memiliki akses ke konteks notifikasi.
 */
const App: React.FC = () => {
    return (
        <ToastProvider>
            <MainApp />
            <ToastContainer />
        </ToastProvider>
    );
};

export default App;