'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Award, Shield, User, Heart, RotateCw, Skull, Handshake, Landmark } from 'lucide-react';
import CanvasGrid from '../../../../../components/ui/canvas-grid';
import { Persona } from '../../../../../types';
import { api } from '../../../../../lib/api';

interface PageProps {
  params: Promise<{ id: string; personaId: string }>;
}

export default function PersonaPage({ params }: PageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const worldId = resolvedParams.id;
  const personaId = resolvedParams.personaId;

  const [persona, setPersona] = useState<(Persona & { posts?: any[] }) | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPersonaDetails() {
      try {
        const data = await api.getPersona(personaId);
        setPersona(data);
      } catch (err) {
        console.warn('Persona load failed, seeding fallback dossier:', err);
        setPersona(getFallbackPersona());
      } finally {
        setLoading(false);
      }
    }
    loadPersonaDetails();
  }, [personaId]);

  const getFallbackPersona = (): Persona & { posts?: any[] } => ({
    id: personaId,
    world_id: worldId,
    name: 'Charles Babbage III',
    handle: 'steam_coder_99',
    avatar: '',
    bio: "Lead engineer at His Majesty's Steam-Net Registry. Dedicated to refining mechanical computation to connect the British Empire.",
    role: 'SCIENTIST',
    followers_count: 14200,
    following_count: 88,
    influence_score: 87,
    interests: ['gears', 'punch-cards', 'earl grey tea'],
    personality: 'Eccentric, highly technical, easily excited by prime factors.',
    posts: [
      {
        id: 'post-1',
        world_id: worldId,
        persona_id: personaId,
        content: 'Just upgraded the central steam-router. Speed is now up to 10 punch-cards per minute! Mechanical computation has never felt so fast. #SteamNet',
        media_url: null,
        media_type: 'TEXT',
        likes_count: 420,
        reposts_count: 17,
        created_at: new Date().toISOString(),
      },
      {
        id: 'post-2',
        world_id: worldId,
        persona_id: personaId,
        content: 'Is there anything more beautiful than the rhythmic clicking of 1,000 brass cogwheels compiling a logarithm? I think not.',
        media_url: null,
        media_type: 'TEXT',
        likes_count: 189,
        reposts_count: 5,
        created_at: new Date(Date.now() - 86400000).toISOString(),
      },
    ],
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center font-mono text-sm scanlines">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border border-primary-base border-t-transparent animate-spin" />
          <span className="text-text-dim text-glow animate-pulse">Retrieving Dossier...</span>
        </div>
      </div>
    );
  }

  const roleLabel = (role: string) => {
    switch (role) {
      case 'SCIENTIST': return 'Imperial Engineer / Scientist';
      case 'POLITICIAN': return 'State Chancellor / Senator';
      case 'BRAND': return 'Industrial Syndicate / Brand';
      default: return 'Public Influencer / Citizen';
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col p-4 md:p-6 overflow-hidden select-none">
      {/* Background canvas */}
      <CanvasGrid />

      {/* Page Header */}
      <header className="w-full max-w-5xl mx-auto flex items-center justify-between border-b border-white/5 pb-4 mb-8 z-10">
        <button
          onClick={() => router.push(`/world/${worldId}`)}
          className="w-9 h-9 rounded-full border border-white/10 hover:border-accent-base bg-white/5 flex items-center justify-center text-text-dim hover:text-text-main cursor-pointer hover:shadow-[0_0_8px_rgba(var(--glow-color),0.2)] transition-all"
        >
          <ArrowLeft size={16} />
        </button>
        <span className="font-mono text-[10px] text-text-dim">
          DOSSIER TELEMETRY // SECURE INDEX
        </span>
      </header>

      {/* Main content grid */}
      <div className="flex-1 w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 z-10 relative">
        
        {/* Profile Card & Bio Details (5 Cols) */}
        <aside className="col-span-1 md:col-span-5 flex flex-col gap-6">
          {/* Main Dossier Card */}
          <div className="glass-panel p-6 rounded-2xl border border-border-color flex flex-col items-center text-center gap-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 border-b border-l border-white/5 rounded-bl-full bg-white/2 flex items-center justify-center text-accent-base font-mono text-xs font-bold">
              ID #{personaId.slice(0, 4)}
            </div>

            {/* Large Avatar */}
            <div className="w-24 h-24 rounded-full border-2 border-accent-base bg-white/5 flex items-center justify-center font-serif text-3xl font-extrabold text-accent-base text-glow my-3">
              {persona?.name.charAt(0)}
            </div>

            <div className="flex flex-col gap-1">
              <h2 className="text-2xl font-bold font-serif text-text-main">{persona?.name}</h2>
              <span className="text-xs text-text-dim font-mono">@{persona?.handle}</span>
            </div>

            <span className="px-3.5 py-1 border border-primary-base/20 bg-primary-base/5 text-primary-base font-mono text-[10px] rounded-full uppercase tracking-wider font-bold">
              {roleLabel(persona?.role || '')}
            </span>

            {/* Profile Statistics */}
            <div className="grid grid-cols-3 w-full gap-4 border-t border-b border-white/5 py-4 font-mono mt-2">
              <div>
                <div className="text-[9px] text-text-dim/60 uppercase">Followers</div>
                <div className="text-sm font-bold text-text-main">{persona?.followers_count.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-[9px] text-text-dim/60 uppercase">Influence</div>
                <div className="text-sm font-bold text-accent-base text-glow">{persona?.influence_score}%</div>
              </div>
              <div>
                <div className="text-[9px] text-text-dim/60 uppercase">Approval</div>
                <div className="text-sm font-bold text-green-400">74%</div>
              </div>
            </div>

            {/* Interests tags */}
            <div className="flex flex-wrap justify-center gap-1.5 mt-2">
              {persona?.interests.map((int) => (
                <span key={int} className="px-2 py-0.5 border border-white/5 bg-white/5 rounded text-[9px] font-mono text-text-dim">
                  #{int}
                </span>
              ))}
            </div>
          </div>

          {/* Dossier Intel (Beliefs, Alliances, Enemies) */}
          <div className="glass-panel p-5 rounded-2xl border border-border-color flex flex-col gap-4">
            <h3 className="font-mono text-xs uppercase tracking-wider text-text-dim border-b border-white/5 pb-2">
              Dossier Intel
            </h3>

            {/* Biography */}
            <div className="flex flex-col gap-1">
              <span className="text-[9px] font-mono text-text-dim/60 uppercase flex items-center gap-1">
                <User size={10} className="text-primary-base" />
                History Record
              </span>
              <p className="text-xs text-text-dim leading-relaxed font-sans">{persona?.bio}</p>
            </div>

            {/* Core Beliefs */}
            <div className="flex flex-col gap-1 mt-1">
              <span className="text-[9px] font-mono text-text-dim/60 uppercase flex items-center gap-1">
                <Shield size={10} className="text-primary-base" />
                Philosophical Alignment
              </span>
              <p className="text-xs text-text-dim leading-relaxed font-sans italic">
                "{persona?.personality || 'The mechanical calculation yields truth. Let no cogwheel fail.'}"
              </p>
            </div>

            {/* Alliances & Enemies */}
            <div className="grid grid-cols-2 gap-3 mt-1.5 border-t border-white/5 pt-3">
              <div className="flex flex-col gap-1 font-mono text-[10px]">
                <span className="text-green-400 flex items-center gap-1">
                  <Handshake size={10} />
                  ALLIANCES
                </span>
                <span className="text-text-dim font-bold">Crown Syndicate</span>
              </div>
              <div className="flex flex-col gap-1 font-mono text-[10px]">
                <span className="text-red-400 flex items-center gap-1">
                  <Skull size={10} />
                  ENEMIES
                </span>
                <span className="text-text-dim font-bold">Luddite Coal Unions</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Role in World History & Recent Feed Posts (7 Cols) */}
        <main className="col-span-1 md:col-span-7 flex flex-col gap-6">
          {/* Core Feature: Role in World History */}
          <div className="glass-panel p-6 rounded-2xl border border-accent-base/20 bg-gradient-to-r from-accent-base/5 via-transparent to-transparent flex flex-col gap-3 relative overflow-hidden shadow-lg shadow-black/30">
            <div className="flex items-center gap-2 border-b border-white/5 pb-2.5">
              <Award size={16} className="text-accent-base animate-pulse" />
              <h3 className="font-mono text-xs uppercase tracking-wider text-text-main font-bold">
                Role in World History
              </h3>
            </div>
            
            <p className="text-sm font-serif text-text-main leading-relaxed italic">
              "Pioneered the development of the Mark IV Analytical Routing Chip, securing British technological hegemony over the mechanical Telegraph Net in 1890, directly countering Luddite data-saboteurs in Edinburgh."
            </p>
            
            <div className="flex items-center justify-between font-mono text-[9px] text-text-dim/60 pt-2.5">
              <span>TEMPORAL INFLUENCE CATEGORY: CIVILIZATION ANCHOR</span>
              <span className="text-accent-base">HISTORICAL SIGNIFICANCE: HIGH</span>
            </div>
          </div>

          {/* Persona's Feed Posts */}
          <div className="flex flex-col gap-4">
            <h3 className="font-mono text-xs uppercase tracking-wider text-text-dim border-b border-white/5 pb-3">
              Recent Net Transmissions
            </h3>

            {persona?.posts && persona.posts.length > 0 ? (
              <div className="flex flex-col gap-4">
                {persona.posts.map((post) => (
                  <div key={post.id} className="glass-panel p-5 rounded-xl border border-border-color flex flex-col gap-3">
                    <p className="text-sm text-text-main leading-relaxed font-sans">{post.content}</p>
                    <div className="flex items-center gap-6 font-mono text-xs text-text-dim pt-2 border-t border-white/5">
                      <div className="flex items-center gap-1.5">
                        <Heart size={12} className="text-rose-500 fill-rose-500/10" />
                        <span>{post.likes_count}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <RotateCw size={12} className="text-green-400" />
                        <span>{post.reposts_count}</span>
                      </div>
                      <span className="text-[10px] text-text-dim/50 ml-auto">
                        {new Date(post.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 border border-white/5 bg-white/2 rounded-xl text-center font-mono text-xs text-text-dim">
                No recent transmissions detected.
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
