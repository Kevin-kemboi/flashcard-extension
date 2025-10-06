// Spaced repetition scheduling utilities
// Inspired by SM-2 but adapted to multiple difficulty states

export interface SRSData {
  interval: number; // days
  easeFactor: number; // multiplier
  repetitions: number;
  nextReview: string; // ISO timestamp
}

export interface FlashcardLike extends Partial<SRSData> {
  id: string;
  difficulty?: string;
}

export interface ScheduleResult extends SRSData {}

const DEFAULT_EF = 2.5;

export function initSRS(now: Date = new Date()): SRSData {
  return {
    interval: 0,
    easeFactor: DEFAULT_EF,
    repetitions: 0,
    nextReview: new Date(now.getTime()).toISOString(),
  };
}

export type DifficultyInput = string;

export function schedule(card: FlashcardLike, difficulty: DifficultyInput, now: Date = new Date()): ScheduleResult {
  // Start from existing or init
  const base: SRSData = {
    interval: card.interval ?? 0,
    easeFactor: card.easeFactor ?? DEFAULT_EF,
    repetitions: card.repetitions ?? 0,
    nextReview: card.nextReview ?? new Date(now.getTime()).toISOString(),
  };

  let { interval, easeFactor, repetitions } = base;

  const clampEF = () => {
    if (easeFactor < 1.3) easeFactor = 1.3;
    if (easeFactor > 3.0) easeFactor = 3.0;
  };

  const addDays = (d: number) => new Date(now.getTime() + d * 24 * 60 * 60 * 1000);
  const addMinutes = (m: number) => new Date(now.getTime() + m * 60 * 1000);

  switch (difficulty) {
    case 'hard':
      easeFactor -= 0.3;
      repetitions = 0;
      interval = 1;
      break;
    case 'easy':
      repetitions += 1;
      easeFactor += 0.15;
      if (repetitions === 1) interval = 1; else if (repetitions === 2) interval = 3; else interval = Math.round(interval * easeFactor);
      break;
    case 'mastered':
      repetitions += 1;
      easeFactor += 0.25;
      interval = Math.max(5, Math.round((interval || 3) * easeFactor * 1.5));
      break;
    case 'medium':
      repetitions += 1;
      easeFactor += 0.05;
      if (repetitions === 1) interval = 1; else interval = Math.round(interval * (easeFactor - 0.05));
      break;
    case 'focus':
      // Short-term reinforcement session in minutes
      repetitions = Math.max(0, repetitions - 1);
      easeFactor += 0.02;
      interval = Math.max(1, interval); // Keep daily spacing but shorter immediate revisit
      return { interval, easeFactor, repetitions, nextReview: addMinutes(10).toISOString() };
    case 'review':
      easeFactor -= 0.15;
      repetitions = Math.max(0, repetitions - 1);
      interval = 1;
      break;
    case 'active':
      easeFactor += 0.03;
      repetitions += 1;
      interval = Math.max(1, Math.round((interval || 1) * (easeFactor - 0.1)));
      break;
    case 'unknown':
      repetitions = 0;
      easeFactor -= 0.4;
      interval = 0;
      return { interval, easeFactor: Math.max(1.3, easeFactor), repetitions, nextReview: addMinutes(5).toISOString() };
    default:
      // fallback treat like medium
      repetitions += 1;
      if (repetitions === 1) interval = 1; else interval = Math.round(interval * 1.4);
      break;
  }

  clampEF();
  const nextReview = addDays(interval).toISOString();
  return { interval, easeFactor, repetitions, nextReview };
}

export function dueNow(card: FlashcardLike, now: Date = new Date()): boolean {
  if (!card.nextReview) return true;
  return new Date(card.nextReview).getTime() <= now.getTime();
}

export function aggregate(cards: FlashcardLike[], now: Date = new Date()) {
  const counts: Record<string, number> = {};
  let due = 0;
  cards.forEach(c => {
    const d = c.difficulty || 'unknown';
    counts[d] = (counts[d] || 0) + 1;
    if (dueNow(c, now)) due += 1;
  });
  const total = cards.length || 1;
  return {
    counts,
    due,
    masteredPercent: ((counts['mastered'] || 0) / total) * 100,
  };
}
