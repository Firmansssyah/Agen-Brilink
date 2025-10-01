import React, { useState, useEffect } from 'react';

interface AddFeeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (amount: number) => void;
}

const AddFeeModal: React.FC<AddFeeModalProps> = ({ isOpen, onClose, onSave }) => {
    const [amount, setAmount] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    
    const formatInputValue = (value: number) => {
        if (value === 0) return '';
        return new Intl.NumberFormat('id-ID').format(value);
    };

    const parseInputValue = (value: string): number => {
        return Number(value.replace(/\./g, '')) || 0;
    };

    useEffect(() => {
        if (isOpen) {
            setAmount(0);
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    }, [isOpen]);
    
    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onClose, 300);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (amount > 0) {
            onSave(amount);
        }
    };
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const parsedValue = parseInputValue(e.target.value);
        setAmount(parsedValue);
    }

    if (!isOpen) return null;

    return (
        <div 
            className={`fixed inset-0 z-50 flex justify-center items-center p-4 transition-opacity duration-300 ease-in-out ${isVisible ? 'opacity-100' : 'opacity-0'}`}
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)'}}
            onClick={handleClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-fee-modal-title"
        >
            <div 
                className={`bg-white dark:bg-[#2F2D35] rounded-3xl shadow-2xl w-full max-w-sm transform transition-all duration-300 ease-in-out ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6">
                    <h2 id="add-fee-modal-title" className="text-xl font-medium text-slate-800 dark:text-white">Tambah Fee Brilink</h2>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <label htmlFor="amount" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">Jumlah Fee</label>
                        <input 
                            type="text" 
                            name="amount" 
                            id="amount"
                            inputMode="numeric"
                            value={formatInputValue(amount)} 
                            onChange={handleChange} 
                            className="w-full bg-slate-100 dark:bg-[#3C3A42] border border-transparent focus:border-blue-400 focus:ring-1 focus:ring-blue-400 rounded-full px-4 py-3 text-sm text-slate-800 dark:text-white transition outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500" 
                            required 
                            autoFocus 
                            placeholder="cth: 150.000"
                        />
                    </div>
                    <div className="px-6 py-4 flex justify-end space-x-3">
                        <button type="button" onClick={handleClose} className="text-blue-600 hover:bg-blue-100 dark:text-blue-200 dark:hover:bg-blue-400/10 font-semibold py-2 px-5 rounded-full text-sm transition-colors">Batal</button>
                        <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white dark:bg-blue-400 dark:hover:bg-blue-500 dark:text-slate-900 font-semibold py-2 px-5 rounded-full text-sm transition-colors">Simpan</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddFeeModal;