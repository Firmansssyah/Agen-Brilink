import React, { useState, useEffect, useCallback } from 'react';
import { useToastContext, ToastMessage, ToastType } from '../contexts/ToastContext';
import { CheckIcon, InfoIcon, CloseIcon, ErrorIcon } from './icons/Icons';

const InlineNotification: React.FC = () => {
    const { toasts, removeToast } = useToastContext();
    // Toast yang sedang ditampilkan dan dianimasikan oleh komponen ini.
    const [currentToast, setCurrentToast] = useState<ToastMessage | null>(null);
    const [isExiting, setIsExiting] = useState(false);

    // Effect ini bertanggung jawab untuk mengambil notifikasi baru dari antrean global.
    useEffect(() => {
        // Jika komponen sedang "idle" (tidak menampilkan notifikasi) dan ada notifikasi yang menunggu di antrean...
        if (!currentToast && toasts.length > 0) {
            // ...ambil notifikasi terbaru dari antrean untuk ditampilkan.
            const toastToDisplay = toasts[0];
            setCurrentToast(toastToDisplay);
            setIsExiting(false); // Pastikan animasi masuk yang dijalankan.
        }
    }, [toasts, currentToast]); // Dijalankan kembali saat antrean berubah atau saat komponen menjadi "idle".

    // Callback ini menangani seluruh proses penutupan notifikasi yang sedang ditampilkan.
    const handleDismiss = useCallback(() => {
        if (!currentToast) return;

        setIsExiting(true); // Memulai animasi keluar.

        // Setelah animasi keluar selesai (300ms)...
        setTimeout(() => {
            // ...hapus notifikasi dari antrean global.
            removeToast(currentToast.id);
            // Tandai komponen ini sebagai "idle" agar siap mengambil notifikasi berikutnya.
            setCurrentToast(null);
        }, 300); // Durasi harus cocok dengan animasi fade-out di CSS.
    }, [currentToast, removeToast]);

    // Effect ini mengatur timer untuk menutup notifikasi secara otomatis.
    useEffect(() => {
        if (currentToast) {
            const timer = setTimeout(() => {
                handleDismiss();
            }, 4000); // Tutup otomatis setelah 4 detik.

            // Bersihkan timer jika komponen di-unmount atau notifikasi berubah.
            return () => clearTimeout(timer);
        }
    }, [currentToast, handleDismiss]);

    // Jika tidak ada notifikasi untuk ditampilkan, jangan render apa pun.
    if (!currentToast) {
        return null;
    }
    
    // Bagian sisa dari komponen ini adalah untuk me-render UI notifikasi.
    const { message, type } = currentToast;

    const iconMap: Record<ToastType, React.ReactNode> = {
        success: <CheckIcon className="h-5 w-5 text-white" />,
        error: <ErrorIcon className="h-5 w-5 text-white" />,
        info: <InfoIcon className="h-5 w-5 text-white" />,
        destructive: <CheckIcon className="h-5 w-5 text-white" />,
    };
    
    const styleMap: Record<ToastType, string> = {
        success: 'bg-emerald-500 dark:bg-emerald-600',
        error: 'bg-red-500 dark:bg-red-600',
        info: 'bg-sky-500 dark:bg-sky-600',
        destructive: 'bg-red-500 dark:bg-red-600',
    };

    return (
        <div className={`w-full p-3 rounded-xl border border-transparent flex items-center justify-between gap-4 text-white ${styleMap[type]} ${isExiting ? 'animate-fade-out-up' : 'animate-fade-in'}`}>
            <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                    {iconMap[type]}
                </div>
                <p className="text-sm font-semibold">{message}</p>
            </div>
            <button
                onClick={handleDismiss}
                className="p-1 rounded-full text-white/80 hover:text-white hover:bg-black/20"
                aria-label="Tutup notifikasi"
            >
                <CloseIcon className="h-5 w-5" />
            </button>
        </div>
    );
};

export default InlineNotification;