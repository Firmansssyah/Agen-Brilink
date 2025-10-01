
import React from 'react';
import { DashboardIcon, ReportIcon, SettingsIcon, PlusIcon, WalletIcon, CategoryIcon, CustomersIcon } from './icons/Icons';

// Fix: Define and export the Page type here to resolve the import error.
export type Page = 'dashboard' | 'management' | 'customers' | 'reports' | 'settings';

interface NavLinkProps {
    page: Page;
    icon: React.ReactNode;
    text: string;
    active: boolean;
    onClick: (page: Page) => void;
}

const NavLink: React.FC<NavLinkProps> = ({ page, icon, text, active, onClick }) => {
    const baseClasses = "flex items-center h-14 w-full rounded-full transition-colors duration-200 cursor-pointer group";
    const activeClasses = "bg-indigo-400/20";
    const inactiveClasses = "hover:bg-white/10";
    
    return (
        <div onClick={() => onClick(page)} className={`${baseClasses} ${active ? activeClasses : inactiveClasses}`}>
            <div className="flex items-center pl-4 space-x-4">
                <span className={active ? 'text-indigo-200' : 'text-slate-400 group-hover:text-slate-200'}>{icon}</span>
                <span className={`font-medium ${active ? 'text-indigo-200' : 'text-slate-300 group-hover:text-slate-100'}`}>{text}</span>
            </div>
        </div>
    );
};

interface SidebarProps {
    currentPage: Page;
    setCurrentPage: (page: Page) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, setCurrentPage }) => {
    return (
        <aside className="hidden lg:flex lg:flex-col lg:w-72 bg-transparent h-screen sticky top-0">
            {/* Logo and Title */}
            <div className="flex items-center h-20 px-6">
                <div className="flex items-center space-x-3">
                    <h1 className="text-xl font-bold text-white">
                        Agen BRILink
                    </h1>
                </div>
            </div>

            <div className="flex-1 flex flex-col p-4 space-y-4 overflow-y-auto">
                {/* Navigation */}
                <nav className="space-y-2 mt-2">
                    <NavLink page="dashboard" icon={<DashboardIcon />} text="Dashboard" active={currentPage === 'dashboard'} onClick={setCurrentPage} />
                    <div className="pt-6">
                        <h2 className="px-4 text-sm font-semibold text-slate-400 tracking-wide">Manajemen</h2>
                        <div className="mt-2 space-y-2">
                            <NavLink page="management" icon={<WalletIcon />} text="Dompet & Kategori" active={currentPage === 'management'} onClick={setCurrentPage} />
                            <NavLink page="customers" icon={<CustomersIcon />} text="Pelanggan" active={currentPage === 'customers'} onClick={setCurrentPage} />
                        </div>
                    </div>
                </nav>

                 <div className="!mt-auto pt-4">
                    <nav className="space-y-2">
                         <NavLink page="reports" icon={<ReportIcon />} text="Laporan" active={currentPage === 'reports'} onClick={setCurrentPage} />
                         <NavLink page="settings" icon={<SettingsIcon />} text="Pengaturan" active={currentPage === 'settings'} onClick={setCurrentPage} />
                    </nav>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;