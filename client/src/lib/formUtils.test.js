import { describe, it, expect } from 'vitest';
import { getFieldError, validateRequired } from './formUtils';

describe('getFieldError', () => {
  it('returns null if errors is falsy', () => {
    expect(getFieldError(null, 'name')).toBeNull();
    expect(getFieldError(undefined, 'name')).toBeNull();
    expect(getFieldError({}, 'name')).toBeNull();
  });

  it('returns string error directly', () => {
    expect(getFieldError({ name: 'Required field' }, 'name')).toBe('Required field');
  });

  it('returns first element if array', () => {
    expect(getFieldError({ email: ['Invalid email', 'Other'] }, 'email')).toBe('Invalid email');
  });

  it('returns null if field does not exist', () => {
    expect(getFieldError({ name: 'error' }, 'email')).toBeNull();
  });

  it('handles empty array', () => {
    expect(getFieldError({ name: [] }, 'name')).toBeUndefined();
  });

  it('handles field with empty string', () => {
    expect(getFieldError({ name: '' }, 'name')).toBeNull();
  });
});

describe('validateRequired', () => {
  it('returns empty object when all fields filled', () => {
    expect(
      validateRequired({ email: 'a@b.com', password: 'secret' }, [
        { name: 'email', label: 'Email' },
        { name: 'password', label: 'Password' },
      ])
    ).toEqual({});
  });

  it('flags empty, blank, null, and undefined as required', () => {
    const errors = validateRequired({ a: '', b: '   ', c: null, d: undefined, e: 'ok' }, [
      { name: 'a', label: 'A' },
      { name: 'b', label: 'B' },
      { name: 'c', label: 'C' },
      { name: 'd', label: 'D' },
      { name: 'e', label: 'E' },
    ]);
    expect(errors).toEqual({
      a: 'A is required.',
      b: 'B is required.',
      c: 'C is required.',
      d: 'D is required.',
    });
  });
});
