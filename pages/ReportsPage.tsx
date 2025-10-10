import React, { useState, useMemo } from 'react';
import { Transaction } from '../types';
import MonthlyFinancialSummary from '../components/MonthlyFinancialSummary';
import TransactionTypeAnalysis from '../components/TransactionTypeAnalysis';
import BrilinkFeeReport from '../components/BrilinkFeeReport';
import BrilinkFeeDetailModal from '../components/BrilinkFeeDetailModal';
import MonthlyMarginHeatmapCard from '../components/MonthlyMarginHeatmapCard';

// Properti untuk komponen ReportsPage.
interface ReportsPageProps {
    transactions: Transaction[];
    formatRupiah: (amount: number) => string;
    categories: string[];
}

/**
 * Komponen ReportsPage berfungsi sebagai wadah untuk menampilkan
 * berbagai macam laporan dan analisis data transaksi, seperti ringkasan
 * bulanan, analisis jenis transaksi, dan laporan fee Brilink.
 */
const ReportsPage: React.FC<ReportsPageProps> = ({
    transactions,
    formatRupiah,
    categories,
}) => {
    // State untuk mengontrol visibilitas modal detail fee Brilink.
    const [isBrilinkDetailOpen, setIsBrilinkDetailOpen] = useState(false);

    // useMemo untuk menyaring transaksi yang akan digunakan dalam laporan
    // (mengabaikan transfer internal).
    const reportTransactions = useMemo(() => 
        transactions.filter(t => !t.isInternalTransfer), 
        [transactions]
    );
    
    // useMemo untuk menyaring dan mengurutkan transaksi fee Brilink secara spesifik.
    const feeTransactions = useMemo(() => {
        return reportTransactions
            .filter(t => t.description === 'Fee Brilink')
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [reportTransactions]);


    return (
        <>
            {/* Modal untuk menampilkan detail semua transaksi fee Brilink */}
            <BrilinkFeeDetailModal
                isOpen={isBrilinkDetailOpen}
                onClose={() => setIsBrilinkDetailOpen(false)}
                feeTransactions={feeTransactions}
                formatRupiah={formatRupiah}
            />
            <main className="p-4 sm:p-6 flex-1">
                <div className="mx-auto max-w-7xl">
                    <div className="space-y-6">
                        {/* Monthly Margin Heatmap Card */}
                        <MonthlyMarginHeatmapCard
                            transactions={reportTransactions}
                            formatRupiah={formatRupiah}
                        />

                        {/* Grid untuk laporan tingkat atas */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <TransactionTypeAnalysis 
                                transactions={reportTransactions}
                                categories={categories}
                            />
                            <BrilinkFeeReport
                                feeTransactions={feeTransactions}
                                formatRupiah={formatRupiah}
                                onOpenDetail={() => setIsBrilinkDetailOpen(true)}
                            />
                        </div>
                        {/* Laporan ringkasan keuangan bulanan */}
                        <MonthlyFinancialSummary 
                            transactions={reportTransactions}
                            formatRupiah={formatRupiah}
                        />
                    </div>
                </div>
            </main>
        </>
    );
};

export default ReportsPage;