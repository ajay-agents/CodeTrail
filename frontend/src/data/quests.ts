import type { DailyQuestState } from '../types/progress';

export interface Quest {
  id: string;
  icon: string;
  t: string;
  target: number;
  xp: number;
  get: (d: DailyQuestState) => number;
}

export const QUESTS: Quest[] = [
  { id: 'runs', icon: 'terminal', t: 'Run code 3 times', target: 3, xp: 10, get: (d) => d.runs },
  { id: 'lessons', icon: 'book', t: 'Finish a lesson', target: 1, xp: 15, get: (d) => d.lessons },
  { id: 'quiz', icon: 'target', t: 'Get 3 quiz answers right', target: 3, xp: 20, get: (d) => d.quizOk },
];
