'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { AlertOctagon, ShieldCheck, ShieldAlert, Sparkles } from 'lucide-react';

interface RealityScoreProps {
  score: number; // 0 to 100
}

export default function RealityScore({ score }: RealityScoreProps) {
  // Determine state labels and styling based on stability score
  const getStatusDetails = (val: number) => {
    if (val >= 90) {
      return {
        label: 'Golden Age',
        color: 'text-emerald-400',
        borderColor: 'border-emerald-500/30',
        glowColor: 'rgba(16, 185, 129, 0.4)',
        icon: <Sparkles className="text-emerald-400" size={18} />,
        bgGlow: 'bg-emerald-500/5',
        desc: 'Civilization is at its zenith. Innovation and harmony flourish.',
      };
    } else if (val >= 70) {
      return {
        label: 'Stable Era',
        color: 'text-blue-400',
        borderColor: 'border-blue-500/30',
        glowColor: 'rgba(59, 130, 246, 0.4)',
        icon: <ShieldCheck className="text-blue-400" size={18} />,
        bgGlow: 'bg-blue-500/5',
        desc: 'Social structures hold. Minor progress-fluctuations reported.',
      };
    } else if (val >= 45) {
      return {
        label: 'Volatile State',
        color: 'text-amber-400',
        borderColor: 'border-amber-500/30',
        glowColor: 'rgba(245, 158, 11, 0.4)',
        icon: <ShieldAlert className="text-amber-400" size={18} />,
        bgGlow: 'bg-amber-500/5',
        desc: 'Civil unrest and rising ideological factions. Stability is vulnerable.',
      };
    } else if (val >= 20) {
      return {
        label: 'Revolutionary Crisis',
        color: 'text-orange-500',
        borderColor: 'border-orange-500/30',
        glowColor: 'rgba(249, 115, 22, 0.5)',
        icon: <AlertOctagon className="text-orange-400" size={18} />,
        bgGlow: 'bg-orange-500/5',
        desc: 'Active regime struggle. Core societal infrastructures are fracturing.',
      };
    } else {
      return {
        label: 'Collapse Imminent',
        color: 'text-red-500 animate-pulse',
        borderColor: 'border-red-500/50 border-dashed',
        glowColor: 'rgba(239, 68, 68, 0.7)',
        icon: <AlertOctagon className="text-red-500 animate-bounce" size={18} />,
        bgGlow: 'bg-red-500/10 animate-pulse',
        desc: 'Societal systems collapsed. Alternate reality matrix facing tear-down.',
      };
    }
  };

  const details = getStatusDetails(score);

  // Map 0-100 score to degree rotation (-90deg to +90deg) for the dial
  const rotation = -90 + (score / 100) * 180;

  return (
    <div
      className={`glass-panel p-5 rounded-xl border flex flex-col gap-4 relative overflow-hidden transition-all duration-500 ${details.borderColor}`}
      style={{
        boxShadow: `0 0 20px 0 ${details.glowColor}`,
      }}
    >
      {/* Background soft pulse */}
      <div className={`absolute inset-0 -z-10 ${details.bgGlow}`} />

      <div className="flex items-center justify-between">
        <h3 className="font-mono text-xs uppercase tracking-wider text-text-dim">Reality Stability Gauge</h3>
        <div className="flex items-center gap-1.5 font-mono text-[11px]">
          {details.icon}
          <span className={`font-bold ${details.color}`}>{details.label}</span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Semi-Circle Gauge Dial */}
        <div className="relative w-28 h-16 flex items-end justify-center select-none overflow-hidden">
          {/* Arc Background */}
          <div className="absolute inset-0 w-28 h-28 border-[10px] border-white/5 rounded-full" />

          {/* Color Arc Indicator (clipped to half circle) */}
          <svg className="absolute top-0 left-0 w-28 h-28 transform -rotate-180" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="currentColor"
              strokeWidth="10"
              strokeDasharray="125 250"
              className={`${details.color} opacity-40`}
            />
          </svg>

          {/* Center Point */}
          <div className="absolute bottom-0 w-4 h-4 rounded-full bg-text-main z-20 border border-white/20" />

          {/* Needle Arrow */}
          <motion.div
            className="absolute bottom-0 w-1 bg-gradient-to-t from-text-main to-accent-base z-10 origin-bottom"
            style={{
              height: '42px',
              x: '-50%',
            }}
            initial={{ rotate: -90 }}
            animate={{ rotate: rotation }}
            transition={{
              type: 'spring',
              stiffness: 80,
              damping: 12,
            }}
          />
        </div>

        {/* Stability Percentage Output */}
        <div className="flex-1">
          <div className="flex items-baseline gap-1">
            <motion.span
              className={`text-4xl font-extrabold font-mono tracking-tighter ${details.color}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              {score}
            </motion.span>
            <span className="text-sm text-text-dim font-mono">/100</span>
          </div>
          <p className="text-[11px] text-text-dim mt-1 leading-normal font-sans">{details.desc}</p>
        </div>
      </div>
    </div>
  );
}
