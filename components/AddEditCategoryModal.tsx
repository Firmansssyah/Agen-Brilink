import React, { useState, useEffect } from 'react';

// Properti untuk komponen AddEditCategoryModal.
interface AddEditCategoryModalProps {
    isOpen: boolean; // Status apakah modal terbuka atau tertutup.
    onClose: () => void; // Fungsi callback untuk menutup modal.
    onSave: (categoryName: string) => void; // Fungsi callback untuk menyimpan nama kategori.
    categoryToEdit?: string; // Nama kategori yang akan diedit, undefined jika menambah baru.
}

/**
 * Komponen AddEditCategoryModal adalah sebuah modal (popup) yang digunakan untuk
 * menambah kategori transaksi baru atau mengedit kategori yang sudah ada.
 */
const AddEditCategoryModal: React.FC<AddEditCategoryModalProps> = ({ isOpen, onClose, onSave, categoryToEdit }) => {
    // State untuk menyimpan nama kategori yang sedang diinput.
    const [name, setName] = useState('');
    // State untuk mengontrol transisi animasi (fade in/out).
    const [isVisible, setIsVisible] = useState(false);

    // useEffect untuk mengatur state saat modal dibuka.
    useEffect(() => {
        if (isOpen) {
            // Jika dalam mode edit, isi input dengan nama kategori yang ada. Jika tidak, kosongkan.
            setName(categoryToEdit || '');
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    }, [isOpen, categoryToEdit]);
    
    // Handler untuk menutup modal dengan animasi.
    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Tunggu animasi selesai sebelum memanggil onClose.
    };

    // Handler saat form disubmit.
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Validasi sederhana: pastikan nama tidak kosong setelah di-trim.
        if (name.trim()) {
            onSave(name.trim());
        }
    };

    // Jangan render apapun jika modal tidak terbuka.
    if (!isOpen) return null;

    return (
        // Latar belakang modal dengan efek blur.
        <div 
            className={`fixed inset-0 z-50 flex justify-center items-center p-4 transition-opacity duration-300 ease-in-out bg-black/40 backdrop-blur-sm ${isVisible ? 'opacity-100' : 'opacity-0'}`}
            onClick={handleClose}
        >
            {/* Konten modal */}
            <div 
                className={`bg-white dark:bg-neutral-800 rounded-3xl shadow-2xl w-full max-w-md transform transition-all duration-300 ease-in-out ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
                onClick={(e) => e.stopPropagation()} // Mencegah modal tertutup saat kontennya diklik.
            >
                <div className="p-6">
                    <h2 className="text-xl font.medium text-slate-800 dark:text-white">{categoryToEdit ? 'Edit Kategori' : 'Tambah Kategori Baru'}</h2>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <label htmlFor="name" className="block text-sm font.medium text-slate-600 dark:text-neutral-300 mb-2">Nama Kategori</label>
                        <input type="text" name="name" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-slate-100 dark:bg-neutral-700 border border-transparent focus:border-blue-400 focus:ring-1 focus:ring-blue-400 rounded-full px-4 py-3 text-sm text-slate-800 dark:text-white transition outline-none" required autoFocus />
                    </div>
                    <div className="px-6 py-4 flex justify-end space-x-3">
                        <button type="button" onClick={handleClose} className="text-blue-600 hover:bg-blue-100 dark:text-blue-200 dark:hover:bg-blue-400/10 font.semibold py-2 px-5 rounded-full text-sm transition-colors">Batal</button>
                        <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white dark:bg-blue-400 dark:hover:bg-blue-500 dark:text-slate-900 font.semibold py-2 px-5 rounded-full text-sm transition-colors">Simpan</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddEditCategoryModal;