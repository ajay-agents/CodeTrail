export interface Level {
  name: string;
  icon: string;
  lo: number;
  hi: number | null;
  nextName: string | null;
  pct: number;
}

const LEVELS: [number, string, string][] = [
  [0, 'Hatchling', 'sprout'],
  [100, 'Rookie', 'compass'],
  [250, 'Builder', 'wrench'],
  [500, 'Hacker', 'terminal'],
  [1000, 'Wizard', 'ai'],
];

export function level(xp: number): Level {
  let idx = 0;
  for (let i = 0; i < LEVELS.length; i++) if (xp >= LEVELS[i][0]) idx = i;
  const next = LEVELS[idx + 1];
  return {
    name: LEVELS[idx][1],
    icon: LEVELS[idx][2],
    lo: LEVELS[idx][0],
    hi: next ? next[0] : null,
    nextName: next ? next[1] : null,
    pct: next ? Math.round(((xp - LEVELS[idx][0]) / (next[0] - LEVELS[idx][0])) * 100) : 100,
  };
}
