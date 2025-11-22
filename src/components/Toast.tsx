import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({
  message,
  type = 'success',
  isVisible,
  onClose,
  duration = 3000
}) => {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  const styles = {
    success: {
      bg: 'rgba(26, 77, 46, 0.95)',
      border: 'rgba(34, 197, 94, 0.5)'
    },
    error: {
      bg: 'rgba(127, 29, 29, 0.95)',
      border: 'rgba(239, 68, 68, 0.5)'
    },
    info: {
      bg: 'rgba(30, 58, 138, 0.95)',
      border: 'rgba(59, 130, 246, 0.5)'
    }
  };

  const icon = {
    success: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
      </svg>
    ),
    error: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
    info: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="fixed top-6 left-1/2 -translate-x-1/2 z-[10000] flex items-center gap-4 px-8 py-5 rounded-2xl shadow-2xl text-white border-2"
          style={{
            backgroundColor: styles[type].bg,
            borderColor: styles[type].border,
            minWidth: '400px',
            maxWidth: '600px',
            backdropFilter: 'blur(8px)'
          }}
        >
          {icon[type]}
          <span className="text-lg font-semibold flex-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Toast;
