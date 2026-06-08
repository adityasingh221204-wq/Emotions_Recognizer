'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowDown, Calendar, GitFork } from 'lucide-react';
import { HistoricalEvent } from '../../types';

interface HistoricalEventCardProps {
  event: HistoricalEvent;
  index: number;
}

export default function HistoricalEventCard({ event, index }: HistoricalEventCardProps) {
  const [isOpen, setIsOpen] = useState(index === 0); // Open the first event by default

  return (
    <div className="flex gap-4 relative">
      {/* Visual vertical line connectors */}
      <div className="flex flex-col items-center">
        <div className="w-8 h-8 rounded-full border border-border-color bg-background z-10 flex items-center justify-center font-mono text-[10px] font-bold text-accent-base tracking-tighter shadow-md select-none group-hover:scale-110 transition-transform duration-300">
          {event.year}
        </div>
        <div className="w-0.5 flex-1 bg-white/5 relative">
          {/* Animated signal gradient line */}
          <div className="absolute inset-x-0 top-0 bottom-0 temporal-line opacity-20 group-hover:opacity-40 transition-opacity" />
        </div>
      </div>

      {/* Main card box */}
      <div className="flex-1 pb-6">
        <motion.div
          className="glass-panel p-4 rounded-xl border border-border-color cursor-pointer flex flex-col gap-2 relative overflow-hidden select-none"
          onClick={() => setIsOpen(!isOpen)}
          layout
        >
          {/* Header */}
          <div className="flex items-start justify-between">
            <h4 className="text-sm font-bold font-serif text-text-main pr-4 leading-snug">
              {event.title}
            </h4>
            <span className="text-[9px] font-mono text-text-dim/50 uppercase tracking-widest mt-0.5">
              Node #{index + 1}
            </span>
          </div>

          {/* Expandable details */}
          <AnimatePresence initial={false}>
            {isOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="pt-2.5 flex flex-col gap-3 border-t border-white/5 mt-2 text-xs">
                  {/* Summary */}
                  <div>
                    <div className="text-[9px] font-mono text-text-dim/60 uppercase mb-1">Dossier Log</div>
                    <p className="text-text-dim leading-relaxed font-sans">{event.description}</p>
                  </div>

                  {/* Cause & Effect Impact */}
                  <div className="p-2.5 bg-white/5 border border-white/10 rounded-lg flex flex-col gap-1.5 font-mono text-[11px] text-accent-base relative">
                    <div className="text-[8px] text-text-dim/60 uppercase flex items-center gap-1">
                      <GitFork size={10} />
                      Causal Consequence
                    </div>
                    <div className="flex items-center gap-1.5 text-text-main">
                      <span>{event.title}</span>
                      <ArrowDown size={12} className="text-accent-base animate-pulse" />
                    </div>
                    <p className="text-text-dim text-[10px] leading-normal font-sans italic">{event.impact}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
