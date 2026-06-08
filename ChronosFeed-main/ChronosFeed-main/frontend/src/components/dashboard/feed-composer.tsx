'use client';

import React, { useState } from 'react';
import { Send, Sparkles, Feather } from 'lucide-react';

interface FeedComposerProps {
  onPublish: (content: string, faction: string) => void;
}

export default function FeedComposer({ onPublish }: FeedComposerProps) {
  const [content, setContent] = useState('');
  const [selectedFaction, setSelectedFaction] = useState('CITIZEN');

  const factions = [
    { value: 'CITIZEN', label: 'Citizen', color: 'border-white/10 text-text-dim' },
    { value: 'TECHNOLOGIST', label: 'Technologist', color: 'border-emerald-500/20 text-emerald-400' },
    { value: 'REBEL', label: 'Rebel / Factionist', color: 'border-red-500/20 text-red-400' },
    { value: 'ROYALIST', label: 'Imperial / Royalist', color: 'border-amber-500/20 text-amber-400' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    onPublish(content, selectedFaction);
    setContent('');
  };

  return (
    <div className="glass-panel p-5 rounded-xl border border-border-color flex flex-col gap-4 select-none">
      <div className="flex items-center gap-2 border-b border-white/5 pb-2.5">
        <Feather size={14} className="text-primary-base" />
        <span className="font-mono text-xs uppercase tracking-wider text-text-dim">
          Inject Temporal Proclamation
        </span>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Input Text */}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Draft a message to transmit into the Mechanical Net stream..."
          rows={3}
          className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-text-main focus:outline-none focus:border-accent-base focus:ring-1 focus:ring-accent-base/30 transition-all font-sans placeholder-text-dim/55 resize-none"
        />

        {/* Faction selection and submit */}
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Faction selector */}
          <div className="flex flex-wrap gap-2">
            {factions.map((fac) => (
              <button
                key={fac.value}
                type="button"
                onClick={() => setSelectedFaction(fac.value)}
                className={`px-3 py-1 rounded-full border text-[10px] font-mono transition-all cursor-pointer ${
                  selectedFaction === fac.value
                    ? 'bg-primary-base/15 border-accent-base text-text-main text-glow'
                    : 'bg-transparent border-white/5 hover:border-white/20 text-text-dim'
                }`}
              >
                {fac.label}
              </button>
            ))}
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={!content.trim()}
            className="glass-button px-4 py-2 rounded-lg font-mono text-xs flex items-center justify-center gap-2 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={12} />
            <span>Transmit</span>
          </button>
        </div>
      </form>
    </div>
  );
}
