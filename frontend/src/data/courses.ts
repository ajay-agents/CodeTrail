import { COURSES as RAW_COURSES, BADGES as RAW_BADGES, TIPS, GCOL } from './content.js';
import type { Course, Badge } from '../types/content';

export const COURSES = RAW_COURSES as Course[];
export const BADGES = RAW_BADGES as Badge[];
export const TIPS_MAP = TIPS as Record<string, string[]>;
export { TIPS, GCOL };

export const courseOf = (id: string): Course | undefined => COURSES.find((c) => c.id === id);
