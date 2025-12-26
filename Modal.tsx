
import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'primary' | 'danger';
}

const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = 'primary'
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fadeIn" 
        onClick={onClose}
      />
      <div className="relative bg-white w-full max-w-md rounded-[32px] p-8 shadow-2xl animate-scaleIn border border-slate-100">
        <div className="text-center">
          <div className={`w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center text-2xl ${
            variant === 'danger' ? 'bg-red-50 text-red-500' : 'bg-orange-50 text-orange-600'
          }`}>
            <i className={`fa-solid ${variant === 'danger' ? 'fa-triangle-exclamation' : 'fa-circle-question'}`}></i>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-2">{title}</h3>
          <p className="text-slate-500 mb-8 leading-relaxed">{message}</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition-all active:scale-95"
          >
            {cancelLabel}
          </button>
          <button 
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`flex-1 px-6 py-3 text-white font-bold rounded-2xl transition-all active:scale-95 shadow-lg ${
              variant === 'danger' ? 'bg-red-500 hover:bg-red-600 shadow-red-100' : 'bg-orange-600 hover:bg-orange-700 shadow-orange-100'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
