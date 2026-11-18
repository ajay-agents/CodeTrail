import { GCOL } from './courses';

export interface DsaLangInfo {
  name: string;
  hl: string;
  file: string;
  rt: string;
  col: string;
}

export const DSA_LANGS: Record<string, DsaLangInfo> = {
  c: { name: 'C', hl: 'c', file: 'solution.c', rt: 'C compiler', col: GCOL.c },
  cpp: { name: 'C++', hl: 'cpp', file: 'solution.cpp', rt: 'C++ compiler', col: GCOL.cpp },
  java: { name: 'Java', hl: 'java', file: 'Main.java', rt: 'Java runtime', col: GCOL.java },
  js: { name: 'JavaScript', hl: 'js', file: 'solution.js', rt: 'JavaScript engine', col: GCOL.js },
  py: { name: 'Python', hl: 'python', file: 'solution.py', rt: 'Python interpreter', col: GCOL.python },
};

export function dsaLang(current: string | undefined): string {
  return current && DSA_LANGS[current] ? current : 'js';
}
