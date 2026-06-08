'use client';

import React from 'react';
import { GitBranch, History } from 'lucide-react';
import HistoricalEventCard from '../cards/historical-event-card';
import { HistoricalEvent } from '../../types';

interface TimelineSidebarProps {
  events: HistoricalEvent[];
}

export default function TimelineSidebar({ events }: TimelineSidebarProps) {
  return (
    <div className="flex flex-col gap-5 h-full max-h-[85vh] overflow-y-auto pr-2 custom-scrollbar select-none">
      {/* Sidebar Header */}
      <div className="flex items-center gap-2.5 border-b border-white/5 pb-3.5">
        <div className="w-7 h-7 rounded bg-primary-base/10 border border-primary-base/20 flex items-center justify-center text-primary-base">
          <History size={15} />
        </div>
        <div>
          <h2 className="text-sm font-bold font-mono uppercase tracking-wider text-text-main flex items-center gap-1.5">
            Chronology Branch
          </h2>
          <p className="text-[10px] text-text-dim">Historical milestones of divergence</p>
        </div>
      </div>

      {/* Events Stream */}
      {events && events.length > 0 ? (
        <div className="flex flex-col pl-2.5">
          {events.map((event, index) => (
            <HistoricalEventCard key={event.id} event={event} index={index} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-8 border border-white/5 bg-white/25 rounded-xl text-center">
          <GitBranch size={28} className="text-text-dim/40 mb-2.5 animate-pulse" />
          <span className="font-mono text-xs text-text-dim">No historical branches detected</span>
        </div>
      )}
    </div>
  );
}
