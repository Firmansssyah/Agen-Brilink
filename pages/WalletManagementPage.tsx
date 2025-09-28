
import React, { useState } from 'react';
import { Wallet } from '../types';
import { EditIcon, DeleteIcon, PlusIcon } from '../components/icons/Icons';
import AddEditWalletModal from '../components/AddEditWalletModal';
import ConfirmationModal from '../components/ConfirmationModal';

interface WalletManagementPageProps {
    wallets: Wallet[];
    setWallets: React.Dispatch<React.SetStateAction<Wallet[]>>;
    formatRupiah: (amount: number) => string;
}

const WalletManagementPage: React.FC<WalletManagementPageProps> = ({ wallets, setWallets, formatRupiah }) => {
    const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);
    const [walletToDelete, setWalletToDelete] = useState<Wallet | null>(null);
    
    const handleOpenAddModal = () => {
        setSelectedWallet(null);
        setIsAddEditModalOpen(true);
    };

    const handleOpenEditModal = (wallet: Wallet) => {
        setSelectedWallet(wallet);
        setIsAddEditModalOpen(true);
    };

    const handleOpenDeleteModal = (wallet: Wallet) => {
        setWalletToDelete(wallet);
        setIsDeleteModalOpen(true);
    }

    const handleSaveWallet = (walletData: Omit<Wallet, 'id'> | Wallet) => {
        if ('id' in walletData) {
            // Editing existing wallet
            setWallets(prev => prev.map(w => w.id === walletData.id ? walletData : w));
        } else {
            // Adding new wallet
            const newWallet: Wallet = {
                ...walletData,
                id: `W${Date.now()}`
            };
            setWallets(prev => [...prev, newWallet]);
        }
        setIsAddEditModalOpen(false);
    };

    const handleDeleteWallet = () => {
        if (walletToDelete) {
            setWallets(prev => prev.filter(w => w.id !== walletToDelete.id));
            setIsDeleteModalOpen(false);
            setWalletToDelete(null);
        }
    };

    return (
        <main className="p-4 sm:p-6 flex-1">
            <div className="mx-auto max-w-4xl">
                <div className="bg-[#2A282F] p-4 rounded-3xl">
                    <div className="flex justify-between items-center mb-4 px-2">
                        <h3 className="text-lg font-medium text-white">Daftar Dompet</h3>
                        <button 
                            onClick={handleOpenAddModal}
                            className="bg-indigo-400 hover:bg-indigo-500 text-slate-900 font-semibold py-2 px-5 rounded-full flex items-center space-x-2 transition-colors duration-300 text-sm"
                        >
                            <PlusIcon />
                            <span>Tambah Dompet</span>
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="border-b border-white/10">
                                <tr>
                                    <th className="p-3 text-xs font-medium uppercase text-[#958F99] tracking-wider">Dompet</th>
                                    <th className="p-3 text-xs font-medium uppercase text-[#958F99] tracking-wider">Saldo</th>
                                    <th className="p-3 text-xs font-medium uppercase text-[#958F99] tracking-wider text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {wallets.map(wallet => (
                                     <tr key={wallet.id} className="border-b border-white/10 last:border-b-0 hover:bg-white/5 transition-colors duration-200">
                                        <td className="p-3 text-sm text-white">
                                            {wallet.name}
                                        </td>
                                        <td className="p-3 text-sm font-medium text-emerald-400">{formatRupiah(wallet.balance)}</td>
                                        <td className="p-3 text-sm text-center">
                                            <div className="flex justify-center space-x-2">
                                                <button onClick={() => handleOpenEditModal(wallet)} className="p-2 rounded-full text-slate-400 hover:bg-white/10 hover:text-white transition-colors duration-200"><EditIcon /></button>
                                                <button onClick={() => handleOpenDeleteModal(wallet)} className="p-2 rounded-full text-red-400 hover:bg-red-400/10 hover:text-red-300 transition-colors duration-200"><DeleteIcon /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <AddEditWalletModal 
                isOpen={isAddEditModalOpen}
                onClose={() => setIsAddEditModalOpen(false)}
                onSave={handleSaveWallet}
                walletToEdit={selectedWallet}
            />
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
