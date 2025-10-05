import React from 'react';
import { Font } from '../types';
import { WalletIcon, CashIcon, MarginIcon } from '../components/icons/Icons';

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

    const FlowCard: React.FC<{
        title: string;
        description: string;
        walletChange: string;
        cashChange: string;
        marginDestination: string;
    }> = ({ title, description, walletChange, cashChange, marginDestination }) => {
        const getChangeColor = (change: string) => {
            if (change.startsWith('+')) return 'text-emerald-500 dark:text-emerald-400';
            if (change.startsWith('-')) return 'text-red-500 dark:text-red-400';
            return 'text-slate-500 dark:text-neutral-400';
        };

        return (
            <div className="bg-slate-50 dark:bg-neutral-900/50 rounded-xl p-4 flex flex-col h-full">
                <div>
                    <h4 className="font-semibold text-slate-700 dark:text-neutral-200">{title}</h4>
                    <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">{description}</p>
                </div>
                <div className="mt-4 space-y-3 flex-grow">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-neutral-300">
                            <WalletIcon className="h-5 w-5 text-slate-400 dark:text-neutral-500" />
                            <span>Dompet Agen</span>
                        </div>
                        <span className={`font-mono font-semibold ${getChangeColor(walletChange)}`}>{walletChange}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-neutral-300">
                            <CashIcon className="h-5 w-5 text-slate-400 dark:text-neutral-500" />
                            <span>Kas Tunai</span>
                        </div>
                        <span className={`font-mono font-semibold ${getChangeColor(cashChange)}`}>{cashChange}</span>
                    </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-200 dark:border-neutral-700/50 text-xs text-slate-500 dark:text-neutral-400 flex items-center gap-2">
                    <MarginIcon className="h-4 w-4 text-sky-500" />
                    <span>Margin Masuk Ke: <b className="font-semibold text-sky-600 dark:text-sky-400">{marginDestination}</b></span>
                </div>
            </div>
        );
    };
    
    return (
        <main className="p-4 sm:p-6 flex-1">
            <div className="mx-auto max-w-4xl">
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
                        <h3 className="text-lg font-medium text-slate-800 dark:text-white mb-1">Logika Alur Kas</h3>
                        <p className="text-sm text-slate-500 dark:text-neutral-400 mb-4">
                            Contoh perhitungan untuk transaksi <b className="font-semibold text-slate-600 dark:text-neutral-200">Rp 50.000</b> dengan margin <b className="font-semibold text-slate-600 dark:text-neutral-200">Rp 5.000</b>.
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <FlowCard 
                                title="Transfer Keluar"
                                description="Pelanggan bayar tunai"
                                walletChange="-50.000"
                                cashChange="+55.000"
                                marginDestination="Kas Tunai"
                            />
                            <FlowCard 
                                title="Transfer Masuk"
                                description="Pelanggan terima tunai"
                                walletChange="+55.000"
                                cashChange="-50.000"
                                marginDestination="Dompet Agen"
                            />
                            <FlowCard 
                                title="Tarik Tunai (Admin Dalam)"
                                description="Admin dari saldo pelanggan"
                                walletChange="+55.000"
                                cashChange="-50.000"
                                marginDestination="Dompet Agen"
                            />
                             <FlowCard 
                                title="Tarik Tunai (Admin Luar)"
                                description="Admin dibayar tunai"
                                walletChange="+50.000"
                                cashChange="-45.000"
                                marginDestination="Kas Tunai"
                            />
                            <FlowCard 
                                title="Piutang"
                                description="Hutang dibayar kemudian"
                                walletChange="-50.000"
                                cashChange="± 0"
                                marginDestination="(Belum Ada)"
                            />
                            <FlowCard 
                                title="Pelunasan Piutang"
                                description="Pelanggan bayar tunai"
                                walletChange="± 0"
                                cashChange="+55.000"
                                marginDestination="Kas Tunai"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default SettingsPage;
