export type LeaderboardEntry = {
  id: string;
  name: string;
  elapsedMs: number;
  gridSize: 3 | 4;
  recordedAt: string;
};

const STORAGE_KEY = 'last-horizon.leaderboard';

export function readLeaderboard(): LeaderboardEntry[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isEntry).sort((a, b) => a.elapsedMs - b.elapsedMs).slice(0, 20);
  } catch {
    return [];
  }
}

export function recordScore(name: string, elapsedMs: number, gridSize: 3 | 4): LeaderboardEntry[] {
  const entry: LeaderboardEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    name,
    elapsedMs,
    gridSize,
    recordedAt: new Date().toISOString(),
  };
  const entries = [...readLeaderboard(), entry].sort((a, b) => a.elapsedMs - b.elapsedMs).slice(0, 20);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // The game remains playable when storage is unavailable.
  }
  return entries;
}

function isEntry(value: unknown): value is LeaderboardEntry {
  if (!value || typeof value !== 'object') return false;
  const entry = value as Partial<LeaderboardEntry>;
  return typeof entry.id === 'string'
    && typeof entry.name === 'string'
    && typeof entry.elapsedMs === 'number'
    && (entry.gridSize === 3 || entry.gridSize === 4)
    && typeof entry.recordedAt === 'string';
}