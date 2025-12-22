
import React, { useEffect } from 'react';

interface NotificationProps {
  message: string;
  isOpen: boolean;
  onClose: () => void;
  type?: 'success' | 'error' | 'info';
}

const Notification: React.FC<NotificationProps> = ({ message, isOpen, onClose, type = 'success' }) => {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const bgColors = {
    success: 'bg-indigo-600 border-indigo-400',
    error: 'bg-red-600 border-red-400',
    info: 'bg-slate-800 border-slate-700'
  };

  return (
    <div className="fixed bottom-8 right-8 z-[100] animate-in slide-in-from-right-10 fade-in duration-300">
      <div className={`${bgColors[type]} border px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur-xl`}>
        <span className="text-xl">
          {type === 'success' ? '✨' : type === 'error' ? '❌' : 'ℹ️'}
        </span>
        <p className="font-semibold text-white text-sm">{message}</p>
        <button onClick={onClose} className="ml-4 text-white/50 hover:text-white">✕</button>
      </div>
    </div>
  );
};

export default Notification;
