import React, { useState } from 'react';
import { Wallet } from '../types';
import { EditIcon, DeleteIcon, PlusIcon, SettingsIcon } from '../components/icons/Icons';
import AddEditWalletModal from '../components/AddEditWalletModal';
import ConfirmationModal from '../components/ConfirmationModal';
import AddEditCategoryModal from '../components/AddEditCategoryModal';
import InitialBalanceModal from '../components/InitialBalanceModal';

interface ManagementPageProps {
    wallets: Wallet[];
    onSaveWallet: (walletData: Omit<Wallet, 'id'> | Wallet) => Promise<void>;
    onDeleteWallet: (walletId: string) => Promise<void>;
    categories: string[];
    onSaveCategories: (newCategories: string[]) => Promise<void>;
    onSaveInitialBalances: (updatedWallets: { id: string; initialBalance: number }[]) => Promise<void>;
    formatRupiah: (amount: number) => string;
}

const ManagementPage: React.FC<ManagementPageProps> = ({
    wallets,
    onSaveWallet,
    onDeleteWallet,
    categories,
    onSaveCategories,
    onSaveInitialBalances,
    formatRupiah,
}) => {
    // State from WalletManagementPage
    const [isAddEditWalletModalOpen, setIsAddEditWalletModalOpen] = useState(false);
    const [isDeleteWalletModalOpen, setIsDeleteWalletModalOpen] = useState(false);
    const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);
    const [walletToDelete, setWalletToDelete] = useState<Wallet | null>(null);
    const [isInitialBalanceModalOpen, setIsInitialBalanceModalOpen] = useState(false);

    // State from TransactionCategoryPage
    const [isAddEditCategoryModalOpen, setIsAddEditCategoryModalOpen] = useState(false);
    const [isDeleteCategoryModalOpen, setIsDeleteCategoryModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<{name: string, index: number} | null>(null);
    const [categoryToDelete, setCategoryToDelete] = useState<{name: string, index: number} | null>(null);

    // Handlers from WalletManagementPage
    const handleOpenAddWalletModal = () => {
        setSelectedWallet(null);
        setIsAddEditWalletModalOpen(true);
    };

    const handleOpenEditWalletModal = (wallet: Wallet) => {
        setSelectedWallet(wallet);
        setIsAddEditWalletModalOpen(true);
    };

    const handleOpenDeleteWalletModal = (wallet: Wallet) => {
        setWalletToDelete(wallet);
        setIsDeleteWalletModalOpen(true);
    };

    const handleSaveWallet = async (walletData: Omit<Wallet, 'id'> | Wallet) => {
        await onSaveWallet(walletData);
        setIsAddEditWalletModalOpen(false);
    };

    const handleDeleteWallet = async () => {
        if (walletToDelete) {
            await onDeleteWallet(walletToDelete.id);
            setIsDeleteWalletModalOpen(false);
            setWalletToDelete(null);
        }
    };

    // Handlers from TransactionCategoryPage
    const handleOpenAddCategoryModal = () => {
        setSelectedCategory(null);
        setIsAddEditCategoryModalOpen(true);
    };

    const handleOpenEditCategoryModal = (category: string, index: number) => {
        setSelectedCategory({ name: category, index: index });
        setIsAddEditCategoryModalOpen(true);
    };

    const handleOpenDeleteCategoryModal = (category: string, index: number) => {
        setCategoryToDelete({ name: category, index: index });
        setIsDeleteCategoryModalOpen(true);
    };

    const handleSaveCategory = async (categoryName: string) => {
        let newCategories;
        if (selectedCategory) {
            newCategories = categories.map((cat, i) => i === selectedCategory.index ? categoryName : cat);
        } else {
            newCategories = [...categories, categoryName];
        }
        await onSaveCategories(newCategories);
        setIsAddEditCategoryModalOpen(false);
    };

    const handleDeleteCategory = async () => {
        if (categoryToDelete) {
            const newCategories = categories.filter((_, i) => i !== categoryToDelete.index);
            await onSaveCategories(newCategories);
            setIsDeleteCategoryModalOpen(false);
            setCategoryToDelete(null);
        }
    };


    return (
        <main className="p-4 sm:p-6 flex-1">
            <div className="mx-auto max-w-7xl">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Wallet Management Section */}
                    <div className="bg-white dark:bg-neutral-800 p-4 rounded-3xl shadow-lg shadow-slate-200/50 dark:shadow-none">
                        <div className="flex justify-between items-center mb-4 px-2">
                            <h3 className="text-lg font-medium text-slate-800 dark:text-white">Daftar Dompet</h3>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => setIsInitialBalanceModalOpen(true)}
                                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-neutral-700/50 dark:hover:bg-neutral-700 dark:text-neutral-200 font-semibold py-2 px-4 rounded-full flex items-center space-x-2 transition-colors duration-300 text-sm"
                                    aria-label="Atur modal awal dompet"
                                >
                                    <SettingsIcon className="h-4 w-4" />
                                    <span>Atur Modal</span>
                                </button>
                                <button 
                                    onClick={handleOpenAddWalletModal}
                                    className="bg-blue-500 hover:bg-blue-600 text-white dark:bg-blue-400 dark:hover:bg-blue-500 dark:text-slate-900 font-semibold py-2 px-5 rounded-full flex items-center space-x-2 transition-colors duration-300 text-sm"
                                >
                                    <PlusIcon />
                                    <span>Tambah Dompet</span>
                                </button>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                           <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-white/10">
                                <table className="w-full text-left">
                                    <thead className="border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5">
                                        <tr>
                                            <th className="p-3 text-xs font-medium uppercase text-slate-500 dark:text-[#958F99] tracking-wider">Dompet</th>
                                            <th className="p-3 text-xs font-medium uppercase text-slate-500 dark:text-[#958F99] tracking-wider">Saldo</th>
                                            <th className="p-3 text-xs font-medium uppercase text-slate-500 dark:text-[#958F99] tracking-wider text-center">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {wallets.map(wallet => (
                                            <tr key={wallet.id} className="border-b border-slate-200 dark:border-white/10 last:border-b-0 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors duration-200">
                                                <td className="p-3 text-sm text-slate-800 dark:text-white">{wallet.name}</td>
                                                <td className="p-3 text-sm font-medium text-emerald-600 dark:text-emerald-400">{formatRupiah(wallet.balance)}</td>
                                                <td className="p-3 text-sm text-center">
                                                    <div className="flex justify-center space-x-2">
                                                        <button onClick={() => handleOpenEditWalletModal(wallet)} className="p-2 rounded-full text-slate-500 dark:text-neutral-400 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-slate-700 dark:hover:text-white transition-colors duration-200" aria-label={`Edit dompet ${wallet.name}`}><EditIcon /></button>
                                                        <button onClick={() => handleOpenDeleteWalletModal(wallet)} className="p-2 rounded-full text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-400/10 hover:text-red-600 dark:hover:text-red-300 transition-colors duration-200" aria-label={`Hapus dompet ${wallet.name}`}><DeleteIcon /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Category Management Section */}
                    <div className="bg-white dark:bg-neutral-800 p-4 rounded-3xl shadow-lg shadow-slate-200/50 dark:shadow-none">
                        <div className="flex justify-between items-center mb-4 px-2">
                            <h3 className="text-lg font-medium text-slate-800 dark:text-white">Jenis Transaksi</h3>
                            <button 
                                onClick={handleOpenAddCategoryModal}
                                className="bg-blue-500 hover:bg-blue-600 text-white dark:bg-blue-400 dark:hover:bg-blue-500 dark:text-slate-900 font-semibold py-2 px-5 rounded-full flex items-center space-x-2 transition-colors duration-300 text-sm"
                            >
                                <PlusIcon />
                                <span>Tambah Kategori</span>
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                             <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-white/10">
                                <table className="w-full text-left">
                                    <thead className="border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5">
                                        <tr>
                                            <th className="p-3 text-xs font-medium uppercase text-slate-500 dark:text-[#958F99] tracking-wider">Nama Kategori</th>
                                            <th className="p-3 text-xs font-medium uppercase text-slate-500 dark:text-[#958F99] tracking-wider text-center">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {categories.map((category, index) => (
                                            <tr key={index} className="border-b border-slate-200 dark:border-white/10 last:border-b-0 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors duration-200">
                                                <td className="p-3 text-sm text-slate-800 dark:text-white">{category}</td>
                                                <td className="p-3 text-sm text-center">
                                                    <div className="flex justify-center space-x-2">
                                                        <button onClick={() => handleOpenEditCategoryModal(category, index)} className="p-2 rounded-full text-slate-500 dark:text-neutral-400 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-slate-700 dark:hover:text-white transition-colors duration-200" aria-label={`Edit kategori ${category}`}><EditIcon /></button>
                                                        <button onClick={() => handleOpenDeleteCategoryModal(category, index)} className="p-2 rounded-full text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-400/10 hover:text-red-600 dark:hover:text-red-300 transition-colors duration-200" aria-label={`Hapus kategori ${category}`}><DeleteIcon /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modals */}
                <AddEditWalletModal 
                    isOpen={isAddEditWalletModalOpen}
                    onClose={() => setIsAddEditWalletModalOpen(false)}
                    onSave={handleSaveWallet}
                    walletToEdit={selectedWallet}
                />
                <ConfirmationModal 
                    isOpen={isDeleteWalletModalOpen}
                    onClose={() => setIsDeleteWalletModalOpen(false)}
                    onConfirm={handleDeleteWallet}
                    title="Hapus Dompet"
                    message={`Apakah Anda yakin ingin menghapus dompet "${walletToDelete?.name}"? Tindakan ini tidak dapat dibatalkan.`}
                />
                <AddEditCategoryModal 
                    isOpen={isAddEditCategoryModalOpen}
                    onClose={() => setIsAddEditCategoryModalOpen(false)}
                    onSave={handleSaveCategory}
                    categoryToEdit={selectedCategory?.name}
                />
                <ConfirmationModal 
                    isOpen={isDeleteCategoryModalOpen}
                    onClose={() => setIsDeleteCategoryModalOpen(false)}
                    onConfirm={handleDeleteCategory}
                    title="Hapus Kategori"
                    message={`Apakah Anda yakin ingin menghapus kategori "${categoryToDelete?.name}"?`}
                />
                <InitialBalanceModal
                    isOpen={isInitialBalanceModalOpen}
                    onClose={() => setIsInitialBalanceModalOpen(false)}
                    onSave={onSaveInitialBalances}
                    wallets={wallets}
                />
            </div>
        </main>
    );
};

export default ManagementPage;