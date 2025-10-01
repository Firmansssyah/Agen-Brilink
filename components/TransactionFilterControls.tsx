import React, { useState } from 'react';
import { TransactionType } from '../types';
import { SearchIcon, FilterIcon, CloseIcon, ChevronDownIcon } from './icons/Icons';
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
    const [showFilters, setShowFilters] = useState(false);
    
    const hasActiveFilters = filterType !== 'all' || startDate !== '' || endDate !== '';

    const handleClear = () => {
        onClearFilters();
        setShowFilters(false);
    }

    const inputClass = "w-full bg-slate-100 dark:bg-[#3C3A42] border border-transparent focus:border-blue-400 focus:ring-1 focus:ring-blue-400 rounded-full px-4 py-2 text-sm text-slate-800 dark:text-white transition outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500";

    return (
        <div className="px-2 pb-4 space-y-3">
            <div className="flex flex-col sm:flex-row items-center gap-3">
                {/* Search Bar */}
                <div className="relative flex-grow w-full">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                        <SearchIcon className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Cari deskripsi, pelanggan, atau jumlah..."
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className={`${inputClass} w-full pl-11 pr-10`}
                    />
                     {searchTerm && (
                        <button onClick={() => onSearchChange('')} className="absolute inset-y-0 right-0 flex items-center pr-4" aria-label="Clear search">
                            <CloseIcon className="h-5 w-5 text-slate-400 hover:text-slate-600 dark:hover:text-white" />
                        </button>
                    )}
                </div>

                {/* Filter Buttons */}
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex flex-grow sm:flex-grow-0 justify-center items-center gap-2 px-4 py-2 text-sm font-semibold rounded-full transition-colors ${showFilters || hasActiveFilters ? 'bg-blue-100 text-blue-700 dark:bg-blue-400/20 dark:text-blue-200' : 'bg-slate-100 text-slate-600 dark:bg-[#3C3A42] dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'}`}
                        aria-expanded={showFilters}
                    >
                        <FilterIcon className="h-4 w-4"/>
                        <span>Filter</span>
                         {hasActiveFilters && !showFilters && <span className="h-2 w-2 rounded-full bg-blue-400"></span>}
                    </button>
                    {(hasActiveFilters || searchTerm) && (
                        <button
                            onClick={handleClear}
                            className="px-4 py-2 text-sm font-semibold rounded-full bg-slate-100 text-slate-600 dark:bg-[#3C3A42] dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                        >
                            Reset
                        </button>
                    )}
                </div>
            </div>

            {/* Collapsible Filter Section */}
            {showFilters && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-100/50 dark:bg-black/20 rounded-xl animate-fade-in">
                    <div>
                        <label id="filterTypeLabel" className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Tipe Transaksi</label>
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
                             <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                                <ChevronDownIcon className="h-5 w-5" />
                            </div>
                        </div>
                    </div>
                    <div>
                        <label id="startDateLabel" className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Tanggal Mulai</label>
                         <DatePicker
                            value={startDate}
                            onChange={onStartDateChange}
                            placeholder="Pilih tanggal..."
                        />
                    </div>
                     <div>
                        <label id="endDateLabel" className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Tanggal Akhir</label>
                         <DatePicker
                            value={endDate}
                            onChange={onEndDateChange}
                            placeholder="Pilih tanggal..."
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default TransactionFilterControls;