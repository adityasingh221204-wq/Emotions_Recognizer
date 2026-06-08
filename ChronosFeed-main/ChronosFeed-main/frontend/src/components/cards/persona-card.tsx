'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Check, UserCheck } from 'lucide-react';
import { Persona } from '../../types';

interface PersonaCardProps {
  persona: Persona;
  onPersonaClick?: (id: string) => void;
}

export default function PersonaCard({ persona, onPersonaClick }: PersonaCardProps) {
  const [isFollowing, setIsFollowing] = useState(false);

  const handleFollow = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFollowing(!isFollowing);
  };

  return (
    <motion.div
      onClick={() => onPersonaClick && onPersonaClick(persona.id)}
      className="glass-panel p-4 rounded-xl border border-border-color cursor-pointer flex items-center justify-between gap-3 group select-none"
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center gap-3 min-w-0">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full border border-white/10 bg-white/5 flex items-center justify-center font-serif font-bold text-accent-base text-sm group-hover:border-accent-base transition-colors duration-300">
          {persona.name.charAt(0)}
        </div>

        <div className="min-w-0">
          <div className="text-xs font-bold text-text-main group-hover:text-accent-base transition-colors truncate flex items-center gap-1.5">
            {persona.name}
            <span className="text-[8px] font-mono bg-white/5 px-1 py-0.2 rounded border border-white/5 text-text-dim">
              Score: {persona.influence_score}
            </span>
          </div>
          <div className="text-[10px] text-text-dim truncate">@{persona.handle}</div>
          <p className="text-[10px] text-text-dim/80 line-clamp-1 mt-1 leading-normal font-sans">
            {persona.bio}
          </p>
        </div>
      </div>

      <button
        onClick={handleFollow}
        className={`w-7 h-7 rounded-full border flex items-center justify-center cursor-pointer transition-all duration-300 ${
          isFollowing
            ? 'bg-accent-base/10 border-accent-base text-accent-base'
            : 'border-white/20 hover:border-accent-base hover:bg-white/5 text-text-dim hover:text-text-main'
        }`}
      >
        {isFollowing ? <Check size={12} /> : <Plus size={12} />}
      </button>
    </motion.div>
  );
}
