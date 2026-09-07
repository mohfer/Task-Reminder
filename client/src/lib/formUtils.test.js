import { describe, it, expect } from 'vitest';
import { getFieldError } from './formUtils';

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
