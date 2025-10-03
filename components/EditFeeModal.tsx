import React, { useState, useEffect } from 'react';
import { Transaction } from '../types';
import DatePicker from './DatePicker';

interface EditFeeModalProps {
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

const EditFeeModal: React.FC<EditFeeModalProps> = ({ isOpen, onClose, onSave, onDelete, transactionToEdit, formatRupiah }) => {
    const [date, setDate] = useState('');
    const [isVisible, setIsVisible] = useState(false);
    
    useEffect(() => {
        if (isOpen && transactionToEdit) {
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
        if (transactionToEdit && date) {
            const originalDate = new Date(transactionToEdit.date);
            const [year, month, day] = date.split('-').map(Number);
            const newDate = new Date(year, month - 1, day, originalDate.getHours(), originalDate.getMinutes(), originalDate.getSeconds());
            
            onSave({ ...transactionToEdit, date: newDate.toISOString() });
        }
    };
    
    const handleDelete = () => {
        if (transactionToEdit) {
            onDelete(transactionToEdit.id);
            handleClose();
        }
    };

    if (!isOpen || !transactionToEdit) return null;

    return (
        <div 
            className={`fixed inset-0 z-50 flex justify-center items-center p-4 transition-opacity duration-300 ease-in-out bg-black/40 backdrop-blur-sm ${isVisible ? 'opacity-100' : 'opacity-0'}`}
            onClick={handleClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-fee-modal-title"
        >
            <div 
                className={`bg-white dark:bg-neutral-800 rounded-3xl shadow-2xl w-full max-w-sm transform transition-all duration-300 ease-in-out ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6">
                    <h2 id="edit-fee-modal-title" className="text-xl font-medium text-slate-800 dark:text-white">Edit Fee Brilink</h2>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-slate-600 dark:text-neutral-300 mb-2">Jumlah Fee</label>
                            <div className="w-full bg-slate-100 dark:bg-neutral-700 rounded-full px-4 py-3 text-sm text-slate-800 dark:text-white">
                                {formatRupiah(transactionToEdit.margin)}
                            </div>
                        </div>
                         <div>
                            <label htmlFor="date" className="block text-sm font-medium text-slate-600 dark:text-neutral-300 mb-2">Tanggal</label>
                            <DatePicker
                                value={date}
                                onChange={setDate}
                            />
                        </div>
                    </div>
                    <div className="px-6 py-4 flex justify-between items-center">
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
    );
};

export default EditFeeModal;
