import React, { useState, useEffect, useRef } from 'react';
import { Transaction, Wallet, Font } from '../types';
import { useToastContext } from '../contexts/ToastContext';

// Deklarasi untuk memberitahu TypeScript bahwa html2canvas ada di window object
declare const html2canvas: any;

interface InvoiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    transaction: Transaction | null;
    wallets: Wallet[];
    formatRupiah: (amount: number) => string;
    invoiceAppName: string;
    invoiceAddress: string;
    invoicePhone: string;
    invoiceFooter: string;
    invoiceFont: Font;
}

const InvoiceModal: React.FC<InvoiceModalProps> = ({ 
    isOpen, 
    onClose, 
    transaction, 
    wallets, 
    formatRupiah,
    invoiceAppName,
    invoiceAddress,
    invoicePhone,
    invoiceFooter,
    invoiceFont
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [copyButtonText, setCopyButtonText] = useState('Salin sbg. Gambar');
    const invoiceRef = useRef<HTMLDivElement>(null);
    const { addToast } = useToastContext();


    useEffect(() => {
        setIsVisible(isOpen);
        if (isOpen) {
            setCopyButtonText('Salin sbg. Gambar');
        }
    }, [isOpen]);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onClose, 300);
    };

    const handleCopyAsImage = () => {
        if (!invoiceRef.current) return;
        setCopyButtonText('Menyalin...');

        html2canvas(invoiceRef.current, { 
            backgroundColor: '#ffffff', // Explicitly set white background for capture
            scale: 2 // Higher resolution
        }).then((canvas: HTMLCanvasElement) => {
            canvas.toBlob((blob) => {
                if (blob) {
                    const item = new ClipboardItem({ 'image/png': blob });
                    navigator.clipboard.write([item]).then(() => {
                        setCopyButtonText('Tersalin!');
                        addToast('Struk gambar berhasil disalin', 'success');
                        handleClose(); // Tutup segera setelah berhasil
                    }).catch(err => {
                        console.error('Gagal menyalin gambar ke clipboard:', err);
                        setCopyButtonText('Gagal');
                        addToast('Gagal menyalin struk', 'error');
                        setTimeout(() => setCopyButtonText('Salin sbg. Gambar'), 2000);
                    });
                }
            }, 'image/png');
        }).catch((err: any) => {
             console.error('Gagal membuat gambar dari struk:', err);
             setCopyButtonText('Gagal');
             addToast('Gagal membuat gambar struk', 'error');
             setTimeout(() => setCopyButtonText('Salin sbg. Gambar'), 2000);
        });
    };
    
    // Process footer text for HTML rendering
    const processFooter = (text: string) => {
        return text
            .replace(/<b>/g, '<strong style="font-weight: 700;">').replace(/<\/b>/g, '</strong>')
            .replace(/<i>/g, '<em style="font-style: italic;">').replace(/<\/i>/g, '</em>')
            .replace(/<light>/g, '<span style="font-weight: 300;">').replace(/<\/light>/g, '</span>')
            .replace(/\n/g, '<br />');
    };

    if (!isOpen || !transaction) return null;

    const wallet = wallets.find(w => w.id === transaction.wallet);
    const total = transaction.amount + transaction.margin;

    const formattedDate = new Date(transaction.date).toLocaleString('id-ID', {
        day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
    
    const processedFooter = processFooter(invoiceFooter);

    return (
        <div
            className="fixed inset-0 z-50 flex justify-center items-center p-4 transition-opacity duration-300 ease-in-out bg-black/40 backdrop-blur-sm"
            onClick={handleClose}
        >
            <div
                id="invoice-modal-content"
                className={`bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl w-full max-w-sm transform transition-all duration-300 ease-in-out flex flex-col max-h-[90vh] ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div ref={invoiceRef} className={`bg-white rounded-t-2xl text-black ${invoiceFont}`}>
                    <div className="p-6 border-b border-dashed border-slate-300 text-center">
                        <h2 className="text-lg font-semibold">{invoiceAppName}</h2>
                        {invoiceAddress && <p className="text-xs text-slate-500 mt-1">{invoiceAddress}</p>}
                        {invoicePhone && <p className="text-xs text-slate-500">{invoicePhone}</p>}
                        <p className="text-sm text-slate-500 mt-2">Bukti Transaksi</p>
                    </div>

                    <div className="p-6 flex-grow">
                        <div className="text-center mb-6">
                            <p className="text-emerald-500 font-bold">TRANSAKSI BERHASIL</p>
                            <p className="text-xs text-slate-400">{formattedDate}</p>
                        </div>

                        <div className="space-y-3 text-sm border-t border-b border-dashed border-slate-300 py-4">
                            <div className="flex justify-between">
                                <span className="text-slate-500">Jenis Transaksi</span>
                                <span className="font-medium text-slate-700">{transaction.description}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Pelanggan</span>
                                <span className="font-medium text-slate-700">{transaction.customer}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Dompet</span>
                                <span className="font-medium text-slate-700">{wallet?.name || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">ID Transaksi</span>
                                <span className="font-mono text-xs text-slate-700">{transaction.id.substring(0, 8)}</span>
                            </div>
                        </div>

                        <div className="space-y-3 text-sm py-4">
                            <div className="flex justify-between">
                                <span className="text-slate-500">Jumlah</span>
                                <span className="font-medium text-slate-700">{formatRupiah(transaction.amount)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Biaya Admin</span>
                                <span className="font-medium text-slate-700">{formatRupiah(transaction.margin)}</span>
                            </div>
                        </div>
                        <div className="flex justify-between border-t border-dashed border-slate-300 pt-4">
                            <span className="font-bold text-slate-800">TOTAL</span>
                            <span className="font-bold text-lg text-slate-800">{formatRupiah(total)}</span>
                        </div>

                         <div 
                            className="text-center text-xs text-slate-500 mt-6 leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: processedFooter }}
                        />
                    </div>
                </div>

                <div id="invoice-modal-actions" className="p-4 flex-shrink-0 flex gap-3 border-t border-slate-200 dark:border-neutral-700">
                    <button onClick={handleClose} className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-slate-700 dark:text-neutral-200 font-semibold py-3 rounded-full text-sm transition-colors">
                        Selesai
                    </button>
                    <button onClick={handleCopyAsImage} className="w-full bg-blue-500 hover:bg-blue-600 text-white dark:bg-blue-400 dark:hover:bg-blue-500 dark:text-slate-900 font-semibold py-3 rounded-full text-sm transition-colors">
                        {copyButtonText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InvoiceModal;