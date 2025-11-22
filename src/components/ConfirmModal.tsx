import React from 'react';
import Modal from './Modal';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmButtonColor?: string;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Ok',
  cancelText = 'Annulla',
  confirmButtonColor = 'rgb(240, 45, 110)'
}) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="md" showCloseButton={false}>
      {/* Header */}
      <div className="bg-secondary border-b px-6 py-5 flex items-center justify-between" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
        <h2 className="text-2xl font-bold text-white uppercase" style={{ fontFamily: 'Montserrat, sans-serif' }}>
          {title}
        </h2>
        <button
          onClick={onClose}
          className="text-white/60 hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="p-6">
        <p className="text-white/80 mb-8 whitespace-pre-line" style={{ fontFamily: 'Montserrat, sans-serif' }}>
          {message}
        </p>
        <div className="flex gap-4 justify-end">
          <button
            onClick={onClose}
            className="px-6 py-3 font-bold uppercase text-white border hover:bg-white/5 transition-all"
            style={{
              borderColor: 'rgba(255, 255, 255, 0.2)',
              fontFamily: 'Montserrat, sans-serif',
              borderRadius: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.3)'
            }}
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className="px-6 py-3 font-bold uppercase text-white transition-all hover:opacity-90"
            style={{
              backgroundColor: confirmButtonColor,
              fontFamily: 'Montserrat, sans-serif',
              borderRadius: 0
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmModal;
