import React from 'react';

interface SettingsPageProps {
    appName: string;
    onAppNameChange: (newName: string) => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ appName, onAppNameChange }) => {
    const formInputClass = "w-full bg-slate-100 dark:bg-neutral-700 border border-transparent focus:border-blue-400 focus:ring-1 focus:ring-blue-400 rounded-full px-4 py-3 text-sm text-slate-800 dark:text-white transition outline-none placeholder:text-slate-400 dark:placeholder:text-neutral-500";
    
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
                </div>
            </div>
        </main>
    );
};

export default SettingsPage;