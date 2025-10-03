import React, { useState, useEffect } from 'react';
import { Page } from '../types';
import { MenuIcon, CloseIcon } from './icons/Icons';

// Mendefinisikan tipe untuk tema aplikasi.
type Theme = 'light' | 'dark';

/**
 * Komponen ThemeToggle adalah tombol untuk beralih antara tema terang (light) dan gelap (dark).
 */
const ThemeToggle: React.FC<{ theme: Theme; onToggle: () => void; }> = ({ theme, onToggle }) => {
    return (
        <button
            onClick={onToggle}
            className="w-14 h-8 rounded-full bg-slate-200 dark:bg-neutral-700 flex items-center p-1 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-50 dark:focus:ring-offset-[#191919] focus:ring-blue-400"
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
    );
};

// Properti untuk komponen NavLink.
interface NavLinkProps {
    page: Page;
    text: string;
    active: boolean;
    onClick: (page: Page) => void;
    isMobile?: boolean; // Menandakan apakah link ini untuk tampilan mobile.
}

/**
 * Komponen NavLink adalah tautan navigasi yang dapat digunakan baik di header desktop maupun di menu mobile.
 * Gayanya berubah tergantung pada apakah tautan tersebut aktif atau tidak.
 */
const NavLink: React.FC<NavLinkProps> = ({ page, text, active, onClick, isMobile = false }) => {
    const baseClasses = "transition-colors duration-200 cursor-pointer";
    
    // Gaya untuk menu mobile.
    if (isMobile) {
        const mobileBase = "block text-center py-4 text-lg font.medium";
        const mobileActive = "text-blue-500 dark:text-blue-300";
        const mobileInactive = "text-slate-700 dark:text-neutral-200 hover:text-slate-900 dark:hover:text-white";
        return (
            <a onClick={() => onClick(page)} className={`${baseClasses} ${mobileBase} ${active ? mobileActive : mobileInactive}`}>
                {text}
            </a>
        );
    }
    
    // Gaya untuk navigasi desktop.
    const desktopBase = "px-4 py-2 rounded-full text-sm font.medium";
    const desktopActive = "bg-blue-100 text-blue-700 dark:bg-blue-400/20 dark:text-blue-200";
    const desktopInactive = "text-slate-600 dark:text-neutral-300 hover:bg-slate-200/50 dark:hover:bg-white/10 hover:text-slate-800 dark:hover:text-neutral-100";
    
    return (
        <a onClick={() => onClick(page)} className={`${baseClasses} ${desktopBase} ${active ? desktopActive : desktopInactive}`}>
            {text}
        </a>
    );
};

// Properti untuk komponen Header utama.
interface HeaderProps {
    currentPage: Page;
    setCurrentPage: (page: Page) => void;
    theme: Theme;
    setTheme: React.Dispatch<React.SetStateAction<Theme>>;
    appName: string;
}

/**
 * Komponen Header adalah bagian atas aplikasi yang menampilkan judul, navigasi utama,
 * informasi waktu, dan tombol ganti tema. Header ini responsif dan memiliki
 * menu tersembunyi untuk tampilan mobile.
 */
const Header: React.FC<HeaderProps> = ({ currentPage, setCurrentPage, theme, setTheme, appName }) => {
    // State untuk menyimpan tanggal dan waktu saat ini.
    const [currentDateTime, setCurrentDateTime] = useState(new Date());
    // State untuk mengontrol visibilitas menu mobile.
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // useEffect untuk memperbarui waktu setiap menit.
    useEffect(() => {
        const timerId = setInterval(() => setCurrentDateTime(new Date()), 60000);
        return () => clearInterval(timerId); // Membersihkan interval saat komponen di-unmount.
    }, []);
    
    // useEffect untuk mencegah scrolling pada body saat menu mobile terbuka.
    useEffect(() => {
        document.body.style.overflow = isMobileMenuOpen ? 'hidden' : 'unset';
    }, [isMobileMenuOpen]);

    // Handler untuk mengganti tema.
    const handleToggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
    };

    // Memformat waktu untuk ditampilkan.
    const formattedTime = new Intl.DateTimeFormat('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    }).format(currentDateTime).replace('.', ':');

    // Memformat tanggal untuk ditampilkan.
    const formattedDate = new Intl.DateTimeFormat('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
    }).format(currentDateTime);

    // Handler saat link navigasi di-klik.
    const handleNavClick = (page: Page) => {
        setCurrentPage(page);
        setIsMobileMenuOpen(false); // Menutup menu mobile setelah navigasi.
    };


    return (
        <>
            <header className="bg-white/80 dark:bg-[#191919]/80 backdrop-blur-sm sticky top-0 z-40 border-b border-slate-200 dark:border-white/10">
                <div className="px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Bagian Kiri: Judul Aplikasi */}
                        <div className="flex-1 flex justify-start">
                             <h1 className="text-xl font.bold text-slate-900 dark:text-white">
                                {appName}
                            </h1>
                        </div>

                        {/* Bagian Tengah: Navigasi Desktop */}
                        <nav className="hidden md:flex flex-shrink-0">
                            <ul className="flex items-center space-x-2">
                                 <li><NavLink page="dashboard" text="Dashboard" active={currentPage === 'dashboard'} onClick={handleNavClick} /></li>
                                 <li><NavLink page="customers" text="Pelanggan" active={currentPage === 'customers'} onClick={handleNavClick} /></li>                                 
                                 <li><NavLink page="management" text="Manajemen" active={currentPage === 'management'} onClick={handleNavClick} /></li>
                                 <li><NavLink page="reports" text="Laporan" active={currentPage === 'reports'} onClick={handleNavClick} /></li>
                                 <li><NavLink page="settings" text="Pengaturan" active={currentPage === 'settings'} onClick={handleNavClick} /></li>
                            </ul>
                        </nav>

                        {/* Bagian Kanan: Waktu, Tombol Tema, dan Tombol Menu Mobile */}
                        <div className="flex-1 flex justify-end items-center space-x-4">
                            <div className="text-right hidden sm:block">
                                <p className="text-base font.medium text-slate-800 dark:text-white tracking-wider">{formattedTime}</p>
                                <p className="text-xs text-slate-500 dark:text-neutral-400">{formattedDate}</p>
                            </div>
                            <ThemeToggle theme={theme} onToggle={handleToggleTheme} />
                            <div className="md:hidden">
                                <button
                                    onClick={() => setIsMobileMenuOpen(true)}
                                    className="p-2 rounded-full text-slate-600 dark:text-neutral-300 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-slate-800 dark:hover:text-white"
                                    aria-label="Buka menu"
                                    aria-expanded={isMobileMenuOpen}
                                >
                                    <MenuIcon className="h-6 w-6" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </header>
            
            {/* Overlay Menu Mobile */}
            <div className={`fixed inset-0 z-50 bg-slate-50/95 dark:bg-[#191919]/95 backdrop-blur-sm md:hidden transition-opacity duration-300 ease-in-out ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} role="dialog" aria-modal="true">
                <div className={`transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-y-0' : '-translate-y-4'}`}>
                    <div className="flex justify-end p-4">
                        <button
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="p-2 rounded-full text-slate-600 dark:text-neutral-300 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-slate-800 dark:hover:text-white"
                            aria-label="Tutup menu"
                        >
                            <CloseIcon className="h-6 w-6" />
                        </button>
                    </div>
                    <nav className="mt-8">
                        <ul className="flex flex-col items-center space-y-4">
                             <li><NavLink page="dashboard" text="Dashboard" active={currentPage === 'dashboard'} onClick={handleNavClick} isMobile /></li>
                             <li><NavLink page="customers" text="Pelanggan" active={currentPage === 'customers'} onClick={handleNavClick} isMobile /></li>
                             <li><NavLink page="management" text="Manajemen" active={currentPage === 'management'} onClick={handleNavClick} isMobile /></li>
                             <li><NavLink page="reports" text="Laporan" active={currentPage === 'reports'} onClick={handleNavClick} isMobile /></li>
                             <li><NavLink page="settings" text="Pengaturan" active={currentPage === 'settings'} onClick={handleNavClick} isMobile /></li>
                        </ul>
                    </nav>
                </div>
            </div>
        </>
    );
};

export default Header;