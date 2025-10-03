import React, { useMemo, useState } from 'react';
import { Transaction, TransactionType } from '../types';

// Interface untuk properti komponen TransactionHeatmap.
interface TransactionHeatmapProps {
    transactions: Transaction[]; // Daftar semua transaksi.
    formatRupiah: (amount: number) => string; // Fungsi untuk memformat Rupiah (tidak terpakai saat ini).
    onDayClick: (date: string) => void; // Callback saat sebuah hari di heatmap diklik.
}

// Interface untuk ringkasan data transaksi harian.
interface DailySummary {
    count: number;
    totalIn: number;
    totalOut: number;
    totalMargin: number;
}

/**
 * Fungsi utilitas untuk memformat angka menjadi format Rupiah yang ringkas (e.g., 'Rp5rb', 'Rp1,2jt').
 * @param amount - Angka yang akan diformat.
 * @returns String Rupiah yang ringkas.
 */
const formatCompactRupiah = (amount: number): string => {
    if (amount === 0) return 'Rp0';
    const absAmount = Math.abs(amount);
    const sign = amount < 0 ? '-' : '';
    
    if (absAmount >= 1_000_000) {
        return `${sign}Rp${(absAmount / 1_000_000).toFixed(1).replace('.', ',')}jt`;
    }
    if (absAmount >= 1_000) {
        return `${sign}Rp${Math.floor(absAmount / 1_000)}rb`;
    }
    return `${sign}Rp${absAmount}`;
};

/**
 * Komponen TransactionHeatmap menampilkan kalender bulanan di mana setiap hari
 * diwarnai berdasarkan jumlah transaksi pada hari tersebut. Ini memberikan
 * visualisasi cepat tentang hari-hari tersibuk.
 */
const TransactionHeatmap: React.FC<TransactionHeatmapProps> = ({ transactions, onDayClick }) => {
    // State untuk menyimpan tanggal (bulan dan tahun) yang sedang ditampilkan.
    const [currentDate, setCurrentDate] = useState(new Date());

    // useMemo untuk mengagregasi data transaksi per hari. Dihitung ulang hanya jika transaksi berubah.
    const dailyData = useMemo(() => {
        const map = new Map<string, DailySummary>();
        transactions
            .filter(t => t.description !== 'Fee Brilink') // Menyaring transaksi fee agar tidak masuk hitungan.
            .forEach(t => {
                const localDate = new Date(t.date);
                // Menggunakan tanggal lokal untuk menghindari masalah timezone.
                const dateStr = `${localDate.getFullYear()}-${String(localDate.getMonth() + 1).padStart(2, '0')}-${String(localDate.getDate()).padStart(2, '0')}`;
                
                const entry = map.get(dateStr) || { count: 0, totalIn: 0, totalOut: 0, totalMargin: 0 };
                const newEntry = {
                    ...entry,
                    count: entry.count + 1,
                    totalMargin: entry.totalMargin + t.margin,
                    totalIn: entry.totalIn + (t.type === TransactionType.IN ? t.amount : 0),
                    totalOut: entry.totalOut + (t.type === TransactionType.OUT ? t.amount : 0),
                };
                map.set(dateStr, newEntry);
            });
        return map;
    }, [transactions]);

    /**
     * Fungsi untuk menghasilkan array hari untuk bulan yang sedang ditampilkan,
     * termasuk padding untuk hari kosong di awal bulan.
     * @returns Array berisi objek Date atau null.
     */
    const getMonthData = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1).getDay(); // Hari pertama dalam minggu (0=Minggu).
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        const days = [];
        for (let i = 0; i < firstDay; i++) {
            days.push(null); // Padding untuk awal bulan.
        }
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(new Date(year, month, i));
        }
        return days;
    };

    const calendarDays = getMonthData();
    const weekDays = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

    /**
     * Menentukan warna latar belakang sel hari berdasarkan jumlah transaksi.
     * @param count - Jumlah transaksi pada hari tersebut.
     * @returns String kelas Tailwind CSS untuk warna latar.
     */
    const getColorIntensity = (count: number) => {
        if (count === 0) return 'bg-slate-200 hover:bg-slate-300 dark:bg-slate-700/60 dark:hover:bg-slate-700';
        if (count <= 2) return 'bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800';
        if (count <= 5) return 'bg-blue-200 hover:bg-blue-300 dark:bg-blue-800 dark:hover:bg-blue-700';
        if (count <= 8) return 'bg-blue-300 hover:bg-blue-400 dark:bg-blue-700 dark:hover:bg-blue-600';
        return 'bg-blue-400 hover:bg-blue-500 dark:bg-blue-600 dark:hover:bg-blue-500';
    };

    /**
     * Handler untuk mengubah bulan yang ditampilkan (maju atau mundur).
     * @param offset - Jumlah bulan untuk digeser (-1 untuk mundur, 1 untuk maju).
     */
    const changeMonth = (offset: number) => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(prev.getMonth() + offset);
            return newDate;
        });
    };

    return (
        <div className="bg-white dark:bg-slate-800 p-4 rounded-3xl shadow-lg shadow-slate-200/50 dark:shadow-none">
            {/* Header dengan judul dan kontrol navigasi bulan */}
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font.medium text-slate-800 dark:text-white">Transaksi Harian</h3>
                <div className="flex items-center space-x-2">
                    <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
                        &lt;
                    </button>
                    <span className="font.medium text-center w-32">
                        {currentDate.toLocaleString('id-ID', { month: 'long', year: 'numeric' })}
                    </span>
                    <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
                        &gt;
                    </button>
                </div>
            </div>

            {/* Grid untuk kalender */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs text-slate-500 dark:text-slate-400 mb-2">
                {weekDays.map(day => <div key={day}>{day}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, index) => {
                    if (!day) return <div key={`empty-${index}`} />;
                    
                    const dateStr = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
                    const data = dailyData.get(dateStr);
                    const count = data?.count || 0;
                    const isClickable = count > 0;
                    // Menggunakan <button> jika ada transaksi, <div> jika tidak, untuk aksesibilitas.
                    const DayComponent = isClickable ? 'button' : 'div';
                    
                    return (
                        <DayComponent 
                            key={dateStr} 
                            onClick={isClickable ? () => onDayClick(dateStr) : undefined}
                            className={`aspect-square w-full rounded-md flex flex-col justify-between p-1 text-xs transition-colors duration-200 text-left ${getColorIntensity(count)} ${isClickable ? 'cursor-pointer' : ''}`}
                            aria-label={isClickable ? `Lihat transaksi untuk ${day.toLocaleDateString('id-ID')}` : undefined}
                        >
                           <div className="flex justify-between items-start w-full">
                                <span className="font.medium text-slate-700 dark:text-slate-300">{day.getDate()}</span>
                                {data && data.count > 0 && (
                                    <span className="bg-blue-300 text-blue-800 dark:bg-blue-400/50 dark:text-blue-200 text-[10px] font.bold px-1.5 py-0.5 rounded-full leading-none">
                                        {data.count}
                                    </span>
                                )}
                            </div>
                            <div className="text-center">
                                {data && data.totalMargin > 0 && (
                                     <span className="font.bold text-emerald-600 dark:text-emerald-300 text-[10px] leading-tight">
                                         {formatCompactRupiah(data.totalMargin)}
                                     </span>
                                )}
                            </div>
                        </DayComponent>
                    );
                })}
            </div>
        </div>
    );
};

export default TransactionHeatmap;