import React from 'react';
import { motion } from 'framer-motion';

interface BackofficeLoaderProps {
  message?: string;
  fullPage?: boolean;
}

const BackofficeLoader: React.FC<BackofficeLoaderProps> = ({
  message = 'Caricamento...',
  fullPage = false
}) => {
  const containerClasses = fullPage
    ? 'min-h-screen flex items-center justify-center'
    : 'min-h-[400px] flex items-center justify-center';

  return (
    <div className={containerClasses}>
      <div className="text-center">
        {/* Spinner animato */}
        <motion.div
          className="relative w-16 h-16 mx-auto mb-4"
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          <div
            className="absolute inset-0 rounded-full border-4 border-transparent"
            style={{
              borderTopColor: 'rgb(240, 45, 110)',
              borderRightColor: 'rgb(240, 45, 110)'
            }}
          />
        </motion.div>

        {/* Testo loading */}
        <motion.p
          className="text-white/60 text-sm font-medium uppercase tracking-wider"
          style={{ fontFamily: 'Montserrat, sans-serif' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {message}
        </motion.p>

        {/* Tre puntini animati */}
        <div className="flex gap-1 justify-center mt-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: 'rgb(240, 45, 110)' }}
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default BackofficeLoader;
