import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn', () => {
  it('menggabungkan class string', () => {
    expect(cn('a', 'b')).toBe('a b');
  });

  it('mengabaikan falsy', () => {
    expect(cn('a', false, null, undefined, 0, 'b')).toBe('a b');
  });

  it('menggabungkan conditional object', () => {
    expect(cn({ a: true, b: false, c: true })).toBe('a c');
  });

  it('merge tailwind dengan tailwind-merge (conflicting)', () => {
    // tailwind-merge should keep last conflicting
    expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4');
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
  });

  it('handle array input', () => {
    expect(cn(['a', 'b'], 'c')).toBe('a b c');
  });

  it('handle empty', () => {
    expect(cn()).toBe('');
    expect(cn('')).toBe('');
  });
});
