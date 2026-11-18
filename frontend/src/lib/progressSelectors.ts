import type { Chapter, Course } from '../types/content';
import type { ChapterProgress, DailyQuestState, ProgressData } from '../types/progress';

export const emptyChapter = (): ChapterProgress => ({ sec: [], quiz: -1, challenge: false, done: false });

export const getChapterProgress = (data: ProgressData, chapterId: string): ChapterProgress =>
  data.ch[chapterId] || emptyChapter();

export const hasContent = (c: Chapter): boolean => !!c.sections;

export const passMark = (c: Chapter): number => Math.ceil((c.quiz?.length || 0) * 0.6);

export const learnDone = (data: ProgressData, c: Chapter): boolean => {
  const s = getChapterProgress(data, c.id);
  return (c.sections || []).every((_, i) => !!s.sec[i]);
};

export const quizDone = (data: ProgressData, c: Chapter): boolean =>
  getChapterProgress(data, c.id).quiz >= passMark(c);

export const chDone = (data: ProgressData, c: Chapter): boolean =>
  hasContent(c) && learnDone(data, c) && quizDone(data, c) && !!getChapterProgress(data, c.id).challenge;

export type ChapterStatus = 'soon' | 'done' | 'current' | 'locked';

export function statusOf(data: ProgressData, chapters: Chapter[], i: number): ChapterStatus {
  const c = chapters[i];
  if (!hasContent(c)) return 'soon';
  if (chDone(data, c)) return 'done';
  const prev = i === 0 || (hasContent(chapters[i - 1]) && chDone(data, chapters[i - 1]));
  return prev ? 'current' : 'locked';
}

export const currentIdx = (data: ProgressData, chapters: Chapter[]): number =>
  chapters.findIndex((_, i) => statusOf(data, chapters, i) === 'current');

export function stagesDone(data: ProgressData, course: Course): number {
  let n = 0;
  for (const c of course.chapters) {
    if (!hasContent(c)) continue;
    const s = getChapterProgress(data, c.id);
    if (learnDone(data, c)) n++;
    if (quizDone(data, c)) n++;
    if (s.challenge) n++;
  }
  return n;
}

export const chaptersDone = (data: ProgressData, course: Course): number =>
  course.chapters.filter((c) => chDone(data, c)).length;

export const checkPolyEligible = (data: ProgressData, courses: Course[]): boolean =>
  courses.filter((c) => c.chapters.some((ch) => hasContent(ch) && getChapterProgress(data, ch.id).sec.some(Boolean)))
    .length >= 2;

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayStr(): string {
  return new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
}

function freshDaily(day: string): DailyQuestState {
  return { day, runs: 0, lessons: 0, quizOk: 0, claimed: {} };
}

/** Mirrors the original app's streak + daily-quest day-rollover, run before any mutation. */
export function ensureFreshDay(data: ProgressData): ProgressData {
  const today = todayStr();
  let next = data;
  if (next.lastDay !== today) {
    const streak = next.lastDay === yesterdayStr() ? (next.streak || 0) + 1 : 1;
    next = { ...next, streak, lastDay: today };
  }
  if (!next.daily || next.daily.day !== today) {
    next = { ...next, daily: freshDaily(today) };
  }
  return next;
}
