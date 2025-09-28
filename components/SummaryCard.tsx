
import React from 'react';

interface SummaryCardProps {
    title: string;
    value: string;
    icon: React.ReactNode;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, icon }) => (
    <div className="bg-[#2A282F] p-4 rounded-3xl flex items-center space-x-4">
        <div className="bg-indigo-400/10 text-indigo-200 p-3 rounded-full">{icon}</div>
        <div>
            <p className="text-sm text-[#CAC4D0]">{title}</p>
            <p className="text-xl font-bold text-white">{value}</p>
        </div>
    </div>
);

export default SummaryCard;
