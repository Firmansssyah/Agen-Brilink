import React from 'react';
import { Font } from '../types';

interface SettingsPageProps {
    appName: string;
    onAppNameChange: (newName: string) => void;
    font: Font;
    onFontChange: (newFont: Font) => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ appName, onAppNameChange, font, onFontChange }) => {
    const formInputClass = "w-full bg-slate-100 dark:bg-neutral-700 border border-transparent focus:border-blue-400 focus:ring-1 focus:ring-blue-400 rounded-full px-4 py-3 text-sm text-slate-800 dark:text-white transition outline-none placeholder:text-slate-400 dark:placeholder:text-neutral-500";
    
    const fonts: { id: Font, name: string, className: string }[] = [
        { id: 'font-sans', name: 'Mona Sans', className: 'font-sans' },
        { id: 'font-inter', name: 'Inter', className: 'font-inter' },
        { id: 'font-poppins', name: 'Poppins', className: 'font-poppins' },
        { id: 'font-roboto-flex', name: 'Roboto Flex', className: 'font-roboto-flex' },
    ];
    
    const ExplanationCard: React.FC<{ title: string; description: string; agentWalletEffect: string; cashWalletEffect: string; result: string; }> = ({ title, description, agentWalletEffect, cashWalletEffect, result }) => (
        <div>
            <h4 className="font-semibold text-slate-700 dark:text-neutral-200">{title}</h4>
            <p className="text-sm text-slate-500 dark:text-neutral-400 mt-1">
                {description}
            </p>
            <div className="mt-2 text-sm space-y-1 pl-4 border-l-2 border-slate-200 dark:border-neutral-600">
                <p>Saldo <span className="font-medium">Dompet Agen</span> {agentWalletEffect.startsWith('-') ? 'berkurang' : 'bertambah'}.</p>
                <p className={`font-mono ${agentWalletEffect.startsWith('-') ? 'text-red-500' : 'text-emerald-500'}`}>{agentWalletEffect}</p>
                <p>Uang di <span className="font-medium">Kas Tunai</span> Anda {cashWalletEffect.startsWith('-') ? 'berkurang' : 'bertambah'}.</p>
                <p className={`font-mono ${cashWalletEffect.startsWith('-') ? 'text-red-500' : 'text-emerald-500'}`}>{cashWalletEffect}</p>
                <p className="font-medium text-sky-500 pt-1">Hasil: {result}</p>
            </div>
        </div>
    );

    return (
        <main className="p-4 sm:p-6 flex-1">
            <div className="mx-auto max-w-2xl">
                <div className="space-y-6">
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white px-2">Pengaturan Aplikasi</h1>
                    
                    <div className="bg-white dark:bg-neutral-800 p-6 rounded-3xl shadow-lg shadow-slate-200/50 dark:shadow-none">
                        <h3 className="text-lg font-medium text-slate-800 dark:text-white mb-1">Nama Aplikasi</h3>
                        <p className="text-sm text-slate-500 dark:text-neutral-400 mb-4">Ubah nama yang ditampilkan di header aplikasi.</p>
                        
                        <input 
                            type="text" 
                            id="appName"
                            value={appName}
                            onChange={(e) => onAppNameChange(e.target.value)}
                            className={formInputClass}
                            maxLength={30}
                        />
                    </div>

                    <div className="bg-white dark:bg-neutral-800 p-6 rounded-3xl shadow-lg shadow-slate-200/50 dark:shadow-none">
                        <h3 className="text-lg font-medium text-slate-800 dark:text-white mb-1">Jenis Huruf (Typeface)</h3>
                        <p className="text-sm text-slate-500 dark:text-neutral-400 mb-4">Pilih jenis huruf yang akan digunakan di seluruh aplikasi.</p>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {fonts.map((fontOption) => (
                                <label 
                                    key={fontOption.id} 
                                    className={`flex flex-col items-center justify-center p-4 border-2 rounded-xl cursor-pointer transition-colors duration-200 ${
                                        font === fontOption.id 
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10' 
                                        : 'border-slate-200 dark:border-neutral-700 hover:border-slate-300 dark:hover:border-neutral-600'
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="fontFamily"
                                        value={fontOption.id}
                                        checked={font === fontOption.id}
                                        onChange={() => onFontChange(fontOption.id)}
                                        className="sr-only"
                                    />
                                    <span className={`text-3xl ${fontOption.className}`}>Ag</span>
                                    <span className={`mt-2 text-sm ${fontOption.className}`}>{fontOption.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-neutral-800 p-6 rounded-3xl shadow-lg shadow-slate-200/50 dark:shadow-none">
                        <h3 className="text-lg font-medium text-slate-800 dark:text-white mb-1">Penjelasan Proses Transaksi</h3>
                        <p className="text-sm text-slate-500 dark:text-neutral-400 mb-4">Berikut adalah contoh perhitungan untuk transaksi sebesar <span className="font-semibold text-slate-600 dark:text-neutral-200">Rp 50.000</span> dengan admin <span className="font-semibold text-slate-600 dark:text-neutral-200">Rp 5.000</span>.</p>
                        
                        <div className="space-y-6">
                             <ExplanationCard 
                                title="1. Transfer Keluar / Pembayaran"
                                description="Pelanggan membayar tagihan dan Anda mengenakan admin. Pelanggan membayar tunai Rp 55.000."
                                agentWalletEffect="- Rp 50.000"
                                cashWalletEffect="+ Rp 55.000"
                                result="Margin Rp 5.000 masuk ke Kas Tunai."
                            />
                             <ExplanationCard 
                                title="2. Transfer Masuk (dari Pelanggan)"
                                description="Pelanggan transfer Rp 55.000 ke rekening Anda untuk mengambil uang tunai Rp 50.000."
                                agentWalletEffect="+ Rp 55.000"
                                cashWalletEffect="- Rp 50.000"
                                result="Margin Rp 5.000 masuk ke Dompet Agen."
                            />
                            <ExplanationCard 
                                title="3. Tarik Tunai (Admin Dalam)"
                                description="Pelanggan tarik tunai via EDC. Saldo rekeningnya terdebet Rp 55.000. Anda memberikan tunai Rp 50.000."
                                agentWalletEffect="+ Rp 55.000"
                                cashWalletEffect="- Rp 50.000"
                                result="Margin Rp 5.000 masuk ke Dompet Agen."
                            />
                             <ExplanationCard 
                                title="4. Tarik Tunai (Admin Luar)"
                                description="Pelanggan tarik tunai via EDC. Saldo rekeningnya terdebet Rp 50.000. Pelanggan membayar admin Rp 5.000 secara tunai."
                                agentWalletEffect="+ Rp 50.000"
                                cashWalletEffect="- Rp 45.000 (Rp 50rb keluar, Rp 5rb masuk)"
                                result="Margin Rp 5.000 masuk ke Kas Tunai."
                            />
                             <div>
                                <h4 className="font-semibold text-slate-700 dark:text-neutral-200">5. Transaksi Piutang (Contoh: Transfer Keluar)</h4>
                                <p className="text-sm text-slate-500 dark:text-neutral-400 mt-1">
                                    Pelanggan berhutang untuk pembayaran tagihan (total Rp 55.000).
                                </p>
                                <div className="mt-2 text-sm space-y-1 pl-4 border-l-2 border-slate-200 dark:border-neutral-600">
                                    <p className="font-medium text-slate-600 dark:text-neutral-300">Saat Transaksi:</p>
                                    <p>Saldo <span className="font-medium">Dompet Agen</span> berkurang untuk bayar tagihan.</p>
                                    <p className="font-mono text-red-500">- Rp 50.000</p>
                                    <p><span className="font-medium">Kas Tunai</span> tidak berubah karena belum dibayar.</p>
                                    
                                    <p className="font-medium text-slate-600 dark:text-neutral-300 pt-2">Saat Pelunasan:</p>
                                    <p>Pelanggan membayar hutang secara tunai.</p>
                                    <p>Uang di <span className="font-medium">Kas Tunai</span> Anda bertambah.</p>
                                    <p className="font-mono text-emerald-500">+ Rp 55.000</p>
                                    <p className="font-medium text-sky-500 pt-1">Hasil: Margin Rp 5.000 masuk ke Kas Tunai setelah lunas.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </main>
    );
};

export default SettingsPage;
