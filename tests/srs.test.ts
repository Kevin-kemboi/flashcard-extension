import { schedule, initSRS } from '../extension/srs';

describe('SRS Scheduling', () => {
  test('initial unknown sets short retry', () => {
    const base = initSRS(new Date('2023-01-01T00:00:00Z'));
    const result = schedule(base as any, 'unknown', new Date('2023-01-01T00:00:00Z'));
    expect(result.interval).toBe(0);
  });

  test('easy progression increases interval', () => {
    let card: any = { ...initSRS(new Date('2023-01-01T00:00:00Z')) };
    card = schedule(card, 'easy', new Date('2023-01-01T00:00:00Z'));
    expect(card.interval).toBe(1);
    card = schedule(card, 'easy', new Date('2023-01-02T00:00:00Z'));
    expect(card.interval).toBe(3);
  });

  test('hard resets repetitions', () => {
    let card: any = { repetitions: 3, interval: 5, easeFactor: 2.5, nextReview: new Date().toISOString() };
    card = schedule(card, 'hard');
    expect(card.repetitions).toBe(0);
    expect(card.interval).toBe(1);
  });
});
