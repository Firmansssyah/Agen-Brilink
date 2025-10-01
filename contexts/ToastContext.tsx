
import React, { createContext, useState, useCallback, useContext, ReactNode } from 'react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
    id: number;
    message: string;
    type: ToastType;
    undoHandler?: () => void;
}

interface ToastContextType {
    toasts: ToastMessage[];
    addToast: (message: string, type: ToastType, options?: { undoHandler?: () => void }) => void;
    removeToast: (id: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const removeToast = (id: number) => {
        setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
    };

    const addToast = useCallback((message: string, type: ToastType, options?: { undoHandler?: () => void }) => {
        const id = Date.now() + Math.random(); // Add random to avoid collision
        const newToast: ToastMessage = { id, message, type, ...options };
        setToasts(prevToasts => [...prevToasts, newToast]);
        
        if (!options?.undoHandler) {
            setTimeout(() => removeToast(id), 4000); // auto-dismiss for non-undo toasts
        }
    }, []);

    return (
        <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
            {children}
        </ToastContext.Provider>
    );
};

export const useToastContext = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToastContext must be used within a ToastProvider');
    }
    return context;
};