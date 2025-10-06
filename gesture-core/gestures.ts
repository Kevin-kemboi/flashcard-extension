// gesture-core/gestures.ts
export type Gesture =
  | 'thumbs_up'
  | 'thumbs_down'
  | 'flat_palm'
  | 'fist'
  | 'peace'
  | 'pinch'
  | 'ok_sign'
  | 'point';

// Difficulty labels extended for richer learning states
// easy, hard, unknown (existing) plus: review, medium, mastered, focus
export const gestureToDifficulty: Record<Gesture, string> = {
  thumbs_up: 'easy',
  thumbs_down: 'hard',
  flat_palm: 'unknown',
  fist: 'review',
  peace: 'medium',
  pinch: 'focus',
  ok_sign: 'mastered',
  point: 'active',
};