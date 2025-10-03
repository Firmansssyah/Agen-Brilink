import React from 'react';

// Interface untuk properti komponen SummaryCard.
interface SummaryCardProps {
    title: string;      // Judul kartu.
    value: string;      // Nilai yang ditampilkan (sudah diformat).
    icon: React.ReactNode; // Ikon yang akan ditampilkan di kartu.
}

/**
 * Komponen SummaryCard adalah kartu UI generik untuk menampilkan
 * data ringkasan seperti total aset atau margin, lengkap dengan judul, nilai, dan ikon.
 * (Saat ini tidak digunakan, digantikan oleh WalletsSummaryCard yang lebih spesifik).
 */
const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, icon }) => (
    <div className="bg-slate-800 p-4 rounded-3xl flex items-center space-x-4">
        <div className="bg-blue-400/10 text-blue-200 p-3 rounded-full">{icon}</div>
        <div>
            <p className="text-sm text-[#CAC4D0]">{title}</p>
            <p className="text-xl font.bold text-white">{value}</p>
        </div>
    </div>
);

export default SummaryCard;