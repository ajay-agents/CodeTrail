import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { api } from '../api/client';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { BADGES, COURSES } from '../data/courses';
import { QUESTS } from '../data/quests';
import { chDone, checkPolyEligible, ensureFreshDay, getChapterProgress } from '../lib/progressSelectors';
import { DEFAULT_PROGRESS, type ProgressData } from '../types/progress';
import type { Chapter, Course } from '../types/content';

interface ProgressContextValue {
  data: ProgressData;
  loading: boolean;
  addXP: (n: number) => void;
  award: (badgeId: string) => void;
  recordRun: () => void;
  toggleSectionDone: (chapterId: string, idx: number) => void;
  recordQuizCorrect: () => void;
  finishQuiz: (chapterId: string, correct: number, total: number) => number;
  setChallengeDone: (chapterId: string) => void;
  checkChapterComplete: (course: Course, chapter: Chapter) => boolean;
  claimQuest: (questId: string) => void;
  setDsaLang: (lang: string) => void;
  setLast: (course: string, ch: string) => void;
  resetAll: () => void;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

function badgeName(id: string): string {
  return BADGES.find((b) => b.id === id)?.name || id;
}

export function ProgressProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [data, setData] = useState<ProgressData>(DEFAULT_PROGRESS);
  const [loading, setLoading] = useState(true);
  const saveTimer = useRef<number | undefined>(undefined);
  const skipNextSave = useRef(false);

  useEffect(() => {
    if (!user) {
      setData(DEFAULT_PROGRESS);
      setLoading(false);
      return;
    }
    setLoading(true);
    api
      .getProgress()
      .then((res) => {
        const loaded: ProgressData = { ...DEFAULT_PROGRESS, ...(res.data as Partial<ProgressData>) };
        skipNextSave.current = true;
        setData(ensureFreshDay(loaded));
      })
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    if (!user || loading) return;
    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      api.putProgress(data as unknown as Record<string, unknown>).catch(() => {});
    }, 600);
    return () => window.clearTimeout(saveTimer.current);
  }, [data, user, loading]);

  const mutate = useCallback((fn: (d: ProgressData) => ProgressData) => {
    setData((prev) => fn(ensureFreshDay(prev)));
  }, []);

  const addXP = useCallback(
    (n: number) => {
      mutate((d) => ({ ...d, xp: d.xp + n }));
      toast(`+${n} XP`);
    },
    [mutate, toast],
  );

  const award = useCallback(
    (badgeId: string) => {
      let didAward = false;
      mutate((d) => {
        if (d.badges[badgeId]) return d;
        didAward = true;
        return { ...d, badges: { ...d.badges, [badgeId]: true } };
      });
      if (didAward) toast('Badge unlocked: ' + badgeName(badgeId));
    },
    [mutate, toast],
  );

  const recordRun = useCallback(() => {
    mutate((d) => ({ ...d, daily: d.daily ? { ...d.daily, runs: d.daily.runs + 1 } : d.daily }));
  }, [mutate]);

  const toggleSectionDone = useCallback(
    (chapterId: string, idx: number) => {
      let gained = false;
      mutate((d) => {
        const chp = getChapterProgress(d, chapterId);
        if (chp.sec[idx]) return d;
        gained = true;
        const sec = [...chp.sec];
        sec[idx] = true;
        return {
          ...d,
          xp: d.xp + 10,
          ch: { ...d.ch, [chapterId]: { ...chp, sec } },
          daily: d.daily ? { ...d.daily, lessons: d.daily.lessons + 1 } : d.daily,
        };
      });
      if (gained) toast('+10 XP');
    },
    [mutate, toast],
  );

  const recordQuizCorrect = useCallback(() => {
    mutate((d) => ({ ...d, daily: d.daily ? { ...d.daily, quizOk: d.daily.quizOk + 1 } : d.daily }));
  }, [mutate]);

  const finishQuiz = useCallback(
    (chapterId: string, correct: number, total: number) => {
      let gain = 0;
      let perfect = false;
      mutate((d) => {
        const chp = getChapterProgress(d, chapterId);
        if (correct > chp.quiz) {
          gain = 15 * (correct - Math.max(chp.quiz, 0));
        }
        if (correct === total) perfect = true;
        if (gain === 0) return d;
        return { ...d, xp: d.xp + gain, ch: { ...d.ch, [chapterId]: { ...chp, quiz: correct } } };
      });
      if (gain) toast(`+${gain} XP`);
      if (perfect) award('perfect');
      return gain;
    },
    [mutate, toast, award],
  );

  const setChallengeDone = useCallback(
    (chapterId: string) => {
      let completed = false;
      mutate((d) => {
        const chp = getChapterProgress(d, chapterId);
        if (chp.challenge) return d;
        completed = true;
        return { ...d, xp: d.xp + 50, ch: { ...d.ch, [chapterId]: { ...chp, challenge: true } } };
      });
      if (completed) {
        toast('+50 XP');
        award('green');
      }
    },
    [mutate, toast, award],
  );

  const checkChapterComplete = useCallback(
    (course: Course, chapter: Chapter) => {
      let completed = false;
      mutate((d) => {
        const chp = getChapterProgress(d, chapter.id);
        if (chp.done || !chDone(d, chapter)) return d;
        completed = true;
        return { ...d, ch: { ...d.ch, [chapter.id]: { ...chp, done: true } } };
      });
      if (completed) {
        addXP(25);
        award('chapter');
      }
      void course;
      return completed;
    },
    [mutate, addXP, award],
  );

  const claimQuest = useCallback(
    (questId: string) => {
      const quest = QUESTS.find((q) => q.id === questId);
      if (!quest) return;
      let claimed = false;
      let allClaimed = false;
      mutate((d) => {
        const daily = d.daily;
        if (!daily || quest.get(daily) < quest.target || daily.claimed[questId]) return d;
        claimed = true;
        const nextClaimed = { ...daily.claimed, [questId]: true };
        allClaimed = QUESTS.every((q) => nextClaimed[q.id]);
        return { ...d, daily: { ...daily, claimed: nextClaimed } };
      });
      if (claimed) {
        addXP(quest.xp);
        if (allClaimed) award('quests');
      }
    },
    [mutate, addXP, award],
  );

  const setDsaLang = useCallback(
    (lang: string) => {
      mutate((d) => ({ ...d, dsaLang: lang }));
    },
    [mutate],
  );

  const setLast = useCallback(
    (course: string, ch: string) => {
      mutate((d) => ({ ...d, last: { course, ch } }));
    },
    [mutate],
  );

  const resetAll = useCallback(() => {
    setData({ ...DEFAULT_PROGRESS, lastDay: new Date().toISOString().slice(0, 10) });
    toast('Progress reset');
  }, [toast]);

  // Reactive polyglot badge check: original awards this as a side effect of finishing a section.
  useEffect(() => {
    if (loading) return;
    if (!data.badges.poly && checkPolyEligible(data, COURSES)) {
      mutate((d) => (d.badges.poly ? d : { ...d, badges: { ...d.badges, poly: true } }));
      toast('Badge unlocked: ' + badgeName('poly'));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.ch, loading]);

  const value = useMemo<ProgressContextValue>(
    () => ({
      data,
      loading,
      addXP,
      award,
      recordRun,
      toggleSectionDone,
      recordQuizCorrect,
      finishQuiz,
      setChallengeDone,
      checkChapterComplete,
      claimQuest,
      setDsaLang,
      setLast,
      resetAll,
    }),
    [
      data,
      loading,
      addXP,
      award,
      recordRun,
      toggleSectionDone,
      recordQuizCorrect,
      finishQuiz,
      setChallengeDone,
      checkChapterComplete,
      claimQuest,
      setDsaLang,
      setLast,
      resetAll,
    ],
  );

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgress must be used within ProgressProvider');
  return ctx;
}
