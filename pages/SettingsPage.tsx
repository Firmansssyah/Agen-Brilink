import React, { useRef, useState, useEffect } from 'react';
import { Font } from '../types';
import { WalletIcon, CashIcon, MarginIcon, ChevronDownIcon } from '../components/icons/Icons';
import InvoicePreview from '../components/InvoicePreview';

interface SettingsPageProps {
    appName: string;
    font: Font;
    invoiceAppName: string;
    invoiceAddress: string;
    invoicePhone: string;
    invoiceFooter: string;
    invoiceFont: Font;
    onSaveSettings: (settings: {
        appName: string;
        font: Font;
        invoiceAppName: string;
        invoiceAddress: string;
        invoicePhone: string;
        invoiceFooter: string;
        invoiceFont: Font;
    }) => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ 
    appName, 
    font, 
    invoiceAppName,
    invoiceAddress,
    invoicePhone,
    invoiceFooter,
    invoiceFont,
    onSaveSettings,
}) => {
    const [localAppName, setLocalAppName] = useState(appName);
    const [localFont, setLocalFont] = useState(font);
    const [localInvoiceAppName, setLocalInvoiceAppName] = useState(invoiceAppName);
    const [localInvoiceAddress, setLocalInvoiceAddress] = useState(invoiceAddress);
    const [localInvoicePhone, setLocalInvoicePhone] = useState(invoicePhone);
    const [localInvoiceFooter, setLocalInvoiceFooter] = useState(invoiceFooter);
    const [localInvoiceFont, setLocalInvoiceFont] = useState(invoiceFont);
    const [isDirty, setIsDirty] = useState(false);

    const footerTextareaRef = useRef<HTMLTextAreaElement>(null);
    const formInputClass = "w-full bg-slate-100 dark:bg-neutral-700 border border-transparent focus:border-blue-400 focus:ring-1 focus:ring-blue-400 rounded-full px-4 py-3 text-sm text-slate-800 dark:text-white transition outline-none placeholder:text-slate-400 dark:placeholder:text-neutral-500";
    
    useEffect(() => {
        const hasChanges =
            localAppName !== appName ||
            localFont !== font ||
            localInvoiceAppName !== invoiceAppName ||
            localInvoiceAddress !== invoiceAddress ||
            localInvoicePhone !== invoicePhone ||
            localInvoiceFooter !== invoiceFooter ||
            localInvoiceFont !== invoiceFont;
        setIsDirty(hasChanges);
    }, [localAppName, localFont, localInvoiceAppName, localInvoiceAddress, localInvoicePhone, localInvoiceFooter, localInvoiceFont, appName, font, invoiceAppName, invoiceAddress, invoicePhone, invoiceFooter, invoiceFont]);

    const handleSave = () => {
        onSaveSettings({
            appName: localAppName,
            font: localFont,
            invoiceAppName: localInvoiceAppName,
            invoiceAddress: localInvoiceAddress,
            invoicePhone: localInvoicePhone,
            invoiceFooter: localInvoiceFooter,
            invoiceFont: localInvoiceFont,
        });
    };

    const handleReset = () => {
        setLocalAppName(appName);
        setLocalFont(font);
        setLocalInvoiceAppName(invoiceAppName);
        setLocalInvoiceAddress(invoiceAddress);
        setLocalInvoicePhone(invoicePhone);
        setLocalInvoiceFooter(invoiceFooter);
        setLocalInvoiceFont(invoiceFont);
    };

    const appFonts: { id: Font, name: string, className: string }[] = [
        { id: 'font-sans', name: 'Mona Sans', className: 'font-sans' },
        { id: 'font-inter', name: 'Inter', className: 'font-inter' },
        { id: 'font-poppins', name: 'Poppins', className: 'font-poppins' },
        { id: 'font-roboto-flex', name: 'Roboto Flex', className: 'font-roboto-flex' },
    ];

    const invoiceFonts: { id: Font, name: string, className: string }[] = [
        ...appFonts,
        { id: 'font-mono', name: 'Monospace', className: 'font-mono' },
    ];

    const handleFormatFooter = (tag: 'b' | 'i' | 'light') => {
        const textarea = footerTextareaRef.current;
        if (textarea) {
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            if (start === end) return;
            
            const selectedText = textarea.value.substring(start, end);
            const before = textarea.value.substring(0, start);
            const after = textarea.value.substring(end);

            const newText = `${before}<${tag}>${selectedText}</${tag}>${after}`;
            setLocalInvoiceFooter(newText);
        }
    };

    const FormatButton: React.FC<{ onClick: () => void; children: React.ReactNode; format: string; }> = ({ onClick, children, format }) => (
        <button
            type="button"
            onClick={onClick}
            className="px-3 py-1 text-sm rounded-md bg-slate-200 dark:bg-neutral-600 hover:bg-slate-300 dark:hover:bg-neutral-500 transition-colors"
            aria-label={`Format as ${format}`}
        >
            {children}
        </button>
    );
    
    return (
        <main className="p-4 sm:p-6 flex-1">
            <div className="mx-auto max-w-7xl">
                <div className="space-y-6">
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white px-2">Pengaturan</h1>
                    
                    {/* Appearance Settings Card */}
                    <div className="bg-white dark:bg-neutral-800 p-6 rounded-3xl shadow-lg shadow-slate-200/50 dark:shadow-none">
                        <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-6">Tampilan Dasbor</h2>
                        <div className="space-y-6">
                            <div>
                                <label htmlFor="appName" className="block text-sm font-medium text-slate-600 dark:text-neutral-300 mb-2">Nama Aplikasi</label>
                                <input 
                                    type="text" 
                                    id="appName"
                                    value={localAppName}
                                    onChange={(e) => setLocalAppName(e.target.value)}
                                    className={formInputClass}
                                    maxLength={30}
                                />
                            </div>
                            <div>
                               <label className="block text-sm font-medium text-slate-600 dark:text-neutral-300 mb-2">Jenis Huruf Aplikasi</label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    {appFonts.map((fontOption) => (
                                        <label 
                                            key={fontOption.id} 
                                            className={`flex flex-col items-center justify-center p-4 border-2 rounded-xl cursor-pointer transition-colors duration-200 ${
                                                localFont === fontOption.id 
                                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10' 
                                                : 'border-slate-200 dark:border-neutral-700 hover:border-slate-300 dark:hover:border-neutral-600'
                                            }`}
                                        >
                                            <input
                                                type="radio"
                                                name="fontFamily"
                                                value={fontOption.id}
                                                checked={localFont === fontOption.id}
                                                onChange={() => setLocalFont(fontOption.id)}
                                                className="sr-only"
                                            />
                                            <span className={`text-3xl ${fontOption.className}`}>Ag</span>
                                            <span className={`mt-2 text-sm ${fontOption.className}`}>{fontOption.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Invoice Settings Card */}
                    <div className="bg-white dark:bg-neutral-800 p-6 rounded-3xl shadow-lg shadow-slate-200/50 dark:shadow-none">
                        <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-6">Pengaturan Struk</h2>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                            {/* Left side: Form Inputs */}
                            <div className="space-y-6">
                                <div>
                                    <label htmlFor="invoiceAppName" className="block text-sm font-medium text-slate-600 dark:text-neutral-300 mb-2">Nama Toko</label>
                                    <input 
                                        type="text" 
                                        id="invoiceAppName"
                                        value={localInvoiceAppName}
                                        onChange={(e) => setLocalInvoiceAppName(e.target.value)}
                                        className={formInputClass}
                                        placeholder="cth: BRILink Jaya Abadi"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="invoiceAddress" className="block text-sm font-medium text-slate-600 dark:text-neutral-300 mb-2">Alamat</label>
                                    <input 
                                        type="text" 
                                        id="invoiceAddress"
                                        value={localInvoiceAddress}
                                        onChange={(e) => setLocalInvoiceAddress(e.target.value)}
                                        className={formInputClass}
                                        placeholder="cth: Jl. Merdeka No. 10"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="invoicePhone" className="block text-sm font-medium text-slate-600 dark:text-neutral-300 mb-2">Nomor HP</label>
                                    <input 
                                        type="text" 
                                        id="invoicePhone"
                                        value={localInvoicePhone}
                                        onChange={(e) => setLocalInvoicePhone(e.target.value)}
                                        className={formInputClass}
                                        placeholder="cth: 08123456789"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 dark:text-neutral-300 mb-2">Jenis Huruf Struk</label>
                                    <div className="relative">
                                        <select
                                            value={localInvoiceFont}
                                            onChange={(e) => setLocalInvoiceFont(e.target.value as Font)}
                                            className={`${formInputClass} appearance-none`}
                                        >
                                            {invoiceFonts.map(f => <option key={f.id} value={f.id} className={f.className}>{f.name}</option>)}
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-neutral-400">
                                            <ChevronDownIcon />
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="invoiceFooter" className="block text-sm font-medium text-slate-600 dark:text-neutral-300 mb-2">Teks Footer</label>
                                    <div className="flex items-center gap-2 mb-2">
                                        <FormatButton onClick={() => handleFormatFooter('b')} format="Bold">
                                            <span className="font-bold">Tebal</span>
                                        </FormatButton>
                                        <FormatButton onClick={() => handleFormatFooter('i')} format="Italic">
                                            <span className="italic">Miring</span>
                                        </FormatButton>
                                        <FormatButton onClick={() => handleFormatFooter('light')} format="Light">
                                            <span className="font-light">Tipis</span>
                                        </FormatButton>
                                    </div>
                                    <textarea
                                        ref={footerTextareaRef}
                                        id="invoiceFooter"
                                        value={localInvoiceFooter}
                                        onChange={(e) => setLocalInvoiceFooter(e.target.value)}
                                        className="w-full bg-slate-100 dark:bg-neutral-700 border border-transparent focus:border-blue-400 focus:ring-1 focus:ring-blue-400 rounded-2xl px-4 py-3 text-sm text-slate-800 dark:text-white transition outline-none placeholder:text-slate-400 dark:placeholder:text-neutral-500"
                                        rows={3}
                                        placeholder="Gunakan Enter untuk baris baru. Sorot teks lalu klik tombol format di atas."
                                    />
                                </div>
                            </div>
                            {/* Right side: Preview */}
                            <div className="flex flex-col items-center">
                                <h3 className="text-md font-semibold text-slate-700 dark:text-neutral-200 mb-4">Preview Struk</h3>
                                <div className="w-full max-w-xs scale-95 md:scale-100 origin-top">
                                    <InvoicePreview 
                                        invoiceAppName={localInvoiceAppName}
                                        invoiceAddress={localInvoiceAddress}
                                        invoicePhone={localInvoicePhone}
                                        invoiceFooter={localInvoiceFooter}
                                        invoiceFont={localInvoiceFont}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Save Changes Card */}
                    {isDirty && (
                        <div className="bg-white dark:bg-neutral-800 p-4 rounded-3xl shadow-lg shadow-slate-200/50 dark:shadow-none animate-fade-in">
                            <div className="flex justify-end items-center gap-4">
                                <p className="text-sm font-medium text-slate-600 dark:text-neutral-300 mr-auto">
                                    Anda memiliki perubahan yang belum disimpan.
                                </p>
                                <button 
                                    onClick={handleReset} 
                                    className="text-blue-600 hover:bg-blue-100 dark:text-blue-200 dark:hover:bg-blue-400/10 font-semibold py-2 px-5 rounded-full text-sm transition-colors"
                                >
                                    Reset
                                </button>
                                <button 
                                    onClick={handleSave}
                                    className="bg-blue-500 hover:bg-blue-600 text-white dark:bg-blue-400 dark:hover:bg-blue-500 dark:text-slate-900 font-semibold py-2 px-5 rounded-full text-sm transition-colors"
                                >
                                    Simpan Perubahan
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
};

export default SettingsPage;