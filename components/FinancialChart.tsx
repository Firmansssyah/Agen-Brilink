
import React, { useMemo, useState } from 'react';
import { Transaction } from '../types';

// Data structure for monthly summaries
interface MonthlyData {
    month: string;
    year: number;
    totalMargin: number;
    transactionCount: number;
}

// Props for the individual charts
interface ChartComponentProps {
    chartData: MonthlyData[];
    formatRupiah: (amount: number) => string;
}

// --- Margin Trend Chart (Line Chart) ---
const MarginTrendChart: React.FC<ChartComponentProps> = ({ chartData, formatRupiah }) => {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    const width = 800;
    const height = 300;
    const margin = { top: 20, right: 20, bottom: 40, left: 70 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const maxMargin = Math.max(...chartData.map(d => d.totalMargin), 0);
    const yMaxMargin = maxMargin * 1.2 || 100000;

    const xScale = (index: number) => (innerWidth / (chartData.length - 1)) * index;
    const yScaleMargin = (value: number) => innerHeight - (value / yMaxMargin) * innerHeight;
    
    const linePath = chartData
        .map((d, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScaleMargin(d.totalMargin)}`)
        .join(' ');

    const formatYAxisLabel = (value: number) => {
        if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(0)} Jt`;
        if (value >= 1_000) return `${(value / 1_000).toFixed(0)} Rb`;
        return value.toString();
    };
    
    const yAxisTicksMargin = useMemo(() => {
        const ticks = 5;
        const tickValues = [];
        for (let i = 0; i <= ticks; i++) {
            tickValues.push((yMaxMargin / ticks) * i);
        }
        return tickValues;
    }, [yMaxMargin]);

    return (
        <div className="bg-white dark:bg-[#2A282F] p-4 sm:p-6 rounded-3xl animate-fade-in shadow-lg shadow-slate-200/50 dark:shadow-none">
            <h3 className="text-lg font-medium text-slate-800 dark:text-white mb-4">Tren Margin (12 Bulan)</h3>
            <div className="w-full overflow-x-auto">
                <svg viewBox={`0 0 ${width} ${height}`} className="min-w-[600px]">
                    <g transform={`translate(${margin.left}, ${margin.top})`}>
                        {yAxisTicksMargin.map(tickValue => (
                            <line key={`grid-${tickValue}`} x1={0} x2={innerWidth} y1={yScaleMargin(tickValue)} y2={yScaleMargin(tickValue)}
                                stroke="currentColor" strokeWidth="0.5" strokeDasharray="3,3" className="text-slate-200 dark:text-slate-700" />
                        ))}
                        {yAxisTicksMargin.map(tickValue => (
                            <text key={`margin-label-${tickValue}`} x={-10} y={yScaleMargin(tickValue)} textAnchor="end"
                                alignmentBaseline="middle" fontSize="10" className="fill-emerald-600 dark:fill-emerald-400">
                                {formatYAxisLabel(tickValue)}
                            </text>
                        ))}
                        {chartData.map((d, i) => (
                            <text key={d.month} x={xScale(i)} y={innerHeight + 20} textAnchor="middle"
                                fontSize="10" fill="currentColor" className="text-slate-500 dark:text-slate-400 font-medium">
                                {d.month}
                            </text>
                        ))}
                        <path d={linePath} fill="none" stroke="#4ade80" strokeWidth="2" />
                        
                        <g onMouseLeave={() => setHoveredIndex(null)}>
                            {chartData.map((d, i) => (
                                <rect key={i} x={xScale(i) - (innerWidth / (chartData.length -1) / 2)} y={0}
                                    width={innerWidth / (chartData.length-1)} height={innerHeight} fill="transparent"
                                    onMouseMove={() => setHoveredIndex(i)} />
                            ))}
                        </g>

                        {hoveredIndex !== null && (() => {
                            const d = chartData[hoveredIndex];
                            const x = xScale(hoveredIndex);
                            const tooltipWidth = 160;
                            const tooltipHeight = 45;
                            const tooltipX = x + 15 > innerWidth - tooltipWidth ? x - 15 - tooltipWidth : x + 15;
                            return (
                                <g>
                                    <line x1={x} y1={0} x2={x} y2={innerHeight} stroke="#958F99" strokeWidth="1" strokeDasharray="3,3" />
                                    <circle cx={x} cy={yScaleMargin(d.totalMargin)} r="4" fill="#4ade80" stroke="currentColor" strokeWidth="2" className="stroke-white dark:stroke-[#1C1B1F]" />
                                    <g transform={`translate(${tooltipX}, ${margin.top})`}>
                                        <rect width={tooltipWidth} height={tooltipHeight} rx="8" className="fill-white dark:fill-[#1C1B1F] stroke-slate-200 dark:stroke-[#4A4458]" strokeWidth="1" />
                                        <text x="10" y="20" fontSize="12" fontWeight="bold" className="fill-slate-800 dark:fill-[#E6E1E5]">{d.month} {d.year}</text>
                                        <text x="10" y="38" fontSize="11" className="fill-slate-600 dark:fill-[#CAC4D0]">
                                            <tspan className="fill-emerald-600 dark:fill-emerald-400">Margin:</tspan> {formatRupiah(d.totalMargin)}
                                        </text>
                                    </g>
                                </g>
                            );
                        })()}
                    </g>
                </svg>
            </div>
        </div>
    );
};

// --- Transaction Count Chart (Bar Chart) ---
const TransactionCountChart: React.FC<Pick<ChartComponentProps, 'chartData'>> = ({ chartData }) => {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    const width = 800;
    const height = 300;
    const margin = { top: 20, right: 40, bottom: 40, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const maxCount = Math.max(...chartData.map(d => d.transactionCount), 0);
    const yMaxCount = Math.ceil(maxCount * 1.2 / 5) * 5 || 10;
    
    const bandWidth = innerWidth / chartData.length;
    const barWidth = bandWidth * 0.6;
    
    const xScale = (index: number) => index * bandWidth;
    const yScaleCount = (value: number) => innerHeight - (value / yMaxCount) * innerHeight;

    const yAxisTicksCount = useMemo(() => {
        const numTicks = Math.min(5, Math.ceil(yMaxCount));
        if (yMaxCount === 0) return [0];
        const ticks = [];
        for (let i = 0; i <= numTicks; i++) {
            ticks.push(Math.round((yMaxCount / numTicks) * i));
        }
        return [...new Set(ticks)];
    }, [yMaxCount]);

    return (
        <div className="bg-white dark:bg-[#2A282F] p-4 sm:p-6 rounded-3xl animate-fade-in shadow-lg shadow-slate-200/50 dark:shadow-none">
            <h3 className="text-lg font-medium text-slate-800 dark:text-white mb-4">Tren Jumlah Transaksi (12 Bulan)</h3>
            <div className="w-full overflow-x-auto">
                 <svg viewBox={`0 0 ${width} ${height}`} className="min-w-[600px]">
                    <g transform={`translate(${margin.left}, ${margin.top})`}>
                        {yAxisTicksCount.map(tickValue => (
                            <line key={`grid-${tickValue}`} x1={0} x2={innerWidth} y1={yScaleCount(tickValue)} y2={yScaleCount(tickValue)}
                                stroke="currentColor" strokeWidth="0.5" strokeDasharray="3,3" className="text-slate-200 dark:text-slate-700" />
                        ))}
                        {yAxisTicksCount.map(tickValue => (
                            <text key={`count-label-${tickValue}`} x={-10} y={yScaleCount(tickValue)} textAnchor="end"
                                alignmentBaseline="middle" fontSize="10" className="fill-blue-500 dark:fill-blue-400">
                                {Math.round(tickValue)}
                            </text>
                        ))}
                        {chartData.map((d, i) => (
                            <text key={d.month} x={xScale(i) + bandWidth / 2} y={innerHeight + 20} textAnchor="middle"
                                fontSize="10" fill="currentColor" className="text-slate-500 dark:text-slate-400 font-medium">
                                {d.month}
                            </text>
                        ))}
                        
                        {chartData.map((d, i) => (
                            <rect key={i} x={xScale(i) + (bandWidth - barWidth) / 2} y={yScaleCount(d.transactionCount)}
                                width={barWidth} height={innerHeight - yScaleCount(d.transactionCount)} className="fill-blue-500 dark:fill-blue-400 transition-opacity duration-200" opacity={hoveredIndex === null || hoveredIndex === i ? 1 : 0.5} />
                        ))}
                        
                        <g onMouseLeave={() => setHoveredIndex(null)}>
                            {chartData.map((d, i) => (
                                <rect key={i} x={xScale(i)} y={0} width={bandWidth} height={innerHeight}
                                    fill="transparent" onMouseMove={() => setHoveredIndex(i)} />
                            ))}
                        </g>

                        {hoveredIndex !== null && (() => {
                            const d = chartData[hoveredIndex];
                            const x = xScale(hoveredIndex) + bandWidth / 2;
                            const tooltipWidth = 160;
                            const tooltipHeight = 45;
                            const tooltipX = x + 15 > innerWidth - tooltipWidth ? x - 15 - tooltipWidth : x + 15;
                            return (
                                <g>
                                     <line x1={x} y1={0} x2={x} y2={innerHeight} stroke="#958F99" strokeWidth="1" strokeDasharray="3,3" />
                                    <g transform={`translate(${tooltipX}, ${margin.top})`}>
                                        <rect width={tooltipWidth} height={tooltipHeight} rx="8" className="fill-white dark:fill-[#1C1B1F] stroke-slate-200 dark:stroke-[#4A4458]" strokeWidth="1" />
                                        <text x="10" y="20" fontSize="12" fontWeight="bold" className="fill-slate-800 dark:fill-[#E6E1E5]">{d.month} {d.year}</text>
                                        <text x="10" y="38" fontSize="11" className="fill-slate-600 dark:fill-[#CAC4D0]">
                                            <tspan className="fill-blue-500 dark:fill-blue-400">Jml. Transaksi:</tspan> {d.transactionCount}
                                        </text>
                                    </g>
                                </g>
                            );
                        })()}
                    </g>
                 </svg>
            </div>
        </div>
    );
};


// --- Main Wrapper Component ---
interface FinancialChartProps {
    transactions: Transaction[];
    formatRupiah: (amount: number) => string;
}

const FinancialChart: React.FC<FinancialChartProps> = ({ transactions, formatRupiah }) => {
    const chartData = useMemo<MonthlyData[]>(() => {
        const summaryMap = new Map<string, { totalMargin: number; transactionCount: number }>();
        const today = new Date();

        // Initialize last 12 months
        for (let i = 11; i >= 0; i--) {
            const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const year = date.getFullYear();
            const month = date.getMonth();
            const key = `${year}-${String(month).padStart(2, '0')}`;
            summaryMap.set(key, { totalMargin: 0, transactionCount: 0 });
        }
        
        const twelveMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 11, 1);
        twelveMonthsAgo.setHours(0,0,0,0);

        transactions.forEach(t => {
            const transactionDate = new Date(t.date);
            if (transactionDate >= twelveMonthsAgo) {
                const year = transactionDate.getFullYear();
                const month = transactionDate.getMonth();
                const key = `${year}-${String(month).padStart(2, '0')}`;
                
                if (summaryMap.has(key)) {
                    const entry = summaryMap.get(key)!;
                    entry.totalMargin += t.margin;
                    entry.transactionCount++;
                    summaryMap.set(key, entry);
                }
            }
        });

        return Array.from(summaryMap.entries()).map(([key, data]) => {
            const [year, monthIndex] = key.split('-').map(Number);
            const monthName = new Date(year, monthIndex).toLocaleString('id-ID', { month: 'short' });
            return {
                month: monthName,
                year: year,
                ...data
            };
        });

    }, [transactions]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <MarginTrendChart chartData={chartData} formatRupiah={formatRupiah} />
            <TransactionCountChart chartData={chartData} />
        </div>
    );
};

export default FinancialChart;