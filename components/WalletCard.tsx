
import React from 'react';
import { Wallet } from '../types';
import WalletIconComponent from './WalletIconComponent';

interface WalletCardProps {
    wallet: Wallet;
    formatRupiah: (amount: number) => string;
}

const WalletCard: React.FC<WalletCardProps> = ({ wallet, formatRupiah }) => {
    return (
        <div className="bg-slate-800/50 p-4 rounded-xl shadow-lg border border-slate-700/50 flex flex-col justify-between hover:bg-slate-700/50 transition-colors duration-300">
            <div className="flex items-center space-x-3 mb-3">
                <div className="bg-slate-700 p-2 rounded-full flex items-center justify-center">
                    <WalletIconComponent 
                        walletId={wallet.id} 
                        iconUrl={wallet.icon}
                        className="h-5 w-5 text-white" 
                        altText={`${wallet.name} logo`} 
                    />
                </div>
                <h3 className="text-sm font-semibold text-white">{wallet.name}</h3>
            </div>
            <div>
                <p className="text-lg font-bold text-emerald-400 tracking-tight">{formatRupiah(wallet.balance)}</p>
                <p className="text-xs text-slate-400">Saldo Saat Ini</p>
            </div>
        </div>
    );
};

export default WalletCard;
