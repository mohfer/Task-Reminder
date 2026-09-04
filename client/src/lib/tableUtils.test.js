import { describe, it, expect } from 'vitest';
import { compareValues, getDeadlineBadgeClass } from './tableUtils';

describe('compareValues', () => {
  it('bandingkan angka', () => {
    expect(compareValues(1, 2)).toBeLessThan(0);
    expect(compareValues(5, 3)).toBeGreaterThan(0);
    expect(compareValues(3, 3)).toBe(0);
    expect(compareValues(-1, 1)).toBeLessThan(0);
  });

  it('bandingkan tanggal string', () => {
    expect(compareValues('2025-01-01', '2025-01-02')).toBeLessThan(0);
    expect(compareValues('2025-12-31', '2025-01-01')).toBeGreaterThan(0);
    expect(compareValues('2025-06-15', '2025-06-15')).toBe(0);
  });

  it('bandingkan string dengan numeric true', () => {
    expect(compareValues('a2', 'a10')).toBeLessThan(0);
    expect(compareValues('MK001', 'MK002')).toBeLessThan(0);
  });

  it('fallback ke string compare jika bukan angka atau tanggal', () => {
    expect(compareValues('apple', 'banana')).toBeLessThan(0);
    expect(compareValues('Zebra', 'apple')).toBeGreaterThan(0);
  });

  it('handle tanggal tidak valid fallback ke string', () => {
    expect(typeof compareValues('not-a-date', 'also-not')).toBe('number');
  });
});

describe('getDeadlineBadgeClass', () => {
  it('completed status 1', () => {
    expect(getDeadlineBadgeClass('anything', 1)).toContain('bg-success');
    expect(getDeadlineBadgeClass('5 days left', '1')).toContain('bg-success');
  });

  it('completed label', () => {
    expect(getDeadlineBadgeClass('Completed', 0)).toContain('bg-success');
    expect(getDeadlineBadgeClass('completed task', 0)).toContain('bg-success');
  });

  it('overdue', () => {
    expect(getDeadlineBadgeClass('Overdue', 0)).toContain('bg-destructive');
  });

  it('today', () => {
    expect(getDeadlineBadgeClass('Due today', 0)).toContain('bg-destructive');
    expect(getDeadlineBadgeClass('Hari ini', 0)).not.toContain('bg-destructive');
  });

  it('0 day dan 1 day', () => {
    expect(getDeadlineBadgeClass('0 days left', 0)).toContain('bg-destructive');
    expect(getDeadlineBadgeClass('1 day left', 0)).toContain('bg-destructive');
    expect(getDeadlineBadgeClass('0 day', 0)).toContain('bg-destructive');
  });

  it('2-5 days warning', () => {
    expect(getDeadlineBadgeClass('2 days left', 0)).toContain('bg-warning');
    expect(getDeadlineBadgeClass('3 days left', 0)).toContain('bg-warning');
    expect(getDeadlineBadgeClass('5 days left', 0)).toContain('bg-warning');
    expect(getDeadlineBadgeClass('5 day', 0)).toContain('bg-warning');
  });

  it('tidak masuk kategori -> secondary', () => {
    expect(getDeadlineBadgeClass('6 days left', 0)).toContain('bg-secondary');
    expect(getDeadlineBadgeClass('Due in a week', 0)).toContain('bg-secondary');
    expect(getDeadlineBadgeClass('', 0)).toContain('bg-secondary');
    expect(getDeadlineBadgeClass(null, 0)).toContain('bg-secondary');
    expect(getDeadlineBadgeClass(undefined, 0)).toContain('bg-secondary');
  });

  it('case insensitive', () => {
    expect(getDeadlineBadgeClass('OVERDUE', 0)).toContain('bg-destructive');
    expect(getDeadlineBadgeClass('COMPLETED', 0)).toContain('bg-success');
  });
});
