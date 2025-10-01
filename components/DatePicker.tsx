import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

interface DatePickerProps {
    value: string;
    onChange: (date: string) => void;
    placeholder?: string;
}

const DatePicker: React.FC<DatePickerProps> = ({ value, onChange, placeholder }) => {
    const [isOpen, setIsOpen] = useState(false);
    // FIX: Parse date string as local time to avoid timezone issues (e.g., '2023-01-01' being parsed as UTC midnight).
    const initialDate = value && !isNaN(new Date(value + 'T00:00:00').getTime()) ? new Date(value + 'T00:00:00') : new Date();
    const [viewDate, setViewDate] = useState(initialDate);
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        // FIX: Parse date string as local time to avoid timezone issues.
        const newDate = value && !isNaN(new Date(value + 'T00:00:00').getTime()) ? new Date(value + 'T00:00:00') : new Date();
        setViewDate(newDate);
    }, [value]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen]);

    const handleDateSelect = (day: Date) => {
        // Format to YYYY-MM-DD
        const year = day.getFullYear();
        const month = String(day.getMonth() + 1).padStart(2, '0');
        const date = String(day.getDate()).padStart(2, '0');
        const isoDate = `${year}-${month}-${date}`;
        onChange(isoDate);
        setIsOpen(false);
    };
    
    const formatDisplayDate = (dateString: string) => {
        if (!dateString || isNaN(new Date(dateString).getTime())) return '';
        // Date string is YYYY-MM-DD, need to adjust for timezone issues when creating date
        const [year, month, day] = dateString.split('-').map(Number);
        const date = new Date(year, month - 1, day);
        return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const CalendarPortal = () => {
        const calendarRef = useRef<HTMLDivElement>(null);
        const [position, setPosition] = useState({ top: 0, left: 0 });

        useEffect(() => {
            if (inputRef.current) {
                const rect = inputRef.current.getBoundingClientRect();
                setPosition({
                    top: rect.bottom + window.scrollY,
                    left: rect.left + window.scrollX
                });
            }
        }, []);

        useEffect(() => {
            const handleClickOutside = (event: MouseEvent) => {
                if (calendarRef.current && !calendarRef.current.contains(event.target as Node) && !inputRef.current?.contains(event.target as Node)) {
                    setIsOpen(false);
                }
            };

            document.addEventListener('mousedown', handleClickOutside);
            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }, []);
        
        const daysOfWeek = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

        const generateCalendarDays = () => {
            const year = viewDate.getFullYear();
            const month = viewDate.getMonth();
            const firstDayOfMonth = new Date(year, month, 1).getDay();
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            
            const days: (Date | null)[] = [];
            // Pad start
            for (let i = 0; i < firstDayOfMonth; i++) {
                days.push(null);
            }
            // Current month days
            for (let i = 1; i <= daysInMonth; i++) {
                days.push(new Date(year, month, i));
            }
            return days;
        };

        const calendarDays = generateCalendarDays();
        // FIX: Parse date string as local time to avoid timezone issues.
        const selectedDate = value && !isNaN(new Date(value + 'T00:00:00').getTime()) ? new Date(value + 'T00:00:00') : null;
        if (selectedDate) selectedDate.setHours(0, 0, 0, 0);
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const handleMonthChange = (offset: number) => {
            setViewDate(prev => {
                const newDate = new Date(prev);
                newDate.setMonth(prev.getMonth() + offset);
                return newDate;
            });
        };

        return createPortal(
            <div
                ref={calendarRef}
                style={{ position: 'absolute', top: `${position.top + 8}px`, left: `${position.left}px` }}
                className="z-[100] bg-white dark:bg-neutral-800 border border-slate-300 dark:border-neutral-600 rounded-xl shadow-lg p-4 w-72 animate-fade-in"
                role="dialog"
                aria-modal="true"
                aria-label="Kalender"
            >
                <div className="flex justify-between items-center mb-4">
                    <button type="button" onClick={() => handleMonthChange(-1)} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-600 dark:text-neutral-300" aria-label="Bulan sebelumnya">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <span className="font-semibold text-slate-800 dark:text-white" aria-live="polite">
                        {viewDate.toLocaleString('id-ID', { month: 'long', year: 'numeric' })}
                    </span>
                    <button type="button" onClick={() => handleMonthChange(1)} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-600 dark:text-neutral-300" aria-label="Bulan berikutnya">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </button>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-xs text-slate-500 dark:text-neutral-400 mb-2" aria-hidden="true">
                    {daysOfWeek.map(day => <div key={day}>{day}</div>)}
                </div>
                <div className="grid grid-cols-7 gap-1" role="grid">
                    {calendarDays.map((day, index) => {
                        if (!day) return <div key={`empty-${index}`} role="gridcell" />;
                        
                        const isSelected = selectedDate && day.getTime() === selectedDate.getTime();
                        const isToday = day.getTime() === today.getTime();

                        let dayClasses = "h-8 w-8 flex items-center justify-center rounded-full text-sm transition-colors cursor-pointer ";
                        if (isSelected) {
                            dayClasses += "bg-blue-500 text-white font-bold";
                        } else if (isToday) {
                            dayClasses += "bg-blue-100 text-blue-700 dark:bg-blue-400/20 dark:text-blue-200";
                        } else {
                            dayClasses += "text-slate-700 dark:text-neutral-200 hover:bg-slate-100 dark:hover:bg-white/10";
                        }
                        
                        return (
                            <button
                                type="button"
                                key={day.toISOString()}
                                onClick={() => handleDateSelect(day)}
                                className={dayClasses}
                                role="gridcell"
                                aria-selected={isSelected}
                                aria-label={day.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            >
                                {day.getDate()}
                            </button>
                        );
                    })}
                </div>
            </div>,
            document.body
        );
    };

    return (
        <div className="relative w-full" ref={containerRef}>
             <div className="relative">
                <input
                    ref={inputRef}
                    type="text"
                    readOnly
                    value={formatDisplayDate(value)}
                    onClick={() => setIsOpen(!isOpen)}
                    placeholder={placeholder}
                    className="w-full bg-slate-100 dark:bg-neutral-700 border border-transparent focus:border-blue-400 focus:ring-1 focus:ring-blue-400 rounded-full px-4 py-2 text-sm text-slate-800 dark:text-white transition outline-none cursor-pointer pr-10 placeholder:text-slate-400 dark:placeholder:text-neutral-500"
                    aria-haspopup="dialog"
                    aria-expanded={isOpen}
                />
                 <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-neutral-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
            </div>

            {isOpen && <CalendarPortal />}
        </div>
    );
};

export default DatePicker;