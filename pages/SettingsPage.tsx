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

                </div>
            </div>
        </main>
    );
};

export default SettingsPage;