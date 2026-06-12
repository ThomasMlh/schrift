import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  formatRotationDate,
  calculateRotationPeriod,
  ensureCorrectRotationPositions,
  isCycleActive,
  getRotationRealDates,
} from '../../src/utils/cycleHelpers';
import type { ICycle, ICycleRotation } from '../../src/interfaces';

const makeRotation = (overrides: Partial<ICycleRotation> = {}): ICycleRotation => ({
  start_date: '01/01/2025',
  end_date: '03/01/2025',
  period: 'Mardi-Jeudi',
  killer: 'killer',
  attack: 'attack',
  alteration: 'alt',
  position: 1,
  rotation_id: 'r1',
  ...overrides,
});

describe('formatRotationDate', () => {
  it('formats a date as DD/MM/YYYY', () => {
    expect(formatRotationDate(new Date(2025, 0, 5))).toBe('05/01/2025');
    expect(formatRotationDate(new Date(2025, 11, 31))).toBe('31/12/2025');
  });

  it('pads single-digit day and month with a leading zero', () => {
    expect(formatRotationDate(new Date(2025, 2, 3))).toBe('03/03/2025');
  });
});

describe('calculateRotationPeriod', () => {
  it('returns "Mardi-Jeudi" when start is Tuesday and end is Thursday', () => {
    expect(calculateRotationPeriod('04/02/2025', '06/02/2025')).toBe('Mardi-Jeudi');
  });

  it('returns "Vendredi-Dimanche" when start is Friday and end is Sunday', () => {
    expect(calculateRotationPeriod('07/02/2025', '09/02/2025')).toBe('Vendredi-Dimanche');
  });

  it('falls back to "Mardi-Jeudi" for unrecognized date combinations', () => {
    expect(calculateRotationPeriod('01/01/2025', '03/01/2025')).toBe('Mardi-Jeudi');
  });
});

describe('ensureCorrectRotationPositions', () => {
  it('assigns position starting from 1', () => {
    const rotations = [makeRotation({ position: 99 }), makeRotation({ position: 99 })];
    const result = ensureCorrectRotationPositions(rotations);
    expect(result[0].position).toBe(1);
    expect(result[1].position).toBe(2);
  });

  it('assigns "Mardi-Jeudi" to odd positions', () => {
    const rotations = [makeRotation(), makeRotation(), makeRotation()];
    const result = ensureCorrectRotationPositions(rotations);
    expect(result[0].period).toBe('Mardi-Jeudi');
    expect(result[2].period).toBe('Mardi-Jeudi');
  });

  it('assigns "Vendredi-Dimanche" to even positions', () => {
    const rotations = [makeRotation(), makeRotation()];
    const result = ensureCorrectRotationPositions(rotations);
    expect(result[1].period).toBe('Vendredi-Dimanche');
  });

  it('does not mutate the original array', () => {
    const rotations = [makeRotation({ position: 5 })];
    ensureCorrectRotationPositions(rotations);
    expect(rotations[0].position).toBe(5);
  });
});

describe('getRotationRealDates', () => {
  it('sets real start date to the day before at 15:00 UTC', () => {
    const { realStartDate } = getRotationRealDates('05/02/2025', '07/02/2025');
    expect(realStartDate.toISOString()).toBe('2025-02-04T15:00:00.000Z');
  });

  it('sets real end date to the end date at 15:00 UTC', () => {
    const { realEndDate } = getRotationRealDates('05/02/2025', '07/02/2025');
    expect(realEndDate.toISOString()).toBe('2025-02-07T15:00:00.000Z');
  });
});

describe('isCycleActive', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const makeCycle = (rotations: ICycleRotation[]): ICycle => ({
    name: 'Test Cycle',
    rotations,
    year: 2025,
  });

  it('returns false when the cycle has no rotations', () => {
    vi.setSystemTime(new Date('2025-02-05T16:00:00Z'));
    expect(isCycleActive(makeCycle([]))).toBe(false);
  });

  it('returns true when a rotation is currently active', () => {
    // Rotation: 04/02/2025 → 06/02/2025, real window: 03/02 15:00 → 06/02 15:00 UTC
    vi.setSystemTime(new Date('2025-02-05T12:00:00Z'));
    const cycle = makeCycle([makeRotation({ start_date: '04/02/2025', end_date: '06/02/2025' })]);
    expect(isCycleActive(cycle)).toBe(true);
  });

  it('returns false when all rotations are in the past', () => {
    vi.setSystemTime(new Date('2025-03-01T12:00:00Z'));
    const cycle = makeCycle([makeRotation({ start_date: '04/02/2025', end_date: '06/02/2025' })]);
    expect(isCycleActive(cycle)).toBe(false);
  });

  it('returns true when a rotation is upcoming', () => {
    vi.setSystemTime(new Date('2025-02-01T12:00:00Z'));
    const cycle = makeCycle([makeRotation({ start_date: '04/02/2025', end_date: '06/02/2025' })]);
    expect(isCycleActive(cycle)).toBe(true);
  });
});
