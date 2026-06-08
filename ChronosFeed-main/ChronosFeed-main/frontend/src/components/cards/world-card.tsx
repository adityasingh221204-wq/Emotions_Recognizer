'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ShieldAlert, Globe2, Cpu, CalendarClock } from 'lucide-react';
import { World } from '../../types';

interface WorldCardProps {
  world: World;
}

export default function WorldCard({ world }: WorldCardProps) {
  const router = useRouter();

  // Deduce a stable stability score from world properties (e.g. length of prompt, name)
  const calculateStability = (w: World) => {
    const seed = w.id.charCodeAt(0) + w.id.charCodeAt(w.id.length - 1);
    return 35 + (seed % 61); // returns stability score between 35 and 95
  };

  const stability = calculateStability(world);

  const getStabilityLabel = (score: number) => {
    if (score >= 90) return { label: 'Golden Age', color: 'text-emerald-400 border-emerald-500/20' };
    if (score >= 70) return { label: 'Stable', color: 'text-blue-400 border-blue-500/20' };
    if (score >= 45) return { label: 'Volatile', color: 'text-amber-400 border-amber-500/20' };
    if (score >= 20) return { label: 'Revolutionary', color: 'text-orange-400 border-orange-500/20' };
    return { label: 'Collapse Imminent', color: 'text-red-400 border-red-500/20' };
  };

  const stabilityMeta = getStabilityLabel(stability);

  return (
    <motion.div
      onClick={() => router.push(`/world/${world.id}`)}
      className="glass-panel p-6 rounded-xl border border-border-color cursor-pointer flex flex-col justify-between h-[300px] hover:border-accent-base relative overflow-hidden group select-none"
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 200, damping: 18 }}
    >
      {/* Visual background ambient color according to stability */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-base/5 via-transparent to-transparent opacity-30 group-hover:opacity-60 transition-opacity duration-300 pointer-events-none" />

      {/* Header Info */}
      <div className="flex flex-col gap-2.5 relative">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] text-accent-base uppercase tracking-widest flex items-center gap-1.5">
            <CalendarClock size={12} />
            {world.era || 'Alternate Era'}
          </span>
          <span className={`text-[9px] font-mono font-bold px-2 py-0.5 border rounded-full bg-white/5 ${stabilityMeta.color}`}>
            {stability}% {stabilityMeta.label}
          </span>
        </div>

        <h3 className="text-xl font-bold font-serif leading-snug tracking-tight text-text-main group-hover:text-accent-base transition-colors duration-300">
          {world.name || 'Unnamed Dimension'}
        </h3>

        <p className="text-xs text-text-dim leading-relaxed line-clamp-3 my-1">
          {world.summary || 'Chronos anomaly generated from: ' + world.prompt}
        </p>
      </div>

      {/* Footer Metrics */}
      <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/5 font-mono text-[10px] text-text-dim relative">
        <div className="flex items-center gap-2">
          <Globe2 size={12} className="text-primary-base" />
          <div className="truncate">
            <div className="text-[8px] text-text-dim/60 uppercase">Governance</div>
            <div className="font-bold text-text-main truncate">{world.gov_type || 'Senatorial'}</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Cpu size={12} className="text-primary-base" />
          <div className="truncate">
            <div className="text-[8px] text-text-dim/60 uppercase">Tech Scale</div>
            <div className="font-bold text-text-main truncate">{world.tech_level || 'Steam Computation'}</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
