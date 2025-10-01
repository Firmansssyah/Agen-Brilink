
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useToastContext, ToastMessage, ToastType } from '../contexts/ToastContext';
import { CheckIcon, InfoIcon, CloseIcon, ErrorIcon } from './icons/Icons';

const Toast: React.FC<{ toast: ToastMessage, onDismiss: (id: number) => void }> = ({ toast, onDismiss }) => {
    const { message, type, id, undoHandler } = toast;
    const [countdown, setCountdown] = useState(5);

    useEffect(() => {
        if (undoHandler) {
            const timer = setTimeout(() => {
                onDismiss(id);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [id, undoHandler, onDismiss]);

    useEffect(() => {
        if (undoHandler) {
            const interval = setInterval(() => {
                setCountdown(prev => (prev > 0 ? prev - 1 : 0));
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [undoHandler]);


    const handleUndo = () => {
        if (undoHandler) {
            undoHandler();
        }
        onDismiss(id);
    };
    
    const iconMap: Record<ToastType, React.ReactNode> = {
        success: <CheckIcon className="h-6 w-6 text-emerald-500 dark:text-emerald-400" />,
        error: <ErrorIcon className="h-6 w-6 text-red-500 dark:text-red-400" />,
        info: <InfoIcon className="h-6 w-6 text-sky-500 dark:text-sky-400" />,
    };

    return (
        <div className="w-full max-w-sm rounded-full shadow-lg bg-white/80 dark:bg-[#322F3B]/80 backdrop-blur-sm border border-slate-200 dark:border-white/10 animate-toast-in">
            <div className="flex items-center px-4 py-3">
                <div className="flex-shrink-0">
                    {iconMap[type]}
                </div>
                <div className="ml-3 w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{message}</p>
                </div>
                <div className="ml-4 flex-shrink-0 flex items-center space-x-2">
                    {undoHandler && (
                        <>
                            <div className="relative w-6 h-6">
                                <svg className="absolute inset-0" viewBox="0 0 24 24">
                                    <circle className="text-slate-200 dark:text-slate-600" strokeWidth="2" stroke="currentColor" fill="transparent" r="10" cx="12" cy="12" />
                                    <circle
                                        className="text-indigo-500 dark:text-indigo-400 animate-countdown-circle"
                                        style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
                                        strokeWidth="2"
                                        strokeDasharray="62.83"
                                        strokeLinecap="round"
                                        stroke="currentColor"
                                        fill="transparent"
                                        r="10"
                                        cx="12"
                                        cy="12"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-slate-700 dark:text-slate-200">
                                    {countdown}
                                </div>
                            </div>
                            <button
                                onClick={handleUndo}
                                className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:underline focus:outline-none"
                            >
                                Urungkan
                            </button>
                        </>
                    )}
                    <button
                        onClick={() => onDismiss(id)}
                        className="inline-flex rounded-full p-1 transition-colors text-slate-500 dark:text-slate-400 hover:bg-black/10 dark:hover:bg-white/10 focus:outline-none"
                    >
                        <span className="sr-only">Close</span>
                        <CloseIcon className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

const ToastContainer: React.FC = () => {
    const { toasts, removeToast } = useToastContext();

    if (typeof document === 'undefined') return null;

    return createPortal(
        <div className="fixed top-4 right-4 z-[100] w-full max-w-sm px-4 space-y-3">
            {toasts.map(toast => (
                <Toast 
                    key={toast.id}
                    toast={toast}
                    onDismiss={removeToast}
                />
            ))}
        </div>,
        document.body
    );
};

export default ToastContainer;