import axios from 'axios';
import { getCached, setCache } from '@/lib/redis';

const BASE_URL = 'https://api.henrikdev.xyz';
const CACHE_TTL_ACCOUNT = 3600;   // 1 hour - account data rarely changes
const CACHE_TTL_MMR = 300;        // 5 min - rank can change after matches
const CACHE_TTL_MATCHES = 180;    // 3 min - match history updates frequently
const API_KEY = process.env.HENRIK_API_KEY || '';

const POINTS_WIN = 3;
const POINTS_LOSS = -1.5;
const POINTS_MVP = 1;
const POINTS_TEAM_MVP = 0.5;
const POINTS_ACE = 0.5;

const TIER_TO_RANK = [
  'Unranked', 'Iron 1', 'Iron 2', 'Iron 3', 'Bronze 1', 'Bronze 2', 'Bronze 3',
  'Silver 1', 'Silver 2', 'Silver 3', 'Gold 1', 'Gold 2', 'Gold 3',
  'Platinum 1', 'Platinum 2', 'Platinum 3', 'Diamond 1', 'Diamond 2', 'Diamond 3',
  'Ascendant 1', 'Ascendant 2', 'Ascendant 3', 'Immortal 1', 'Immortal 2', 'Immortal 3', 'Radiant'
];

function buildUrl(path: string): string {
  let url = `${BASE_URL}${path}`;
  if (API_KEY) url += (path.includes('?') ? '&' : '?') + 'api_key=' + encodeURIComponent(API_KEY);
  return url;
}

function normalizeRegion(region?: string): string {
  if (!region) return 'na';
  const r = region.trim().toLowerCase();
  if (r.startsWith('na') || r === 'americas') return 'na';
  if (r.startsWith('eu') || r === 'europe') return 'eu';
  if (r.startsWith('ap') || r === 'asia' || r === 'sea') return 'ap';
  if (r.startsWith('kr') || r === 'korea') return 'kr';
  if (r.startsWith('latam')) return 'latam';
  if (r.startsWith('br') || r === 'brazil') return 'br';
  return r;
}

export interface MatchRecordInput {
  userId: string;
  puuid: string;
  matchId: string;
  agent: string;
  won: boolean;
  kills: number;
  deaths: number;
  assists: number;
  wasMvp: boolean;
  wasTeamMvp: boolean;
  aces: number;
  pointsEarned: number;
  matchPlayedAt: Date;
}

export async function getAccount(name: string, tag: string) {
  if (!API_KEY) {
    return { success: false as const, error: 'HENRIK_API_KEY is not configured. Add it to .env (get from https://henrikdev.xyz)' };
  }
  const cacheKey = `valorant:account:${name.toLowerCase().trim()}:${tag.toLowerCase().trim()}`;
  const cached = await getCached<{ success: true; puuid: string; region: string }>(cacheKey);
  if (cached) return cached;
  try {
    const url = buildUrl(`/valorant/v1/account/${encodeURIComponent(name)}/${encodeURIComponent(tag)}`);
    const res = await axios.get(url);
    const data = res.data?.data;
    if (!data?.puuid) return { success: false as const, error: 'Invalid API response' };
    const result = {
      success: true as const,
      puuid: data.puuid,
      region: normalizeRegion(data.region || 'na'),
    };
    await setCache(cacheKey, result, CACHE_TTL_ACCOUNT);
    return result;
  } catch (err: unknown) {
    if (axios.isAxiosError(err) && err.response?.status === 401) {
      return { success: false as const, error: 'Invalid or expired HENRIK_API_KEY. Check your .env and get a new key from https://henrikdev.xyz' };
    }
    const msg = axios.isAxiosError(err) ? err.response?.data?.message || err.message : String(err);
    return { success: false as const, error: msg };
  }
}

function parseMmrRank(data: Record<string, unknown> | null): string | null {
  if (!data) return null;
  // New API format: data.current.tier.name or data.current.tier.id
  const current = data.current as Record<string, unknown> | undefined;
  const tier = current?.tier as Record<string, unknown> | undefined;
  if (tier) {
    const name = tier.name as string | undefined;
    if (name?.trim()) return name;
    const id = tier.id as number | undefined;
    if (typeof id === 'number' && id >= 0 && id < TIER_TO_RANK.length) return TIER_TO_RANK[id];
  }
  // Legacy format: currenttierpatched, currenttier
  const patched =
    (data.currenttierpatched as string) ??
    (data.current_tier_patched as string) ??
    (data.currentTierPatched as string);
  if (patched?.trim()) return patched;
  const currentData = data.current_data as Record<string, unknown> | undefined;
  const tierNum =
    (currentData?.currenttier as number) ?? (data.currenttier as number) ?? (data.current_tier as number);
  if (typeof tierNum === 'number' && tierNum >= 0 && tierNum < TIER_TO_RANK.length) return TIER_TO_RANK[tierNum];
  return null;
}

export async function getMmr(name: string, tag: string, region: string, platform = 'pc', puuid?: string) {
  const r = normalizeRegion(region);
  const cacheKey = puuid
    ? `valorant:mmr:${r}:${platform}:puuid:${puuid}`
    : `valorant:mmr:${r}:${platform}:${name.toLowerCase().trim()}:${tag.toLowerCase().trim()}`;
  const cached = await getCached<{ success: true; rank: string }>(cacheKey);
  if (cached) return cached;
  // PUUID-based MMR is more reliable when available
  if (puuid) {
    try {
      const url = buildUrl(`/valorant/v3/by-puuid/mmr/${r}/${platform}/${encodeURIComponent(puuid)}`);
      const res = await axios.get(url);
      const data = res.data?.data as Record<string, unknown> | undefined;
      const rank = parseMmrRank(data ?? null);
      if (rank) {
        const result = { success: true as const, rank };
        await setCache(cacheKey, result, CACHE_TTL_MMR);
        return result;
      }
    } catch {
      /* fall through to name/tag */
    }
  }
  try {
    const url = buildUrl(`/valorant/v3/mmr/${r}/${platform}/${encodeURIComponent(name)}/${encodeURIComponent(tag)}`);
    const res = await axios.get(url);
    const data = res.data?.data as Record<string, unknown> | undefined;
    const rank = parseMmrRank(data ?? null);
    const result = { success: true as const, rank: rank ?? 'Unranked' };
    await setCache(cacheKey, result, CACHE_TTL_MMR);
    return result;
  } catch {
    return { success: false as const, rank: 'Unranked' };
  }
}

export async function getMatchHistory(puuid: string, region: string, platform = 'pc') {
  const r = normalizeRegion(region);
  const cacheKey = `valorant:matches:${puuid}:${r}:${platform}`;
  const cached = await getCached<{ success: true; matches: unknown[] }>(cacheKey);
  if (cached) return cached;
  try {
    const url = buildUrl(`/valorant/v4/by-puuid/matches/${r}/${platform}/${puuid}?size=20`);
    const res = await axios.get(url);
    const raw = res.data?.data || [];
    const matches = raw.map((item: Record<string, unknown>) => ({
      metadata: {
        match_id: (item.metadata as Record<string, unknown>)?.match_id,
        mode: ((item.metadata as Record<string, unknown>)?.queue as Record<string, unknown>)?.id || (item.metadata as Record<string, unknown>)?.mode || '',
        game_start_patched: (item.metadata as Record<string, unknown>)?.started_at || (item.metadata as Record<string, unknown>)?.game_start_patched,
      },
      players: item.players || [],
      teams: item.teams || [],
    })).filter((m: { metadata: { match_id: unknown } }) => m.metadata?.match_id);
    const result = { success: true as const, matches };
    await setCache(cacheKey, result, CACHE_TTL_MATCHES);
    return result;
  } catch (err: unknown) {
    return { success: false as const, matches: [], error: String(err) };
  }
}

function extractAgentName(player: Record<string, unknown>): string {
  // v4 API: agent is { id: string, name: string }
  const agent = player.agent;
  if (agent && typeof agent === 'object' && agent !== null) {
    const a = agent as Record<string, unknown>;
    const name = a.name;
    if (typeof name === 'string' && name.trim()) return name.trim();
    const id = a.id;
    if (typeof id === 'string' && id.trim()) return id;
  }
  // v2/legacy: character or character_id as string
  const char = player.character ?? player.character_id;
  return typeof char === 'string' ? char.trim() : '';
}

export function calculateMatchRecord(
  match: {
    metadata?: { match_id?: string; game_start_patched?: string; started_at?: string };
    players?: Array<{
      puuid: string;
      team_id?: string;
      team?: string;
      character?: string;
      character_id?: string;
      agent?: { id?: string; name?: string } | Record<string, unknown>;
      stats?: { score?: number; acs?: number; kills?: number; deaths?: number; assists?: number; rounds_with_aces?: number };
    }>;
    teams?: Array<{ team_id?: string; teamId?: string; won?: boolean }>;
  },
  puuid: string,
  userId: string
): MatchRecordInput | null {
  const player = match.players?.find((p) => p.puuid === puuid);
  if (!player) return null;

  const teamId = String(player.team_id || player.team || '').toLowerCase();
  const team = match.teams?.find((t) => String(t.team_id || t.teamId || '').toLowerCase() === teamId);
  const won = team?.won ?? false;

  let points = won ? POINTS_WIN : POINTS_LOSS;

  const allPlayers = match.players || [];
  const maxScore = Math.max(0, ...allPlayers.map((p) => p.stats?.score ?? p.stats?.acs ?? 0));
  const playerScore = player.stats?.score ?? player.stats?.acs ?? 0;
  const wasMvp = playerScore >= maxScore && maxScore > 0;

  const teamPlayers = allPlayers.filter((p) => String(p.team_id || p.team || '').toLowerCase() === teamId);
  const teamMaxScore = Math.max(0, ...teamPlayers.map((p) => p.stats?.score ?? p.stats?.acs ?? 0));
  const wasTeamMvp = !wasMvp && playerScore >= teamMaxScore && teamMaxScore > 0;

  if (wasMvp) points += POINTS_MVP;
  if (wasTeamMvp) points += POINTS_TEAM_MVP;

  const aces = player.stats?.rounds_with_aces ?? 0;
  points += aces * POINTS_ACE;

  const gameStart = match.metadata?.game_start_patched || match.metadata?.started_at;
  const matchPlayedAt = gameStart ? new Date(gameStart as string) : new Date();

  const agentName = extractAgentName(player as Record<string, unknown>);

  return {
    userId,
    puuid,
    matchId: match.metadata?.match_id || '',
    agent: agentName || '',
    won,
    kills: player.stats?.kills ?? 0,
    deaths: player.stats?.deaths ?? 0,
    assists: player.stats?.assists ?? 0,
    wasMvp,
    wasTeamMvp,
    aces: aces || 0,
    pointsEarned: points,
    matchPlayedAt,
  };
}
