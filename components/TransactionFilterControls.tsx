import React, { useState } from 'react';
import { TransactionType } from '../types';
import { SearchIcon, CloseIcon, ChevronDownIcon, FilterIcon } from './icons/Icons';
import DatePicker from './DatePicker';

interface TransactionFilterControlsProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    filterType: 'all' | TransactionType;
    onFilterTypeChange: (value: 'all' | TransactionType) => void;
    startDate: string;
    onStartDateChange: (value: string) => void;
    endDate: string;
    onEndDateChange: (value: string) => void;
    onClearFilters: () => void;
}

const TransactionFilterControls: React.FC<TransactionFilterControlsProps> = ({
    searchTerm,
    onSearchChange,
    filterType,
    onFilterTypeChange,
    startDate,
    onEndDateChange,
    endDate,
    onStartDateChange,
    onClearFilters
}) => {
    const [isFilterPanelVisible, setIsFilterPanelVisible] = useState(false);
    const hasActiveFilters = filterType !== 'all' || startDate !== '' || endDate !== '';
    const inputClass = "w-full bg-slate-100 dark:bg-neutral-700 border border-transparent focus:border-blue-400 focus:ring-1 focus:ring-blue-400 rounded-full px-4 py-2 text-sm text-slate-800 dark:text-white transition outline-none placeholder:text-slate-400 dark:placeholder:text-neutral-500";
    
    return (
        <div className="mb-4 px-2 space-y-3">
            <div className="flex items-center gap-3">
                <div className="relative flex-grow">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                        <SearchIcon className="h-5 w-5 text-neutral-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Cari deskripsi, pelanggan, atau jumlah..."
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className={`${inputClass} w-full pl-11 pr-10`}
                    />
                     {searchTerm && (
                        <button onClick={() => onSearchChange('')} className="absolute inset-y-0 right-0 flex items-center pr-4" aria-label="Hapus pencarian">
                            <CloseIcon className="h-5 w-5 text-neutral-400 hover:text-neutral-600 dark:hover:text-white" />
                        </button>
                    )}
                </div>
                
                <button
                    onClick={() => setIsFilterPanelVisible(prev => !prev)}
                    className={`flex-shrink-0 relative flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-full transition-colors ${
                        hasActiveFilters
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-400/20 dark:text-blue-200'
                        : 'bg-slate-200 text-slate-700 dark:bg-neutral-700 dark:text-neutral-200 hover:bg-slate-300 dark:hover:bg-neutral-600'
                    }`}
                    aria-expanded={isFilterPanelVisible}
                >
                    <FilterIcon className="h-4 w-4" />
                    <span>Filter</span>
                    {hasActiveFilters && <span className="absolute -top-1 -right-1 block h-2.5 w-2.5 rounded-full bg-blue-500 border-2 border-white dark:border-neutral-800"></span>}
                </button>
            </div>
            
            {isFilterPanelVisible && (
                <div className="animate-fade-in">
                    <div className="mt-3 p-4 bg-slate-100 dark:bg-black/20 rounded-2xl">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label id="filterTypeLabel" className="block text-xs font-medium text-slate-500 dark:text-neutral-400 mb-1">Tipe Transaksi</label>
                                <div className="relative">
                                    <select
                                        aria-labelledby="filterTypeLabel"
                                        value={filterType}
                                        onChange={(e) => onFilterTypeChange(e.target.value as 'all' | TransactionType)}
                                        className={`${inputClass} w-full appearance-none`}
                                    >
                                        <option value="all">Semua Tipe</option>
                                        <option value={TransactionType.IN}>Masuk</option>
                                        <option value={TransactionType.OUT}>Keluar</option>
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-neutral-400">
                                        <ChevronDownIcon className="h-5 w-5" />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label id="startDateLabel" className="block text-xs font-medium text-slate-500 dark:text-neutral-400 mb-1">Tanggal Mulai</label>
                                <DatePicker
                                    value={startDate}
                                    onChange={onStartDateChange}
                                    placeholder="Pilih tanggal..."
                                />
                            </div>
                            <div>
                                <label id="endDateLabel" className="block text-xs font-medium text-slate-500 dark:text-neutral-400 mb-1">Tanggal Akhir</label>
                                <DatePicker
                                    value={endDate}
                                    onChange={onEndDateChange}
                                    placeholder="Pilih tanggal..."
                                />
                            </div>
                        </div>
                        {(hasActiveFilters || searchTerm) && (
                             <div className="mt-4 flex justify-end">
                                <button
                                    onClick={onClearFilters}
                                    className="px-4 py-2 text-xs font-semibold rounded-full bg-slate-200 text-slate-700 dark:bg-neutral-700 dark:text-neutral-200 hover:bg-slate-300 dark:hover:bg-neutral-600 transition-colors"
                                >
                                    Reset Filter
                                </button>
                             </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TransactionFilterControls;