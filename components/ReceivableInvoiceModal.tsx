import React, { useState, useEffect, useRef } from 'react';
import { Transaction } from '../types';
import { useToastContext } from '../contexts/ToastContext';
import { CloseIcon, ShareIcon } from './icons/Icons';

// Declare html2canvas to avoid TypeScript errors
declare const html2canvas: any;

interface ReceivableInvoiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    customerName: string | null;
    transactions: Transaction[];
    invoiceAppName: string;
    invoiceAddress: string;
    invoicePhone: string;
}

const ReceivableInvoiceModal: React.FC<ReceivableInvoiceModalProps> = ({
    isOpen,
    onClose,
    customerName,
    transactions,
    invoiceAppName,
    invoiceAddress,
    invoicePhone
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const invoiceRef = useRef<HTMLDivElement>(null);
    const { addToast } = useToastContext();
    const [buttonState, setButtonState] = useState<'idle' | 'processing'>('idle');

    const customerTransactions = transactions.filter(t => t.customer === customerName && t.isPiutang);
    const totalPiutang = customerTransactions.reduce((sum, t) => sum + t.amount + t.margin, 0);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            setButtonState('idle');
        } else {
            setIsVisible(false);
        }
    }, [isOpen]);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onClose, 300);
    };

    const formatRupiah = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const handleShare = async () => {
        if (!invoiceRef.current) return;
        setButtonState('processing');

        try {
            const canvas = await html2canvas(invoiceRef.current, {
                backgroundColor: '#ffffff',
                scale: 2,
            });

            const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
            if (!blob) throw new Error("Could not create blob from canvas");

            const file = new File([blob], `tagihan-${customerName?.replace(/\s/g, '_')}.png`, { type: 'image/png' });

            if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: `Tagihan Piutang - ${customerName}`,
                    text: `Berikut adalah rincian tagihan untuk ${customerName}.`,
                });
                addToast('Tagihan berhasil dibagikan', 'success');
                handleClose();
            } else if (typeof ClipboardItem !== 'undefined' && navigator.clipboard?.write) {
                // @ts-ignore
                const item = new ClipboardItem({ 'image/png': blob });
                await navigator.clipboard.write([item]);
                addToast('Tagihan berhasil disalin ke clipboard', 'success');
                handleClose();
            } else {
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = `tagihan-${customerName?.replace(/\s/g, '_')}.png`;
                link.click();
                URL.revokeObjectURL(link.href);
                addToast('Tagihan diunduh', 'success');
                handleClose();
            }
        } catch (error) {
            if ((error as DOMException).name === 'AbortError') {
                // User cancelled the share dialog
                setButtonState('idle');
                return;
            }
            console.error("Gagal membagikan tagihan:", error);
            addToast('Gagal membagikan tagihan.', 'error');
            setButtonState('idle');
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className={`fixed inset-0 z-50 flex justify-center items-center p-4 transition-opacity duration-300 ease-in-out bg-black/40 backdrop-blur-sm ${isVisible ? 'opacity-100' : 'opacity-0'}`}
            onClick={handleClose}
        >
            <div
                className={`bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl w-full max-w-sm transform transition-all duration-300 ease-in-out flex flex-col max-h-[90vh] ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div ref={invoiceRef} className="bg-white rounded-t-2xl text-black font-mono">
                    <div className="p-4 border-b border-dashed border-slate-300 text-center">
                        <h2 className="text-base font-semibold">{invoiceAppName}</h2>
                        <p className="text-xs text-slate-500 mt-1">{invoiceAddress}</p>
                        <p className="text-xs text-slate-500">{invoicePhone}</p>
                        <p className="text-sm text-slate-500 mt-2">TAGIHAN PIUTANG</p>
                    </div>

                    <div className="p-4">
                        <div className="text-xs space-y-1 mb-3">
                            <div className="flex justify-between">
                                <span className="text-slate-500">Tanggal:</span>
                                <span>{new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Pelanggan:</span>
                                <span className="font-semibold">{customerName}</span>
                            </div>
                        </div>

                        <div className="border-t border-b border-dashed border-slate-300 py-2">
                            <table className="w-full text-xs">
                                <thead>
                                    <tr className="border-b border-dashed border-slate-300">
                                        <th className="py-1 text-left font-normal text-slate-500">Tanggal</th>
                                        <th className="py-1 text-left font-normal text-slate-500">Keterangan</th>
                                        <th className="py-1 text-right font-normal text-slate-500">Jumlah</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {customerTransactions.map(t => (
                                        <tr key={t.id}>
                                            <td className="py-1 align-top">{new Date(t.date).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit' })}</td>
                                            <td className="py-1 align-top">{t.description}</td>
                                            <td className="py-1 align-top text-right">{formatRupiah(t.amount + t.margin)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex justify-between mt-3">
                            <span className="font-bold text-sm">TOTAL TAGIHAN</span>
                            <span className="font-bold text-sm">{formatRupiah(totalPiutang)}</span>
                        </div>
                         <div className="text-center text-xs text-slate-500 mt-4 leading-relaxed">
                            Mohon untuk segera melunasi tagihan ini. <br /> Terima kasih.
                        </div>
                    </div>
                </div>

                <div className="p-4 flex gap-3 border-t border-slate-200 dark:border-neutral-700">
                    <button onClick={handleClose} className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-slate-700 dark:text-neutral-200 font-semibold py-3 rounded-full text-sm transition-colors">
                        Tutup
                    </button>
                    <button
                        onClick={handleShare}
                        disabled={buttonState === 'processing'}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white dark:bg-blue-400 dark:hover:bg-blue-500 dark:text-slate-900 font-semibold py-3 rounded-full text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                        <ShareIcon className="h-4 w-4" />
                        <span>{buttonState === 'processing' ? 'Memproses...' : 'Bagikan Tagihan'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReceivableInvoiceModal;