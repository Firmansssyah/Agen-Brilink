import React, { useState, useEffect, useRef } from 'react';
import { Transaction, Wallet, Font } from '../types';
import { useToastContext } from '../contexts/ToastContext';
import { InfoIcon } from './icons/Icons';

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

type SupportedAction = 'share' | 'copy' | 'download';
type ButtonState = 'idle' | 'processing' | 'success' | 'failed';

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
    const invoiceRef = useRef<HTMLDivElement>(null);
    const { addToast } = useToastContext();
    
    const [supportedAction, setSupportedAction] = useState<SupportedAction>('download');
    const [buttonState, setButtonState] = useState<ButtonState>('idle');
    const [isSecureContext, setIsSecureContext] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            setButtonState('idle'); // Reset button state when modal opens
            
            const secure = window.location.protocol === 'https:';
            setIsSecureContext(secure);

            // Feature detection to determine the best action
            const dummyFile = new File([""], "dummy.png", { type: "image/png" });
            if (secure && navigator.share && navigator.canShare?.({ files: [dummyFile] })) {
                setSupportedAction('share');
            // @ts-ignore
            } else if (typeof ClipboardItem !== 'undefined' && navigator.clipboard?.write) {
                setSupportedAction('copy');
            } else {
                setSupportedAction('download');
            }
        } else {
            setIsVisible(false);
        }
    }, [isOpen]);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onClose, 300);
    };

    const handleActionClick = async () => {
        if (!invoiceRef.current) return;
        setButtonState('processing');

        try {
            const canvas = await html2canvas(invoiceRef.current, {
                backgroundColor: '#ffffff',
                scale: 2,
            });

            if (supportedAction === 'share') {
                const blob = await new Promise<Blob | null>(r => canvas.toBlob(r, 'image/png'));
                if (!blob) throw new Error('Gagal membuat gambar dari struk.');
                
                const file = new File([blob], `struk-${transaction?.id.substring(0, 8)}.png`, { type: 'image/png' });

                await navigator.share({
                    files: [file],
                    title: `Struk Transaksi - ${transaction?.description}`,
                    text: `Berikut adalah struk transaksi ${invoiceAppName}.`,
                });
                addToast('Struk berhasil dibagikan', 'success');
                handleClose();

            } else if (supportedAction === 'copy') {
                const blob = await new Promise<Blob | null>(r => canvas.toBlob(r, 'image/png'));
                if (!blob) throw new Error('Gagal membuat gambar dari struk.');
                
                // @ts-ignore
                const item = new ClipboardItem({ 'image/png': blob });
                await navigator.clipboard.write([item]);
                addToast('Struk berhasil disalin', 'success');
                setButtonState('success');
                setTimeout(handleClose, 1000);

            } else { // 'download' fallback
                const imageUrl = canvas.toDataURL('image/png');
                const link = document.createElement('a');
                link.href = imageUrl;
                link.download = `struk-${transaction?.id.substring(0, 8)}.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                addToast('Gambar struk diunduh', 'success');
                handleClose();
            }

        } catch (error: any) {
            // User cancelled the share dialog
            if (error.name === 'AbortError') {
                setButtonState('idle');
                return;
            }

            console.error('Gagal melakukan aksi struk:', error);
            addToast('Aksi gagal. Coba lagi.', 'error');
            setButtonState('failed');
            setTimeout(() => setButtonState('idle'), 2000);
        }
    };
    
    // Process footer text for HTML rendering
    const processFooter = (text: string) => {
        return text
            .replace(/<b>/g, '<strong style="font-weight: 700;">').replace(/<\/b>/g, '</strong>')
            .replace(/<i>/g, '<em style="font-style: italic;">').replace(/<\/i>/g, '</em>')
            .replace(/<light>/g, '<span style="font-weight: 300;">').replace(/<\/light>/g, '</span>')
            .replace(/\n/g, '<br />');
    };

    const buttonTextMap: Record<SupportedAction, string> = {
        share: 'Bagikan Struk',
        copy: 'Salin sbg. Gambar',
        download: 'Unduh Gambar',
    };
    
    const buttonStateTextMap: Record<ButtonState, string> = {
        idle: buttonTextMap[supportedAction],
        processing: 'Memproses...',
        success: 'Berhasil!',
        failed: 'Gagal',
    };
    
    const actionButtonText = buttonStateTextMap[buttonState];

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

                <div id="invoice-modal-actions" className="p-4 flex flex-col gap-3 border-t border-slate-200 dark:border-neutral-700">
                    {!isSecureContext && (
                        <div className="bg-yellow-100 dark:bg-yellow-500/10 p-3 rounded-lg flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
                            <InfoIcon className="h-5 w-5 flex-shrink-0" />
                            <p className="text-xs">Fitur 'Bagikan Struk' memerlukan koneksi aman (HTTPS) dan akan aktif saat aplikasi di-hosting.</p>
                        </div>
                    )}
                    <div className="flex gap-3">
                        <button onClick={handleClose} className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-slate-700 dark:text-neutral-200 font-semibold py-3 rounded-full text-sm transition-colors">
                            Selesai
                        </button>
                        <button onClick={handleActionClick} disabled={buttonState === 'processing'} className="w-full bg-blue-500 hover:bg-blue-600 text-white dark:bg-blue-400 dark:hover:bg-blue-500 dark:text-slate-900 font-semibold py-3 rounded-full text-sm transition-colors disabled:opacity-70 disabled:cursor-wait">
                            {actionButtonText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InvoiceModal;