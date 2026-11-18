export interface Section {
  title: string;
  body: string;
  code: string;
  tryIt: string;
  callout: string;
  variants?: Record<string, { code: string; out: string }>;
}

export interface QuizQuestion {
  q: string;
  options: string[];
  answer: number;
  why: string;
}

export interface ChallengeTest {
  label: string;
  check: (code: string, output: string, extra?: unknown) => boolean;
}

export interface Challenge {
  title: string;
  prompt: string;
  starter?: string;
  starters?: Record<string, string>;
  hint: string;
  tests: ChallengeTest[];
}

export interface Chapter {
  id: string;
  emoji?: string;
  icon?: string;
  title: string;
  alias: string;
  minutes: number;
  blurb: string;
  topics?: string[];
  sections?: Section[];
  quiz?: QuizQuestion[];
  challenge?: Challenge;
}

export interface Course {
  id: string;
  name: string;
  glyph: string;
  lang: string;
  file: string;
  level: string;
  title: string;
  tag: string;
  intro: string;
  sample: string;
  chapters: Chapter[];
}

export interface Badge {
  id: string;
  icon: string;
  name: string;
  desc: string;
}
