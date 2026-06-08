'use client';

import React from 'react';
import { Globe2, Landmark, Users, TrendingUp, Info } from 'lucide-react';
import RealityScore from '../ui/reality-score';
import WorldMapPlaceholder from '../ui/world-map-placeholder';
import { World } from '../../types';

interface IntelligencePanelProps {
  world: World;
}

export default function IntelligencePanel({ world }: IntelligencePanelProps) {
  // Derive a stable, prompt-based stability score
  const calculateStability = (w: World) => {
    const seed = w.id.charCodeAt(0) + w.id.charCodeAt(w.id.length - 1);
    return 35 + (seed % 61);
  };

  const stability = calculateStability(world);

  // Generate some themed trending topics based on the world prompt
  const getTrendingTopics = (prompt: string) => {
    const combined = prompt.toLowerCase();
    if (combined.includes('rome')) {
      return [
        { tag: '#ImperiumNova', volume: '142K scrolls' },
        { tag: '#SenatusConsultum', volume: '98K scrolls' },
        { tag: '#SteamGalleyRace', volume: '44K scrolls' },
        { tag: '#BarbarianBorders', volume: '22K scrolls' },
      ];
    } else if (combined.includes('mars')) {
      return [
        { tag: '#MarsColonization', volume: '88K signal-pings' },
        { tag: '#OxygenRationAct', volume: '72K signal-pings' },
        { tag: '#SteamRockets', volume: '54K signal-pings' },
        { tag: '#PhobosMining', volume: '19K signal-pings' },
      ];
    } else {
      return [
        { tag: '#AnalyticalEngine', volume: '120K telegrams' },
        { tag: '#SteamRouterSpeed', volume: '84K telegrams' },
        { tag: '#PunchCardTax', volume: '43K telegrams' },
        { tag: '#LudditeGuilds', volume: '29K telegrams' },
      ];
    }
  };

  const trends = getTrendingTopics(world.prompt);

  return (
    <div className="flex flex-col gap-6 h-full max-h-[85vh] overflow-y-auto pr-2 custom-scrollbar select-none">
      {/* Reality Stability Section */}
      <RealityScore score={stability} />

      {/* Hologram Vector Map */}
      <WorldMapPlaceholder />

      {/* Civilization Telemetry Grid */}
      <div className="glass-panel p-5 rounded-xl border border-border-color flex flex-col gap-4">
        <h3 className="font-mono text-xs uppercase tracking-wider text-text-dim flex items-center gap-1.5">
          <Info size={14} className="text-primary-base" />
          Civilization Telemetry
        </h3>

        <div className="flex flex-col gap-3 font-mono text-[11px]">
          {/* Era / Government */}
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <span className="text-text-dim uppercase">Governance</span>
            <span className="text-text-main font-bold">{world.gov_type || 'Monarchal Republic'}</span>
          </div>

          {/* Tech Level */}
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <span className="text-text-dim uppercase">Tech Level</span>
            <span className="text-text-main font-bold text-right truncate max-w-[150px]">
              {world.tech_level || 'Steam Computation'}
            </span>
          </div>

          {/* Population */}
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <span className="text-text-dim uppercase">Est. Population</span>
            <span className="text-text-main font-bold">428.5 Million</span>
          </div>

          {/* Economic Index */}
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <span className="text-text-dim uppercase">Economic Index</span>
            <div className="flex items-center gap-2">
              <span className="w-16 h-2 rounded-full bg-white/5 overflow-hidden block">
                <span className="h-full bg-accent-base block" style={{ width: '78%' }} />
              </span>
              <span className="text-text-main font-bold">7.8 / 10</span>
            </div>
          </div>

          {/* Public Sentiment */}
          <div className="flex items-center justify-between">
            <span className="text-text-dim uppercase">Public Sentiment</span>
            <div className="flex items-center gap-2">
              <span className="w-16 h-2 rounded-full bg-white/5 overflow-hidden block">
                <span className="h-full bg-green-400 block" style={{ width: '65%' }} />
              </span>
              <span className="text-text-main font-bold">65% Content</span>
            </div>
          </div>
        </div>
      </div>

      {/* Trending Temporal Hashtags */}
      <div className="glass-panel p-5 rounded-xl border border-border-color flex flex-col gap-4">
        <h3 className="font-mono text-xs uppercase tracking-wider text-text-dim flex items-center gap-1.5">
          <TrendingUp size={14} className="text-primary-base" />
          Trending Chronologies
        </h3>

        <div className="flex flex-col gap-3.5">
          {trends.map((tr, idx) => (
            <div key={idx} className="flex justify-between items-center group cursor-pointer">
              <div className="font-mono text-xs text-text-main font-bold group-hover:text-accent-base transition-colors">
                {tr.tag}
              </div>
              <div className="font-mono text-[9px] text-text-dim">{tr.volume}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
