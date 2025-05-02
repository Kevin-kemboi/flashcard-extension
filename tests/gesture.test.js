// tests/gesture.test.ts
import { gestureToDifficulty } from '../gesture-core/gestures';
describe('Gesture Mapping', () => {
    test('maps gestures to difficulties', () => {
        expect(gestureToDifficulty.thumbs_up).toBe('easy');
        expect(gestureToDifficulty.thumbs_down).toBe('hard');
        expect(gestureToDifficulty.flat_palm).toBe('unknown');
    });
});
//# sourceMappingURL=gesture.test.js.map