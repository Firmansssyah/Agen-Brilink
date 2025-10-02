

export enum TransactionType {
    IN = 'IN',
    OUT = 'OUT',
}

export interface Wallet {
    id: string; // Changed from WalletId enum to string
    name: string;
    balance: number;
    icon: string;
}

export interface Transaction {
    id: string;
    date: string;
    description: string;
    customer: string;
    type: TransactionType;
    amount: number;
    margin: number;
    wallet: string; // Changed from WalletId enum to string
    isPiutang: boolean;
    marginType?: 'dalam' | 'luar';
    isInternalTransfer?: boolean;
    isDeleting?: boolean;
    notes?: string;
}

export type Page = 'dashboard' | 'management' | 'customers' | 'reports' | 'settings';
export type SortKey = 'date' | 'description' | 'customer' | 'amount' | 'margin';
export type SortDirection = 'asc' | 'desc';