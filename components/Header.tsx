
import React, { useState, useEffect } from 'react';
import { Page } from '../types';

interface NavLinkProps {
    page: Page;
    text: string;
    active: boolean;
    onClick: (page: Page) => void;
}

const NavLink: React.FC<NavLinkProps> = ({ page, text, active, onClick }) => {
    const baseClasses = "px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 cursor-pointer";
    const activeClasses = "bg-indigo-400/20 text-indigo-200";
    const inactiveClasses = "text-slate-300 hover:bg-white/10 hover:text-slate-100";
    
    return (
        <a onClick={() => onClick(page)} className={`${baseClasses} ${active ? activeClasses : inactiveClasses}`}>
            {text}
        </a>
    );
};

interface HeaderProps {
    currentPage: Page;
    setCurrentPage: (page: Page) => void;
}


const Header: React.FC<HeaderProps> = ({ currentPage, setCurrentPage }) => {
    const [currentDateTime, setCurrentDateTime] = useState(new Date());

    useEffect(() => {
        // Update the time every minute
        const timerId = setInterval(() => setCurrentDateTime(new Date()), 60000);
        return () => clearInterval(timerId);
    }, []);

    const formattedTime = new Intl.DateTimeFormat('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    }).format(currentDateTime).replace('.', ':');

    const formattedDate = new Intl.DateTimeFormat('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
    }).format(currentDateTime);


    return (
        <header className="bg-[#2A282F]/80 backdrop-blur-sm sticky top-0 z-40 border-b border-white/10">
            <div className="px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Left Section: Logo/Title */}
                    <div className="flex-1 flex justify-start">
                         <h1 className="text-xl font-bold text-white">
                            Agen BRILink
                        </h1>
                    </div>

                    {/* Center Section: Navigation */}
                    <nav className="hidden md:flex flex-shrink-0">
                        <ul className="flex items-center space-x-2">
                             <li><NavLink page="dashboard" text="Dashboard" active={currentPage === 'dashboard'} onClick={setCurrentPage} /></li>
                             <li><NavLink page="wallets" text="Dompet" active={currentPage === 'wallets'} onClick={setCurrentPage} /></li>
                             <li><NavLink page="categories" text="Jenis Transaksi" active={currentPage === 'categories'} onClick={setCurrentPage} /></li>
                             <li><NavLink page="customers" text="Pelanggan" active={currentPage === 'customers'} onClick={setCurrentPage} /></li>
                             <li><NavLink page="reports" text="Laporan" active={currentPage === 'reports'} onClick={setCurrentPage} /></li>
                             <li><NavLink page="settings" text="Pengaturan" active={currentPage === 'settings'} onClick={setCurrentPage} /></li>
                        </ul>
                    </nav>

                    {/* Right Section: Date and Time */}
                     <div className="flex-1 flex justify-end items-center">
                        <div className="text-right">
                            <p className="text-base font-medium text-white tracking-wider">{formattedTime}</p>
                            <p className="text-xs text-slate-400">{formattedDate}</p>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
