import React, { useState, useEffect } from 'react';
import { Wallet } from '../types';

// Properti untuk komponen AddEditWalletModal.
interface AddEditWalletModalProps {
    isOpen: boolean; // Status apakah modal terbuka atau tertutup.
    onClose: () => void; // Fungsi callback untuk menutup modal.
    onSave: (wallet: Omit<Wallet, 'id'> | Wallet) => void; // Fungsi callback untuk menyimpan data dompet.
    walletToEdit: Wallet | null; // Data dompet yang akan diedit, null jika menambah dompet baru.
}

/**
 * Komponen AddEditWalletModal adalah sebuah modal (popup) yang digunakan untuk
 * menambah dompet baru atau mengedit dompet yang sudah ada.
 */
const AddEditWalletModal: React.FC<AddEditWalletModalProps> = ({ isOpen, onClose, onSave, walletToEdit }) => {
    // Kelas CSS umum untuk input form.
    const formInputClass = "w-full bg-slate-100 dark:bg-neutral-700 border border-transparent focus:border-blue-400 focus:ring-1 focus:ring-blue-400 rounded-full px-4 py-3 text-sm text-slate-800 dark:text-white transition outline-none placeholder:text-slate-400 dark:placeholder:text-neutral-500";
    
    // Fungsi untuk memformat nilai angka untuk ditampilkan di input (misal: 1000 -> "1.000").
    const formatInputValue = (value: number) => {
        if (value === 0) return '';
        return new Intl.NumberFormat('id-ID').format(value);
    };

    // Fungsi untuk mengubah string input kembali menjadi angka (misal: "1.000" -> 1000).
    const parseInputValue = (value: string): number => {
        return Number(value.replace(/\./g, '')) || 0;
    };
    
    // Fungsi untuk mendapatkan data form awal (kosong).
    const getInitialData = () => ({
        name: '',
        balance: 0,
        icon: ''
    });

    // State untuk menyimpan data form saat ini.
    const [formData, setFormData] = useState(getInitialData());
    // State untuk mengontrol transisi animasi (fade in/out).
    const [isVisible, setIsVisible] = useState(false);

    // useEffect untuk mengatur data form dan visibilitas saat modal dibuka atau ditutup.
    useEffect(() => {
        if (isOpen) {
            // Jika dalam mode edit, isi form dengan data `walletToEdit`. Jika tidak, gunakan data awal.
            setFormData(walletToEdit || getInitialData());
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    }, [isOpen, walletToEdit]);
    
    // Handler untuk menutup modal dengan animasi.
    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Tunggu animasi selesai sebelum memanggil onClose.
    };

    // Handler untuk setiap perubahan pada input form.
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        
        let processedValue: string | number = value;

        // Proses nilai input khusus untuk field 'balance'.
        if (name === 'balance') {
            processedValue = parseInputValue(value);
        }
        
        setFormData(prev => ({
            ...prev,
            [name]: processedValue
        }));
    };

    // Handler saat form disubmit.
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Validasi sederhana: nama dompet tidak boleh kosong.
        if (!formData.name) {
            alert("Nama dompet harus diisi.");
            return;
        }
        // Panggil fungsi onSave dengan data yang sudah diproses.
        onSave(walletToEdit ? { ...walletToEdit, ...formData } : formData);
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
                    <h2 className="text-xl font.medium text-slate-800 dark:text-white">{walletToEdit ? 'Edit Dompet' : 'Tambah Dompet Baru'}</h2>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font.medium text-slate-600 dark:text-neutral-300 mb-2">Nama Dompet</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} className={formInputClass} required />
                        </div>
                        <div>
                            <label htmlFor="balance" className="block text-sm font.medium text-slate-600 dark:text-neutral-300 mb-2">Saldo Awal</label>
                            <input 
                                type="text"
                                inputMode="numeric"
                                name="balance"
                                placeholder="cth: 1.000.000"
                                value={formatInputValue(formData.balance)}
                                onChange={handleChange}
                                className={formInputClass}
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="icon" className="block text-sm font.medium text-slate-600 dark:text-neutral-300 mb-2">URL Ikon (Opsional)</label>
                            <input type="text" name="icon" value={formData.icon} onChange={handleChange} className={formInputClass} />
                        </div>
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

export default AddEditWalletModal;