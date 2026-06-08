'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Clock, Info, ShieldAlert, Newspaper, Globe, Menu, X } from 'lucide-react';
import { useTheme } from '../../../context/theme-context';
import CanvasGrid from '../../../components/ui/canvas-grid';
import TimelineSidebar from '../../../components/dashboard/timeline-sidebar';
import FeedColumn from '../../../components/dashboard/feed-column';
import IntelligencePanel from '../../../components/dashboard/intelligence-panel';
import { FeedItem } from '../../../components/cards/feed-card';
import { World } from '../../../types';
import { api } from '../../../lib/api';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function WorldPage({ params }: PageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const worldId = resolvedParams.id;

  const { setThemeByEra, setTheme } = useTheme();

  // World Data & State
  const [world, setWorld] = useState<World | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Feed Items & Pagination State
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Mobile navigation panels toggles
  const [showMobileTimeline, setShowMobileTimeline] = useState(false);
  const [showMobileIntelligence, setShowMobileIntelligence] = useState(false);

  // 1. Fetch World & Theme initialization
  useEffect(() => {
    let active = true;

    async function fetchWorldDetails() {
      try {
        const data = await api.getWorld(worldId);
        if (!active) return;
        setWorld(data);
        setThemeByEra(data.era, data.prompt);
        setLoading(false);
      } catch (err) {
        if (!active) return;
        console.warn('World fetch failed, using Victorian stub fallback:', err);
        const fallback = getFallbackWorld();
        setWorld(fallback);
        setThemeByEra(fallback.era, fallback.prompt);
        setLoading(false);
      }
    }

    fetchWorldDetails();

    return () => {
      active = false;
      setTheme('default'); // reset on unmount
    };
  }, [worldId]);

  // 2. Fetch polymorphic feed data (posts, news, ads interleaved)
  useEffect(() => {
    if (!world) return;

    async function loadInitialFeed() {
      try {
        const [feedRes, newsRes, adsRes] = await Promise.all([
          api.getWorldFeed(worldId, 10),
          api.getWorldNews(worldId),
          api.getWorldAds(worldId),
        ]);

        // Transform and Interleave
        const postItems = feedRes.posts.map((p) => ({ type: 'post' as const, data: p }));
        const newsItems = newsRes.map((n) => ({ type: 'news' as const, data: n }));
        const adItems = adsRes.map((a) => ({ type: 'ad' as const, data: a }));

        const interleaved: FeedItem[] = [...postItems, ...newsItems, ...adItems];
        
        // Sort chronologically descending
        interleaved.sort(
          (a, b) => new Date(b.data.created_at).getTime() - new Date(a.data.created_at).getTime()
        );

        setFeedItems(interleaved);
        setHasMore(feedRes.hasMore);
        setNextCursor(feedRes.nextCursor);
      } catch (err) {
        console.warn('Error loading initial polymorphic feed, using seeds:', err);
        setFeedItems(getSeededFeedItems());
      }
    }

    loadInitialFeed();
  }, [world]);

  // 3. Load More Paginated Posts
  const handleLoadMore = async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);

    try {
      const feedRes = await api.getWorldFeed(worldId, 8, nextCursor || undefined);

      const newPostItems = feedRes.posts.map((p) => ({ type: 'post' as const, data: p }));
      
      setFeedItems((prev) => {
        const updated = [...prev, ...newPostItems];
        updated.sort(
          (a, b) => new Date(b.data.created_at).getTime() - new Date(a.data.created_at).getTime()
        );
        return updated;
      });

      setHasMore(feedRes.hasMore);
      setNextCursor(feedRes.nextCursor);
    } catch (err) {
      console.error('Failed loading page cursors:', err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // 4. Inject Local proclamation (Transmissions)
  const handleAddLocalPost = (content: string, faction: string) => {
    const newPostItem: FeedItem = {
      type: 'post',
      data: {
        id: `local-${Date.now()}`,
        world_id: worldId,
        persona_id: 'local-user',
        content,
        media_url: null,
        media_type: 'TEXT',
        likes_count: 0,
        reposts_count: 0,
        created_at: new Date().toISOString(),
        persona: {
          id: 'local-persona-id',
          name: 'Temporal Observer',
          handle: 'temp_anchor_01',
          avatar: '',
          role: faction,
          influence_score: 99,
        },
      },
    };

    setFeedItems((prev) => [newPostItem, ...prev]);
  };

  const handlePersonaProfileRedirect = (personaId: string) => {
    router.push(`/world/${worldId}/persona/${personaId}`);
  };

  const getFallbackWorld = (): World => ({
    id: worldId,
    prompt: 'What if the internet was invented in 1890?',
    name: 'The Victorian Web',
    summary: 'Charles Babbage completes the Analytical Engine under Royal charter, launching steam computing 60 years ahead of schedule.',
    era: 'Victorian Cyberpunk',
    tech_level: 'Mechanical steam computation, punch-card routers',
    gov_type: 'Corporatist Monarchy',
    status: 'ready',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    events: [
      {
        id: 'stub-event-1',
        world_id: worldId,
        year: '1890',
        title: 'Analytical Engine Finalized',
        description: 'Babbage completes the prototype with funding from the British Crown.',
        impact: 'Socio-economic industrial scale computing goes online.',
      },
      {
        id: 'stub-event-2',
        world_id: worldId,
        year: '1895',
        title: 'Net Expansion Act',
        description: 'Parliament passes the Net Act, placing tubes and mechanical lines across the empire.',
        impact: 'Information corporations take structural control.',
      },
    ],
  });

  const getSeededFeedItems = (): FeedItem[] => [
    {
      type: 'news',
      data: {
        id: 'seed-news-1',
        world_id: worldId,
        title: 'Steam Parliament Passes Net Expansion Act',
        content: 'The Imperial Steam Parliament voted 312-88 to fund expansion of the Mechanical Net to all major colonies, sparking a surge in stock value for BabbageCo.',
        category: 'POLITICS',
        publisher: 'The Chronos Daily',
        created_at: new Date(Date.now() - 3600000).toISOString(),
      },
    },
    {
      type: 'post',
      data: {
        id: 'seed-post-1',
        world_id: worldId,
        persona_id: 'seed-pers-1',
        content: 'Just upgraded the central steam-router. Speed is now up to 10 punch-cards per minute! Mechanical computation has never felt so fast. #SteamNet #Innovation',
        media_url: null,
        media_type: 'TEXT',
        likes_count: 420,
        reposts_count: 17,
        created_at: new Date(Date.now() - 7200000).toISOString(),
        persona: {
          id: 'stub-persona-id',
          name: 'Charles Babbage III',
          handle: 'steam_coder_99',
          avatar: '',
          role: 'SCIENTIST',
          influence_score: 87,
        },
      },
    },
    {
      type: 'ad',
      data: {
        id: 'seed-ad-1',
        world_id: worldId,
        company_name: 'BabbageCo Steam Solutions',
        tagline: 'Compute at the speed of steam.',
        description: 'Our Mark VII Analytical Coprocessor handles 500 mechanical calculations per hour. Command gears to solve your ledgers. Order today from BabbageCo.',
        image_url: null,
        price: '3 Sovereigns',
        created_at: new Date(Date.now() - 10800000).toISOString(),
      },
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center font-mono text-sm scanlines">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border border-primary-base border-t-transparent animate-spin" />
          <span className="text-text-dim text-glow animate-pulse">Syncing Portal Telemetry...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex flex-col p-4 md:p-6 overflow-hidden select-none">
      {/* Background Particles Grid */}
      <CanvasGrid />

      {/* World Page Header */}
      <header className="w-full max-w-7xl mx-auto flex items-center justify-between border-b border-white/5 pb-4 mb-6 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/')}
            className="w-9 h-9 rounded-full border border-white/10 hover:border-accent-base bg-white/5 flex items-center justify-center text-text-dim hover:text-text-main cursor-pointer hover:shadow-[0_0_8px_rgba(var(--glow-color),0.2)] transition-all"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-xl font-bold font-serif text-text-main tracking-tight leading-none flex items-center gap-2">
              {world?.name}
            </h1>
            <span className="text-[10px] font-mono text-accent-base uppercase tracking-wider">
              {world?.era}
            </span>
          </div>
        </div>

        {/* Mobile controls */}
        <div className="flex md:hidden gap-2">
          <button
            onClick={() => setShowMobileTimeline(true)}
            className="px-3 py-1.5 border border-white/10 rounded-lg text-[10px] font-mono flex items-center gap-1.5 text-text-dim bg-white/5"
          >
            <Clock size={12} />
            <span>Timeline</span>
          </button>
          <button
            onClick={() => setShowMobileIntelligence(true)}
            className="px-3 py-1.5 border border-white/10 rounded-lg text-[10px] font-mono flex items-center gap-1.5 text-text-dim bg-white/5"
          >
            <Info size={12} />
            <span>Intelligence</span>
          </button>
        </div>

        <div className="hidden md:flex gap-4 font-mono text-[10px] text-text-dim">
          <span>REALITY_KEY: {worldId.slice(0, 8)}</span>
          <span className="text-emerald-400">STABILIZED</span>
        </div>
      </header>

      {/* Three Panel Layout Container */}
      <div className="flex-1 w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 z-10 relative">
        
        {/* Left Panel: Cause-Effect Timeline (4 Cols on Desktop) */}
        <aside className="hidden md:block md:col-span-3 h-full">
          <TimelineSidebar events={world?.events || []} />
        </aside>

        {/* Center Panel: Social Feed (5 Cols on Desktop) */}
        <main className="col-span-1 md:col-span-6 h-full">
          <FeedColumn
            initialItems={feedItems}
            worldId={worldId}
            hasMore={hasMore}
            nextCursor={nextCursor}
            onLoadMore={handleLoadMore}
            onPersonaClick={handlePersonaProfileRedirect}
            onAddLocalPost={handleAddLocalPost}
            isLoadingMore={isLoadingMore}
          />
        </main>

        {/* Right Panel: World Intelligence Telemetry (3 Cols on Desktop) */}
        <aside className="hidden md:block md:col-span-3 h-full">
          {world && <IntelligencePanel world={world} />}
        </aside>
      </div>

      {/* -------------------------------------------------------------
          MOBILE MODALS / SLIDEOUTS (USING FRAMER MOTION)
          ------------------------------------------------------------- */}
      <AnimatePresence>
        {/* Mobile Left Panel (Timeline drawer from bottom) */}
        {showMobileTimeline && (
          <div className="fixed inset-0 z-50 bg-black/60 md:hidden flex items-end">
            {/* Backdrop click closer */}
            <div className="absolute inset-0" onClick={() => setShowMobileTimeline(false)} />
            
            <motion.div
              className="w-full bg-background border-t border-border-color rounded-t-2xl p-5 relative z-10 max-h-[80vh] overflow-hidden flex flex-col"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            >
              <div className="flex justify-between items-center border-b border-white/5 pb-3 mb-4">
                <span className="font-mono text-xs text-text-main font-bold">Chronology Branches</span>
                <button
                  onClick={() => setShowMobileTimeline(false)}
                  className="p-1 hover:text-accent-base text-text-dim"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto pr-1">
                <TimelineSidebar events={world?.events || []} />
              </div>
            </motion.div>
          </div>
        )}

        {/* Mobile Right Panel (Intelligence slide-over from right) */}
        {showMobileIntelligence && (
          <div className="fixed inset-0 z-50 bg-black/60 md:hidden flex justify-end">
            <div className="absolute inset-0" onClick={() => setShowMobileIntelligence(false)} />

            <motion.div
              className="w-[85vw] bg-background border-l border-border-color p-5 relative z-10 h-full overflow-hidden flex flex-col"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            >
              <div className="flex justify-between items-center border-b border-white/5 pb-3 mb-4">
                <span className="font-mono text-xs text-text-main font-bold">World Intelligence</span>
                <button
                  onClick={() => setShowMobileIntelligence(false)}
                  className="p-1 hover:text-accent-base text-text-dim"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto pr-1">
                {world && <IntelligencePanel world={world} />}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
