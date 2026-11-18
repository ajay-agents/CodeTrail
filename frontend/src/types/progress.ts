export interface ChapterProgress {
  sec: boolean[];
  quiz: number;
  challenge: boolean;
  done: boolean;
}

export interface DailyQuestState {
  day: string;
  runs: number;
  lessons: number;
  quizOk: number;
  claimed: Record<string, boolean>;
}

export interface LastPosition {
  course: string;
  ch: string;
}

export interface ProgressData {
  xp: number;
  streak: number;
  lastDay: string;
  ch: Record<string, ChapterProgress>;
  badges: Record<string, boolean>;
  last: LastPosition | null;
  daily: DailyQuestState | null;
  dsaLang?: string;
}

export const DEFAULT_PROGRESS: ProgressData = {
  xp: 0,
  streak: 1,
  lastDay: '',
  ch: {},
  badges: {},
  last: null,
  daily: null,
};
