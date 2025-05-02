// gesture-core/gestures.ts
export type Gesture = 'thumbs_up' | 'thumbs_down' | 'flat_palm';

export const gestureToDifficulty: Record<Gesture, string> = {
  thumbs_up: 'easy',
  thumbs_down: 'hard',
  flat_palm: 'unknown',
};