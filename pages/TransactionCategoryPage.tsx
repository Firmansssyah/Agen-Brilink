import React, { useState } from 'react';
import { EditIcon, DeleteIcon, PlusIcon } from '../components/icons/Icons';
import AddEditCategoryModal from '../components/AddEditCategoryModal';
import ConfirmationModal from '../components/ConfirmationModal';

interface TransactionCategoryPageProps {
    categories: string[];
    onSaveCategories: (newCategories: string[]) => Promise<void>;
}

const TransactionCategoryPage: React.FC<TransactionCategoryPageProps> = ({ categories, onSaveCategories }) => {
    const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<{name: string, index: number} | null>(null);
    const [categoryToDelete, setCategoryToDelete] = useState<{name: string, index: number} | null>(null);

    const handleOpenAddModal = () => {
        setSelectedCategory(null);
        setIsAddEditModalOpen(true);
    };

    const handleOpenEditModal = (category: string, index: number) => {
        setSelectedCategory({ name: category, index: index });
        setIsAddEditModalOpen(true);
    };

    const handleOpenDeleteModal = (category: string, index: number) => {
        setCategoryToDelete({ name: category, index: index });
        setIsDeleteModalOpen(true);
    };

    const handleSaveCategory = async (categoryName: string) => {
        let newCategories;
        if (selectedCategory) {
            // Editing
            newCategories = categories.map((cat, i) => i === selectedCategory.index ? categoryName : cat);
        } else {
            // Adding
            newCategories = [...categories, categoryName];
        }
        await onSaveCategories(newCategories);
        setIsAddEditModalOpen(false);
    };

    const handleDeleteCategory = async () => {
        if (categoryToDelete) {
            const newCategories = categories.filter((_, i) => i !== categoryToDelete.index);
            await onSaveCategories(newCategories);
            setIsDeleteModalOpen(false);
            setCategoryToDelete(null);
        }
    };
    
    return (
         <main className="p-4 sm:p-6 flex-1">
            <div className="mx-auto max-w-2xl">
                <div className="bg-white dark:bg-[#2A282F] p-4 rounded-3xl shadow-lg shadow-slate-200/50 dark:shadow-none">
                    <div className="flex justify-between items-center mb-4 px-2">
                        <h3 className="text-lg font-medium text-slate-800 dark:text-white">Jenis Transaksi</h3>
                        <button 
                            onClick={handleOpenAddModal}
                            className="bg-blue-500 hover:bg-blue-600 text-white dark:bg-blue-400 dark:hover:bg-blue-500 dark:text-slate-900 font-semibold py-2 px-5 rounded-full flex items-center space-x-2 transition-colors duration-300 text-sm"
                        >
                            <PlusIcon />
                            <span>Tambah Kategori</span>
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="border-b border-slate-200 dark:border-white/10">
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
                                                 <button onClick={() => handleOpenEditModal(category, index)} className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-slate-700 dark:hover:text-white transition-colors duration-200"><EditIcon /></button>
                                                <button onClick={() => handleOpenDeleteModal(category, index)} className="p-2 rounded-full text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-400/10 hover:text-red-600 dark:hover:text-red-300 transition-colors duration-200"><DeleteIcon /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <AddEditCategoryModal 
                isOpen={isAddEditModalOpen}
                onClose={() => setIsAddEditModalOpen(false)}
                onSave={handleSaveCategory}
                categoryToEdit={selectedCategory?.name}
            />
            <ConfirmationModal 
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteCategory}
                title="Hapus Kategori"
                message={`Apakah Anda yakin ingin menghapus kategori "${categoryToDelete?.name}"?`}
            />
        </main>
    );
};

export default TransactionCategoryPage;