
import React from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirm Delete" }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4" aria-modal="true" role="dialog">
      <div className="bg-[#2a2b32] rounded-2xl shadow-xl w-full max-w-sm border border-gray-700">
        <div className="p-6">
          <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
          <p className="text-gray-300 text-sm">{message}</p>
        </div>
        <div className="flex items-center justify-end p-4 bg-[#202123] rounded-b-2xl space-x-2">
          <button onClick={onClose} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition">
            Cancel
          </button>
          <button 
            onClick={onConfirm} 
            className="bg-red-600/80 hover:bg-red-500 text-white font-bold py-2 px-4 rounded-lg transition"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
