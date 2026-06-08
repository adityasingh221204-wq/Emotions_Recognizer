'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function WorldMapPlaceholder() {
  const [coords, setCoords] = useState({ lat: '51.5074° N', lon: '0.1278° W' });

  // Update mock coordinate telemetry periodically
  useEffect(() => {
    const timer = setInterval(() => {
      const latDeg = (40 + Math.random() * 20).toFixed(4);
      const lonDeg = (Math.random() * 10).toFixed(4);
      setCoords({
        lat: `${latDeg}° N`,
        lon: `${lonDeg}° W`,
      });
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="glass-panel p-4 rounded-xl border border-border-color flex flex-col gap-3 relative overflow-hidden h-[240px] select-none">
      {/* HUD Telemetry header */}
      <div className="flex items-center justify-between font-mono text-[9px] text-text-dim border-b border-white/5 pb-2">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-primary-base-color animate-ping" />
          <span>REAL-TIME TEMPORAL PLOTTING</span>
        </div>
        <div className="flex gap-4">
          <span>LAT: {coords.lat}</span>
          <span>LON: {coords.lon}</span>
        </div>
      </div>

      {/* Map Content */}
      <div className="relative flex-1 flex items-center justify-center overflow-hidden">
        {/* Holographic grid lines */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />

        {/* Vector SVG Map */}
        <svg className="w-full h-full opacity-60 text-primary-base-color" viewBox="0 0 400 180" fill="none">
          {/* Graticule Circles */}
          <circle cx="200" cy="90" r="80" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 6" className="opacity-30" />
          <circle cx="200" cy="90" r="140" stroke="currentColor" strokeWidth="0.5" strokeDasharray="5 10" className="opacity-20" />

          {/* Stylized Vector Landmasses */}
          <path
            d="M50,70 Q70,50 90,65 T130,60 T160,80 T130,120 T90,105 T60,110 Z"
            fill="currentColor"
            fillOpacity="0.04"
            stroke="currentColor"
            strokeWidth="1"
            className="text-primary-base-color"
          />
          <path
            d="M220,50 Q260,30 300,50 T340,80 T300,130 T250,110 T230,80 Z"
            fill="currentColor"
            fillOpacity="0.04"
            stroke="currentColor"
            strokeWidth="1"
            className="text-primary-base-color"
          />
          <path
            d="M160,110 Q180,95 200,120 T220,140 T170,160 Z"
            fill="currentColor"
            fillOpacity="0.04"
            stroke="currentColor"
            strokeWidth="0.8"
            className="text-primary-base-color"
          />

          {/* Sector grid markers */}
          <line x1="200" y1="0" x2="200" y2="180" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4" className="opacity-30" />
          <line x1="0" y1="90" x2="400" y2="90" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4" className="opacity-30" />

          {/* Pulse points representing temporal hubs */}
          <g>
            <circle cx="110" cy="80" r="3" fill="rgb(var(--color-accent))" />
            <circle cx="110" cy="80" r="8" stroke="rgb(var(--color-accent))" strokeWidth="0.5" className="animate-ping origin-center" />
          </g>
          <g>
            <circle cx="280" cy="70" r="3" fill="rgb(var(--color-accent))" />
            <circle cx="280" cy="70" r="8" stroke="rgb(var(--color-accent))" strokeWidth="0.5" className="animate-ping origin-center" />
          </g>
          <g>
            <circle cx="260" cy="110" r="2.5" fill="currentColor" />
            <circle cx="260" cy="110" r="6" stroke="currentColor" strokeWidth="0.5" className="animate-ping origin-center" />
          </g>
        </svg>

        {/* Compass Dial overlay */}
        <motion.div
          className="absolute bottom-2 right-2 w-16 h-16 opacity-40 border border-current text-primary-base border-dashed rounded-full pointer-events-none flex items-center justify-center"
          animate={{ rotate: 360 }}
          transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
        >
          <div className="w-10 h-0.5 bg-current absolute" />
          <div className="h-10 w-0.5 bg-current absolute" />
        </motion.div>
      </div>

      {/* Subtext telemetry info */}
      <div className="flex justify-between font-mono text-[9px] text-text-dim mt-1">
        <span>SECTOR: DELTA-9</span>
        <span>ENGINE STABILIZATION: OPTIMAL</span>
      </div>
    </div>
  );
}
