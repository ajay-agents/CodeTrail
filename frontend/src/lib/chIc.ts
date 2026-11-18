import { ic, EMO } from './icons.js';
import type { Chapter } from '../types/content';

export function chIc(c: Chapter): string {
  const key = (c.emoji || '').replace(/️/g, '');
  return ic(c.icon || (EMO as Record<string, string>)[key] || 'terminal');
}
