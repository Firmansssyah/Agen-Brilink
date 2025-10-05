import React from 'react';
import { Page } from '../types';
import { CloseIcon, DashboardIcon, CustomersIcon, WalletIcon, ReportIcon, SettingsIcon } from './icons/Icons';
import ClockCard from './ClockCard';

// Mendefinisikan tipe untuk tema aplikasi.
type Theme = 'light' | 'dark';

/**
 * Komponen ThemeToggle adalah tombol untuk beralih antara tema terang (light) dan gelap (dark).
 */
const ThemeToggle: React.FC<{ theme: Theme; onToggle: () => void; }> = ({ theme, onToggle }) => {
    return (
        <div className="flex items-center justify-between w-full">
            <span className="text-sm text-slate-600 dark:text-neutral-300">Dark Mode</span>
            <button
                onClick={onToggle}
                className="w-14 h-8 rounded-full bg-slate-200 dark:bg-neutral-700 flex items-center p-1 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-[#212121] focus:ring-blue-400"
                aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
                <span className={`w-6 h-6 rounded-full bg-white dark:bg-neutral-800 shadow-md transform transition-transform duration-300 relative ${theme === 'dark' ? 'translate-x-6' : 'translate-x-0'}`}>
                    {/* Ikon untuk tema terang (matahari) */}
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-opacity duration-300 text-yellow-500 ${theme === 'light' ? 'opacity-100' : 'opacity-0'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                     {/* Ikon untuk tema gelap (bulan) */}
                     <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-opacity duration-300 text-neutral-300 ${theme === 'dark' ? 'opacity-100' : 'opacity-0'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                </span>
            </button>
        </div>
    );
};

// Properti untuk komponen NavLink.
interface NavLinkProps {
    page: Page;
    text: string;
    icon: React.ReactNode;
    active: boolean;
    onClick: (page: Page) => void;
}

/**
 * Komponen NavLink adalah tautan navigasi yang digunakan di dalam sidebar.
 */
const NavLink: React.FC<NavLinkProps> = ({ page, text, icon, active, onClick }) => {
    const baseClasses = "flex items-center space-x-3 w-full px-4 py-3 rounded-xl transition-colors duration-200 cursor-pointer";
    const activeClasses = "bg-blue-100 text-blue-700 dark:bg-blue-400/20 dark:text-blue-200 font-semibold";
    const inactiveClasses = "text-slate-600 dark:text-neutral-300 hover:bg-slate-200/50 dark:hover:bg-white/10 hover:text-slate-800 dark:hover:text-neutral-100";
    
    return (
        <a onClick={() => onClick(page)} className={`${baseClasses} ${active ? activeClasses : inactiveClasses}`}>
            {icon}
            <span className="text-sm font-medium">{text}</span>
        </a>
    );
};

// Properti untuk komponen Sidebar utama.
interface SidebarProps {
    currentPage: Page;
    setCurrentPage: (page: Page) => void;
    theme: Theme;
    setTheme: React.Dispatch<React.SetStateAction<Theme>>;
    appName: string;
    isOpen: boolean;
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

/**
 * Komponen Sidebar adalah panel navigasi utama aplikasi.
 */
const Sidebar: React.FC<SidebarProps> = ({ currentPage, setCurrentPage, theme, setTheme, appName, isOpen, setIsOpen }) => {
    
    const handleNavClick = (page: Page) => {
        setCurrentPage(page);
        setIsOpen(false); // Menutup sidebar di mobile setelah navigasi.
    };

    const handleToggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
    };

    // FIX: Add explicit type to navItems to ensure TypeScript infers `page` as type `Page`, not `string`.
    const navItems: { page: Page; text: string; icon: React.ReactNode }[] = [
        { page: 'dashboard', text: 'Dashboard', icon: <DashboardIcon className="h-5 w-5" /> },
        { page: 'customers', text: 'Pelanggan', icon: <CustomersIcon className="h-5 w-5" /> },
        { page: 'management', text: 'Manajemen', icon: <WalletIcon className="h-5 w-5" /> },
        { page: 'reports', text: 'Laporan', icon: <ReportIcon className="h-5 w-5" /> },
        { page: 'settings', text: 'Pengaturan', icon: <SettingsIcon className="h-5 w-5" /> }
    ];

    return (
        <>
            {/* Overlay untuk mobile */}
            <div 
                className={`fixed inset-0 bg-black/40 z-40 md:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsOpen(false)}
                aria-hidden="true"
            ></div>
            
            {/* Kontainer Sidebar */}
            <aside 
                className={`fixed top-0 left-0 h-full bg-white dark:bg-[#212121] border-r border-slate-200 dark:border-white/10 z-50
                w-64 flex-shrink-0 flex flex-col transition-transform duration-300 ease-in-out
                md:relative md:translate-x-0
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
                role="navigation"
            >
                <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200 dark:border-white/10 flex-shrink-0">
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white">{appName}</h1>
                    <button onClick={() => setIsOpen(false)} className="md:hidden p-2 -mr-2 text-slate-500 hover:text-slate-800 dark:text-neutral-400 dark:hover:text-white" aria-label="Tutup menu">
                        <CloseIcon />
                    </button>
                </div>

                <nav className="flex-1 p-4 overflow-y-auto flex flex-col">
                    <ul className="space-y-2">
                        {navItems.map(item => (
                            <li key={item.page}>
                                <NavLink 
                                    page={item.page}
                                    text={item.text}
                                    icon={item.icon}
                                    active={currentPage === item.page} 
                                    onClick={handleNavClick} 
                                />
                            </li>
                        ))}
                    </ul>
                    <div className="mt-auto">
                        <ClockCard />
                    </div>
                </nav>

                <div className="p-4 border-t border-slate-200 dark:border-white/10 flex-shrink-0">
                    <ThemeToggle theme={theme} onToggle={handleToggleTheme} />
                </div>
            </aside>
        </>
    );
};

export default Sidebar;