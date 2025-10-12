import React, { useState, useEffect } from 'react';
import { Page } from '../types';
import { CloseIcon, PanelLeftCloseIcon, PanelLeftOpenIcon } from './icons/Icons';
import ClockCard from './ClockCard';

// --- New SVG Icon Components ---

const DashboardIcon: React.FC<{ className?: string }> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
        <path fill="currentColor" d="M5 21q-.825 0-1.412-.587T3 19V5q0-.825.588-1.412T5 3h6v18zm8 0v-9h8v7q0 .825-.587 1.413T19 21zm0-11V3h6q.825 0 1.413.588T21 5v5z"/>
    </svg>
);

const CustomersIcon: React.FC<{ className?: string }> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
        <path fill="currentColor" d="M1 17.2q0-.85.438-1.562T2.6 14.55q1.55-.775 3.15-1.162T9 13t3.25.388t3.15 1.162q.725.375 1.163 1.088T17 17.2v.8q0 .825-.587 1.413T15 20H3q-.825 0-1.412-.587T1 18zM18.45 20q.275-.45.413-.962T19 18v-1q0-1.1-.612-2.113T16.65 13.15q1.275.15 2.4.513t2.1.887q.9.5 1.375 1.112T23 17v1q0 .825-.587 1.413T21 20zM9 12q-1.65 0-2.825-1.175T5 8t1.175-2.825T9 4t2.825 1.175T13 8t-1.175 2.825T9 12m10-4q0 1.65-1.175 2.825T15 12q-.275 0-.7-.062t-.7-.138q.675-.8 1.038-1.775T15 8t-.362-2.025T13.6 4.2q.35-.125.7-.163T15 4q1.65 0 2.825 1.175T19 8"/>
    </svg>
);

const ManagementIcon: React.FC<{ className?: string }> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
        <path fill="currentColor" d="M3 8h18V5.5q0-.625-.437-1.062T19.5 4h-15q-.625 0-1.062.438T3 5.5zm0 6h18v-4H3zm1.5 6h15q.625 0 1.063-.437T21 18.5V16H3v2.5q0 .625.438 1.063T4.5 20M5 7q-.425 0-.712-.288T4 6t.288-.712T5 5t.713.288T6 6t-.288.713T5 7m0 6q-.425 0-.712-.288T4 12t.288-.712T5 11t.713.288T6 12t-.288.713T5 13m0 6q-.425 0-.712-.288T4 18t.288-.712T5 17t.713.288T6 18t-.288.713T5 19"/>
    </svg>
);

const ReportIcon: React.FC<{ className?: string }> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
        <path fill="currentColor" d="M16 20v-7h4v7zm-6 0V4h4v16zm-6 0V9h4v11z"/>
    </svg>
);

const SettingsIcon: React.FC<{ className?: string }> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
        <path fill="currentColor" d="m9.25 22l-.4-3.2q-.325-.125-.612-.3t-.563-.375L4.7 19.375l-2.75-4.75l2.575-1.95Q4.5 12.5 4.5 12.338v-.675q0-.163.025-.338L1.95 9.375l2.75-4.75l2.975 1.25q.275-.2.575-.375t.6-.3l.4-3.2h5.5l.4 3.2q.325.125.613.3t.562.375l2.975-1.25l2.75 4.75l-2.575 1.95q.025.175.025.338v.674q0 .163-.05.338l2.575 1.95l-2.75 4.75l-2.95-1.25q-.275.2-.575-.375t-.6.3l-.4 3.2zm2.8-6.5q1.45 0 2.475-1.025T15.55 12t-1.025-2.475T12.05 8.5q-1.475 0-2.488 1.025T8.55 12t1.013 2.475T12.05 15.5"/>
    </svg>
);


type Theme = 'light' | 'dark';

const AppLogo: React.FC<{ className?: string }> = ({ className }) => (
    <div className={`flex items-center justify-center bg-blue-600 dark:bg-blue-700 rounded-lg ${className}`}>
        <span className="text-2xl font-bold text-white font-sans">B</span>
    </div>
);

const ThemeToggle: React.FC<{ theme: Theme; onToggle: () => void; isCollapsed: boolean; }> = ({ theme, onToggle, isCollapsed }) => {
    return (
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : ''}`}>
            <button
                onClick={onToggle}
                className="w-14 h-8 flex-shrink-0 rounded-full bg-slate-200 dark:bg-neutral-700 flex items-center p-1 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-[#212121] focus:ring-blue-400"
                aria-label={`Beralih ke mode ${theme === 'dark' ? 'terang' : 'gelap'}`}
            >
                <span className={`w-6 h-6 rounded-full bg-white dark:bg-neutral-800 shadow-md transform transition-transform duration-300 relative ${theme === 'dark' ? 'translate-x-6' : 'translate-x-0'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-opacity duration-300 text-yellow-500 ${theme === 'light' ? 'opacity-100' : 'opacity-0'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 12m-4 0a4 4 0 1 0 8 0 4 4 0 1 0-8 0 M12 2V4 M12 20V22 M2 12H4 M20 12H22 M5.64 5.64l1.41 1.41 M16.95 16.95l1.41 1.41 M5.64 18.36l1.41-1.41 M16.95 7.05l1.41-1.41" />
                    </svg>
                     <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-opacity duration-300 text-neutral-300 ${theme === 'dark' ? 'opacity-100' : 'opacity-0'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                </span>
            </button>
        </div>
    );
};

interface NavLinkProps {
    page: Page;
    text: string;
    icon: React.ReactNode;
    active: boolean;
    onClick: (page: Page) => void;
    isCollapsed: boolean;
}

const NavLink: React.FC<NavLinkProps> = ({ page, text, icon, active, onClick, isCollapsed }) => {
    const commonClasses = "relative flex items-center w-full transition-colors duration-200 cursor-pointer rounded-xl";
    const activeClasses = "bg-blue-600 text-white dark:bg-blue-700 font-semibold shadow-md";
    const inactiveClasses = "text-slate-600 dark:text-neutral-300 hover:bg-slate-200/50 dark:hover:bg-white/10";
    
    // For mobile and expanded desktop
    const expandedClasses = "px-4 py-3 space-x-4";
    // For collapsed desktop
    const collapsedDesktopClasses = "md:h-12 md:w-12 md:mx-auto md:justify-center md:has-tooltip md:p-0 md:space-x-0";

    return (
        <a 
            onClick={() => onClick(page)}
            className={`${commonClasses} ${active ? activeClasses : inactiveClasses} ${isCollapsed ? collapsedDesktopClasses : expandedClasses}`}
        >
            {icon}
            <span className={`text-sm font-medium whitespace-nowrap overflow-hidden transition-opacity ${isCollapsed ? 'md:opacity-0 md:w-0 md:hidden' : 'md:opacity-100'}`}>{text}</span>
            {isCollapsed && (
                 <div className="tooltip absolute left-full top-1/2 -translate-y-1/2 ml-4 px-3 py-1.5 bg-slate-800 dark:bg-neutral-900 text-white text-xs font-medium rounded-md shadow-lg whitespace-nowrap z-50 hidden md:block">
                    {text}
                 </div>
            )}
        </a>
    );
};


interface SidebarProps {
    currentPage: Page;
    setCurrentPage: (page: Page) => void;
    theme: Theme;
    setTheme: React.Dispatch<React.SetStateAction<Theme>>;
    appName: string;
    isOpen: boolean;
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, setCurrentPage, theme, setTheme, appName, isOpen, setIsOpen }) => {
    const [isCollapsed, setIsCollapsed] = useState(() => {
        return typeof window !== 'undefined' ? localStorage.getItem('sidebarCollapsed') === 'true' : false;
    });

    useEffect(() => {
        localStorage.setItem('sidebarCollapsed', String(isCollapsed));
    }, [isCollapsed]);
    
    const handleNavClick = (page: Page) => {
        setCurrentPage(page);
        setIsOpen(false);
    };

    const handleToggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
    };
    
    const handleToggleCollapse = () => {
        setIsCollapsed(prev => !prev);
    };

    const navItems: { page: Page; text: string; icon: React.ReactNode }[] = [
        { page: 'dashboard', text: 'Dashboard', icon: <DashboardIcon className="h-5 w-5 flex-shrink-0" /> },
        { page: 'customers', text: 'Pelanggan', icon: <CustomersIcon className="h-5 w-5 flex-shrink-0" /> },
        { page: 'management', text: 'Manajemen', icon: <ManagementIcon className="h-5 w-5 flex-shrink-0" /> },
        { page: 'reports', text: 'Laporan', icon: <ReportIcon className="h-5 w-5 flex-shrink-0" /> },
        { page: 'settings', text: 'Pengaturan', icon: <SettingsIcon className="h-5 w-5 flex-shrink-0" /> }
    ];

    return (
        <>
            <div 
                className={`fixed inset-0 bg-black/40 z-40 md:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsOpen(false)}
                aria-hidden="true"
            ></div>
            
            <aside 
                className={`fixed top-0 left-0 h-full bg-white dark:bg-[#212121] border-r border-slate-200 dark:border-white/10 z-50
                flex-shrink-0 flex flex-col transition-transform md:transition-[width] duration-300 ease-in-out
                md:relative md:translate-x-0
                w-64 ${isCollapsed ? 'md:w-20' : 'md:w-64'}
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
                role="navigation"
            >
                <div className="h-16 flex items-center justify-between px-6 md:px-0 border-b border-slate-200 dark:border-white/10 flex-shrink-0 overflow-hidden">
                    <div className={`transition-all duration-200 w-full flex items-center ${isCollapsed ? 'md:justify-center' : 'md:px-6'}`}>
                        {/* Mobile view, always expanded */}
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white md:hidden">{appName}</h1>
                        
                        {/* Desktop view */}
                        <div className={`hidden md:flex items-center gap-3 transition-opacity ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>
                            <AppLogo className="h-8 w-8" />
                            <span className="text-lg font-bold text-slate-900 dark:text-white whitespace-nowrap">{appName}</span>
                        </div>
                         <div className={`hidden md:flex items-center justify-center transition-opacity ${isCollapsed ? 'opacity-100' : 'opacity-0 w-0'}`}>
                             <AppLogo className="h-9 w-9" />
                        </div>
                    </div>

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
                                    isCollapsed={isCollapsed}
                                />
                            </li>
                        ))}
                    </ul>
                    <div className="mt-auto pt-4">
                        <ClockCard isCollapsed={isCollapsed} />
                    </div>
                </nav>

                <div className={`p-4 border-t border-slate-200 dark:border-white/10 flex-shrink-0 flex items-center ${isCollapsed ? 'flex-col-reverse gap-4' : 'justify-between'}`}>
                    <ThemeToggle theme={theme} onToggle={handleToggleTheme} isCollapsed={isCollapsed} />
                    <button 
                        onClick={handleToggleCollapse}
                        className="hidden md:flex items-center justify-center h-8 w-8 rounded-full text-slate-500 dark:text-neutral-400 hover:bg-slate-200/60 dark:hover:bg-white/10 transition-colors"
                        aria-label={isCollapsed ? "Lebarkan sidebar" : "Sempitkan sidebar"}
                    >
                        {isCollapsed ? <PanelLeftOpenIcon className="h-5 w-5" /> : <PanelLeftCloseIcon className="h-5 w-5" />}
                    </button>
                </div>

            </aside>
        </>
    );
};

export default Sidebar;
