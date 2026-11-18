import { runCode } from '../engine/interpreters.js';
import { useProgress } from '../context/ProgressContext';
import type { RunResult } from '../components/OutputPanel';

export function useRunCode() {
  const { award, recordRun } = useProgress();
  return (lang: string, code: string): RunResult => {
    award('first');
    recordRun();
    return runCode(lang, code) as RunResult;
  };
}
