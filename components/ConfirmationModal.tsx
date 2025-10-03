import React, { useState, useEffect } from 'react';

// Properti untuk komponen ConfirmationModal.
interface ConfirmationModalProps {
    isOpen: boolean; // Status apakah modal terbuka.
    onClose: () => void; // Callback untuk menutup modal.
    onConfirm: () => void; // Callback saat pengguna menekan tombol konfirmasi.
    title: string; // Judul modal.
    message: string; // Pesan atau pertanyaan konfirmasi.
    confirmText?: string; // Teks untuk tombol konfirmasi (default: 'Konfirmasi').
    confirmColor?: string; // Kelas warna Tailwind untuk tombol konfirmasi (default: merah).
}

/**
 * Komponen ConfirmationModal adalah modal generik yang digunakan untuk meminta
 * konfirmasi dari pengguna sebelum melakukan aksi yang berpotensi merusak,
 * seperti penghapusan data.
 */
const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title, 
    message,
    confirmText = 'Konfirmasi',
    confirmColor = 'bg-red-600 hover:bg-red-700'
}) => {
    // State untuk mengontrol transisi animasi.
    const [isVisible, setIsVisible] = useState(false);

    // useEffect untuk memicu animasi saat modal dibuka atau ditutup.
    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    }, [isOpen]);
    
    // Handler untuk menutup modal dengan animasi.
    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Tunggu animasi selesai.
    };

    // Handler saat tombol konfirmasi ditekan.
    const handleConfirm = () => {
        onConfirm();
    };

    if (!isOpen) return null;

    return (
        <div 
            className={`fixed inset-0 z-50 flex justify-center items-center p-4 transition-opacity duration-300 ease-in-out bg-black/40 backdrop-blur-sm ${isVisible ? 'opacity-100' : 'opacity-0'}`}
            onClick={handleClose}
        >
            <div 
                className={`bg-white dark:bg-neutral-800 rounded-3xl shadow-2xl w-full max-w-md transform transition-all duration-300 ease-in-out ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6">
                    <h2 className="text-xl font.medium text-slate-800 dark:text-white">{title}</h2>
                </div>
                <div className="px-6 pb-6">
                    <p className="text-slate-600 dark:text-[#CAC4D0] text-sm">{message}</p>
                </div>
                <div className="px-6 py-4 flex justify-end space-x-3">
                    <button type="button" onClick={handleClose} className="text-blue-600 hover:bg-blue-100 dark:text-blue-200 dark:hover:bg-blue-400/10 font.semibold py-2 px-5 rounded-full text-sm transition-colors">Batal</button>
                    <button type="button" onClick={handleConfirm} className={`${confirmColor} text-white font.semibold py-2 px-5 rounded-full text-sm transition-colors`}>{confirmText}</button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;