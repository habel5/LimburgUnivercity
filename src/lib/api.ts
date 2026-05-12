import { projectId, publicAnonKey } from '../config/env';
import type { Listing, Proposal } from './supabase';

const BASE = () =>
  `https://${projectId}.supabase.co/functions/v1/make-server-09c2210b`;

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry<unknown>>();
const inflight = new Map<string, Promise<unknown>>();

async function apiFetch<T>(
  path: string,
  ttlMs: number,
  init?: RequestInit,
): Promise<T> {
  const key = path;
  const entry = cache.get(key) as CacheEntry<T> | undefined;
  if (entry && Date.now() < entry.expiresAt) return entry.data;

  if (inflight.has(key)) return inflight.get(key) as Promise<T>;

  const promise = fetch(`${BASE()}${path}`, {
    headers: { apikey: publicAnonKey },
    ...init,
  })
    .then(async (res) => {
      if (!res.ok) throw new Error(String(res.status));
      const data = (await res.json()) as T;
      cache.set(key, { data, expiresAt: Date.now() + ttlMs });
      inflight.delete(key);
      return data;
    })
    .catch((err) => {
      inflight.delete(key);
      throw err;
    });

  inflight.set(key, promise);
  return promise;
}

export interface Stats {
  challenges: number;
  proposals: number;
  municipalities: number;
}

export interface ChallengeDetail {
  challenge: Listing;
  proposals: Proposal[];
}

export interface AdminStats {
  totalChallenges: number;
  totalProposals: number;
  challengesByMunicipality: Record<string, number>;
  challengesByCategory: Record<string, number>;
}

export const api = {
  stats: () => apiFetch<Stats>('/stats', 60_000),

  challenges: (params?: URLSearchParams) => {
    const qs = params?.toString() ? `?${params}` : '';
    return apiFetch<Listing[]>(`/challenges${qs}`, 30_000);
  },

  challenge: (id: string) =>
    apiFetch<ChallengeDetail>(`/challenges/${id}`, 30_000),

  adminStats: () => apiFetch<AdminStats>('/stats', 60_000),

  adminChallenges: () => apiFetch<Listing[]>('/challenges', 10_000),

  adminProposals: () =>
    apiFetch<{ id: string; challenge_id: string; title: string; author: string; organization: string; created_at: string }[]>(
      '/proposals',
      10_000,
    ),
};

export function invalidate(prefix: string) {
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) cache.delete(key);
  }
}
