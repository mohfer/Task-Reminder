import { describe, it, expect } from 'vitest';
import { SEMESTERS } from './constants';

describe('constants', () => {
  it('SEMESTERS berisi 8 semester', () => {
    expect(SEMESTERS).toHaveLength(8);
    expect(SEMESTERS[0]).toBe('Semester 1');
    expect(SEMESTERS[7]).toBe('Semester 8');
  });

  it('semua semester format benar', () => {
    SEMESTERS.forEach((s, i) => {
      expect(s).toBe(`Semester ${i + 1}`);
    });
  });

  it('tidak mutable secara langsung', () => {
    expect(Array.isArray(SEMESTERS)).toBe(true);
  });
});
