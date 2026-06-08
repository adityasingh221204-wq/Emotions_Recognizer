'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, RotateCw, Newspaper, Tag, Compass, Binary, AlertTriangle, MessageSquare } from 'lucide-react';
import { Post, News, Ad } from '../../types';

export type FeedItem =
  | { type: 'post'; data: Post }
  | { type: 'news'; data: News }
  | { type: 'ad'; data: Ad };

interface FeedCardProps {
  item: FeedItem;
  onPersonaClick?: (personaId: string) => void;
}

export default function FeedCard({ item, onPersonaClick }: FeedCardProps) {
  const [liked, setLiked] = useState(false);
  const [reposted, setReposted] = useState(false);
  const [likesCount, setLikesCount] = useState(
    item.type === 'post' ? item.data.likes_count : 0
  );
  const [repostsCount, setRepostsCount] = useState(
    item.type === 'post' ? item.data.reposts_count : 0
  );

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLiked(!liked);
    setLikesCount((prev) => (liked ? prev - 1 : prev + 1));
  };

  const handleRepost = (e: React.MouseEvent) => {
    e.stopPropagation();
    setReposted(!reposted);
    setRepostsCount((prev) => (reposted ? prev - 1 : prev + 1));
  };

  // -------------------------------------------------------------
  // RENDERING: 1. NEWS CARD (THE CHRONOS TELEGRAPH)
  // -------------------------------------------------------------
  if (item.type === 'news') {
    const { title, content, category, publisher, created_at } = item.data;
    return (
      <motion.div
        className="bg-[#f2ebd9] text-[#1f1a14] border-2 border-[#806f50] p-6 rounded-sm shadow-md font-serif relative overflow-hidden select-none"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Tiny aged print overlays */}
        <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] bg-[size:4px_4px]" />
        
        {/* Masthead */}
        <div className="flex flex-col items-center border-b-2 border-double border-[#806f50] pb-3 mb-4">
          <div className="flex items-center gap-2 text-[10px] tracking-widest font-mono font-bold uppercase text-[#5a4e37]">
            <Newspaper size={12} />
            {publisher || 'The Chronos daily'}
          </div>
          <h4 className="text-3xl font-black uppercase text-center my-1.5 tracking-tight font-serif text-[#111]">
            {title}
          </h4>
          <div className="flex justify-between w-full text-[9px] font-mono uppercase text-[#5a4e37] pt-1 border-t border-[#806f50]/40">
            <span>Section: {category}</span>
            <span>{new Date(created_at).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Content */}
        <p className="text-xs leading-relaxed text-[#2a231b] first-letter:text-4xl first-letter:font-bold first-letter:float-left first-letter:mr-2 first-letter:leading-none">
          {content}
        </p>

        {/* Newspaper Footer */}
        <div className="mt-4 pt-3 border-t border-dashed border-[#806f50]/50 flex justify-between items-center text-[10px] font-mono text-[#5a4e37]">
          <span>PRICE: 1 PENNY</span>
          <span>IMPERIAL PRESS LICENSE #408</span>
        </div>
      </motion.div>
    );
  }

  // -------------------------------------------------------------
  // RENDERING: 2. ADVERTISEMENT CARD (BLUEPRINT SOLUTION)
  // -------------------------------------------------------------
  if (item.type === 'ad') {
    const { company_name, tagline, description, price, created_at } = item.data;
    return (
      <motion.div
        className="bg-[#0b2447] text-[#5fd6fa] border border-[#19376d] p-6 rounded-lg font-mono relative overflow-hidden flex flex-col justify-between h-[280px] select-none"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Blueprint grids */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(95,214,250,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(95,214,250,0.03)_1px,transparent_1px)] bg-[size:12px_12px] pointer-events-none" />
        
        <div>
          <div className="flex items-center justify-between border-b border-[#19376d] pb-2.5 mb-3.5">
            <span className="text-[10px] tracking-widest text-[#a5f3fc] uppercase flex items-center gap-1.5">
              <Tag size={12} />
              Patent Commercial
            </span>
            <span className="text-xs font-bold text-amber-400 border border-amber-400/40 px-2 py-0.5 rounded">
              {price}
            </span>
          </div>

          <h4 className="text-lg font-bold text-white tracking-wide uppercase font-serif mb-1">
            {company_name}
          </h4>
          <p className="text-xs text-[#a5f3fc] italic mb-3">"{tagline}"</p>
          <p className="text-xs text-[#a5f3fc]/80 leading-relaxed font-sans line-clamp-4">
            {description}
          </p>
        </div>

        <div className="border-t border-[#19376d]/50 pt-2.5 flex justify-between items-center text-[9px] text-[#5fd6fa]/60">
          <span>BABBAGE ENTERPRISES CO.</span>
          <span>{new Date(created_at).toLocaleDateString()}</span>
        </div>
      </motion.div>
    );
  }

  // -------------------------------------------------------------
  // RENDERING: 3. POLYSOCIAL FEED CARD (POSTS)
  // -------------------------------------------------------------
  const { id, content, created_at, persona } = item.data;
  const role = persona?.role || 'INFLUENCER';

  // Sub-classification of post styles based on Author Role
  const getPostStyle = (authorRole: string) => {
    switch (authorRole) {
      case 'SCIENTIST':
        return {
          headerBg: 'border-emerald-500/20 text-emerald-400',
          icon: <Binary size={14} />,
          badgeLabel: 'Research Ledger',
          cardClass: 'hover:border-emerald-500/30',
        };
      case 'POLITICIAN':
        return {
          headerBg: 'border-red-500/20 text-red-400',
          icon: <AlertTriangle size={14} />,
          badgeLabel: 'State Gazette',
          cardClass: 'hover:border-red-500/30 bg-gradient-to-r from-red-500/5 via-transparent to-transparent',
        };
      case 'BRAND':
        return {
          headerBg: 'border-amber-500/20 text-amber-400',
          icon: <Compass size={14} />,
          badgeLabel: 'Industrial Dispatch',
          cardClass: 'hover:border-amber-500/30',
        };
      default:
        return {
          headerBg: 'border-primary-base/20 text-primary-base',
          icon: <Compass size={14} />,
          badgeLabel: 'Temporal Feed',
          cardClass: '',
        };
    }
  };

  const styleMeta = getPostStyle(role);

  return (
    <motion.div
      className={`glass-panel p-5 rounded-xl border border-border-color flex flex-col gap-4 select-none ${styleMeta.cardClass}`}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      {/* Author and Metadata Header */}
      <div className="flex items-start justify-between">
        <div 
          className="flex items-center gap-3 cursor-pointer group/author"
          onClick={() => onPersonaClick && onPersonaClick(persona?.id || '')}
        >
          {/* Avatar Placeholder */}
          <div className="w-10 h-10 rounded-full border border-white/10 bg-white/5 flex items-center justify-center font-serif font-bold text-accent-base text-sm group-hover/author:border-accent-base group-hover/author:text-glow transition-all duration-300">
            {persona?.name ? persona.name.charAt(0) : '?'}
          </div>

          <div>
            <div className="text-sm font-bold text-text-main group-hover/author:text-accent-base transition-colors duration-200 flex items-center gap-1.5">
              {persona?.name || 'Charles Babbage III'}
              <span className="text-[9px] font-mono bg-white/5 border border-white/10 text-text-dim px-1.5 py-0.5 rounded font-normal">
                Influence: {persona?.influence_score || 50}
              </span>
            </div>
            <div className="text-xs text-text-dim">
              @{persona?.handle || 'steam_coder_99'}
            </div>
          </div>
        </div>

        {/* Faction/Topic Classification Badge */}
        <div className={`flex items-center gap-1 font-mono text-[9px] border rounded-full px-2.5 py-0.5 bg-white/5 ${styleMeta.headerBg}`}>
          {styleMeta.icon}
          <span>{styleMeta.badgeLabel}</span>
        </div>
      </div>

      {/* Main Content */}
      <p className="text-sm leading-relaxed text-text-main font-sans">
        {content}
      </p>

      {/* Social Engagement Panel */}
      <div className="flex justify-between items-center pt-3 border-t border-white/5 text-text-dim text-xs font-mono">
        <div className="flex items-center gap-6">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 transition-all duration-200 cursor-pointer ${
              liked ? 'text-rose-500 text-glow' : 'hover:text-rose-400'
            }`}
          >
            <Heart size={14} className={liked ? 'fill-current' : ''} />
            <span>{likesCount}</span>
          </button>

          <button
            onClick={handleRepost}
            className={`flex items-center gap-1.5 transition-all duration-200 cursor-pointer ${
              reposted ? 'text-green-400 text-glow' : 'hover:text-green-400'
            }`}
          >
            <RotateCw size={14} className={reposted ? 'rotate-180 duration-500' : ''} />
            <span>{repostsCount}</span>
          </button>
          
          <div className="flex items-center gap-1.5 hover:text-blue-400 transition-colors cursor-pointer">
            <MessageSquare size={14} />
            <span>{Math.floor(likesCount * 0.15)}</span>
          </div>
        </div>

        <span className="text-[10px] text-text-dim/60">
          {new Date(created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </motion.div>
  );
}
