import React from 'react';
import { motion } from 'framer-motion';

interface LoadingStateProps {
  type?: 'collection' | 'list' | 'table';
  itemCount?: number;
}

const LoadingState: React.FC<LoadingStateProps> = ({ type = 'list', itemCount = 3 }) => {
  if (type === 'collection') {
    return (
      <div className="grid gap-6">
        {Array.from({ length: itemCount }).map((_, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="bg-secondary p-4 border rounded-xl"
            style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
          >
            <div className="flex items-start gap-6 p-2">
              {/* Image Skeleton */}
              <div className="w-48 h-32 rounded-lg flex-shrink-0 bg-white/5 animate-pulse" />

              {/* Content Skeleton */}
              <div className="flex-1 space-y-3">
                {/* Title */}
                <div className="h-6 bg-white/10 rounded-lg animate-pulse" style={{ width: '60%' }} />

                {/* Description */}
                <div className="space-y-2">
                  <div className="h-4 bg-white/10 rounded-lg animate-pulse" style={{ width: '90%' }} />
                  <div className="h-4 bg-white/10 rounded-lg animate-pulse" style={{ width: '70%' }} />
                </div>

                {/* Link */}
                <div className="h-3 bg-white/10 rounded-lg animate-pulse" style={{ width: '40%' }} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  if (type === 'list') {
    return (
      <div className="grid gap-6">
        {Array.from({ length: itemCount }).map((_, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="bg-secondary p-4 border rounded-xl"
            style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
          >
            <div className="p-2 space-y-4">
              {/* Header */}
              <div className="flex items-start gap-6">
                <div className="flex-1 space-y-3">
                  {/* Title */}
                  <div className="h-7 bg-white/10 rounded-lg animate-pulse" style={{ width: '50%' }} />

                  {/* Subtitle */}
                  <div className="h-5 bg-white/10 rounded-lg animate-pulse" style={{ width: '40%' }} />

                  {/* Description lines */}
                  <div className="space-y-2 pt-2">
                    <div className="h-4 bg-white/10 rounded-lg animate-pulse" style={{ width: '85%' }} />
                    <div className="h-4 bg-white/10 rounded-lg animate-pulse" style={{ width: '75%' }} />
                    <div className="h-4 bg-white/10 rounded-lg animate-pulse" style={{ width: '65%' }} />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className="bg-secondary border border-white/10 rounded-xl overflow-hidden">
        <div className="animate-pulse">
          {/* Table Header */}
          <div className="bg-white/5 border-b border-white/10 px-6 py-4 flex gap-6">
            <div className="h-4 bg-white/10 rounded flex-1" />
            <div className="h-4 bg-white/10 rounded flex-1" />
            <div className="h-4 bg-white/10 rounded w-32" />
          </div>

          {/* Table Rows */}
          {Array.from({ length: itemCount }).map((_, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="border-b border-white/10 px-6 py-4 flex gap-6 items-center"
            >
              {/* Image + Title */}
              <div className="flex items-center gap-3 flex-1">
                <div className="w-12 h-12 bg-white/10 rounded-lg" />
                <div className="h-5 bg-white/10 rounded flex-1" style={{ maxWidth: '200px' }} />
              </div>

              {/* Meta */}
              <div className="h-4 bg-white/10 rounded flex-1" style={{ maxWidth: '150px' }} />

              {/* Status */}
              <div className="h-6 bg-white/10 rounded w-24" />
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  return null;
};

export default LoadingState;
