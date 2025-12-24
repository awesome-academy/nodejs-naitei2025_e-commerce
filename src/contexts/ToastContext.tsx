import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

type ToastType = 'success' | 'error';

interface ToastMessage {
  type: ToastType;
  message: string;
}

interface ToastContextType {
  showToast: (type: ToastType, message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showToast = (type: ToastType, message: string) => setToast({ type, message });

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4500);
    return () => clearTimeout(timer);
  }, [toast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <div className="fixed left-1/2 bottom-8 z-[80] transform -translate-x-1/2">
          <div role="status" aria-live="polite" className={`px-5 py-3 rounded-lg shadow-lg text-white max-w-xl text-center ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
            {toast.message}
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
};

export default ToastContext;
