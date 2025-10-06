// tests/gesture.test.ts
import { gestureToDifficulty } from '../gesture-core/gestures';
describe('Gesture Mapping', () => {
    test('maps base gestures to difficulties', () => {
        expect(gestureToDifficulty.thumbs_up).toBe('easy');
        expect(gestureToDifficulty.thumbs_down).toBe('hard');
        expect(gestureToDifficulty.flat_palm).toBe('unknown');
    });
    test('maps extended gestures to difficulties', () => {
        expect(gestureToDifficulty.fist).toBe('review');
        expect(gestureToDifficulty.peace).toBe('medium');
        expect(gestureToDifficulty.pinch).toBe('focus');
        expect(gestureToDifficulty.ok_sign).toBe('mastered');
        expect(gestureToDifficulty.point).toBe('active');
    });
    test('has no unexpected undefined mappings', () => {
        Object.entries(gestureToDifficulty).forEach(([g, diff]) => {
            expect(typeof diff).toBe('string');
            expect(diff.length).toBeGreaterThan(0);
        });
    });
});
//# sourceMappingURL=gesture.test.js.map