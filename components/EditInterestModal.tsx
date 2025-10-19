import React, { useState, useEffect } from 'react';
import { Transaction } from '../types';
import DatePicker from './DatePicker';
import ConfirmationModal from './ConfirmationModal';
import { CloseIcon } from './icons/Icons';

interface EditInterestModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (transaction: Transaction) => void;
    onDelete: (transactionId: string) => void;
    transactionToEdit: Transaction | null;
    formatRupiah: (amount: number) => string;
}

const toYYYYMMDD = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const EditInterestModal: React.FC<EditInterestModalProps> = ({ isOpen, onClose, onSave, onDelete, transactionToEdit }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [amount, setAmount] = useState<number | null>(null);
    const [date, setDate] = useState('');
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

    const formatInputValue = (value: number | null) => {
        if (value === null) return '';
        return new Intl.NumberFormat('id-ID').format(value);
    };

    const parseInputValue = (value: string): number | null => {
        if (value.trim() === '') return null;
        const num = Number(value.replace(/\./g, ''));
        return isNaN(num) ? null : num;
    };
    
    useEffect(() => {
        if (isOpen && transactionToEdit) {
            setAmount(transactionToEdit.margin); // Interest amount is stored in margin
            setDate(toYYYYMMDD(new Date(transactionToEdit.date)));
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    }, [isOpen, transactionToEdit]);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onClose, 300);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (transactionToEdit && date && amount !== null && amount > 0) {
            const originalDate = new Date(transactionToEdit.date);
            const [year, month, day] = date.split('-').map(Number);
            const newDate = new Date(year, month - 1, day, originalDate.getHours(), originalDate.getMinutes(), originalDate.getSeconds());
            
            onSave({ 
                ...transactionToEdit, 
                date: newDate.toISOString(),
                margin: amount, // Save the new amount back to the margin field
            });
        }
    };
    
    const handleDelete = () => {
        setIsDeleteConfirmOpen(true);
    };

    const handleConfirmDelete = () => {
        if (transactionToEdit) {
            onDelete(transactionToEdit.id);
        }
        setIsDeleteConfirmOpen(false);
        handleClose();
    };

    if (!isOpen || !transactionToEdit) return null;

    return (
        <>
            <div 
                className={`fixed inset-0 z-50 flex justify-center items-center p-4 transition-opacity duration-300 ease-in-out bg-black/40 backdrop-blur-sm ${isVisible ? 'opacity-100' : 'opacity-0'}`}
                onClick={handleClose}
                role="dialog"
                aria-modal="true"
                aria-labelledby="edit-interest-modal-title"
            >
                <div 
                    className={`bg-white dark:bg-neutral-800 rounded-3xl shadow-2xl w-full max-w-sm transform transition-all duration-300 ease-in-out ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="p-6 flex justify-between items-center border-b border-slate-200 dark:border-white/10">
                        <h2 id="edit-interest-modal-title" className="text-xl font-medium text-slate-800 dark:text-white">Edit Bunga Bank</h2>
                         <button onClick={handleClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 dark:text-neutral-300 transition-colors" aria-label="Tutup">
                            <CloseIcon />
                        </button>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="p-6 space-y-5">
                             <div>
                                <label htmlFor="amountEditInterest" className="block text-sm font-medium text-slate-600 dark:text-neutral-300 mb-2">Jumlah Bunga (Rp)</label>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    id="amountEditInterest"
                                    value={formatInputValue(amount)}
                                    onChange={(e) => setAmount(parseInputValue(e.target.value))}
                                    placeholder="cth: 15.000"
                                    className="w-full bg-slate-100 dark:bg-neutral-700 border border-transparent focus:border-blue-400 focus:ring-1 focus:ring-blue-400 rounded-full px-4 py-3 text-sm text-slate-800 dark:text-white transition outline-none"
                                    required
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label htmlFor="dateInterest" className="block text-sm font-medium text-slate-600 dark:text-neutral-300 mb-2">Tanggal</label>
                                <DatePicker
                                    value={date}
                                    onChange={setDate}
                                />
                            </div>
                        </div>
                        <div className="px-6 py-4 flex justify-between items-center border-t border-slate-200 dark:border-white/10">
                            <button 
                                type="button" 
                                onClick={handleDelete}
                                className="bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20 font-semibold py-2 px-5 rounded-full text-sm transition-colors"
                            >
                                Hapus
                            </button>
                            <div className="flex space-x-3">
                                <button type="button" onClick={handleClose} className="text-blue-600 hover:bg-blue-100 dark:text-blue-200 dark:hover:bg-blue-400/10 font-semibold py-2 px-5 rounded-full text-sm transition-colors">Batal</button>
                                <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white dark:bg-blue-400 dark:hover:bg-blue-500 dark:text-slate-900 font-semibold py-2 px-5 rounded-full text-sm transition-colors">Simpan</button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
            <ConfirmationModal
                isOpen={isDeleteConfirmOpen}
                onClose={() => setIsDeleteConfirmOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Hapus Bunga Bank"
                message="Apakah Anda yakin ingin menghapus transaksi ini? Tindakan ini tidak dapat dibatalkan."
                confirmText="Ya, Hapus"
                confirmColor="bg-red-600 hover:bg-red-700"
            />
        </>
    );
};

export default EditInterestModal;