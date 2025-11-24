import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from '../i18n/useTranslation';

interface AlertDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onClose: () => void;
  variant?: 'success' | 'error' | 'info';
  closeText?: string;
}

const AlertDialog: React.FC<AlertDialogProps> = ({
  isOpen,
  title,
  message,
  onClose,
  variant = 'info',
  closeText
}) => {
  const { t } = useTranslation();

  // Prevent body scroll when dialog is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Close on ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Auto-close after 3 seconds for success messages
  useEffect(() => {
    if (isOpen && variant === 'success') {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, variant, onClose]);

  if (!isOpen) return null;

  const variantConfig = {
    success: {
      color: 'border-green-500/30 bg-green-500/5',
      icon: (
        <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
      button: 'bg-green-500 hover:bg-green-600'
    },
    error: {
      color: 'border-red-500/30 bg-red-500/5',
      icon: (
        <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      ),
      button: 'bg-red-500 hover:bg-red-600'
    },
    info: {
      color: 'border-blue-500/30 bg-blue-500/5',
      icon: (
        <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      button: 'bg-blue-500 hover:bg-blue-600'
    }
  };

  const config = variantConfig[variant];

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(4px)'
      }}
      onClick={onClose}
    >
      <div
        className={`relative bg-background rounded-xl max-w-md w-full border ${config.color} shadow-2xl`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Icon */}
        <div className="p-6 pb-4 flex items-start gap-4">
          <div className="flex-shrink-0 mt-1">
            {config.icon}
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white">{title}</h3>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 pb-6 pl-16">
          <p className="text-white/80 leading-relaxed whitespace-pre-wrap">{message}</p>
        </div>

        {/* Footer */}
        <div className="p-6 pt-0 pl-16 border-t border-white/10">
          <button
            onClick={onClose}
            className={`w-full px-4 py-3 ${config.button} text-white rounded-lg transition-colors font-medium`}
          >
            {closeText || t('backoffice.close')}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default AlertDialog;
