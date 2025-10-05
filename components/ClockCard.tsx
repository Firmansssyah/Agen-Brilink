import React, { useState, useEffect } from 'react';

/**
 * Komponen ClockCard menampilkan jam dan tanggal saat ini yang diperbarui secara real-time.
 * Didesain untuk ditempatkan di sidebar untuk memberikan informasi waktu kepada pengguna.
 */
const ClockCard: React.FC = () => {
    // State untuk menyimpan objek Date saat ini.
    const [currentDate, setCurrentDate] = useState(new Date());

    useEffect(() => {
        // Memperbarui waktu setiap menit untuk menghindari update yang tidak perlu per detik.
        const timerId = setInterval(() => {
            setCurrentDate(new Date());
        }, 60000); // 60000ms = 1 menit

        // Membersihkan interval saat komponen di-unmount untuk mencegah memory leak.
        return () => {
            clearInterval(timerId);
        };
    }, []);

    // Opsi format untuk waktu (format 12 jam, tanpa detik).
    const timeOptions: Intl.DateTimeFormatOptions = {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
    };

    // Opsi format untuk tanggal (nama hari, tanggal, dan bulan).
    const dateOptions: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
    };

    // Memformat waktu dan tanggal menggunakan lokal Bahasa Indonesia.
    const formattedTime = new Intl.DateTimeFormat('id-ID', timeOptions).format(currentDate);
    const formattedDate = new Intl.DateTimeFormat('id-ID', dateOptions).format(currentDate);

    return (
        <div className="bg-slate-100 dark:bg-neutral-700/50 p-4 rounded-xl text-center">
            <p className="text-3xl font-bold text-slate-800 dark:text-white tracking-wider">
                {formattedTime}
            </p>
            <p className="text-sm text-slate-500 dark:text-neutral-400 mt-1">
                {formattedDate}
            </p>
        </div>
    );
};

export default ClockCard;
