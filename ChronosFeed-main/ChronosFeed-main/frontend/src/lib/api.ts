import { World, WorldFeedResponse, Persona, News, Ad } from '../types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function fetchJson<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
  });

  if (!response.ok) {
    let errorMsg = `HTTP error! status: ${response.status}`;
    try {
      const errorJson = await response.json();
      if (errorJson && errorJson.error) {
        errorMsg = errorJson.error;
      }
    } catch {
      // ignore JSON parse error on non-json error responses
    }
    throw new Error(errorMsg);
  }

  const result = await response.json();
  return result.data as T;
}

export const api = {
  // Worlds
  createWorld: (prompt: string) =>
    fetchJson<{ worldId: string; status: 'generating' | 'ready' }>('/api/worlds', {
      method: 'POST',
      body: JSON.stringify({ prompt }),
    }),

  getWorlds: () => fetchJson<World[]>('/api/worlds'),

  getWorld: (id: string) => fetchJson<World>(`/api/worlds/${id}`),

  // Feed
  getWorldFeed: (id: string, limit = 10, cursor?: string) => {
    let url = `/api/worlds/${id}/feed?limit=${limit}`;
    if (cursor) {
      url += `&cursor=${encodeURIComponent(cursor)}`;
    }
    return fetchJson<WorldFeedResponse>(url);
  },

  // Personas
  getWorldPersonas: (id: string) => fetchJson<Persona[]>(`/api/worlds/${id}/personas`),

  getPersona: (id: string) => fetchJson<Persona & { posts: any[] }>(`/api/personas/${id}`),

  // News
  getWorldNews: (id: string, category?: string) => {
    let url = `/api/worlds/${id}/news`;
    if (category) {
      url += `?category=${category}`;
    }
    return fetchJson<News[]>(url);
  },

  // Ads
  getWorldAds: (id: string) => fetchJson<Ad[]>(`/api/worlds/${id}/ads`),
};
