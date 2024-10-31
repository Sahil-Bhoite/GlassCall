import React, { useEffect } from 'react';
import { XCircle, AlertCircle, CheckCircle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, type, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle className="text-blue-300" size={20} />,
    error: <XCircle className="text-red-300" size={20} />,
    info: <AlertCircle className="text-blue-300" size={20} />,
  };

  const backgrounds = {
    success: 'bg-blue-500/10',
    error: 'bg-red-500/10',
    info: 'bg-blue-500/10',
  };

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${backgrounds[type]} glass-panel rounded-2xl p-4 shadow-lg`}>
      <div className="flex items-center gap-3">
        {icons[type]}
        <p className="text-blue-100 text-sm">{message}</p>
      </div>
    </div>
  );
}