'use client';

import { motion } from 'framer-motion';

interface ScrollingBannerProps {
  messages: string[];
  speed?: number;
}

export default function ScrollingBanner({ messages, speed = 40 }: ScrollingBannerProps) {
  // Ensure we have messages
  if (!messages || messages.length === 0) return null;

  return (
    <div className="w-full bg-green-600/95 dark:bg-green-700/95 backdrop-blur-md text-white overflow-hidden whitespace-nowrap py-1 flex items-center border-b border-white/10 relative z-[60] h-8">
      <motion.div
        animate={{ x: [0, '-50%'] }}
        transition={{
          repeat: Infinity,
          duration: speed,
          ease: 'linear',
        }}
        className="flex space-x-12 px-4 items-center min-w-max"
      >
        {/* Render twice for seamless loop */}
        {[...messages, ...messages, ...messages].map((msg, i) => (
          <span key={i} className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] flex items-center shrink-0">
            {msg}
          </span>
        ))}
        {[...messages, ...messages, ...messages].map((msg, i) => (
          <span key={i + 'repeat'} className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] flex items-center shrink-0">
            {msg}
          </span>
        ))}
      </motion.div>
    </div>
  );
}
