'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Database } from 'lucide-react';
import FeedCard, { FeedItem } from '../cards/feed-card';
import FeedComposer from './feed-composer';
import { Post } from '../../types';

interface FeedColumnProps {
  initialItems: FeedItem[];
  worldId: string;
  hasMore: boolean;
  nextCursor: string | null;
  onLoadMore: () => Promise<void>;
  onPersonaClick?: (personaId: string) => void;
  onAddLocalPost: (content: string, faction: string) => void;
  isLoadingMore: boolean;
}

export default function FeedColumn({
  initialItems,
  worldId,
  hasMore,
  nextCursor,
  onLoadMore,
  onPersonaClick,
  onAddLocalPost,
  isLoadingMore,
}: FeedColumnProps) {
  return (
    <div className="flex flex-col gap-6 h-full max-h-[85vh] overflow-y-auto pr-2 custom-scrollbar select-none">
      {/* Compose Feed Box */}
      <FeedComposer onPublish={onAddLocalPost} />

      {/* Feed Stream */}
      {initialItems.length > 0 ? (
        <div className="flex flex-col gap-5">
          <AnimatePresence initial={false}>
            {initialItems.map((item) => {
              // Create unique key based on type + ID
              const itemKey = `${item.type}-${item.type === 'post' ? item.data.id : item.type === 'news' ? item.data.id : item.data.id}`;
              return (
                <motion.div
                  key={itemKey}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                >
                  <FeedCard item={item} onPersonaClick={onPersonaClick} />
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Load More Button */}
          {hasMore && (
            <div className="flex justify-center mt-2 mb-6">
              <button
                onClick={onLoadMore}
                disabled={isLoadingMore}
                className="glass-button w-full py-3.5 rounded-xl text-xs font-mono uppercase tracking-wider font-bold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoadingMore ? (
                  <>
                    <RefreshCw className="animate-spin" size={14} />
                    <span>Syncing Temporal Stream...</span>
                  </>
                ) : (
                  <>
                    <Database size={14} />
                    <span>Retrieve Further Records</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-16 glass-panel rounded-xl text-center border-dashed">
          <RefreshCw className="animate-spin text-accent-base/40 mb-4" size={36} />
          <span className="font-mono text-sm text-text-dim">Reconstituting Feed Channels...</span>
        </div>
      )}
    </div>
  );
}
