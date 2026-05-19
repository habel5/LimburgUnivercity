import { projectId, publicAnonKey } from '../config/env';
import type { Listing, Proposal } from './supabase';

const BASE = () =>
  `https://${projectId}.supabase.co/functions/v1/make-server-09c2210b`;

// Client-side cache: API-responses worden tijdelijk opgeslagen met een vervaldatum (TTL).
// Zolang de cache geldig is, worden geen onnodige netwerkverzoeken gedaan.
interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry<unknown>>();
// Inflight-map: als hetzelfde verzoek al loopt, wordt geen tweede aanvraag gestart —
// alle aanroepers wachten op hetzelfde resultaat.
const inflight = new Map<string, Promise<unknown>>();

async function apiFetch<T>(
  path: string,
  ttlMs: number,
  init?: RequestInit,
): Promise<T> {
  const key = path;
  // Retourneer de gecachede response als die nog niet verlopen is
  const entry = cache.get(key) as CacheEntry<T> | undefined;
  if (entry && Date.now() < entry.expiresAt) return entry.data;

  // Voorkom dubbele requests: koppel aan het lopende verzoek als dat al bestaat
  if (inflight.has(key)) return inflight.get(key) as Promise<T>;

  const promise = fetch(`${BASE()}${path}`, {
    headers: { apikey: publicAnonKey },
    ...init,
  })
    .then(async (res) => {
      if (!res.ok) throw new Error(String(res.status));
      const data = (await res.json()) as T;
      // Sla het resultaat op in de cache met de opgegeven TTL (in milliseconden)
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
  // Statistieken worden 60 seconden gecached — deze veranderen zelden
  stats: () => apiFetch<Stats>('/stats', 60_000),

  // Cases ophalen met optionele query parameters (gemeente, categorie, limiet)
  challenges: (params?: URLSearchParams) => {
    const qs = params?.toString() ? `?${params}` : '';
    return apiFetch<Listing[]>(`/challenges${qs}`, 30_000);
  },

  challenge: (id: string) =>
    apiFetch<ChallengeDetail>(`/challenges/${id}`, 30_000),

  adminStats: () => apiFetch<AdminStats>('/stats', 60_000),

  // Admin-endpoints gebruiken een kortere TTL van 10 seconden zodat wijzigingen snel zichtbaar zijn
  adminChallenges: () => apiFetch<Listing[]>('/challenges', 10_000),

  adminProposals: () =>
    apiFetch<{ id: string; challenge_id: string; title: string; author: string; organization: string; created_at: string }[]>(
      '/proposals',
      10_000,
    ),
};

// Verwijder cache-entries die beginnen met het opgegeven prefix.
// Wordt aangeroepen na een mutatie (aanmaken of verwijderen) zodat de volgende request verse data ophaalt.
export function invalidate(prefix: string) {
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) cache.delete(key);
  }
}
