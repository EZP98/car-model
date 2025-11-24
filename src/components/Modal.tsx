import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl';
  maxHeight?: string;
  showCloseButton?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  maxWidth = '4xl',
  maxHeight = '90vh',
  showCloseButton = true
}) => {
  // Stop Lenis when modal is open
  useEffect(() => {
    if (isOpen) {
      const lenis = (window as any).lenis;
      if (lenis) {
        lenis.stop();
      }

      // Cleanup function to always re-enable scroll when modal closes or unmounts
      return () => {
        const lenis = (window as any).lenis;
        if (lenis) {
          lenis.start();
        }
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const maxWidthClass = `max-w-${maxWidth}`;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Panel */}
      <div
        className={`relative bg-secondary ${maxWidthClass} w-full flex flex-col border-2`}
        style={{
          borderColor: 'rgba(255, 255, 255, 0.2)',
          maxHeight,
          borderRadius: '12px'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        {showCloseButton && (
          <button
            onClick={onClose}
            className="absolute top-6 right-6 text-white/60 hover:text-white transition-colors z-10"
            aria-label="Close modal"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        )}

        {/* Content - Scrollable */}
        <div
          className="flex-1 overflow-y-auto scrollbar-hide"
          onWheel={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;
