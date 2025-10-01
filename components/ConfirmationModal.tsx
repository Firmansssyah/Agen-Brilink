

import React, { useState, useEffect } from 'react';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    confirmColor?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title, 
    message,
    confirmText = 'Konfirmasi',
    confirmColor = 'bg-red-600 hover:bg-red-700'
}) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    }, [isOpen]);
    
    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onClose, 300);
    };

    const handleConfirm = () => {
        onConfirm();
    };

    if (!isOpen) return null;

    return (
        <div 
            className={`fixed inset-0 z-50 flex justify-center items-center p-4 transition-opacity duration-300 ease-in-out ${isVisible ? 'opacity-100' : 'opacity-0'}`}
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)'}}
            onClick={handleClose}
        >
            <div 
                className={`bg-white dark:bg-[#2F2D35] rounded-3xl shadow-2xl w-full max-w-md transform transition-all duration-300 ease-in-out ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6">
                    <h2 className="text-xl font-medium text-slate-800 dark:text-white">{title}</h2>
                </div>
                <div className="px-6 pb-6">
                    <p className="text-slate-600 dark:text-[#CAC4D0] text-sm">{message}</p>
                </div>
                <div className="px-6 py-4 flex justify-end space-x-3">
                    <button type="button" onClick={handleClose} className="text-indigo-600 hover:bg-indigo-100 dark:text-indigo-200 dark:hover:bg-indigo-400/10 font-semibold py-2 px-5 rounded-full text-sm transition-colors">Batal</button>
                    <button type="button" onClick={handleConfirm} className={`${confirmColor} text-white font-semibold py-2 px-5 rounded-full text-sm transition-colors`}>{confirmText}</button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;