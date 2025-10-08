import React, { useState, useEffect } from 'react';

/**
 * Komponen ClockCard menampilkan jam dan tanggal saat ini yang diperbarui secara real-time.
 * Didesain untuk ditempatkan di sidebar untuk memberikan informasi waktu kepada pengguna.
 */
const ClockCard: React.FC = () => {
    // State untuk menyimpan objek Date saat ini.
    const [currentDate, setCurrentDate] = useState(new Date());

    useEffect(() => {
        // Memperbarui waktu setiap detik untuk jam real-time.
        const timerId = setInterval(() => {
            setCurrentDate(new Date());
        }, 1000);

        // Membersihkan interval saat komponen di-unmount untuk mencegah memory leak.
        return () => {
            clearInterval(timerId);
        };
    }, []);

    // Opsi format untuk tanggal (nama hari, tanggal, dan bulan).
    const dateOptions: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
    };

    // Memformat waktu dan tanggal.
    const hours = String(currentDate.getHours()).padStart(2, '0');
    const minutes = String(currentDate.getMinutes()).padStart(2, '0');
    const formattedDate = new Intl.DateTimeFormat('id-ID', dateOptions).format(currentDate);

    return (
        // Layout baru: tanpa background, teks di tengah, dan tipografi yang lebih bersih.
        <div className="p-4 text-center">
            <p className="text-xl font-semibold text-slate-800 dark:text-white">
                {hours}:{minutes}
            </p>
            <p className="text-sm text-slate-500 dark:text-neutral-400 mt-1">
                {formattedDate}
            </p>
        </div>
    );
};

export default ClockCard;