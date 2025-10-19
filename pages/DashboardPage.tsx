import React, { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { Transaction, Wallet, SortKey, SortDirection, TransactionType, Font } from '../types';
import WalletsSummaryCard from '../components/WalletsSummaryCard';
import AccountsReceivableCard from '../components/AccountsReceivableCard';
import TransactionTable from '../components/TransactionTable';
import WeeklyTransactionSummary from '../components/WeeklyTransactionSummary';
import TransactionModal from '../components/TransactionModal';
import AddFeeModal from '../components/AddFeeModal';
import EditFeeModal from '../components/EditFeeModal';
import TransactionFilterControls from '../components/TransactionFilterControls';
import { PlusIcon, TransferIcon, CutIcon, MarginIcon, MoreVerticalIcon } from '../components/icons/Icons';
import TransferModal from '../components/TransferModal';
import DailyTransactionsModal from '../components/DailyTransactionsModal';
import ReceivableDetailModal from '../components/ReceivableDetailModal';
import ConfirmationModal from '../components/ConfirmationModal';
import FinancialHighlightsCard from '../components/FinancialHighlightsCard';
import TransactionDetailModal from '../components/TransactionDetailModal';
import EditRewardModal from '../components/EditRewardModal';
import MonthlyMarginDetailModal from '../components/MonthlyMarginDetailModal';
import AssetDetailModal from '../components/AssetDetailModal';
import EditBankFeeModal from '../components/EditBankFeeModal';
import InvoiceModal from '../components/InvoiceModal';
import EditInterestModal from '../components/EditInterestModal';
import BankFeeModal from '../components/BankFeeModal';
import AddInterestModal from '../components/AddInterestModal';


// Properti yang diterima oleh komponen DashboardPage.
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
    onUpdateBalanceTransfer: (data: { fromWallet: string; toWallet: string; amount: number; fee: number; transferId: string; }) => void;
    onDeleteTransaction: (transactionId: string) => void;
    onDeleteBalanceTransfer: (transferId: string) => void;
    formatRupiah: (amount: number) => string;
    appName: string;
    invoiceForTransaction: Transaction | null;
    onCloseInvoice: () => void;
    onShowInvoice: (transaction: Transaction) => void;
    invoiceAppName: string;
    invoiceAddress: string;
    invoicePhone: string;
    invoiceFooter: string;
    invoiceFont: Font;
    // FIX: Update function signature to return a Promise, matching the implementation in App.tsx and the expectation in child components.
    onSaveBankFee: (data: { walletId: string; amount: number; }) => Promise<void>;
    // FIX: Update function signature to return a Promise, matching the implementation in App.tsx and the expectation in child components.
    onSaveInterest: (data: { walletId: string; amount: number; date: string; }) => Promise<void>;
}

/**
 * DashboardPage adalah komponen utama yang menampilkan ringkasan finansial,
 * daftar transaksi, daftar piutang, dan menyediakan kontrol untuk menambah
 * atau memfilter data
 */
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
    onUpdateBalanceTransfer,
    onDeleteTransaction,
    onDeleteBalanceTransfer,
    formatRupiah,
    appName,
    invoiceForTransaction,
    onCloseInvoice,
    onShowInvoice,
    invoiceAppName,
    invoiceAddress,
    invoicePhone,
    invoiceFooter,
    invoiceFont,
    onSaveBankFee,
    onSaveInterest,
}) => {
    // State for visibilitas modal tambah/edit transaksi.
    const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
    // State for visibilitas modal transfer saldo.
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
    // State for menyimpan data transaksi yang akan diedit.
    const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);
    // State for menyimpan data transfer yang akan diedit.
    const [transferToEdit, setTransferToEdit] = useState<Transaction | null>(null);
    // State for pengurutan tabel.
    const [sortKey, setSortKey] = useState<SortKey>('date');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
    // State for visibilitas modal tambah fee.
    const [isFeeModalOpen, setIsFeeModalOpen] = useState(false);
    // State for visibilitas modal edit fee.
    const [isEditFeeModalOpen, setIsEditFeeModalOpen] = useState(false);
    // State for visibilitas modal edit reward.
    const [isEditRewardModalOpen, setIsEditRewardModalOpen] = useState(false);
    const [isEditBankFeeModalOpen, setIsEditBankFeeModalOpen] = useState(false);
    const [isEditInterestModalOpen, setIsEditInterestModalOpen] = useState(false);
    // State for menyimpan tanggal yang dipilih untuk modal detail harian.
    const [dailyModalDate, setDailyModalDate] = useState<string | null>(null);
    // State for filter.
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<'all' | TransactionType>('all');
    const [filterStartDate, setFilterStartDate] = useState('');
    const [filterEndDate, setFilterEndDate] = useState('');
    // State for menu Floating Action Button (FAB) di mobile.
    const [isFabMenuOpen, setIsFabMenuOpen] = useState(false);
    // State for visibilitas modal detail piutang.
    const [isReceivableDetailModalOpen, setIsReceivableDetailModalOpen] = useState(false);
    // State for menyimpan nama pelanggan yang piutangnya akan dilihat.
    const [selectedCustomerForReceivables, setSelectedCustomerForReceivables] = useState<string | null>(null);
    // State for modal konfirmasi penghapusan transfer.
    const [isDeleteTransferConfirmOpen, setIsDeleteTransferConfirmOpen] = useState(false);
    const [transferToDeleteId, setTransferToDeleteId] = useState<string | null>(null);
    // State for visibilitas modal info transaksi.
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const [transactionForInfo, setTransactionForInfo] = useState<Transaction | null>(null);
    // State for modal konfirmasi penghapusan transaksi umum.
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [transactionToDeleteId, setTransactionToDeleteId] = useState<string | null>(null);
    // State for margin detail modal
    const [isMarginDetailModalOpen, setIsMarginDetailModalOpen] = useState(false);
    // State for asset detail modal
    const [isAssetDetailModalOpen, setIsAssetDetailModalOpen] = useState(false);
    // State for bank fee and interest modals
    const [isBankFeeModalOpen, setIsBankFeeModalOpen] = useState(false);
    const [isAddInterestModalOpen, setIsAddInterestModalOpen] = useState(false);
    // State for desktop actions dropdown menu
    const [isActionsMenuOpen, setIsActionsMenuOpen] = useState(false);
    const actionsMenuRef = useRef<HTMLDivElement>(null);

    // Close actions menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (actionsMenuRef.current && !actionsMenuRef.current.contains(event.target as Node)) {
                setIsActionsMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [actionsMenuRef]);

    
    // useMemo for menghitung total margin pada bulan ini.
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

    // useMemo for menghitung total aset. Dihitung ulang hanya jika dompet atau piutang berubah.
    const totalAssets = useMemo(() => {
        // Menjumlahkan saldo semua dompet.
        const walletsTotal = wallets.reduce((sum, wallet) => {
            let usableBalance = wallet.balance;
            // Saldo BRI dan BRILink dikurangi Rp50.000 karena biasanya tidak dapat digunakan.
            if (wallet.id === 'BRI' || wallet.id === 'BRILINK') {
                usableBalance = Math.max(0, wallet.balance - 50000);
            }
            return sum + usableBalance;
        }, 0);
        // Total aset adalah total saldo dompet yang dapat digunakan ditambah total piutang.
        return walletsTotal + totalPiutang;
    }, [wallets, totalPiutang]);


    // useMemo for memproses daftar transaksi yang akan ditampilkan.
    // Ini menggabungkan dua entri transfer saldo menjadi satu baris.
    const displayTransactions = useMemo(() => {
        const transfers = new Map<string, { in?: Transaction, out?: Transaction }>();
        const otherTransactions: Transaction[] = [];

        // 1. Kelompokkan transfer dan pisahkan transaksi lain.
        transactions.forEach(t => {
            if (t.isInternalTransfer && t.transferId) {
                const pair = transfers.get(t.transferId) || {};
                if (t.type === TransactionType.IN) {
                    pair.in = t;
                } else { // OUT
                    pair.out = t;
                }
                transfers.set(t.transferId, pair);
            } else {
                otherTransactions.push(t);
            }
        });

        // 2. Buat objek transaksi gabungan untuk setiap pasangan transfer.
        const combinedTransferTransactions: Transaction[] = [];
        for (const [transferId, pair] of transfers.entries()) {
            if (pair.in && pair.out) {
                combinedTransferTransactions.push({
                    id: transferId, // Gunakan transferId sebagai ID unik untuk tampilan gabungan.
                    transferId: transferId,
                    date: pair.out.date,
                    description: `Pindah Saldo`,
                    customer: 'Internal',
                    type: TransactionType.OUT, // Tipe netral, logika tampilan akan dikustomisasi.
                    amount: pair.in.amount, // Jumlah yang diterima.
                    margin: pair.out.amount - pair.in.amount, // Biaya transfer.
                    wallet: pair.out.wallet, // Dompet asal.
                    toWallet: pair.in.wallet, // Dompet tujuan.
                    isPiutang: false,
                    isInternalTransfer: true,
                });
            } else {
                // Jika pasangan tidak lengkap, kembalikan sebagai transaksi individual.
                if (pair.in) otherTransactions.push(pair.in);
                if (pair.out) otherTransactions.push(pair.out);
            }
        }
        return [...otherTransactions, ...combinedTransferTransactions];
    }, [transactions]);

    // useMemo for menyaring dan mengurutkan transaksi berdasarkan input pengguna.
    const filteredAndSortedTransactions = useMemo(() => {
        let items = displayTransactions.filter(t => !t.isDeleting);

        // 1. Terapkan filter pencarian.
        if (searchTerm.trim()) {
            const lowercasedFilter = searchTerm.toLowerCase();
            items = items.filter(t =>
                t.description.toLowerCase().includes(lowercasedFilter) ||
                t.customer.toLowerCase().includes(lowercasedFilter) ||
                t.amount.toString().includes(lowercasedFilter) ||
                formatRupiah(t.amount).includes(lowercasedFilter)
            );
        }

        // 2. Terapkan filter tipe transaksi.
        if (filterType !== 'all') {
            items = items.filter(t => t.type === filterType);
        }

        // 3. Terapkan filter rentang tanggal.
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
        
        // 4. Lakukan pengurutan.
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
    }, [displayTransactions, searchTerm, filterType, filterStartDate, filterEndDate, sortKey, sortDirection, formatRupiah]);
    
    // useMemo for menghitung default "pintar" untuk modal transaksi.
    const smartDefaults = useMemo(() => {
        if (transactions.length === 0) {
            return { mostFrequentDescription: null, mostFrequentWallet: null };
        }

        const descriptionCounts = new Map<string, number>();
        const walletCounts = new Map<string, number>();

        // Hanya hitung transaksi non-internal untuk mendapatkan preferensi pengguna yang sebenarnya.
        transactions.filter(t => !t.isInternalTransfer).forEach(t => {
            descriptionCounts.set(t.description, (descriptionCounts.get(t.description) || 0) + 1);
            if (t.wallet !== 'CASH') { // Abaikan dompet KAS dari perhitungan frekuensi.
                walletCounts.set(t.wallet, (walletCounts.get(t.wallet) || 0) + 1);
            }
        });
        
        const findMax = (map: Map<string, number>): string | null => {
            if (map.size === 0) return null;
            return [...map.entries()].reduce((a, e) => e[1] > a[1] ? e : a)[0];
        };
        
        return {
            mostFrequentDescription: findMax(descriptionCounts),
            mostFrequentWallet: findMax(walletCounts)
        };
    }, [transactions]);
    
    // useCallback for membuka modal tambah transaksi.
    const handleOpenAddModal = useCallback(() => {
        setTransactionToEdit(null);
        setIsTransactionModalOpen(true);
        setIsFabMenuOpen(false);
    }, []);

    // Handler for membuka modal edit transaksi.
    const handleOpenEditModal = (transaction: Transaction) => {
        if (transaction.description === 'Fee Brilink') {
            setTransactionToEdit(transaction);
            setIsEditFeeModalOpen(true);
        } else if (transaction.description.startsWith('Reward:')) {
            setTransactionToEdit(transaction);
            setIsEditRewardModalOpen(true);
        } else if (transaction.description === 'Potongan Bank') {
            setTransactionToEdit(transaction);
            setIsEditBankFeeModalOpen(true);
        } else if (transaction.description === 'Bunga Bank') {
            setTransactionToEdit(transaction);
            setIsEditInterestModalOpen(true);
        } else {
            setTransactionToEdit(transaction);
            setIsTransactionModalOpen(true);
        }
    };

    // Handler for membuka modal info transaksi.
    const handleOpenInfoModal = useCallback((transaction: Transaction) => {
        // For combined transfer transactions, we need to find the original to show details
        if(transaction.isInternalTransfer && transaction.id.startsWith('transfer-')) {
            const originalTx = transactions.find(t => t.transferId === transaction.id);
            if (originalTx) {
                 setTransactionForInfo(originalTx);
            } else {
                 setTransactionForInfo(transaction); // Fallback
            }
        } else {
            setTransactionForInfo(transaction);
        }
        setIsInfoModalOpen(true);
    }, [transactions]);


    // Handler for membuka modal edit transfer.
    const handleOpenEditTransferModal = (transfer: Transaction) => {
        setTransferToEdit(transfer);
        setIsTransferModalOpen(true);
    };
    
    // useCallback for membuka modal detail transaksi harian.
    const handleDayClick = useCallback((date: string) => {
        setDailyModalDate(date);
    }, []);

    // useMemo for menyaring transaksi harian yang akan ditampilkan di modal.
    const dailyTransactions = useMemo(() => {
        if (!dailyModalDate) return [];
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

    // Handler for menutup modal transaksi.
    const handleCloseModal = () => {
        setIsTransactionModalOpen(false);
    };

    // Handler for menyimpan data dari modal transaksi.
    const handleSaveFromModal = (data: Transaction | Omit<Transaction, 'id' | 'date'>) => {
        onSaveTransaction(data);
        setIsTransactionModalOpen(false);
    };
    
    // Handler for mengubah pengurutan tabel.
    const handleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortKey(key);
            setSortDirection(key === 'date' ? 'desc' : 'asc');
        }
    };
    
    // Handler for membuka modal tambah fee.
    const handleOpenFeeModal = () => {
        setIsFeeModalOpen(true);
        setIsFabMenuOpen(false);
    };

    const handleOpenBankFeeModal = () => {
        setIsBankFeeModalOpen(true);
        setIsFabMenuOpen(false);
    };

    const handleOpenInterestModal = () => {
        setIsAddInterestModalOpen(true);
        setIsFabMenuOpen(false);
    };

    // Handler for menyimpan transaksi fee.
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
    
    const handleSaveBankFeeFromModal = async (data: { walletId: string; amount: number; }) => {
        await onSaveBankFee(data);
        setIsBankFeeModalOpen(false);
    };

    const handleSaveInterestFromModal = async (data: { walletId: string; amount: number; date: string; }) => {
        await onSaveInterest(data);
        setIsAddInterestModalOpen(false);
    };

    // Handler for memperbarui transaksi fee.
    const handleUpdateFee = (updatedTransaction: Transaction) => {
        onSaveTransaction(updatedTransaction);
        setIsEditFeeModalOpen(false);
    };

    // Handler for memperbarui transaksi reward.
    const handleUpdateReward = (updatedTransaction: Transaction) => {
        onSaveTransaction(updatedTransaction);
        setIsEditRewardModalOpen(false);
    };

    const handleUpdateBankFee = (updatedTransaction: Transaction) => {
        onSaveTransaction(updatedTransaction);
        setIsEditBankFeeModalOpen(false);
    };

    const handleUpdateInterest = (updatedTransaction: Transaction) => {
        onSaveTransaction(updatedTransaction);
        setIsEditInterestModalOpen(false);
    };

    // Handler for membuka modal transfer.
    const handleOpenTransferModal = () => {
        setTransferToEdit(null);
        setIsTransferModalOpen(true);
        setIsFabMenuOpen(false);
    };
    
    // useCallback for menyimpan data dari modal transfer (baru atau editan).
    const handleSaveTransfer = useCallback((data: { fromWallet: string; toWallet: string; amount: number; fee: number; transferId?: string; }) => {
        if (data.transferId) {
            onUpdateBalanceTransfer(data as { fromWallet: string; toWallet: string; amount: number; fee: number; transferId: string; });
        } else {
            onBalanceTransfer(data);
        }
        setIsTransferModalOpen(false);
        setTransferToEdit(null);
    }, [onBalanceTransfer, onUpdateBalanceTransfer]);

    // Handler for membuka modal konfirmasi hapus transfer dari modal edit.
    const handleOpenDeleteTransferConfirmFromEdit = (transferId: string) => {
        setIsTransferModalOpen(false);
        setTransferToEdit(null);
        setTransferToDeleteId(transferId);
        setIsDeleteTransferConfirmOpen(true);
    };

    // Handler for membuka modal konfirmasi hapus transfer dari baris tabel.
    const handleDeleteTransferConfirm = (transferId: string) => {
        setTransferToDeleteId(transferId);
        setIsDeleteTransferConfirmOpen(true);
    };

    // Handler for mengonfirmasi penghapusan transfer.
    const handleConfirmDeleteTransfer = () => {
        if (transferToDeleteId) {
            onDeleteBalanceTransfer(transferToDeleteId);
        }
        setIsDeleteTransferConfirmOpen(false);
        setTransferToDeleteId(null);
    };
    
    // Handler untuk membuka modal konfirmasi hapus transaksi umum.
    const handleDeleteTransactionConfirm = (transactionId: string) => {
        setTransactionToDeleteId(transactionId);
        setIsDeleteConfirmOpen(true);
    };

    // Handler untuk mengonfirmasi penghapusan transaksi umum.
    const handleConfirmDeleteTransaction = () => {
        if (transactionToDeleteId) {
            onDeleteTransaction(transactionToDeleteId);
        }
        setIsDeleteConfirmOpen(false);
        setTransactionToDeleteId(null);
    };


    // useCallback for membersihkan semua filter.
    const handleClearFilters = useCallback(() => {
        setSearchTerm('');
        setFilterType('all');
        setFilterStartDate('');
        setFilterEndDate('');
    }, []);

    // Handler for membuka modal detail piutang pelanggan.
    const handleOpenReceivableDetail = (customerName: string) => {
        setSelectedCustomerForReceivables(customerName);
        setIsReceivableDetailModalOpen(true);
    };

    // useEffect for menambahkan shortcut keyboard '/' untuk membuka modal tambah transaksi.
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
            {/* Render semua modal */}
             <AssetDetailModal
                isOpen={isAssetDetailModalOpen}
                onClose={() => setIsAssetDetailModalOpen(false)}
                wallets={wallets}
                transactions={transactions}
                totalPiutang={totalPiutang}
                formatRupiah={formatRupiah}
            />
            <MonthlyMarginDetailModal
                isOpen={isMarginDetailModalOpen}
                onClose={() => setIsMarginDetailModalOpen(false)}
                transactions={transactions}
                formatRupiah={formatRupiah}
            />
            <TransferModal
                isOpen={isTransferModalOpen}
                onClose={() => {
                    setIsTransferModalOpen(false);
                    setTransferToEdit(null);
                }}
                onSave={handleSaveTransfer}
                wallets={wallets}
                transferToEdit={transferToEdit}
                onDelete={handleOpenDeleteTransferConfirmFromEdit}
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
                mostFrequentDescription={smartDefaults.mostFrequentDescription}
                mostFrequentWallet={smartDefaults.mostFrequentWallet}
            />
            <TransactionDetailModal
                isOpen={isInfoModalOpen}
                onClose={() => setIsInfoModalOpen(false)}
                transaction={transactionForInfo}
                wallets={wallets}
                formatRupiah={formatRupiah}
                onShowInvoice={onShowInvoice}
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
             <ReceivableDetailModal
                isOpen={isReceivableDetailModalOpen}
                onClose={() => setIsReceivableDetailModalOpen(false)}
                customerName={selectedCustomerForReceivables}
                allReceivables={accountsReceivable}
                onSettle={onSettleReceivable}
                formatRupiah={formatRupiah}
            />
            <AddFeeModal 
                isOpen={isFeeModalOpen}
                onClose={() => setIsFeeModalOpen(false)}
                onSave={handleSaveFee}
            />
            <EditFeeModal
                isOpen={isEditFeeModalOpen}
                onClose={() => setIsEditFeeModalOpen(false)}
                onSave={handleUpdateFee}
                onDelete={onDeleteTransaction}
                transactionToEdit={transactionToEdit}
                formatRupiah={formatRupiah}
            />
            <EditRewardModal
                isOpen={isEditRewardModalOpen}
                onClose={() => setIsEditRewardModalOpen(false)}
                onSave={handleUpdateReward}
                onDelete={onDeleteTransaction}
                transactionToEdit={transactionToEdit}
                formatRupiah={formatRupiah}
            />
            <EditBankFeeModal
                isOpen={isEditBankFeeModalOpen}
                onClose={() => setIsEditBankFeeModalOpen(false)}
                onSave={handleUpdateBankFee}
                onDelete={onDeleteTransaction}
                transactionToEdit={transactionToEdit}
                formatRupiah={formatRupiah}
            />
            <EditInterestModal
                isOpen={isEditInterestModalOpen}
                onClose={() => setIsEditInterestModalOpen(false)}
                onSave={handleUpdateInterest}
                onDelete={onDeleteTransaction}
                transactionToEdit={transactionToEdit}
                formatRupiah={formatRupiah}
            />
            <BankFeeModal
                isOpen={isBankFeeModalOpen}
                onClose={() => setIsBankFeeModalOpen(false)}
                onSave={handleSaveBankFeeFromModal}
                wallets={wallets}
            />
            <AddInterestModal
                isOpen={isAddInterestModalOpen}
                onClose={() => setIsAddInterestModalOpen(false)}
                onSave={handleSaveInterestFromModal}
                wallets={wallets}
            />
            <ConfirmationModal 
                isOpen={isDeleteTransferConfirmOpen}
                onClose={() => setIsDeleteTransferConfirmOpen(false)}
                onConfirm={handleConfirmDeleteTransfer}
                title="Hapus Pindah Saldo"
                message="Apakah Anda yakin ingin menghapus transaksi pindah saldo ini? Kedua transaksi (keluar dan masuk) akan dihapus secara permanen."
                confirmText="Ya, Hapus"
                confirmColor="bg-red-600 hover:bg-red-700"
            />
             <ConfirmationModal 
                isOpen={isDeleteConfirmOpen}
                onClose={() => setIsDeleteConfirmOpen(false)}
                onConfirm={handleConfirmDeleteTransaction}
                title="Hapus Transaksi"
                message="Apakah Anda yakin ingin menghapus transaksi ini? Tindakan ini tidak dapat dibatalkan."
                confirmText="Ya, Hapus"
                confirmColor="bg-red-600 hover:bg-red-700"
            />
            <InvoiceModal
                isOpen={!!invoiceForTransaction}
                onClose={onCloseInvoice}
                transaction={invoiceForTransaction}
                wallets={wallets}
                formatRupiah={formatRupiah}
                invoiceAppName={invoiceAppName}
                invoiceAddress={invoiceAddress}
                invoicePhone={invoicePhone}
                invoiceFooter={invoiceFooter}
                invoiceFont={invoiceFont}
            />
            <main className="p-4 sm:p-6 flex-1">
                <div className="mx-auto max-w-7xl">
                    <div className="space-y-6">
                        {/* Tata letak grid utama */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Kolom Kanan (Ringkasan), menjadi yang pertama di mobile */}
                            <div className="lg:col-span-1 space-y-6 lg:order-2 lg:h-[calc(100vh-3rem)] flex flex-col">
                               
                                 <section>
                                    <WalletsSummaryCard 
                                        wallets={wallets}
                                        formatRupiah={formatRupiah}
                                        totalAssets={totalAssets}
                                        totalMargin={currentMonthMargin}
                                        onMarginClick={() => setIsMarginDetailModalOpen(true)}
                                        onAssetClick={() => setIsAssetDetailModalOpen(true)}
                                    />
                                </section>
                                <section>
                                    <WeeklyTransactionSummary 
                                        transactions={transactions}
                                        onDayClick={handleDayClick}
                                        formatRupiah={formatRupiah}
                                    />
                                </section>                                
                                <section className="flex-grow min-h-0">
                                    <AccountsReceivableCard 
                                        receivableTransactions={accountsReceivable} 
                                        totalPiutang={totalPiutang}
                                        formatRupiah={formatRupiah} 
                                        onOpenDetail={handleOpenReceivableDetail}
                                        onSettleReceivable={onSettleReceivable}
                                    />
                                </section>
                            </div>

                            {/* Konten Utama (Tabel Transaksi), menjadi yang kedua di mobile */}
                            <div className="lg:col-span-2 lg:space-y-6 lg:order-1">
                                <div className="hidden lg:block">
                                    <FinancialHighlightsCard
                                        totalAssets={totalAssets}
                                        totalMargin={currentMonthMargin}
                                        formatRupiah={formatRupiah}
                                        onMarginClick={() => setIsMarginDetailModalOpen(true)}
                                        onAssetClick={() => setIsAssetDetailModalOpen(true)}
                                    />
                                </div>
                                <div className="bg-white dark:bg-neutral-800 p-4 rounded-3xl flex flex-col shadow-lg shadow-slate-200/50 dark:shadow-none lg:h-[calc(100vh-11.5rem)]">
                                    <div className="flex-shrink-0 flex justify-between items-center mb-4 px-2">
                                        <h3 className="text-lg font.medium text-slate-800 dark:text-white">Riwayat Transaksi</h3>
                                        <div className="hidden md:flex items-center space-x-2">
                                            {/* New Actions Dropdown */}
                                            <div ref={actionsMenuRef} className="relative">
                                                <button
                                                    onClick={() => setIsActionsMenuOpen(prev => !prev)}
                                                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-neutral-700/50 dark:hover:bg-neutral-700 dark:text-neutral-200 font-semibold p-2.5 rounded-full flex items-center justify-center transition-colors duration-300"
                                                    aria-label="Aksi lainnya"
                                                    aria-haspopup="true"
                                                    aria-expanded={isActionsMenuOpen}
                                                >
                                                    <MoreVerticalIcon className="h-5 w-5" />
                                                </button>

                                                {isActionsMenuOpen && (
                                                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-neutral-800 rounded-xl shadow-lg border border-slate-200 dark:border-white/10 z-20 animate-fade-in p-2">
                                                        <ul className="space-y-1">
                                                            <li>
                                                                <button onClick={() => { handleOpenInterestModal(); setIsActionsMenuOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-left rounded-lg text-slate-700 dark:text-neutral-200 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
                                                                    <MarginIcon className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />
                                                                    <span>Bunga Bank</span>
                                                                </button>
                                                            </li>
                                                            <li>
                                                                <button onClick={() => { handleOpenBankFeeModal(); setIsActionsMenuOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-left rounded-lg text-slate-700 dark:text-neutral-200 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
                                                                    <CutIcon className="h-5 w-5 text-purple-500 dark:text-purple-400" />
                                                                    <span>Potongan Bank</span>
                                                                </button>
                                                            </li>
                                                            <li>
                                                                <button onClick={() => { handleOpenTransferModal(); setIsActionsMenuOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-left rounded-lg text-slate-700 dark:text-neutral-200 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
                                                                    <TransferIcon className="h-5 w-5 text-sky-500 dark:text-sky-400" />
                                                                    <span>Pindah Saldo</span>
                                                                </button>
                                                            </li>
                                                            <li>
                                                                <button onClick={() => { handleOpenFeeModal(); setIsActionsMenuOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-left rounded-lg text-slate-700 dark:text-neutral-200 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
                                                                    <PlusIcon className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                                                                    <span>Fee Brilink</span>
                                                                </button>
                                                            </li>
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Main Add Transaction Button */}
                                            <button 
                                                onClick={handleOpenAddModal}
                                                className="bg-blue-500 hover:bg-blue-600 text-white dark:bg-blue-400 dark:hover:bg-blue-500 dark:text-slate-900 font-semibold py-2 px-4 rounded-full flex items-center justify-center space-x-2 transition-colors duration-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <PlusIcon className="h-4 w-4" />
                                                <span>Tambah Transaksi</span>
                                                <kbd className="hidden sm:inline-block ml-2 bg-slate-100/30 dark:bg-neutral-700/80 border border-slate-300 dark:border-neutral-600 rounded px-1.5 py-0.5 text-xs font.mono text-white dark:text-neutral-300">/</kbd>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex-shrink-0">
                                        <TransactionFilterControls 
                                            searchTerm={searchTerm}
                                            onSearchChange={setSearchTerm}
                                            filterType={filterType}
                                            onFilterTypeChange={setFilterType}
                                            startDate={filterStartDate}
                                            onStartDateChange={setFilterStartDate}
                                            endDate={filterEndDate}
                                            onEndDateChange={setFilterEndDate}
                                            onClearFilters={handleClearFilters}
                                        />
                                    </div>
                                    <div className="flex-grow min-h-0">
                                        <TransactionTable 
                                            wallets={wallets}
                                            transactions={filteredAndSortedTransactions} 
                                            formatRupiah={formatRupiah} 
                                            onInfoTransaction={handleOpenInfoModal}
                                            onEditTransaction={handleOpenEditModal}
                                            onDeleteTransactionConfirm={handleDeleteTransactionConfirm}
                                            onEditTransfer={handleOpenEditTransferModal}
                                            onDeleteTransferConfirm={handleDeleteTransferConfirm}
                                            sortKey={sortKey}
                                            sortDirection={sortDirection}
                                            onSort={handleSort}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            
            {/* Tombol Aksi Apung (FAB) untuk Mobile */}
            <div className="md:hidden fixed bottom-6 right-6 z-40">
                {isFabMenuOpen && (
                    <div 
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm" 
                        onClick={() => setIsFabMenuOpen(false)}
                        aria-hidden="true"
                    ></div>
                )}
                <div className="relative flex flex-col items-end gap-3">
                    {/* Aksi Sekunder */}
                    <div 
                        className={`transition-all duration-300 ease-in-out flex flex-col items-end gap-3 ${isFabMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}
                    >
                        <div className="flex items-center gap-3">
                            <div className="bg-white dark:bg-neutral-700 text-slate-700 dark:text-neutral-200 text-xs font.semibold px-3 py-1.5 rounded-full shadow-md">
                                Tambah Transaksi
                            </div>
                            <button onClick={handleOpenAddModal} className="h-12 w-12 rounded-full bg-white dark:bg-neutral-700 text-blue-500 dark:text-blue-300 flex items-center justify-center shadow-md hover:bg-slate-100 dark:hover:bg-neutral-600">
                                <PlusIcon className="h-6 w-6" strokeWidth={2} />
                            </button>
                        </div>
                         <div className="flex items-center gap-3">
                            <div className="bg-white dark:bg-neutral-700 text-slate-700 dark:text-neutral-200 text-xs font.semibold px-3 py-1.5 rounded-full shadow-md">
                                Bunga Bank
                            </div>
                            <button onClick={handleOpenInterestModal} className="h-12 w-12 rounded-full bg-white dark:bg-neutral-700 text-emerald-500 dark:text-emerald-300 flex items-center justify-center shadow-md hover:bg-slate-100 dark:hover:bg-neutral-600">
                                <MarginIcon className="h-6 w-6" />
                            </button>
                        </div>
                         <div className="flex items-center gap-3">
                            <div className="bg-white dark:bg-neutral-700 text-slate-700 dark:text-neutral-200 text-xs font.semibold px-3 py-1.5 rounded-full shadow-md">
                                Potongan Bank
                            </div>
                            <button onClick={handleOpenBankFeeModal} className="h-12 w-12 rounded-full bg-white dark:bg-neutral-700 text-purple-500 dark:text-purple-300 flex items-center justify-center shadow-md hover:bg-slate-100 dark:hover:bg-neutral-600">
                                <CutIcon className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="bg-white dark:bg-neutral-700 text-slate-700 dark:text-neutral-200 text-xs font.semibold px-3 py-1.5 rounded-full shadow-md">
                                Fee Brilink
                            </div>
                            <button onClick={handleOpenFeeModal} className="h-12 w-12 rounded-full bg-white dark:bg-neutral-700 text-blue-500 dark:text-blue-300 flex items-center justify-center shadow-md hover:bg-slate-100 dark:hover:bg-neutral-600">
                                <PlusIcon className="h-6 w-6" strokeWidth={2} />
                            </button>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="bg-white dark:bg-neutral-700 text-slate-700 dark:text-neutral-200 text-xs font.semibold px-3 py-1.5 rounded-full shadow-md">
                                Pindah Saldo
                            </div>
                            <button onClick={handleOpenTransferModal} className="h-12 w-12 rounded-full bg-white dark:bg-neutral-700 text-sky-500 dark:text-sky-300 flex items-center justify-center shadow-md hover:bg-slate-100 dark:hover:bg-neutral-600">
                                <TransferIcon className="h-6 w-6" strokeWidth={1.5} />
                            </button>
                        </div>
                    </div>

                    {/* Tombol FAB Utama */}
                    <button
                        onClick={() => setIsFabMenuOpen(!isFabMenuOpen)}
                        className="w-14 h-14 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-lg hover:bg-blue-600 transition-transform duration-300"
                        style={{ transform: isFabMenuOpen ? 'rotate(45deg)' : 'none' }}
                        aria-expanded={isFabMenuOpen}
                        aria-label={isFabMenuOpen ? "Tutup menu aksi" : "Buka menu aksi"}
                    >
                        <PlusIcon className="h-8 w-8" strokeWidth={2} />
                    </button>
                </div>
            </div>
        </>
    );
};

export default DashboardPage;