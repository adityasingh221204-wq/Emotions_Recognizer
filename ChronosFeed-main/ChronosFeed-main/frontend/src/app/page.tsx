'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Terminal as TerminalIcon, Globe, Compass, GitBranch, ArrowRight } from 'lucide-react';
import CanvasGrid from '../components/ui/canvas-grid';
import SimulationStatus from '../components/ui/simulation-status';
import WorldCard from '../components/cards/world-card';
import { World } from '../types';
import { api } from '../lib/api';

const EXAMPLE_PROMPTS = [
  'What if the internet was invented in 1890?',
  'What if Rome never fell?',
  'What if humanity colonized Mars in 1900?',
  'What if the Library of Alexandria survived?',
];

export default function LandingPage() {
  const router = useRouter();
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedWorldId, setGeneratedWorldId] = useState<string | null>(null);
  const [worlds, setWorlds] = useState<World[]>([]);
  const [isLoadingWorlds, setIsLoadingWorlds] = useState(true);

  // Load live worlds from backend or fallback to stub seeds
  useEffect(() => {
    async function loadWorlds() {
      try {
        const fetched = await api.getWorlds();
        if (fetched && fetched.length > 0) {
          setWorlds(fetched);
        } else {
          setWorlds(getFallbackWorlds());
        }
      } catch (err) {
        console.warn('Backend worlds query failed, using seeded worlds:', err);
        setWorlds(getFallbackWorlds());
      } finally {
        setIsLoadingWorlds(false);
      }
    }
    loadWorlds();
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsGenerating(true);

    try {
      // Initiate async generation on backend
      const result = await api.createWorld(prompt);
      setGeneratedWorldId(result.worldId);
    } catch (err) {
      console.error('Error generating world, falling back to stub-world-id:', err);
      // Fallback for hackathon ease if backend isn't running
      setGeneratedWorldId('stub-world-id');
    }
  };

  const handlePromptClick = (p: string) => {
    setPrompt(p);
  };

  const handleSimulationComplete = () => {
    if (generatedWorldId) {
      router.push(`/world/${generatedWorldId}`);
    }
  };

  const getFallbackWorlds = (): World[] => [
    {
      id: 'stub-world-id',
      prompt: 'What if the internet was invented in 1890?',
      name: 'The Victorian Web',
      summary: 'In 1890, Charles Babbage completed the Analytical Engine, leading to a primitive steam-powered global network connecting major British colonies.',
      era: 'Victorian Cyberpunk',
      tech_level: 'Mechanical steam computation, punch-card routers',
      gov_type: 'Corporatist Monarchy',
      status: 'ready',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'roman-world-id',
      prompt: 'What if Rome never fell?',
      name: 'Imperium Nova',
      summary: 'The Roman Empire survives into the modern era, merging ancient senatorial systems with geothermal grids, steam-powered legions, and marble computer lattices.',
      era: 'Roman Cyberpunk',
      tech_level: 'Geothermal combustion, senatorial lattices',
      gov_type: 'Senatorial Republic',
      status: 'ready',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'mars-world-id',
      prompt: 'What if humanity colonized Mars in 1900?',
      name: 'The Rusty Mars Empire',
      summary: 'Victorian steamships equipped with atmospheric coal sails colonize the red sands, creating a feudal space station network ruled by copper baronies.',
      era: 'Steampunk Space Era',
      tech_level: 'Coal-sails space flight, pressurized biodomes',
      gov_type: 'Industrial Feudalism',
      status: 'ready',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  return (
    <main className="min-h-screen relative flex flex-col p-4 md:p-8 overflow-hidden select-none">
      {/* Dynamic particles and grid background */}
      <CanvasGrid />

      {/* Cinematic terminal loader overlay */}
      <AnimatePresence>
        {isGenerating && (
          <SimulationStatus prompt={prompt} onComplete={handleSimulationComplete} />
        )}
      </AnimatePresence>

      {/* Glowing atmospheric circles */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary-base/5 filter blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-accent-base/5 filter blur-[120px] pointer-events-none" />

      {/* Header Log */}
      <header className="w-full max-w-7xl mx-auto flex items-center justify-between border-b border-white/5 pb-4 mb-8 z-10 font-mono text-[11px] text-text-dim">
        <div className="flex items-center gap-2">
          <TerminalIcon size={14} className="text-primary-base" />
          <span className="font-bold text-text-main tracking-wider uppercase">ChronosFeed Console</span>
        </div>
        <div className="flex gap-4">
          <span>PORTAL: ACTIVE</span>
          <span className="text-accent-base animate-pulse">NODE_01</span>
        </div>
      </header>

      {/* Content Area */}
      <div className="flex-1 w-full max-w-7xl mx-auto flex flex-col gap-16 justify-center z-10">
        
        {/* Cinematic Prompt Console (Hero Section) */}
        <section className="flex flex-col items-center text-center max-w-3xl mx-auto gap-8 pt-8 md:pt-16">
          <div className="flex flex-col gap-3">
            <span className="font-mono text-xs uppercase tracking-widest text-accent-base flex items-center justify-center gap-2">
              <Compass size={14} className="animate-spin" style={{ animationDuration: '8s' }} />
              Reality Divergence Console
            </span>
            <h1 className="text-4xl md:text-6xl font-black font-serif tracking-tight leading-[1.15] text-text-main">
              History itself became a{' '}
              <span className="bg-gradient-to-r from-primary-base via-secondary-base to-accent-base bg-clip-text text-transparent text-glow">
                social network.
              </span>
            </h1>
            <p className="text-sm md:text-base text-text-dim max-w-xl mx-auto mt-2 leading-relaxed">
              Inject a historical pivot point to compile complete alternate civilizations, political factions, timelines, and live feeds.
            </p>
          </div>

          {/* Large Console Prompt Input */}
          <form onSubmit={handleGenerate} className="w-full glass-panel p-2 rounded-2xl flex items-center gap-2 border border-primary-base/20 max-w-2xl shadow-xl shadow-black/40">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. What if Rome never fell?"
              className="flex-1 bg-transparent border-none focus:outline-none p-3 font-serif text-base text-text-main placeholder-text-dim/55 ml-2"
            />
            <button
              type="submit"
              disabled={!prompt.trim()}
              className="glass-button px-6 py-3 rounded-xl font-mono text-sm flex items-center gap-2 font-bold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed group/btn"
            >
              <Sparkles size={16} className="text-accent-base animate-pulse" />
              <span>Compile</span>
              <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
            </button>
          </form>

          {/* Quick Seed Prompts */}
          <div className="flex flex-col items-center gap-3">
            <span className="font-mono text-[10px] text-text-dim/60 uppercase tracking-widest">
              Select Divergence Seed
            </span>
            <div className="flex flex-wrap justify-center gap-2.5 max-w-xl">
              {EXAMPLE_PROMPTS.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handlePromptClick(p)}
                  className="px-3.5 py-1.5 rounded-full border border-white/5 bg-white/5 hover:bg-white/10 hover:border-accent-base transition-all duration-300 font-mono text-[10px] text-text-dim hover:text-text-main cursor-pointer"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Live generated Worlds Gallery */}
        <section className="flex flex-col gap-6 pt-8 pb-16">
          <div className="flex items-center justify-between border-b border-white/5 pb-3.5">
            <div className="flex items-center gap-2.5">
              <Globe size={18} className="text-primary-base" />
              <h2 className="text-lg font-bold font-serif text-text-main">
                Compiled Alternate Realities
              </h2>
            </div>
            <span className="font-mono text-[10px] text-text-dim">
              GALLERY INDEX: {worlds.length} SYSTEM{worlds.length !== 1 && 'S'}
            </span>
          </div>

          {isLoadingWorlds ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className="glass-panel p-6 rounded-xl border border-white/5 h-[300px] flex flex-col justify-between animate-pulse">
                  <div className="flex flex-col gap-3">
                    <div className="w-16 h-3 bg-white/10 rounded" />
                    <div className="w-48 h-6 bg-white/10 rounded" />
                    <div className="w-full h-12 bg-white/10 rounded" />
                  </div>
                  <div className="w-full h-8 bg-white/10 rounded" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {worlds.map((world) => (
                <WorldCard key={world.id} world={world} />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
