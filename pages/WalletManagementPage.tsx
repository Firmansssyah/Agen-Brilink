import React, { useState } from 'react';
import { Wallet } from '../types';
import { EditIcon, DeleteIcon, PlusIcon } from '../components/icons/Icons';
import AddEditWalletModal from '../components/AddEditWalletModal';
import ConfirmationModal from '../components/ConfirmationModal';

// Properti untuk komponen WalletManagementPage.
interface WalletManagementPageProps {
    wallets: Wallet[];
    onSaveWallet: (walletData: Omit<Wallet, 'id'> | Wallet) => Promise<void>;
    onDeleteWallet: (walletId: string) => Promise<void>;
    formatRupiah: (amount: number) => string;
}

/**
 * Komponen WalletManagementPage adalah halaman terpisah untuk mengelola dompet.
 * (Catatan: Komponen ini tampaknya sudah tidak digunakan lagi dan fungsionalitasnya
 * telah digabungkan ke dalam ManagementPage).
 */
const WalletManagementPage: React.FC<WalletManagementPageProps> = ({ wallets, onSaveWallet, onDeleteWallet, formatRupiah }) => {
    // State untuk mengontrol visibilitas modal tambah/edit.
    const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
    // State untuk mengontrol visibilitas modal konfirmasi hapus.
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    // State untuk menyimpan data dompet yang akan diedit.
    const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);
    // State untuk menyimpan data dompet yang akan dihapus.
    const [walletToDelete, setWalletToDelete] = useState<Wallet | null>(null);
    
    // Handler untuk membuka modal tambah dompet.
    const handleOpenAddModal = () => {
        setSelectedWallet(null);
        setIsAddEditModalOpen(true);
    };

    // Handler untuk membuka modal edit dompet.
    const handleOpenEditModal = (wallet: Wallet) => {
        setSelectedWallet(wallet);
        setIsAddEditModalOpen(true);
    };

    // Handler untuk membuka modal konfirmasi hapus.
    const handleOpenDeleteModal = (wallet: Wallet) => {
        setWalletToDelete(wallet);
        setIsDeleteModalOpen(true);
    }

    // Handler untuk menyimpan dompet.
    const handleSaveWallet = async (walletData: Omit<Wallet, 'id'> | Wallet) => {
        await onSaveWallet(walletData);
        setIsAddEditModalOpen(false);
    };

    // Handler untuk mengonfirmasi penghapusan dompet.
    const handleDeleteWallet = async () => {
        if (walletToDelete) {
            await onDeleteWallet(walletToDelete.id);
            setIsDeleteModalOpen(false);
            setWalletToDelete(null);
        }
    };

    return (
        <main className="p-4 sm:p-6 flex-1">
            <div className="mx-auto max-w-4xl">
                <div className="bg-white dark:bg-[#2A282F] p-4 rounded-3xl shadow-lg shadow-slate-200/50 dark:shadow-none">
                    <div className="flex justify-between items-center mb-4 px-2">
                        <h3 className="text-lg font.medium text-slate-800 dark:text-white">Daftar Dompet</h3>
                        <button 
                            onClick={handleOpenAddModal}
                            className="bg-blue-500 hover:bg-blue-600 text-white dark:bg-blue-400 dark:hover:bg-blue-500 dark:text-slate-900 font.semibold py-2 px-5 rounded-full flex items-center space-x-2 transition-colors duration-300 text-sm"
                        >
                            <PlusIcon />
                            <span>Tambah Dompet</span>
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="border-b border-slate-200 dark:border-white/10">
                                <tr>
                                    <th className="p-3 text-xs font.medium uppercase text-slate-500 dark:text-[#958F99] tracking-wider">Dompet</th>
                                    <th className="p-3 text-xs font.medium uppercase text-slate-500 dark:text-[#958F99] tracking-wider">Saldo</th>
                                    <th className="p-3 text-xs font.medium uppercase text-slate-500 dark:text-[#958F99] tracking-wider text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {wallets.map(wallet => (
                                     <tr key={wallet.id} className="border-b border-slate-200 dark:border-white/10 last:border-b-0 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors duration-200">
                                        <td className="p-3 text-sm text-slate-800 dark:text-white">
                                            {wallet.name}
                                        </td>
                                        <td className="p-3 text-sm font.medium text-emerald-600 dark:text-emerald-400">{formatRupiah(wallet.balance)}</td>
                                        <td className="p-3 text-sm text-center">
                                            <div className="flex justify-center space-x-2">
                                                <button onClick={() => handleOpenEditModal(wallet)} className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-slate-700 dark:hover:text-white transition-colors duration-200"><EditIcon /></button>
                                                <button onClick={() => handleOpenDeleteModal(wallet)} className="p-2 rounded-full text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-400/10 hover:text-red-600 dark:hover:text-red-300 transition-colors duration-200"><DeleteIcon /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            {/* Modal untuk menambah/mengedit dompet */}
            <AddEditWalletModal 
                isOpen={isAddEditModalOpen}
                onClose={() => setIsAddEditModalOpen(false)}
                onSave={handleSaveWallet}
                walletToEdit={selectedWallet}
            />
            {/* Modal untuk konfirmasi hapus */}
            <ConfirmationModal 
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteWallet}
                title="Hapus Dompet"
                message={`Apakah Anda yakin ingin menghapus dompet "${walletToDelete?.name}"? Tindakan ini tidak dapat dibatalkan.`}
            />
        </main>
    );
};

export default WalletManagementPage;