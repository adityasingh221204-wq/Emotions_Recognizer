'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Shield, Cpu, Users, Globe2, AlertCircle } from 'lucide-react';

interface SimulationStatusProps {
  prompt: string;
  onComplete: () => void;
}

interface Step {
  id: number;
  label: string;
  subtext: string;
  status: 'pending' | 'running' | 'done';
}

export default function SimulationStatus({ prompt, onComplete }: SimulationStatusProps) {
  const [steps, setSteps] = useState<Step[]>([
    { id: 1, label: 'Initializing Quantum Divergence Pipeline', subtext: 'Calibrating chronological anchors...', status: 'pending' },
    { id: 2, label: 'Simulating Socio-Economic Infrastructure', subtext: 'Estimating industrial outputs and trade nets...', status: 'pending' },
    { id: 3, label: 'Compiling Alternative Historical Milestones', subtext: 'Structuring causal event sequences...', status: 'pending' },
    { id: 4, label: 'Generating Key Personas & Faction Alignments', subtext: 'Formulating profiles and political actors...', status: 'pending' },
    { id: 5, label: 'Stabilizing Alternate Reality Feed Network', subtext: 'Populating social feed and news articles...', status: 'pending' },
  ]);

  const [activeStepIdx, setActiveStepIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [stats, setStats] = useState({
    techIndex: '0.00',
    stability: '100%',
    population: '0M',
    factionCount: '0',
  });

  // Log simulation updates in console-style
  useEffect(() => {
    const logInterval = setInterval(() => {
      const messages = [
        `SYS: Divergence prompt accepted: "${prompt.slice(0, 35)}${prompt.length > 35 ? '...' : ''}"`,
        'MEM: Allocating 64TB temporal buffer...',
        `CALC: Seed value determined: ${Math.floor(Math.random() * 999999)}`,
        'DATA: Injecting Babbage analytical matrices...',
        'GEN: Constructing timeline branch vectors...',
        'AI: Refining persona dialogue templates...',
        'CRITICAL: Instability index fluctuating...',
        'NET: Routing Mechanical-Net protocols...',
        'SYS: Matrix compilation stabilized.',
      ];
      setLogs((prev) => [...prev, messages[Math.floor(Math.random() * messages.length)]].slice(-6));
    }, 400);

    return () => clearInterval(logInterval);
  }, [prompt]);

  // Main simulation lifecycle
  useEffect(() => {
    if (activeStepIdx >= steps.length) {
      setTimeout(() => {
        onComplete();
      }, 800);
      return;
    }

    // Mark current step as running
    setSteps((prev) =>
      prev.map((step, idx) =>
        idx === activeStepIdx
          ? { ...step, status: 'running' }
          : step
      )
    );

    // Simulate progress bar count-up
    const stepDuration = 1200; // 1.2s per step
    const intervalTime = 40;
    const increment = 100 / (stepDuration / intervalTime);

    let currentStepProgress = 0;
    const progressTimer = setInterval(() => {
      currentStepProgress += increment;
      setProgress((prev) => Math.min(Math.round(activeStepIdx * 20 + currentStepProgress * 0.2), 100));

      // Randomize stats to look active
      setStats({
        techIndex: (Math.random() * 4 + activeStepIdx * 1.5).toFixed(2),
        stability: `${Math.round(100 - activeStepIdx * 8 - Math.random() * 5)}%`,
        population: `${(Math.random() * 50 + activeStepIdx * 120).toFixed(1)}M`,
        factionCount: `${Math.floor(activeStepIdx * 0.8) + 2}`,
      });
    }, intervalTime);

    // Transition to next step
    const stepTimer = setTimeout(() => {
      clearInterval(progressTimer);
      setSteps((prev) =>
        prev.map((step, idx) =>
          idx === activeStepIdx
            ? { ...step, status: 'done' }
            : step
        )
      );
      setActiveStepIdx((prev) => prev + 1);
    }, stepDuration);

    return () => {
      clearTimeout(stepTimer);
      clearInterval(progressTimer);
    };
  }, [activeStepIdx, steps.length, onComplete]);

  return (
    <div className="fixed inset-0 bg-background/95 z-50 flex items-center justify-center p-4 scanlines">
      <div className="max-w-3xl w-full glass-panel p-8 rounded-xl border border-primary-base/20 flex flex-col gap-6 relative overflow-hidden">
        {/* Terminal Header */}
        <div className="flex items-center justify-between border-b border-border-color pb-4">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-red-500 pulsing-aura" />
            <div className="flex items-center gap-2 text-primary-base font-mono text-sm font-bold uppercase tracking-wider">
              <Terminal size={16} />
              Reality Generation Engine v1.0
            </div>
          </div>
          <div className="text-accent-base font-mono text-xs">
            STATUS: COMPILING
          </div>
        </div>

        {/* Console grid showing values */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono">
          <div className="p-3 bg-white/5 border border-white/10 rounded flex items-center gap-3">
            <Cpu className="text-primary-base" size={20} />
            <div>
              <div className="text-[10px] text-text-dim uppercase">Tech Index</div>
              <div className="text-sm font-bold text-text-main">{stats.techIndex}</div>
            </div>
          </div>
          <div className="p-3 bg-white/5 border border-white/10 rounded flex items-center gap-3">
            <Shield className="text-green-400" size={20} />
            <div>
              <div className="text-[10px] text-text-dim uppercase">Stability</div>
              <div className="text-sm font-bold text-text-main">{stats.stability}</div>
            </div>
          </div>
          <div className="p-3 bg-white/5 border border-white/10 rounded flex items-center gap-3">
            <Users className="text-accent-base" size={20} />
            <div>
              <div className="text-[10px] text-text-dim uppercase">Population</div>
              <div className="text-sm font-bold text-text-main">{stats.population}</div>
            </div>
          </div>
          <div className="p-3 bg-white/5 border border-white/10 rounded flex items-center gap-3">
            <Globe2 className="text-blue-400" size={20} />
            <div>
              <div className="text-[10px] text-text-dim uppercase">Factions</div>
              <div className="text-sm font-bold text-text-main">{stats.factionCount}</div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-white/5 border border-white/10 rounded-full h-4 overflow-hidden p-[2px]">
          <motion.div
            className="h-full bg-gradient-to-r from-primary-base via-secondary-base to-accent-base rounded-full"
            style={{ width: `${progress}%` }}
            initial={{ width: '0%' }}
            animate={{ width: `${progress}%` }}
            transition={{ ease: 'easeOut' }}
          />
        </div>
        <div className="flex justify-between font-mono text-xs text-text-dim -mt-3">
          <span>PROGRESS DETECTOR: {progress}%</span>
          <span>STABILIZING MATRIX...</span>
        </div>

        {/* Main tasks status */}
        <div className="flex flex-col gap-4 my-2">
          {steps.map((step) => {
            const isPending = step.status === 'pending';
            const isRunning = step.status === 'running';
            const isDone = step.status === 'done';

            return (
              <div
                key={step.id}
                className={`flex items-start gap-4 p-3 rounded transition-all duration-300 ${
                  isRunning ? 'bg-white/10 border border-primary-base/30' : 'bg-transparent'
                }`}
              >
                <div className="mt-1">
                  {isDone && (
                    <div className="w-4 h-4 rounded-full bg-green-500/20 border border-green-500 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                    </div>
                  )}
                  {isRunning && (
                    <div className="w-4 h-4 rounded-full bg-primary-base/20 border border-primary-base flex items-center justify-center animate-spin">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary-base" />
                    </div>
                  )}
                  {isPending && (
                    <div className="w-4 h-4 rounded-full bg-white/5 border border-white/20 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-transparent" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-bold ${isRunning ? 'text-primary-base' : isDone ? 'text-text-main' : 'text-text-dim'}`}>
                    {step.label}
                  </div>
                  <div className="text-xs text-text-dim font-mono">{step.subtext}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Live log feed */}
        <div className="bg-black/40 border border-white/5 rounded p-4 font-mono text-[11px] text-green-400/90 min-h-[120px] flex flex-col gap-1.5 justify-end overflow-hidden">
          <AnimatePresence>
            {logs.map((log, index) => (
              <motion.div
                key={index + '-' + log.slice(0, 6)}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="truncate"
              >
                {log.startsWith('CRITICAL') ? (
                  <span className="text-red-400 flex items-center gap-1">
                    <AlertCircle size={10} />
                    {log}
                  </span>
                ) : (
                  log
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
