import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, X, Wifi, WifiOff } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'offline' | 'online';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
  darkMode?: boolean;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose, duration = 3000, darkMode }) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const getStyles = () => {
    const base = darkMode ? 'bg-[#2D2D2D] text-white' : 'bg-white text-black';
    switch (type) {
      case 'success':
        return `${base} border-green-500`;
      case 'error':
        return `${base} border-red-500`;
      case 'offline':
        return `${base} border-orange-500`;
      case 'online':
        return `${base} border-green-500`;
      default:
        return `${base} border-[#5B4A8F]`;
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} className="text-green-500" />;
      case 'error':
        return <AlertCircle size={20} className="text-red-500" />;
      case 'offline':
        return <WifiOff size={20} className="text-orange-500" />;
      case 'online':
        return <Wifi size={20} className="text-green-500" />;
      default:
        return <Info size={20} className="text-[#5B4A8F]" />;
    }
  };

  return (
    <div className={`fixed top-20 left-4 right-4 max-w-md mx-auto z-[300] animate-in slide-in-from-top duration-300`}>
      <div className={`flex items-center gap-3 p-4 rounded-2xl border-2 shadow-lg ${getStyles()}`}>
        {getIcon()}
        <p className="flex-1 font-opendyslexic text-sm">{message}</p>
        <button onClick={onClose} className="opacity-50 hover:opacity-100 transition-opacity">
          <X size={18} />
        </button>
      </div>
    </div>
  );
};

export default Toast;
