import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn', () => {
  it('combines class strings', () => {
    expect(cn('a', 'b')).toBe('a b');
  });

  it('ignores falsy values', () => {
    expect(cn('a', false, null, undefined, 0, 'b')).toBe('a b');
  });

  it('merges conditional object', () => {
    expect(cn({ a: true, b: false, c: true })).toBe('a c');
  });

  it('merges conflicting tailwind classes', () => {
    // tailwind-merge should keep last conflicting
    expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4');
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
  });

  it('handles array input', () => {
    expect(cn(['a', 'b'], 'c')).toBe('a b c');
  });

  it('handles empty input', () => {
    expect(cn()).toBe('');
    expect(cn('')).toBe('');
  });
});
