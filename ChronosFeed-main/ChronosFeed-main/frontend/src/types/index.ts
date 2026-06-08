export interface World {
  id: string;
  prompt: string;
  name: string;
  summary: string;
  era: string;
  tech_level: string;
  gov_type: string;
  status: 'generating' | 'ready' | 'error';
  created_at: string;
  updated_at: string;
  events?: HistoricalEvent[];
}

export interface HistoricalEvent {
  id: string;
  world_id: string;
  year: string;
  title: string;
  description: string;
  impact: string;
}

export type PersonaRole = 'INFLUENCER' | 'SCIENTIST' | 'POLITICIAN' | 'BRAND';

export interface Persona {
  id: string;
  world_id: string;
  name: string;
  handle: string;
  avatar: string;
  bio: string;
  role: PersonaRole;
  followers_count: number;
  following_count: number;
  influence_score: number;
  interests: string[];
  personality: string;
  posts?: Post[];
}

export type MediaType = 'IMAGE' | 'TEXT' | 'MEME';

export interface Post {
  id: string;
  world_id: string;
  persona_id: string;
  content: string;
  media_url: string | null;
  media_type: MediaType;
  likes_count: number;
  reposts_count: number;
  created_at: string;
  persona?: {
    id: string;
    name: string;
    handle: string;
    avatar: string;
    role: string;
    influence_score: number;
  };
}

export interface Comment {
  id: string;
  post_id: string;
  persona_id: string;
  content: string;
  likes_count: number;
  created_at: string;
  persona?: Persona;
}

export type NewsCategory = 'POLITICS' | 'SCIENCE' | 'BUSINESS' | 'CULTURE' | 'TECHNOLOGY';

export interface News {
  id: string;
  world_id: string;
  title: string;
  content: string;
  category: NewsCategory;
  publisher: string;
  created_at: string;
}

export interface Ad {
  id: string;
  world_id: string;
  company_name: string;
  tagline: string;
  description: string;
  image_url: string | null;
  price: string;
  created_at: string;
}

export interface WorldFeedResponse {
  posts: Post[];
  nextCursor: string | null;
  hasMore: boolean;
}
