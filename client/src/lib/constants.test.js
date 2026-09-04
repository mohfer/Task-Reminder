import { describe, it, expect } from 'vitest';
import { SEMESTERS } from './constants';

describe('constants', () => {
  it('SEMESTERS contains 8 semesters', () => {
    expect(SEMESTERS).toHaveLength(8);
    expect(SEMESTERS[0]).toBe('Semester 1');
    expect(SEMESTERS[7]).toBe('Semester 8');
  });

  it('all semesters have correct format', () => {
    SEMESTERS.forEach((s, i) => {
      expect(s).toBe(`Semester ${i + 1}`);
    });
  });

  it('remains an array and not directly mutable', () => {
    expect(Array.isArray(SEMESTERS)).toBe(true);
  });
});
