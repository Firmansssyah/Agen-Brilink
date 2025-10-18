import React from 'react';
import { Font } from '../types';

interface InvoicePreviewProps {
    invoiceAppName: string;
    invoiceAddress: string;
    invoicePhone: string;
    invoiceFooter: string;
    invoiceFont: Font;
}

const InvoicePreview: React.FC<InvoicePreviewProps> = ({
    invoiceAppName,
    invoiceAddress,
    invoicePhone,
    invoiceFooter,
    invoiceFont
}) => {
    // Process footer text for HTML rendering
    const processFooter = (text: string) => {
        // Replace custom tags and newlines. Trust user input for <b> and <i>.
        return text
            .replace(/<b>/g, '<strong style="font-weight: 700;">').replace(/<\/b>/g, '</strong>')
            .replace(/<i>/g, '<em style="font-style: italic;">').replace(/<\/i>/g, '</em>')
            .replace(/<light>/g, '<span style="font-weight: 300;">').replace(/<\/light>/g, '</span>')
            .replace(/\n/g, '<br />');
    };

    const processedFooter = processFooter(invoiceFooter);

    return (
        <div className={`bg-white rounded-lg shadow-md border border-slate-200 text-black ${invoiceFont}`}>
            <div className="p-4 border-b border-dashed border-slate-300 text-center">
                <h2 className="text-base font-semibold">{invoiceAppName || 'Nama Toko Anda'}</h2>
                {invoiceAddress && <p className="text-[10px] text-slate-500 mt-1">{invoiceAddress}</p>}
                {invoicePhone && <p className="text-[10px] text-slate-500">{invoicePhone}</p>}
                <p className="text-xs text-slate-500 mt-2">Bukti Transaksi</p>
            </div>

            <div className="p-4">
                <div className="text-center mb-4">
                    <p className="text-emerald-500 font-bold text-sm">TRANSAKSI BERHASIL</p>
                    <p className="text-[10px] text-slate-400">{new Date().toLocaleString('id-ID', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                </div>

                <div className="space-y-2 text-xs border-t border-b border-dashed border-slate-300 py-3">
                    <div className="flex justify-between">
                        <span className="text-slate-500">Jenis Transaksi</span>
                        <span className="font-medium">Contoh Transaksi</span>
                    </div>
                     <div className="flex justify-between">
                        <span className="text-slate-500">Pelanggan</span>
                        <span className="font-medium">Nama Pelanggan</span>
                    </div>
                </div>

                <div className="space-y-2 text-xs py-3">
                     <div className="flex justify-between">
                        <span className="text-slate-500">Jumlah</span>
                        <span className="font-medium">Rp 100.000</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-500">Biaya Admin</span>
                        <span className="font-medium">Rp 2.500</span>
                    </div>
                </div>
                 <div className="flex justify-between border-t border-dashed border-slate-300 pt-3">
                    <span className="font-bold text-sm">TOTAL</span>
                    <span className="font-bold text-base">Rp 102.500</span>
                </div>

                <div 
                    className="text-center text-[10px] text-slate-500 mt-4 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: processedFooter }}
                />
            </div>
        </div>
    );
};

export default InvoicePreview;