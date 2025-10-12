import React, { useState, useEffect } from 'react';

interface ClockCardProps {
    isCollapsed: boolean;
}

const ClockCard: React.FC<ClockCardProps> = ({ isCollapsed }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    useEffect(() => {
        const timerId = setInterval(() => {
            setCurrentDate(new Date());
        }, 1000);

        return () => {
            clearInterval(timerId);
        };
    }, []);

    const hours = String(currentDate.getHours()).padStart(2, '0');
    const minutes = String(currentDate.getMinutes()).padStart(2, '0');
    
    // Expanded View (for mobile and wide sidebar)
    const expandedDateOptions: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long' };
    const expandedFormattedDate = new Intl.DateTimeFormat('id-ID', expandedDateOptions).format(currentDate);
    const expandedView = (
        <div className="p-3 bg-slate-100/70 dark:bg-black/20 rounded-xl">
            <div className="flex justify-between items-center">
                <p className="text-sm text-slate-500 dark:text-neutral-400">
                    {expandedFormattedDate}
                </p>
                <p className="text-2xl font-semibold text-slate-800 dark:text-white">
                    {hours}:{minutes}
                </p>
            </div>
        </div>
    );

    // Collapsed View (for narrow sidebar)
    const collapsedDateOptions: Intl.DateTimeFormatOptions = { weekday: 'short', day: 'numeric' };
    const collapsedFormattedDate = new Intl.DateTimeFormat('id-ID', collapsedDateOptions).format(currentDate);
    const collapsedView = (
        <div className="flex flex-col items-center justify-center p-1">
            <p className="text-2xl font-bold text-slate-800 dark:text-white leading-none">
                {hours}:{minutes}
            </p>
            <p className="text-[10px] text-slate-500 dark:text-neutral-400 mt-1">
                {collapsedFormattedDate}
            </p>
        </div>
    );

    return (
        <>
            {/* Mobile view is always expanded */}
            <div className="md:hidden">
                {expandedView}
            </div>
            {/* Desktop view is conditional */}
            <div className="hidden md:block">
                {isCollapsed ? collapsedView : expandedView}
            </div>
        </>
    );
};

export default ClockCard;