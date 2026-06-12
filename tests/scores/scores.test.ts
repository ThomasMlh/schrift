import { describe, it, expect } from 'vitest';
import { getScoreDisplayValue } from '../../src/utils/scores';

describe('getScoreDisplayValue', () => {
  it('returns "rainbow" for scores >= 600,000,000', () => {
    expect(getScoreDisplayValue(600000000)).toBe('rainbow');
    expect(getScoreDisplayValue(999999999)).toBe('rainbow');
  });

  it('returns "blue" for scores >= 580,000,000', () => {
    expect(getScoreDisplayValue(580000000)).toBe('blue');
    expect(getScoreDisplayValue(599999999)).toBe('blue');
  });

  it('returns "purple" for scores >= 540,000,000', () => {
    expect(getScoreDisplayValue(540000000)).toBe('purple');
    expect(getScoreDisplayValue(579999999)).toBe('purple');
  });

  it('returns "green" for scores >= 430,000,000', () => {
    expect(getScoreDisplayValue(430000000)).toBe('green');
    expect(getScoreDisplayValue(539999999)).toBe('green');
  });

  it('returns "teal" for scores >= 350,000,000', () => {
    expect(getScoreDisplayValue(350000000)).toBe('teal');
    expect(getScoreDisplayValue(429999999)).toBe('teal');
  });

  it('returns "yellow" for scores >= 210,000,000', () => {
    expect(getScoreDisplayValue(210000000)).toBe('yellow');
    expect(getScoreDisplayValue(349999999)).toBe('yellow');
  });

  it('returns "orange" for scores >= 100,000,000', () => {
    expect(getScoreDisplayValue(100000000)).toBe('orange');
    expect(getScoreDisplayValue(209999999)).toBe('orange');
  });

  it('returns "red" for scores >= 22,500,000', () => {
    expect(getScoreDisplayValue(22500000)).toBe('red');
    expect(getScoreDisplayValue(99999999)).toBe('red');
  });

  it('returns "brown" for scores below 22,500,000', () => {
    expect(getScoreDisplayValue(22499999)).toBe('brown');
    expect(getScoreDisplayValue(0)).toBe('brown');
  });
});
